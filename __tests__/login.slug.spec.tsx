import { describe, it, expect, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(public)/login/page'

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@/store/use-auth-store', () => ({
  setAuthSession: vi.fn(),
}))

vi.mock('@/lib/http-client', () => ({
  http: vi.fn(),
}))

describe('LoginPage redirección según slug', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })
  it.skip('llama /auth/me tras login', async () => {
    const httpModule = await import('@/lib/http-client')
    const http = httpModule.http as unknown as Mock

    http.mockImplementation(async (path: string, init?: any) => {
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
      const calls = http.mock.calls.map((c: any[]) => c[0])
      expect(calls).toContain('/auth/me')
    })
  })
})
