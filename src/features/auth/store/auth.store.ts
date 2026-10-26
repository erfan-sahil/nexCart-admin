import { create } from "zustand"

import type { AuthSession, AuthUser } from "../types"

type AuthStatus = "loading" | "authenticated" | "anonymous"

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  sessionId: string | null
  expiresAt: number | null
  status: AuthStatus
  epoch: number
  setSession: (session: AuthSession) => void
  setUser: (user: AuthUser, sessionId?: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  sessionId: null,
  expiresAt: null,
  status: "loading",
  epoch: 0,
  setSession: (session) =>
    set((state) => ({
      user: session.user,
      accessToken: session.accessToken,
      sessionId: session.sessionId,
      expiresAt: Date.now() + session.expiresIn * 1000,
      status: "authenticated",
      epoch: state.epoch + 1,
    })),
  setUser: (user, sessionId) =>
    set((state) => ({
      user,
      sessionId: sessionId ?? state.sessionId,
    })),
  clearSession: () =>
    set((state) => ({
      user: null,
      accessToken: null,
      sessionId: null,
      expiresAt: null,
      status: "anonymous",
      epoch: state.epoch + 1,
    })),
}))

export function getAccessToken() {
  return useAuthStore.getState().accessToken
}

export function sessionFromStore(): AuthSession | null {
  const { user, accessToken, sessionId, expiresAt } = useAuthStore.getState()

  if (!user || !accessToken || !sessionId || !expiresAt) {
    return null
  }

  return {
    user,
    accessToken,
    sessionId,
    tokenType: "Bearer",
    expiresIn: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  }
}
