import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../app/(auth)/login/page'

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
  it('renderiza y envía email/password al endpoint correcto', async () => {
    const { http } = await import('@/lib/http-client') as any
    const { setAuthSession } = await import('@/store/use-auth-store') as any

    render(<LoginPage />)

    // Campos visibles
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()

    // Completar formulario y enviar
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getByLabelText(/Contraseña/i), { target: { value: 'Password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

    // Assert: http llamado con /auth/login y body esperado
    await waitFor(() => expect(http).toHaveBeenCalled())
    const args = (http as any).mock.calls[0]
    expect(args[0]).toBe('/auth/login')
    const init = args[1]
    const parsedBody = JSON.parse(init.body)
    expect(parsedBody).toEqual({ email: 'user@example.com', password: 'Password123' })

    // Assert: setAuthSession llamado con tokens y user
    expect(setAuthSession).toHaveBeenCalled()
  })
})