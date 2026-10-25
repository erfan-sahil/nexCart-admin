import type { QueryClient } from "@tanstack/react-query"
import axios, { type InternalAxiosRequestConfig } from "axios"

import { api } from "@/lib/api/client"

import { useAuthStore } from "../store"

import { refreshSession } from "./auth.api"
import { sessionQueryKey } from "./auth.query"

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const skipRefresh = ["/auth/login", "/auth/refresh", "/auth/logout"]

let installed = false
let queryClient: QueryClient | null = null

function shouldSkipRefresh(url: string | undefined) {
  return skipRefresh.some((path) => url?.includes(path))
}

export function setupAuthInterceptor(client: QueryClient) {
  queryClient = client

  if (installed) {
    return
  }

  installed = true

  api.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || !error.config) {
        return Promise.reject(error)
      }

      const config = error.config as RetryConfig

      if (
        error.response?.status !== 401 ||
        config._retry ||
        shouldSkipRefresh(config.url)
      ) {
        return Promise.reject(error)
      }

      config._retry = true

      try {
        const session = await refreshSession()
        queryClient?.setQueryData(sessionQueryKey, session)
        config.headers.Authorization = `Bearer ${session.accessToken}`
        return api(config)
      } catch (refreshError) {
        if (!useAuthStore.getState().accessToken) {
          queryClient?.setQueryData(sessionQueryKey, null)
        }

        return Promise.reject(refreshError)
      }
    }
  )
}
