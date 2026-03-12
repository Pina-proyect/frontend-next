import { describe, it, expect, vi, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/(public)/register/page'

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
    const httpModule = await import('@/lib/http-client')
    const http = httpModule.http as unknown as Mock

    render(<RegisterPage />)

    // Campos visibles
    expect(screen.getAllByLabelText(/Email/i)[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Nombre completo/i)[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Contraseña/i)[0]).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Fecha de nacimiento/i)[0]).toBeInTheDocument()

    // Completar formulario
    fireEvent.input(screen.getAllByLabelText(/Email/i)[0], { target: { value: 'user@example.com' } })
    fireEvent.input(screen.getAllByLabelText(/Nombre completo/i)[0], { target: { value: 'User Test' } })
    fireEvent.input(screen.getAllByLabelText(/Contraseña/i)[0], { target: { value: 'Password123' } })
    fireEvent.input(screen.getAllByLabelText(/Fecha de nacimiento/i)[0], { target: { value: '1990-01-01' } })

    // Enviar
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    // Assert: llamada http con body sin campos KYC (asincrónico)
    await waitFor(() => expect(http).toHaveBeenCalled())
    const args = http.mock.calls[0]
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
