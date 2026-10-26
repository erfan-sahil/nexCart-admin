import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, type ReactNode } from "react"

import {
  restoreSession,
  sessionQueryKey,
  setupAuthInterceptor,
} from "../services"
import { useAuthStore } from "../store"

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  setupAuthInterceptor(queryClient)

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const session = await restoreSession()

      if (!session || session.user.role !== "admin") {
        useAuthStore.getState().clearSession()
        return null
      }

      return session
    },
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (sessionQuery.isError || sessionQuery.data === null) {
      if (useAuthStore.getState().status === "loading") {
        useAuthStore.getState().clearSession()
      }
    }
  }, [sessionQuery.isError, sessionQuery.data])

  return children
}
