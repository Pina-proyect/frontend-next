import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore } from '@/store/use-onboarding-store'

const STORAGE_KEY = 'pina-onboarding-state'

describe('useOnboardingStore — v1.18 IA onboarding', () => {
  beforeEach(() => {
    localStorage.clear()
    useOnboardingStore.setState({
      currentStep: 1,
      niche: '',
      slug: '',
      bio: '',
      gender: 'creadora',
      country: '',
      profileImage: null,
      connectedSocials: { instagram: true, youtube: false, tiktok: false },
      socialUrls: { instagram: '', youtube: '', tiktok: '' },
      followerCounts: { instagram: 0, tiktok: 0 },
      consent: false,
      aiCase: null,
      aiSuggestions: null,
      aiAnalysisStatus: 'idle',
    })
  })

  it('nextStep avanza de 1 a 3 y queda capado en 3', () => {
    const s = useOnboardingStore.getState()
    s.nextStep()
    expect(useOnboardingStore.getState().currentStep).toBe(2)
    useOnboardingStore.getState().nextStep()
    expect(useOnboardingStore.getState().currentStep).toBe(3)
    // Cap en 3 — no avanza más allá
    useOnboardingStore.getState().nextStep()
    expect(useOnboardingStore.getState().currentStep).toBe(3)
  })

  it('prevStep baja de 3 a 1 y queda pisado en 1', () => {
    useOnboardingStore.setState({ currentStep: 3 })
    const s = useOnboardingStore.getState()
    s.prevStep()
    expect(useOnboardingStore.getState().currentStep).toBe(2)
    useOnboardingStore.getState().prevStep()
    expect(useOnboardingStore.getState().currentStep).toBe(1)
    useOnboardingStore.getState().prevStep()
    expect(useOnboardingStore.getState().currentStep).toBe(1)
  })

  it('setSocialUrl guarda la URL por plataforma sin tocar las demás', () => {
    useOnboardingStore.getState().setSocialUrl('instagram', 'https://instagram.com/foo')
    const s = useOnboardingStore.getState()
    expect(s.socialUrls.instagram).toBe('https://instagram.com/foo')
    expect(s.socialUrls.youtube).toBe('')
    expect(s.socialUrls.tiktok).toBe('')
  })

  it('setFollowerCount guarda followers de Instagram y TikTok', () => {
    useOnboardingStore.getState().setFollowerCount('instagram', 1250)
    useOnboardingStore.getState().setFollowerCount('tiktok', 300)
    const s = useOnboardingStore.getState()
    expect(s.followerCounts.instagram).toBe(1250)
    expect(s.followerCounts.tiktok).toBe(300)
  })

  it('setConsent y setAiAnalysis persisten el resultado del análisis', () => {
    useOnboardingStore.getState().setConsent(true)
    expect(useOnboardingStore.getState().consent).toBe(true)

    const suggestions = {
      suggestedNiche: 'Fotografía',
      suggestedBio: 'Narrativa visual a través del lente.',
      suggestedGoal: { title: 'Cámara profesional', amount: 50000, currency: 'ARS' },
      suggestedPlan: ['Publicar 3 veces por semana', 'Crear un pack de presets'],
    }
    useOnboardingStore.getState().setAiAnalysis('A', suggestions, 'done')
    const s = useOnboardingStore.getState()
    expect(s.aiCase).toBe('A')
    expect(s.aiSuggestions).toEqual(suggestions)
    expect(s.aiAnalysisStatus).toBe('done')
  })

  it('resume: el estado del paso 3 se persiste en localStorage y se puede rehidratar', () => {
    useOnboardingStore.setState({
      currentStep: 3,
      consent: true,
      socialUrls: { instagram: 'https://instagram.com/a', youtube: '', tiktok: 'https://tiktok.com/@b' },
      followerCounts: { instagram: 1200, tiktok: 0 },
      aiCase: 'A',
    })

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const persisted = JSON.parse(raw as string) as { state: Record<string, unknown> }
    expect(persisted.state.currentStep).toBe(3)
    expect(persisted.state.consent).toBe(true)
    expect(persisted.state.aiCase).toBe('A')
    expect((persisted.state.socialUrls as { instagram: string }).instagram).toBe('https://instagram.com/a')
  })
})
