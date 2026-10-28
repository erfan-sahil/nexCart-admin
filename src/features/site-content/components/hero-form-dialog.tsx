import { useState, type FormEvent } from "react"
import { Images } from "lucide-react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

function zodFormMessage(error: ZodError) {
  const messages = [
    ...new Set(
      error.issues
        .map((issue) => issue.message)
        .filter((message) => message.length > 0)
    ),
  ]

  return messages.join("\n") || "Check the highlighted fields and try again."
}

function errorsFromApi(error: ApiError) {
  const fields: FieldErrors = {}
  let hasUnmapped = false

  for (const field of error.fields ?? []) {
    const key = fieldFromApiPath(field.path)

    if (key && !fields[key]) {
      fields[key] = field.message
    } else {
      hasUnmapped = true
    }
  }

  const message =
    Object.keys(fields).length > 0 &&
    !hasUnmapped &&
    error.message === "Validation failed"
      ? null
      : error.message

  return { fields, message }
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

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    const parsed = parseHeroForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(zodFormMessage(parsed.error))
      return
    }

    setErrors({})
    setFormError(null)

    try {
      await onSubmit(toHeroSlide(parsed.data))
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next.fields)
        setFormError(next.message)
        return
      }

      setFormError(
        slide
          ? "Could not update this hero. Please try again."
          : "Could not create this hero. Please try again."
      )
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
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <Images className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {slide ? slide.title : "New hero"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {slide
                  ? "Update this homepage hero."
                  : "Add copy and an image. Only three heroes can be active at once."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          {formError ? (
            <p
              role="alert"
              className="px-6 pt-4 text-sm whitespace-pre-line text-destructive"
            >
              {formError}
            </p>
          ) : null}
          <ScrollArea
            type="auto"
            className="min-h-0 flex-1 overflow-hidden"
            viewportClassName="h-auto max-h-[min(32rem,calc(100dvh-16rem))]"
          >
            <FieldGroup className="gap-4 px-6 py-5">
              <Field data-invalid={Boolean(errors.eyebrow) || undefined}>
                <FieldLabel htmlFor="hero-eyebrow">Eyebrow</FieldLabel>
                <Input
                  id="hero-eyebrow"
                  className="h-9"
                  value={form.eyebrow}
                  maxLength={60}
                  disabled={busy}
                  aria-invalid={Boolean(errors.eyebrow)}
                  onChange={(event) => setField("eyebrow", event.target.value)}
                  autoFocus
                />
                <FieldError>{errors.eyebrow}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.title) || undefined}>
                <FieldLabel htmlFor="hero-title">Title</FieldLabel>
                <Input
                  id="hero-title"
                  className="h-9"
                  value={form.title}
                  maxLength={140}
                  disabled={busy}
                  aria-invalid={Boolean(errors.title)}
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
                  aria-invalid={Boolean(errors.description)}
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
              <Field orientation="horizontal">
                <Checkbox
                  id="hero-active"
                  checked={form.isActive}
                  disabled={busy || (activationBlocked && !form.isActive)}
                  onCheckedChange={(checked) => {
                    setForm((current) => ({
                      ...current,
                      isActive: checked === true,
                    }))
                    setFormError(null)
                  }}
                />
                <FieldContent>
                  <FieldLabel htmlFor="hero-active">Active</FieldLabel>
                  <FieldDescription>
                    {activationBlocked && !form.isActive
                      ? "Three heroes are already active. Deactivate one before turning this on."
                      : "Inactive heroes stay in the list and stay off the homepage."}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </ScrollArea>
          <DialogFooter className="relative z-10 shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="relative z-10 cursor-pointer"
              disabled={busy}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void submit()
              }}
            >
              {uploadingImage
                ? "Uploading…"
                : saving
                  ? slide
                    ? "Saving…"
                    : "Creating…"
                  : slide
                    ? "Save changes"
                    : "Create hero"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
