import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { ApiError } from "@/lib/api/errors"

import { useLogin } from "../hooks"

const fieldClass =
  "h-12 rounded-full border-border/80 bg-background px-4 shadow-xs"

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(8, "Password must be at least 8 characters."),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const login = useLogin()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginValues) => {
    setError(null)

    try {
      await login.mutateAsync(values)
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
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                autoFocus
                disabled={login.isPending}
                aria-invalid={fieldState.invalid}
                className={fieldClass}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={login.isPending}
                aria-invalid={fieldState.invalid}
                className={fieldClass}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full text-[0.9375rem] font-semibold"
        disabled={login.isPending}
      >
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
