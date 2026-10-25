import { api } from "@/lib/api/client"
import { ApiError, toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import { sessionFromStore, useAuthStore } from "../store"
import type { AuthSession, LoginPayload } from "../types"

async function postSession(path: string, body?: LoginPayload) {
  try {
    const { data } = await api.post<ApiSuccess<AuthSession>>(path, body)
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

let refreshRequest: Promise<AuthSession> | null = null

export function login(input: LoginPayload) {
  return postSession("/auth/login", {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  })
}

export function refreshSession() {
  if (!refreshRequest) {
    const epoch = useAuthStore.getState().epoch

    refreshRequest = postSession("/auth/refresh")
      .then((session) => {
        if (useAuthStore.getState().epoch === epoch) {
          useAuthStore.getState().setSession(session)
        }

        return sessionFromStore() ?? session
      })
      .catch((error: unknown) => {
        const apiError = toApiError(error)
        const state = useAuthStore.getState()

        if (
          state.epoch === epoch &&
          (apiError.status === 401 || !state.accessToken)
        ) {
          state.clearSession()
        }

        throw apiError
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

export async function logout() {
  try {
    await api.post("/auth/logout")
  } catch (error) {
    const apiError = toApiError(error)
    useAuthStore.getState().clearSession()

    if (apiError.status !== 401) {
      throw apiError
    }

    return
  }

  useAuthStore.getState().clearSession()
}

export async function restoreSession() {
  try {
    return await refreshSession()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return sessionFromStore()
    }

    throw error
  }
}
