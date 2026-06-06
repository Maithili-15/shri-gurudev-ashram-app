import { create } from "zustand";
import type { AuthUser } from "../services/auth";

type AuthState = {
  user: AuthUser | null;
  isHydrated: boolean;
  aadhaarNumber: string;
  temporaryAadhaarUri: string | null;
  temporarySelfieUri: string | null;
  setUser: (u: AuthUser) => void;
  clearUser: () => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
  setAadhaarNumber: (value: string) => void;
  setTemporaryAadhaarUri: (uri: string | null) => void;
  setTemporarySelfieUri: (uri: string | null) => void;
  clearTemporaryUris: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  aadhaarNumber: "",
  temporaryAadhaarUri: null,
  temporarySelfieUri: null,
  setUser: (u) => set({ user: u }),
  clearUser: () => set({ user: null }),
  logout: () => set({ user: null }),
  setHydrated: (value) => set({ isHydrated: value }),
  setAadhaarNumber: (value) => set({ aadhaarNumber: value }),
  setTemporaryAadhaarUri: (uri) => set({ temporaryAadhaarUri: uri }),
  setTemporarySelfieUri: (uri) => set({ temporarySelfieUri: uri }),
  clearTemporaryUris: () =>
    set({ temporaryAadhaarUri: null, temporarySelfieUri: null }),
}));
