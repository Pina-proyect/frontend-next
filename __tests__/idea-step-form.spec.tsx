import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import IdeaStepForm from '@/components/ai/idea-step-form'

// Patrón del repo: factory sin referencias externas
vi.mock('@/lib/http-client', () => ({
  http: vi.fn(),
}))

describe('IdeaStepForm — REQ-FE-3 caso B/C, REQ-AI-7', () => {
  it('muestra una pregunta por paso con opciones fijas y texto libre (sin chat)', () => {
    render(<IdeaStepForm aiCase="B" onComplete={vi.fn()} onExit={vi.fn()} />)

    expect(screen.getByText(/¿Qué tipo de contenido/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fotografía/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Video/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Cuéntanos más/i)).toBeInTheDocument()
    // Sin chat libre
    expect(screen.queryByRole('textbox', { name: /escribe tu mensaje/i })).not.toBeInTheDocument()
  })

  it('avanza de paso al seleccionar una opción y volver conserva la respuesta', () => {
    render(<IdeaStepForm aiCase="B" onComplete={vi.fn()} onExit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Fotografía/i }))
    fireEvent.change(screen.getByLabelText(/Cuéntanos más/i), { target: { value: 'Fotos de viaje' } })
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))

    expect(screen.getByText(/¿Cuánto tiempo/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Atrás/i }))
    expect(screen.getByText(/¿Qué tipo de contenido/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fotografía/i })).toHaveAttribute('data-selected', 'true')
    expect(screen.getByLabelText(/Cuéntanos más/i)).toHaveValue('Fotos de viaje')
  })

  it('en el último paso llama POST /ai/onboarding/ideas con case, stepIndex, answers y baseContext', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockReset()
    httpMock.mockResolvedValue({ stepIndex: 2, content: 'Plan: publicá fotos de viaje 3 veces por semana.' })

    render(
      <IdeaStepForm
        aiCase="C"
        baseContext="Creadora sin redes"
        onComplete={vi.fn()}
        onExit={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Fotografía/i }))
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    fireEvent.click(screen.getByRole('button', { name: /Menos de 1 hora/i }))
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    fireEvent.click(screen.getByRole('button', { name: /Conseguir mis primeros seguidores/i }))
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }))

    await waitFor(() => expect(httpMock).toHaveBeenCalled())
    const [path, init] = httpMock.mock.calls[0] as [string, { body: string }]
    expect(path).toBe('/ai/onboarding/ideas')
    const body = JSON.parse(init.body)
    expect(body.case).toBe('C')
    expect(body.stepIndex).toBe(2)
    expect(body.baseContext).toBe('Creadora sin redes')
    expect(body.answers).toEqual([
      { question: 'content_type', option: 'Fotografía' },
      { question: 'dedication_time', option: 'Menos de 1 hora' },
      { question: 'goal', option: 'Conseguir mis primeros seguidores' },
    ])

    // Muestra el contenido refinado y permite completar
    expect(await screen.findByText(/Plan: publicá fotos de viaje/i)).toBeInTheDocument()
  })

  it('llama onComplete con el contenido refinado', async () => {
    const { http } = await import('@/lib/http-client')
    const httpMock = http as unknown as Mock
    httpMock.mockReset()
    httpMock.mockResolvedValue({ stepIndex: 2, content: 'Tu plan: comunidad y constancia.' })
    const onComplete = vi.fn()

    render(<IdeaStepForm aiCase="B" onComplete={onComplete} onExit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Fotografía/i }))
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    fireEvent.click(screen.getByRole('button', { name: /Menos de 1 hora/i }))
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    fireEvent.click(screen.getByRole('button', { name: /Conseguir mis primeros seguidores/i }))
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }))

    fireEvent.click(await screen.findByRole('button', { name: /Guardar y continuar/i }))
    expect(onComplete).toHaveBeenCalledWith('Tu plan: comunidad y constancia.')
  })

  it('onExit permite volver al paso de redes sociales', () => {
    const onExit = vi.fn()
    render(<IdeaStepForm aiCase="B" onComplete={vi.fn()} onExit={onExit} />)

    fireEvent.click(screen.getByRole('button', { name: /Volver a redes/i }))
    expect(onExit).toHaveBeenCalled()
  })
})
