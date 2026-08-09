import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(public)/login/page'

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// Patrón del repo: factory sin referencias externas; shape unificado de
// use-auth-store (el primer factory registrado gana con isolate:false).
vi.mock('@/store/use-auth-store', () => ({
  getAuthToken: vi.fn(),
  getRefreshToken: vi.fn(),
  getAuthUser: vi.fn(),
  setAuthSession: vi.fn(),
  updateAuthUser: vi.fn(),
  clearAuthSession: vi.fn(),
  useAuthStore: vi.fn(() => null),
}))

vi.mock('@/lib/http-client', () => ({
  http: vi.fn(),
}))

describe('LoginPage redirección según slug', () => {
  afterEach(async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockReset()
  })
  it.skip('llama /auth/me tras login', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock

    httpMock.mockImplementation(async (path: string) => {
      if (path === '/auth/login') {
        return {
          accessToken: 'at',
          refreshToken: 'rt',
          user: { id: '1', email: 'user@example.com', fullName: 'User', provider: 'local', tokenVersion: 1 },
        }
      }
      if (path === '/auth/me') {
        return { id: '1', email: 'user@example.com', fullName: 'User', slug: '' }
      }
      return {}
    })

    render(<LoginPage />)

    fireEvent.input(screen.getAllByLabelText(/Email/i)[0], { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getAllByLabelText(/Contraseña/i)[0], { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    await waitFor(() => {
      const calls = httpMock.mock.calls.map((c) => c[0])
      expect(calls).toContain('/auth/me')
    })
  })
})
