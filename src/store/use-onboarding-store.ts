import { create } from "zustand";

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
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setNiche: (niche: string) => void;
  setProfileInfo: (slug: string, bio: string, gender: string, country: string, profileImage: string | null) => void;
  toggleSocial: (platform: keyof OnboardingState["connectedSocials"]) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1, // Steps 1 to 3
  niche: "",
  slug: "",
  bio: "",
  gender: "creadora",
  country: "",
  profileImage: null,
  connectedSocials: {
    instagram: true, // Defaulting per Figma mockups
    youtube: false,
    tiktok: false,
  },
  
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  
  setNiche: (niche) => set({ niche }),
  setProfileInfo: (slug, bio, gender, country, profileImage) => set({ slug, bio, gender, country, profileImage }),
  
  toggleSocial: (platform) => set((state) => ({
    connectedSocials: {
      ...state.connectedSocials,
      [platform]: !state.connectedSocials[platform],
    }
  }))
}));
