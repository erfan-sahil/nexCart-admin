import { Navigate } from "react-router"

import { LoginForm } from "@/features/auth/components/login-form"
import { useAuthStore } from "@/features/auth/store"

export function LoginPage() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Checking session…
      </div>
    )
  }

  if (status === "authenticated" && user?.role === "admin") {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-brand-text">NexCart Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use an admin account to manage buyers, vendors, and the catalog.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
