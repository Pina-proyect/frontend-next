// Tipos compartidos del flujo de IA en onboarding (v1.18).
// Alineados con los contratos del backend (AiModule) y el DTO de perfil.

export type AiCase = 'A' | 'B' | 'C' | 'D'

export type AiAnalysisStatus = 'idle' | 'analyzing' | 'done' | 'error'

export type AiPlatform = 'instagram' | 'youtube' | 'tiktok'

export interface AiSuggestion {
  suggestedNiche: string
  suggestedBio: string
  suggestedGoal: { title: string; amount: number; currency: string }
  suggestedPlan: string[]
}

export interface AiAnalyzeResponse {
  case: AiCase
  suggestions?: AiSuggestion
  reasons: string[]
  degraded: boolean
}

export interface AiIdeasResponse {
  stepIndex: number
  content?: string
  degraded?: boolean
  message?: string
}

export interface SocialLinkInput {
  platform: AiPlatform
  url: string
  followers?: number
}

export interface ProfileAiFields {
  socialLinks?: SocialLinkInput[]
  aiSummary?: string
  aiSuggestedNiche?: string
  aiSuggestedBio?: string
  aiSuggestedGoal?: { title: string; amount: number; currency: string }
  aiSuggestedPlan?: string
  aiPlanAccepted?: boolean
}
