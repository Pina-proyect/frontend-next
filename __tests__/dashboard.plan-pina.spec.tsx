import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import DashboardPage from '@/app/(app)/dashboard/page'

// Patrón del repo: factory sin referencias externas; shape unificado de
// use-auth-store (el primer factory registrado gana con isolate:false).
vi.mock('@/lib/http-client', () => ({
  http: vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
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

describe('DashboardPage — REQ-FE-6 "Tu plan Pina"', () => {
  beforeEach(async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockReset()
    httpMock.mockImplementation(async (path: string) => {
      if (path.includes('/donations')) return []
      if (path.includes('/media/')) return []
      if (path.includes('/packs/')) return []
      return {}
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('muestra "Tu plan Pina" cuando aiPlanAccepted=true', async () => {
    const { useAuthStore } = await import('@/store/use-auth-store')
    ;(useAuthStore as unknown as Mock).mockImplementation(
      (selector: (s: { user: unknown }) => unknown) =>
        selector({
          user: {
            id: '1',
            fullName: 'Ana',
            gender: 'creadora',
            niche: 'photography',
            aiPlanAccepted: true,
            aiSummary: 'Creadora enfocada en Fotografía.',
            aiSuggestedNiche: 'Fotografía',
            aiSuggestedBio: 'Narrativa visual.',
            aiSuggestedGoal: { title: 'Cámara', amount: 50000, currency: 'ARS' },
            aiSuggestedPlan: 'Publicar 3 veces por semana',
          },
        })
    )

    render(<DashboardPage />)

    expect(await screen.findByText('Tu plan Pina')).toBeInTheDocument()
    expect(screen.getByText(/Cámara/i)).toBeInTheDocument()
    expect(screen.getByText(/Publicar 3 veces por semana/i)).toBeInTheDocument()
  })

  it('NO muestra "Tu plan Pina" cuando aiPlanAccepted es false', async () => {
    const { useAuthStore } = await import('@/store/use-auth-store')
    ;(useAuthStore as unknown as Mock).mockImplementation(
      (selector: (s: { user: unknown }) => unknown) =>
        selector({
          user: {
            id: '2',
            fullName: 'Bruno',
            gender: 'creador',
            niche: 'film',
            aiPlanAccepted: false,
          },
        })
    )

    render(<DashboardPage />)

    expect(await screen.findByText(/¡Hola/i)).toBeInTheDocument()
    expect(screen.queryByText('Tu plan Pina')).not.toBeInTheDocument()
    expect(screen.queryByText(/Publicar 3 veces por semana/i)).not.toBeInTheDocument()
  })
})
