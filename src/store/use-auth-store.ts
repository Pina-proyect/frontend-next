"use client";

// Store de autenticación con persistencia y protección de hidratación.
// Este patrón evita errores de hidratación en Next.js App Router
// al devolver un estado por defecto en el servidor y usar el real en el cliente.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

// 1) Definición del modelo de usuario (alineado con backend Nest/Auth)
export interface User {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  tokenVersion: number;
}

interface AuthState {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  user: User | null;
  setSession: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  clearSession: () => void;
}

// 2) Store base con persistencia en localStorage
const useAuthStoreBase = create<AuthState>()(
  persist(
    (set: any) => ({
      accessToken: undefined as string | undefined,
      refreshToken: undefined as string | undefined,
      user: null as User | null,
      setSession: (data: { accessToken: string; refreshToken: string; user: User }) =>
        set(data),
      clearSession: () =>
        set({
          accessToken: undefined as string | undefined,
          refreshToken: undefined as string | undefined,
          user: null as User | null,
        }),
    }),
    {
      name: "pina-auth-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 3) Hook selector con protección de hidratación
export const useAuthStore = <T,>(selector: (state: AuthState) => T): T => {
  const [hydrated, setHydrated] = useState(false);
  const state = useAuthStoreBase(selector);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Estado por defecto (en SSR) para evitar desajustes de hidratación
  const defaultState = selector({
    accessToken: undefined,
    refreshToken: undefined,
    user: null,
    setSession: () => {},
    clearSession: () => {},
  });

  return hydrated ? state : defaultState;
};

// 4) Acciones y selectores sincrónicos (útiles en utilidades fuera de React)
export const getAuthToken = () => useAuthStoreBase.getState().accessToken;
export const getRefreshToken = () => useAuthStoreBase.getState().refreshToken;
export const setAuthSession = (data: {
  accessToken: string;
  refreshToken: string;
  user: User;
}) => useAuthStoreBase.getState().setSession(data);
export const clearAuthSession = () => useAuthStoreBase.getState().clearSession();