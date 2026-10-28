import { useState, type FormEvent } from "react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

import {
  EMPTY_HERO_FORM,
  parseHeroForm,
  toHeroSlide,
  type HeroFormValues,
} from "../schema"
import type { HeroSlide } from "../types"
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

function fieldFromApiPath(path: string): HeroField | null {
  const key = path.split(".").at(-1) ?? ""
  return isHeroField(key) ? key : null
}

function errorsFromApi(error: ApiError) {
  const fields: FieldErrors = {}

  for (const field of error.fields ?? []) {
    const key = fieldFromApiPath(field.path)

    if (key && !fields[key]) {
      fields[key] = field.message
    }
  }

  return fields
}

function toForm(
  slide: HeroSlide | null,
  activationBlocked: boolean
): HeroFormValues {
  if (!slide) {
    return { ...EMPTY_HERO_FORM, isActive: !activationBlocked }
  }

  return {
    eyebrow: slide.eyebrow,
    title: slide.title,
    description: slide.description,
    image: slide.image,
    isActive: slide.isActive,
  }
}

type HeroFormDialogProps = {
  slide: HeroSlide | null
  activationBlocked: boolean
  saving: boolean
  onClose: () => void
  onSubmit: (slide: HeroSlide) => Promise<void>
}

export function HeroFormDialog({
  slide,
  activationBlocked,
  saving,
  onClose,
  onSubmit,
}: HeroFormDialogProps) {
  const [form, setForm] = useState<HeroFormValues>(() =>
    toForm(slide, activationBlocked)
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const busy = saving || uploadingImage

  const setField = (field: HeroField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = parseHeroForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(null)
      return
    }

    setErrors({})
    setFormError(null)

    try {
      await onSubmit(toHeroSlide(parsed.data))
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next)
        setFormError(Object.keys(next).length > 0 ? null : error.message)
        return
      }

      setFormError("Could not save this hero. Please try again.")
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !busy) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle>{slide ? "Edit hero" : "Add hero"}</DialogTitle>
          <DialogDescription>
            Copy and image for one homepage hero. Only three heroes can be
            active at once.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => void submit(event)}
        >
          <ScrollArea
            type="auto"
            className="max-h-[calc(100dvh-16rem)]"
            viewportClassName="max-h-[calc(100dvh-16rem)]"
          >
            <FieldGroup className="px-6 py-5">
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
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                />
                <FieldError>{errors.description}</FieldError>
              </Field>
              <HeroImageField
                value={form.image}
                error={errors.image}
                disabled={saving}
                onChange={(value) => setField("image", value)}
                onPendingChange={setUploadingImage}
              />
              <Field
                orientation="horizontal"
                className="items-center rounded-lg border border-border px-3 py-3 has-[>[data-slot=field-content]]:items-center"
              >
                <FieldContent>
                  <FieldLabel htmlFor="hero-active">Active</FieldLabel>
                  <FieldDescription>
                    {activationBlocked && !form.isActive
                      ? "Three heroes are already active. Deactivate one before turning this on."
                      : "Inactive heroes stay in the list and stay off the homepage."}
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="hero-active"
                  checked={form.isActive}
                  disabled={busy || (activationBlocked && !form.isActive)}
                  onCheckedChange={(checked) => {
                    setForm((current) => ({ ...current, isActive: checked }))
                    setFormError(null)
                  }}
                />
              </Field>
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
            </FieldGroup>
          </ScrollArea>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={busy}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
