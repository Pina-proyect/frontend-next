import { describe, it, expect } from 'vitest'
import { resolveLanguage } from '@/lib/ai-language'

describe('resolveLanguage — REQ-FE-5 adaptación por país', () => {
  it('default español cuando el país no está definido', () => {
    expect(resolveLanguage(undefined)).toBe('es')
    expect(resolveLanguage('')).toBe('es')
  })

  it('países hispanohablantes → es', () => {
    expect(resolveLanguage('Argentina')).toBe('es')
    expect(resolveLanguage('España')).toBe('es')
    expect(resolveLanguage('México')).toBe('es')
    expect(resolveLanguage('Colombia')).toBe('es')
  })

  it('Brasil → pt', () => {
    expect(resolveLanguage('Brasil')).toBe('pt')
    expect(resolveLanguage('Brazil')).toBe('pt')
  })

  it('países angloparlantes → en', () => {
    expect(resolveLanguage('Estados Unidos')).toBe('en')
    expect(resolveLanguage('United States')).toBe('en')
    expect(resolveLanguage('UK')).toBe('en')
  })

  it('país desconocido → español por defecto', () => {
    expect(resolveLanguage('Japón')).toBe('es')
  })
})
