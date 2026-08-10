import { describe, it, expect, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AiResultsCard from '@/components/ai/ai-results-card'
import type { AiSuggestion } from '@/lib/ai-types'

// Patrón del repo: factory SIN referencias externas. El mock del módulo se
// comparte entre archivos (isolate:false); se accede a él con import dinámico
// y se configura por test. El shape de use-auth-store es IDÉNTICO en todos los
// archivos para que el primer factory registrado sirva a todos.
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

const suggestions: AiSuggestion = {
  suggestedNiche: 'Fotografía',
  suggestedBio: 'Narrativa visual a través del lente.',
  suggestedGoal: { title: 'Cámara profesional', amount: 50000, currency: 'ARS' },
  suggestedPlan: ['Publicar 3 veces por semana', 'Crear un pack de presets'],
}

describe('AiResultsCard — REQ-FE-4', () => {
  it('renderiza tarjetas editables con los valores sugeridos', () => {
    render(<AiResultsCard suggestions={suggestions} onRegenerate={vi.fn()} onSaved={vi.fn()} />)

    expect(screen.getByLabelText(/nicho/i)).toHaveValue('Fotografía')
    expect(screen.getByLabelText(/biografía/i)).toHaveValue('Narrativa visual a través del lente.')
    expect(screen.getByLabelText(/objetivo/i)).toHaveValue('Cámara profesional')
    expect(screen.getByLabelText(/monto/i)).toHaveValue(50000)
    expect(screen.getByLabelText(/plan/i)).toHaveValue('Publicar 3 veces por semana\nCrear un pack de presets')
  })

  it('guarda los valores editados vía PATCH /auth/profile con aiPlanAccepted=true y llama onSaved', async () => {
    const { http } = await import('@/lib/http-client')
    const { updateAuthUser } = await import('@/store/use-auth-store')
    const httpMock = http as unknown as Mock
    const updateAuthUserMock = updateAuthUser as unknown as Mock

    httpMock.mockReset()
    updateAuthUserMock.mockReset()
    httpMock.mockImplementation(async (path: string, init: { body?: string }) => {
      if (path === '/auth/profile') {
        const body = init?.body ? JSON.parse(init.body) : {}
        return { id: '1', ...body }
      }
      return {}
    })
    const onSaved = vi.fn()
    render(<AiResultsCard suggestions={suggestions} onRegenerate={vi.fn()} onSaved={onSaved} />)

    fireEvent.change(screen.getByLabelText(/nicho/i), { target: { value: 'Fotografía Documental' } })
    fireEvent.change(screen.getByLabelText(/biografía/i), { target: { value: 'Nueva bio editada.' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(httpMock).toHaveBeenCalled())

    const [path, init] = httpMock.mock.calls[0] as [string, { body: string }]
    expect(path).toBe('/auth/profile')
    const body = JSON.parse(init.body)
    expect(body.aiSuggestedNiche).toBe('Fotografía Documental')
    expect(body.aiSuggestedBio).toBe('Nueva bio editada.')
    expect(body.aiSuggestedGoal).toEqual({ title: 'Cámara profesional', amount: 50000, currency: 'ARS' })
    expect(body.aiSuggestedPlan).toBe('Publicar 3 veces por semana\nCrear un pack de presets')
    expect(body.aiPlanAccepted).toBe(true)
    expect(updateAuthUserMock).toHaveBeenCalled()
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
  })

  it('muestra el mensaje de límite diario cuando regenerar devuelve limitado (429) y no reintenta', async () => {
    const onRegenerate = vi.fn().mockResolvedValue({ limited: true, message: 'Llegaste al límite diario de generaciones con IA' })
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockReset()
    render(<AiResultsCard suggestions={suggestions} onRegenerate={onRegenerate} onSaved={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /regenerar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/límite diario/i)
    expect(onRegenerate).toHaveBeenCalledTimes(1)
    // No reintenta automáticamente
    expect(httpMock).not.toHaveBeenCalled()
  })

  it('al regenerar sin límite actualiza las sugerencias (onRegenerate resuelve ok)', async () => {
    const newSuggestions: AiSuggestion = {
      ...suggestions,
      suggestedNiche: 'Cine',
    }
    const onRegenerate = vi.fn().mockResolvedValue({ limited: false, suggestions: newSuggestions })
    render(<AiResultsCard suggestions={suggestions} onRegenerate={onRegenerate} onSaved={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /regenerar/i }))

    // Esperar a que el valor CAMBIE (evita race con el valor previo).
    await waitFor(() => {
      expect(screen.getByLabelText(/nicho/i)).toHaveValue('Cine')
    })
  })
})
