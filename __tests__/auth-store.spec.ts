import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/use-auth-store'

// Este spec valida el CONTRATO del store de autenticación con campos IA.
// setupTests.ts mockea @/store/use-auth-store con un shape unificado (patrón
// del repo, necesario por isolate:false). Las acciones (setSession, etc.)
// son vi.fn() del mock; el hook selector devuelve null por defecto.
import { getAuthToken, setAuthSession, updateAuthUser, clearAuthSession, getAuthUser } from '@/store/use-auth-store'

describe('useAuthStore — campos IA del User (v1.18)', () => {
  beforeEach(() => {
    localStorage.clear()
    clearAuthSession()
  })

  it('setSession persiste user con campos AI y socialLinks', () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      fullName: 'Ana',
      provider: 'google',
      tokenVersion: 1,
      slug: 'ana',
      aiSummary: 'Creadora de fotografía con 1.5k seguidores.',
      aiSuggestedNiche: 'Fotografía',
      aiSuggestedBio: 'Narrativa visual.',
      aiSuggestedGoal: { title: 'Cámara', amount: 50000, currency: 'ARS' },
      aiSuggestedPlan: 'Publicar 3 veces por semana',
      aiPlanAccepted: true,
      socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/ana', followers: 1500 }],
    }
    setAuthSession({ accessToken: 'at', refreshToken: 'rt', user })

    expect(getAuthToken()).toBe('at')
    expect(getAuthUser()).toEqual(user)
  })

  it('updateAuthUser actualiza campos AI sin perder el resto del usuario', () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      fullName: 'Ana',
      provider: 'google',
      tokenVersion: 1,
      aiSuggestedNiche: 'Cine',
      aiSuggestedPlan: 'Plan inicial',
    }
    setAuthSession({ accessToken: 'at', refreshToken: 'rt', user })

    updateAuthUser({
      ...user,
      aiSuggestedNiche: 'Arte Digital',
      aiPlanAccepted: true,
      aiSuggestedGoal: { title: 'Tablet', amount: 30000, currency: 'ARS' },
    })

    const stored = getAuthUser()
    expect(stored?.aiSuggestedNiche).toBe('Arte Digital')
    expect(stored?.aiSuggestedPlan).toBe('Plan inicial')
    expect(stored?.aiPlanAccepted).toBe(true)
    expect(stored?.aiSuggestedGoal).toEqual({ title: 'Tablet', amount: 30000, currency: 'ARS' })
  })

  it('clearSession limpia user y tokens', () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      fullName: 'Ana',
      provider: 'google',
      tokenVersion: 1,
      aiSuggestedNiche: 'Cine',
      aiPlanAccepted: true,
    }
    setAuthSession({ accessToken: 'at', refreshToken: 'rt', user })
    clearAuthSession()

    expect(getAuthUser()).toBeNull()
    expect(getAuthToken()).toBeUndefined()
  })

  it('useAuthStore es un hook selector exportado', () => {
    expect(typeof useAuthStore).toBe('function')
  })
})
