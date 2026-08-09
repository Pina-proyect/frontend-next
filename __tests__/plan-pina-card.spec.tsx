import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlanPinaCard from '@/components/ai/plan-pina-card'

const planCardProps = {
  aiSummary: 'Creadora enfocada en Fotografía. Objetivo: Cámara profesional (50000 ARS).',
  aiSuggestedNiche: 'Fotografía',
  aiSuggestedBio: 'Narrativa visual a través del lente.',
  aiSuggestedGoal: { title: 'Cámara profesional', amount: 50000, currency: 'ARS' },
  aiSuggestedPlan: 'Publicar 3 veces por semana\nCrear un pack de presets',
}

describe('PlanPinaCard — REQ-FE-6', () => {
  it('muestra resumen, objetivo y próximos pasos del plan aceptado', () => {
    render(<PlanPinaCard {...planCardProps} />)

    expect(screen.getByText('Tu plan Pina')).toBeInTheDocument()
    expect(screen.getAllByText(/Cámara profesional/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Publicar 3 veces por semana/i)).toBeInTheDocument()
    expect(screen.getByText(/Crear un pack de presets/i)).toBeInTheDocument()
    expect(screen.getByText(/50000/i)).toBeInTheDocument()
  })

  it('muestra el nicho y la bio sugeridos', () => {
    render(<PlanPinaCard {...planCardProps} />)

    expect(screen.getByText('Fotografía')).toBeInTheDocument()
    expect(screen.getByText('Narrativa visual a través del lente.')).toBeInTheDocument()
  })
})
