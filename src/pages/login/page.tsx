import { Navigate } from "react-router"

import { BrandLogo } from "@/components/brand-logo"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-soft),transparent_58%)]"
      />
      <Card className="relative w-full max-w-md !gap-0 py-0 shadow-sm">
        <div className="flex flex-col items-center gap-4 pt-4 text-center">
          <div className="flex w-full justify-center bg-sidebar py-3">
            <BrandLogo className="h-10" />
          </div>
          <div className="px-6">
            <h1 className="text-2xl leading-none font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              Sign in to manage buyers, vendors, and the catalog.
            </p>
          </div>
        </div>
        <CardContent className="pt-5 pb-6">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
