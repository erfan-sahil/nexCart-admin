import { useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

import { useHeroQuery, useSaveHeroMutation } from "../hooks"
import {
  EMPTY_HERO_FORM,
  parseHeroForm,
  toHeroInput,
  type HeroFormValues,
} from "../schema"
import type { Hero } from "../types"
import { HeroImageField } from "./hero-image-field"

const HERO_FIELDS = ["eyebrow", "title", "description", "image"] as const

type HeroField = (typeof HERO_FIELDS)[number]
type FieldErrors = Partial<Record<HeroField, string>>

function isHeroField(value: string): value is HeroField {
  return HERO_FIELDS.some((field) => field === value)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isHeroField(key) && !errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
}

function errorsFromApi(error: ApiError) {
  const fields: FieldErrors = {}

  for (const field of error.fields ?? []) {
    if (isHeroField(field.path) && !fields[field.path]) {
      fields[field.path] = field.message
    }
  }

  return fields
}

function toForm(hero: Hero | null): HeroFormValues {
  if (!hero) {
    return EMPTY_HERO_FORM
  }

  return {
    eyebrow: hero.eyebrow,
    title: hero.title,
    description: hero.description,
    image: hero.image,
  }
}

function HeroForm({ initial }: { initial: Hero | null }) {
  const saveHero = useSaveHeroMutation()
  const [form, setForm] = useState<HeroFormValues>(() => toForm(initial))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const busy = saveHero.isPending || uploadingImage

  const setField = (field: HeroField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
    setSaved(false)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = parseHeroForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(null)
      setSaved(false)
      return
    }

    setErrors({})
    setFormError(null)

    try {
      const hero = await saveHero.mutateAsync(toHeroInput(parsed.data))
      setForm(toForm(hero))
      setSaved(true)
    } catch (error) {
      setSaved(false)

      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next)
        setFormError(Object.keys(next).length > 0 ? null : error.message)
        return
      }

      setFormError("Could not save the hero section. Please try again.")
    }
  }

  return (
    <form
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      onSubmit={(event) => void onSubmit(event)}
    >
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.eyebrow) || undefined}>
            <FieldLabel htmlFor="hero-eyebrow">Eyebrow</FieldLabel>
            <Input
              id="hero-eyebrow"
              value={form.eyebrow}
              maxLength={60}
              disabled={busy}
              aria-invalid={Boolean(errors.eyebrow) || undefined}
              onChange={(event) => setField("eyebrow", event.target.value)}
            />
            <FieldError>{errors.eyebrow}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.title) || undefined}>
            <FieldLabel htmlFor="hero-title">Title</FieldLabel>
            <Input
              id="hero-title"
              value={form.title}
              maxLength={140}
              disabled={busy}
              aria-invalid={Boolean(errors.title) || undefined}
              onChange={(event) => setField("title", event.target.value)}
            />
            <FieldError>{errors.title}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.description) || undefined}>
            <FieldLabel htmlFor="hero-description">Description</FieldLabel>
            <Textarea
              id="hero-description"
              value={form.description}
              maxLength={400}
              disabled={busy}
              aria-invalid={Boolean(errors.description) || undefined}
              onChange={(event) => setField("description", event.target.value)}
            />
            <FieldError>{errors.description}</FieldError>
          </Field>
          <HeroImageField
            value={form.image}
            error={errors.image}
            disabled={saveHero.isPending}
            onChange={(value) => setField("image", value)}
            onPendingChange={setUploadingImage}
          />
        </FieldGroup>
      </section>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" className="cursor-pointer" disabled={busy}>
          {saveHero.isPending ? "Saving…" : "Save"}
        </Button>
        {saved ? <p className="text-sm text-muted-foreground">Saved</p> : null}
      </div>
    </form>
  )
}

export function HeroSectionPage() {
  const hero = useHeroQuery()

  if (hero.isPending) {
    return (
      <section className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading hero section…
      </section>
    )
  }

  if (hero.isError) {
    const message =
      hero.error instanceof ApiError
        ? hero.error.message
        : "Could not load the hero section."

    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 rounded-xl border border-border bg-card px-4 py-16 text-center">
        <p className="text-sm text-destructive">{message}</p>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => void hero.refetch()}
        >
          Try again
        </Button>
      </section>
    )
  }

  return <HeroForm initial={hero.data ?? null} />
}
