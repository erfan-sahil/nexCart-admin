import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

import { useLogin } from "../hooks"

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function LoginForm() {
  const login = useLogin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      await login.mutateAsync({ email, password })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not sign in. Please try again."
      )
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => void onSubmit(event)}
      noValidate
    >
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          className={fieldClass}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Password</span>
        <input
          type="password"
          className={fieldClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          minLength={8}
        />
      </label>

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
