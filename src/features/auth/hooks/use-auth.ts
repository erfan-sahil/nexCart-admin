import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"

import { ApiError } from "@/lib/api/errors"

import { login, logout, sessionQueryKey } from "../services"
import { useAuthStore } from "../store"
import type { AuthSession, LoginPayload } from "../types"

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: LoginPayload) => {
      const session = await login(input)

      if (session.user.role !== "admin") {
        throw new ApiError(403, {
          success: false,
          message: "Only admin accounts can sign in to this dashboard.",
          code: "FORBIDDEN",
        })
      }

      return session
    },
    onSuccess: (session: AuthSession) => {
      useAuthStore.getState().setSession(session)
      queryClient.setQueryData(sessionQueryKey, session)
      navigate("/", { replace: true })
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      useAuthStore.getState().clearSession()
      queryClient.setQueryData(sessionQueryKey, null)
      queryClient.clear()
      navigate("/login", { replace: true })
    },
  })
}
