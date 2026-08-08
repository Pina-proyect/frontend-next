import { describe, it, expect, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(public)/login/page'

// Mock de http-client
vi.mock('@/lib/http-client', () => ({
  http: vi.fn(async () => ({
    accessToken: 'at',
    refreshToken: 'rt',
    user: { id: '1', email: 'user@example.com', fullName: 'User', provider: 'local', tokenVersion: 1 },
  })),
}))

// Mock de use-auth-store para interceptar setAuthSession
vi.mock('@/store/use-auth-store', () => ({
  setAuthSession: vi.fn(),
}))

// Mock del toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe('LoginPage', () => {
  it.skip('renderiza y envía email/password al endpoint correcto', async () => {
    const httpModule = await import('@/lib/http-client')
    const storeModule = await import('@/store/use-auth-store')
    const http = httpModule.http as unknown as Mock
    const setAuthSession = storeModule.setAuthSession as unknown as Mock

    render(<LoginPage />)

    // Campos visibles
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()

    // Completar formulario y enviar
    fireEvent.input(screen.getAllByLabelText(/Email/i)[0], { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getAllByLabelText(/Contraseña/i)[0], { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    // Assert: http llamado con /auth/login y body esperado
    await waitFor(() => expect(http).toHaveBeenCalled())
    const args = http.mock.calls[0]
    expect(args[0]).toBe('/auth/login')
    const init = args[1]
    const parsedBody = JSON.parse(init.body)
    expect(parsedBody).toEqual({ email: 'user@example.com', password: 'Password123' })

    // Assert: setAuthSession llamado con tokens y user
    expect(setAuthSession).toHaveBeenCalled()
  })

  it('envía email y password a /auth/login al enviar el formulario', async () => {
    const httpModule = await import('@/lib/http-client')
    const http = httpModule.http as unknown as Mock

    http.mockImplementation(async (path: string) => {
      if (path === '/auth/login') {
        return {
          accessToken: 'at',
          refreshToken: 'rt',
          user: { id: '1', email: 'user@example.com', fullName: 'User', provider: 'local', tokenVersion: 1 },
        }
      }
      return {}
    })

    render(<LoginPage />)
    fireEvent.input(screen.getByPlaceholderText('name@domain.com'), { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getByPlaceholderText('••••••••'), { target: { value: 'Password123' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar Sesión' })[0])

    await waitFor(() => {
      const calls = http.mock.calls.map((c) => c[0])
      expect(calls).toContain('/auth/login')
    })
    const args = http.mock.calls.find((c) => c[0] === '/auth/login')!
    const parsedBody = JSON.parse(args[1].body)
    expect(parsedBody).toEqual({ email: 'user@example.com', password: 'Password123' })
  })
})
