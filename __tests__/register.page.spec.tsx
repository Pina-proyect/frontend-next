import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/(public)/register/page'

// Patrón del repo: factory sin referencias externas
vi.mock('@/lib/http-client', () => ({
  http: vi.fn(),
}))

// Mock del toast para evitar tocar Sonner real
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe('RegisterPage', () => {
  beforeEach(async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockReset()
    httpMock.mockResolvedValue({ status: 'pending', message: 'ok', userId: 'u1' })
  })

  it('renderiza campos y envía solo payload sin KYC', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock

    render(<RegisterPage />)

    // Campos visibles
    expect(screen.getAllByLabelText(/Nombre completo/i)[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Correo/i)[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Contraseña/i)[0]).toBeInTheDocument()

    // Completar formulario
    fireEvent.input(screen.getAllByLabelText(/Nombre completo/i)[0], { target: { value: 'User Test' } })
    fireEvent.input(screen.getAllByLabelText(/Correo/i)[0], { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getAllByLabelText(/Contraseña/i)[0], { target: { value: 'Password123' } })

    // Marcar age gate (requerido)
    fireEvent.click(screen.getByLabelText(/Soy mayor de 18 años/i))

    // Enviar
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    // Assert: llamada http con body sin campos KYC (asincrónico)
    await waitFor(() => expect(httpMock).toHaveBeenCalled())
    const args = httpMock.mock.calls[0]
    expect(args[0]).toBe('/registro/creadora')
    const init = args[1]
    const parsedBody = JSON.parse(init.body)
    expect(parsedBody).toEqual({
      fullName: 'User Test',
      email: 'user@example.com',
      password: 'Password123',
      birthDate: '2000-01-01',
      acknowledgedAge: true,
      role: 'CREATOR',
    })
    expect(parsedBody.nationalId).toBeUndefined()
    expect(parsedBody.photoPath).toBeUndefined()
    expect(parsedBody.selfiePath).toBeUndefined()
  })
})
