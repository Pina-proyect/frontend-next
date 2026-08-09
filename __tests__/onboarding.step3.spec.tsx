import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingPage from '@/app/onboarding/page'
import { useOnboardingStore } from '@/store/use-onboarding-store'

// Patrón del repo: factory SIN referencias externas y shape IDÉNTICO de
// use-auth-store en todos los archivos (el primer factory registrado gana con
// isolate:false; un shape unificado sirve a todos).
vi.mock('@/lib/http-client', () => ({
  http: vi.fn(),
}))

vi.mock('@/store/use-auth-store', () => ({
  getAuthToken: vi.fn(),
  getRefreshToken: vi.fn(),
  getAuthUser: vi.fn(),
  setAuthSession: vi.fn(),
  updateAuthUser: vi.fn(),
  clearAuthSession: vi.fn(),
  useAuthStore: vi.fn(() => null),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const baseState = {
  currentStep: 3,
  niche: 'photography',
  slug: 'ana',
  bio: 'Bio corta',
  gender: 'creadora',
  country: 'Argentina',
  profileImage: null,
  connectedSocials: { instagram: true, youtube: true, tiktok: false },
  socialUrls: { instagram: 'https://instagram.com/ana', youtube: 'https://youtube.com/@ana', tiktok: '' },
  followerCounts: { instagram: 1500, tiktok: 0 },
  consent: false,
  aiCase: null,
  aiSuggestions: null,
  aiAnalysisStatus: 'idle',
}

const analyzeCaseA = {
  case: 'A',
  reasons: [],
  degraded: false,
  suggestions: {
    suggestedNiche: 'Fotografía',
    suggestedBio: 'Narrativa visual a través del lente.',
    suggestedGoal: { title: 'Cámara profesional', amount: 50000, currency: 'ARS' },
    suggestedPlan: ['Publicar 3 veces por semana', 'Crear un pack de presets'],
  },
}

describe('OnboardingPage Step 3 — REQ-FE-1/2/3/7', () => {
  beforeEach(async () => {
    localStorage.clear()
    const { http } = await import('@/lib/http-client')
    const { getAuthToken, updateAuthUser } = await import('@/store/use-auth-store')
    const httpMock = http as unknown as Mock
    ;(getAuthToken as unknown as Mock).mockReturnValue('at')
    ;(updateAuthUser as unknown as Mock).mockClear()
    httpMock.mockReset()
    useOnboardingStore.setState(baseState)
  })

  it('muestra el indicador de 3 pasos y renderiza el Step 3', () => {
    render(<OnboardingPage />)

    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Conecta y Lanza/i })).toBeInTheDocument()
  })

  it('consent gate: sin consentimiento el botón de analizar está deshabilitado (REQ-FE-2)', () => {
    render(<OnboardingPage />)

    const analyzeBtn = screen.getByRole('button', { name: /Analizar con IA/i })
    expect(analyzeBtn).toBeDisabled()
  })

  it('con consentimiento habilita el análisis y no arranca sin consent (REQ-FE-2)', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockImplementation(async (path: string) => {
      if (path === '/ai/profile/analyze') return analyzeCaseA
      return {}
    })
    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto que Pina analice/i }))
    const analyzeBtn = screen.getByRole('button', { name: /Analizar con IA/i })
    expect(analyzeBtn).toBeEnabled()

    fireEvent.click(analyzeBtn)

    await waitFor(() => expect(httpMock).toHaveBeenCalledWith(
      '/ai/profile/analyze',
      expect.objectContaining({ method: 'POST' })
    ))
    const [, init] = httpMock.mock.calls[0] as [string, { body: string }]
    const body = JSON.parse(init.body)
    expect(body.consent).toBe(true)
    expect(body.socialLinks).toEqual([
      { platform: 'instagram', url: 'https://instagram.com/ana', followers: 1500 },
      { platform: 'youtube', url: 'https://youtube.com/@ana' },
    ])
    expect(body.country).toBe('Argentina')
    expect(body.language).toBe('es')
  })

  it('caso A: muestra tarjetas editables con las sugerencias (REQ-FE-3)', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockImplementation(async (path: string) => {
      if (path === '/ai/profile/analyze') return analyzeCaseA
      return {}
    })
    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto que Pina analice/i }))
    fireEvent.click(screen.getByRole('button', { name: /Analizar con IA/i }))

    expect(await screen.findByText(/Tu plan sugerido por IA/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nicho/i)).toHaveValue('Fotografía')
    expect(screen.getByLabelText(/biografía/i)).toHaveValue('Narrativa visual a través del lente.')
  })

  it('caso B: inicia el flujo guiado de ideas (REQ-FE-3)', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockImplementation(async (path: string) => {
      if (path === '/ai/profile/analyze') return { case: 'B', reasons: [], degraded: false }
      return {}
    })

    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto que Pina analice/i }))
    fireEvent.click(screen.getByRole('button', { name: /Analizar con IA/i }))

    expect(await screen.findByText(/¿Qué tipo de contenido/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fotografía/i })).toBeInTheDocument()
  })

  it('503 (IA no disponible): degrada a caso D y muestra el flujo manual (REQ-FE-7)', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockRejectedValue(Object.assign(new Error('El servicio de IA no está disponible'), { status: 503 }))

    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto que Pina analice/i }))
    fireEvent.click(screen.getByRole('button', { name: /Analizar con IA/i }))

    expect(await screen.findByRole('button', { name: /Lanzar Estudio/i })).toBeInTheDocument()
  })

  it('429: muestra mensaje de límite diario y continúa el flujo manual (REQ-FE-4)', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockRejectedValue(
      Object.assign(new Error('Llegaste al límite diario de generaciones con IA'), { status: 429 })
    )

    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto que Pina analice/i }))
    fireEvent.click(screen.getByRole('button', { name: /Analizar con IA/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/límite diario/i)
    expect(screen.getByRole('button', { name: /Lanzar Estudio/i })).toBeInTheDocument()
  })

  it('resume: si el store ya tiene caso A resuelto, muestra las tarjetas sin re-analizar (REQ-FE-7)', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    useOnboardingStore.setState({
      ...baseState,
      consent: true,
      aiCase: 'A',
      aiAnalysisStatus: 'done',
      aiSuggestions: analyzeCaseA.suggestions,
    })

    render(<OnboardingPage />)

    expect(await screen.findByText(/Tu plan sugerido por IA/i)).toBeInTheDocument()
    expect(httpMock).not.toHaveBeenCalled()
  })

  it('caso D manual: PATCH /auth/profile y redirige al dashboard', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockImplementation(async (path: string) => {
      if (path === '/ai/profile/analyze') return { case: 'D', reasons: [], degraded: true }
      if (path === '/auth/profile') return { id: '1' }
      return {}
    })

    render(<OnboardingPage />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Acepto que Pina analice/i }))
    fireEvent.click(screen.getByRole('button', { name: /Analizar con IA/i }))

    const launchBtn = await screen.findByRole('button', { name: /Lanzar Estudio/i })
    fireEvent.click(launchBtn)

    await waitFor(() => {
      const calls = httpMock.mock.calls.map((c) => c[0])
      expect(calls).toContain('/auth/profile')
    })
    const [, init] = httpMock.mock.calls.find((c) => c[0] === '/auth/profile') as [string, { body: string }]
    const body = JSON.parse(init.body)
    expect(body.aiPlanAccepted).toBe(false)
  })
})
