import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '../app/(auth)/register/page'

// Mock de http-client para interceptar la llamada
vi.mock('@/lib/http-client', () => ({
  http: vi.fn(async () => ({ status: 'pending', message: 'ok', userId: 'u1' })),
}))

// Mock del toast para evitar tocar Sonner real
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe('RegisterPage', () => {
  it('renderiza campos y envía solo payload sin KYC', async () => {
    const { http } = await import('@/lib/http-client') as any

    render(<RegisterPage />)

    // Campos visibles
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fecha de nacimiento/i)).toBeInTheDocument()

    // Completar formulario
    fireEvent.input(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getByLabelText(/Nombre completo/i), { target: { value: 'User Test' } })
    fireEvent.input(screen.getByLabelText(/Contraseña/i), { target: { value: 'Password123' } })
    fireEvent.input(screen.getByLabelText(/Fecha de nacimiento/i), { target: { value: '1990-01-01' } })

    // Enviar
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    // Assert: llamada http con body sin campos KYC (asincrónico)
    await waitFor(() => expect(http).toHaveBeenCalled())
    const args = (http as any).mock.calls[0]
    expect(args[0]).toBe('/registro/creadora')
    const init = args[1]
    const parsedBody = JSON.parse(init.body)
    expect(parsedBody).toEqual({
      fullName: 'User Test',
      email: 'user@example.com',
      password: 'Password123',
      birthDate: '1990-01-01',
    })
    expect(parsedBody.nationalId).toBeUndefined()
    expect(parsedBody.photoPath).toBeUndefined()
    expect(parsedBody.selfiePath).toBeUndefined()
  })
})