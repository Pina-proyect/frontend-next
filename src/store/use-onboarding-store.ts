import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AiCase, AiAnalysisStatus, AiPlatform, AiSuggestion } from "@/lib/ai-types";

interface SocialUrls {
  instagram: string;
  youtube: string;
  tiktok: string;
}

interface FollowerCounts {
  instagram: number;
  tiktok: number;
}

interface OnboardingState {
  currentStep: number;
  niche: string;
  slug: string;
  bio: string;
  gender: string;
  country: string;
  profileImage: string | null;
  connectedSocials: {
    instagram: boolean;
    youtube: boolean;
    tiktok: boolean;
  };
  // v1.18 — Step 3 IA
  socialUrls: SocialUrls;
  followerCounts: FollowerCounts;
  consent: boolean;
  aiCase: AiCase | null;
  aiSuggestions: AiSuggestion | null;
  aiAnalysisStatus: AiAnalysisStatus;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setNiche: (niche: string) => void;
  setProfileInfo: (slug: string, bio: string, gender: string, country: string, profileImage: string | null) => void;
  toggleSocial: (platform: keyof OnboardingState["connectedSocials"]) => void;
  setSocialUrl: (platform: AiPlatform, url: string) => void;
  setFollowerCount: (platform: "instagram" | "tiktok", count: number) => void;
  setConsent: (consent: boolean) => void;
  setAiAnalysis: (aiCase: AiCase | null, suggestions: AiSuggestion | null, status: AiAnalysisStatus) => void;
}

const initialState = {
  currentStep: 1,
  niche: "",
  slug: "",
  bio: "",
  gender: "creadora",
  country: "",
  profileImage: null,
  connectedSocials: {
    instagram: true,
    youtube: false,
    tiktok: false,
  },
  socialUrls: { instagram: "", youtube: "", tiktok: "" },
  followerCounts: { instagram: 0, tiktok: 0 },
  consent: false,
  aiCase: null as AiCase | null,
  aiSuggestions: null as AiSuggestion | null,
  aiAnalysisStatus: "idle" as AiAnalysisStatus,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      setNiche: (niche) => set({ niche }),
      setProfileInfo: (slug, bio, gender, country, profileImage) => set({ slug, bio, gender, country, profileImage }),

      toggleSocial: (platform) =>
        set((state) => ({
          connectedSocials: {
            ...state.connectedSocials,
            [platform]: !state.connectedSocials[platform],
          },
        })),

      setSocialUrl: (platform, url) =>
        set((state) => ({ socialUrls: { ...state.socialUrls, [platform]: url } })),

      setFollowerCount: (platform, count) =>
        set((state) => ({ followerCounts: { ...state.followerCounts, [platform]: count } })),

      setConsent: (consent) => set({ consent }),

      setAiAnalysis: (aiCase, suggestions, status) => set({ aiCase, aiSuggestions: suggestions, aiAnalysisStatus: status }),    }),
    {
      name: "pina-onboarding-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        niche: state.niche,
        slug: state.slug,
        bio: state.bio,
        gender: state.gender,
        country: state.country,
        profileImage: state.profileImage,
        connectedSocials: state.connectedSocials,
        socialUrls: state.socialUrls,
        followerCounts: state.followerCounts,
        consent: state.consent,
        aiCase: state.aiCase,
        aiSuggestions: state.aiSuggestions,
        aiAnalysisStatus: state.aiAnalysisStatus,
      }),
    }
  )
);
