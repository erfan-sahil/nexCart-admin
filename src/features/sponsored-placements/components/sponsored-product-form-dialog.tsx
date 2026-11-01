import { useState, type FormEvent } from "react"
import { MousePointerClick } from "lucide-react"
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/lib/api/errors"

import { SPONSORED_SECTION_LABEL } from "../labels"
import {
  EMPTY_SPONSORED_FORM,
  parseSponsoredForm,
  toSponsoredForm,
  toUpsertPayload,
  type SponsoredFormValues,
} from "../schema"
import type {
  SponsoredPlacement,
  SponsoredSection,
  SponsoredSlot,
} from "../services/sponsored-placements.api"
import { useUpsertSponsoredMutation } from "../services/sponsored-placements.query"
import { SponsoredProductField } from "./sponsored-product-field"

const FORM_FIELDS = [
  "section",
  "productId",
  "title",
  "subtitle",
  "ctaLabel",
] as const

type SponsoredField = (typeof FORM_FIELDS)[number]
type FieldErrors = Partial<Record<SponsoredField, string>>

function isSponsoredField(value: string): value is SponsoredField {
  return FORM_FIELDS.some((field) => field === value)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isSponsoredField(key) && !errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
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
    const key = field.path.split(".")[0] ?? ""

    if (isSponsoredField(key) && !fields[key]) {
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

type SponsoredProductFormDialogProps = {
  placement: SponsoredPlacement | null
  slot: SponsoredSlot | null
  availableSections: SponsoredSection[]
  open: boolean
  onClose: () => void
}

function SponsoredProductForm({
  placement,
  slot,
  availableSections,
  onClose,
}: {
  placement: SponsoredPlacement | null
  slot: SponsoredSlot
  availableSections: SponsoredSection[]
  onClose: () => void
}) {
  const upsert = useUpsertSponsoredMutation()
  const [form, setForm] = useState<SponsoredFormValues>(() => {
    if (placement) {
      return toSponsoredForm(placement)
    }

    return {
      ...EMPTY_SPONSORED_FORM,
      section: availableSections[0] ?? "top-selling",
    }
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const saving = upsert.isPending
  const editing = Boolean(placement?.productId)

  const sectionOptions =
    placement?.section && !availableSections.includes(placement.section)
      ? [placement.section, ...availableSections]
      : availableSections

  const setField = <K extends keyof SponsoredFormValues>(
    key: K,
    value: SponsoredFormValues[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (isSponsoredField(String(key))) {
      setErrors((current) => {
        const field = String(key) as SponsoredField
        if (!current[field]) {
          return current
        }

        const next = { ...current }
        delete next[field]
        return next
      })
    }
    setFormError(null)
  }

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    const parsed = parseSponsoredForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(zodFormMessage(parsed.error))
      return
    }

    setErrors({})
    setFormError(null)

    try {
      await upsert.mutateAsync({
        slot,
        payload: toUpsertPayload(parsed.data),
      })
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next.fields)
        setFormError(next.message)
        return
      }

      setFormError(
        editing
          ? "Could not update this sponsored product. Please try again."
          : "Could not create this sponsored product. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !saving) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <MousePointerClick className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {editing ? "Edit sponsored product" : "New sponsored product"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                One sponsored product per section. Choose Top selling or New
                arrivals.
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
              <Field data-invalid={Boolean(errors.section) || undefined}>
                <FieldLabel htmlFor="sponsored-section">Section</FieldLabel>
                <Select
                  value={form.section}
                  onValueChange={(value) =>
                    setField("section", value as SponsoredSection)
                  }
                  disabled={saving || sectionOptions.length === 0}
                >
                  <SelectTrigger
                    id="sponsored-section"
                    className="h-9 w-full"
                    aria-invalid={Boolean(errors.section)}
                  >
                    <SelectValue placeholder="Choose a section" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    className="pointer-events-auto z-[70] w-(--radix-select-trigger-width)"
                  >
                    {sectionOptions.map((section) => (
                      <SelectItem
                        key={section}
                        value={section}
                        className="cursor-pointer"
                      >
                        {SPONSORED_SECTION_LABEL[section]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Each homepage section can only have one sponsored product.
                </FieldDescription>
                <FieldError>{errors.section}</FieldError>
              </Field>

              <SponsoredProductField
                productId={form.productId}
                productLabel={form.productName}
                error={errors.productId}
                disabled={saving}
                onChange={({ productId, productLabel }) => {
                  setForm((current) => ({
                    ...current,
                    productId,
                    productName: productLabel,
                  }))
                  setErrors((current) => {
                    if (!current.productId) return current
                    const next = { ...current }
                    delete next.productId
                    return next
                  })
                  setFormError(null)
                }}
              />

              <Field data-invalid={Boolean(errors.title) || undefined}>
                <FieldLabel htmlFor="sponsored-title">
                  Title override
                </FieldLabel>
                <Input
                  id="sponsored-title"
                  className="h-9"
                  value={form.title}
                  maxLength={120}
                  disabled={saving}
                  aria-invalid={Boolean(errors.title)}
                  placeholder="Defaults to product name"
                  onChange={(event) => setField("title", event.target.value)}
                />
                <FieldError>{errors.title}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.subtitle) || undefined}>
                <FieldLabel htmlFor="sponsored-subtitle">
                  Subtitle override
                </FieldLabel>
                <Input
                  id="sponsored-subtitle"
                  className="h-9"
                  value={form.subtitle}
                  maxLength={240}
                  disabled={saving}
                  aria-invalid={Boolean(errors.subtitle)}
                  placeholder="Defaults to short description"
                  onChange={(event) => setField("subtitle", event.target.value)}
                />
                <FieldError>{errors.subtitle}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.ctaLabel) || undefined}>
                <FieldLabel htmlFor="sponsored-cta">CTA label</FieldLabel>
                <Input
                  id="sponsored-cta"
                  className="h-9"
                  value={form.ctaLabel}
                  maxLength={40}
                  disabled={saving}
                  aria-invalid={Boolean(errors.ctaLabel)}
                  placeholder="Shop now"
                  onChange={(event) => setField("ctaLabel", event.target.value)}
                />
                <FieldError>{errors.ctaLabel}</FieldError>
              </Field>

              <Field className="flex flex-row items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
                <div className="min-w-0">
                  <FieldLabel htmlFor="sponsored-active">Active</FieldLabel>
                  <FieldDescription>
                    Inactive placements stay saved but are hidden on the
                    storefront.
                  </FieldDescription>
                </div>
                <Switch
                  id="sponsored-active"
                  checked={form.isActive}
                  disabled={saving}
                  onCheckedChange={(checked) => setField("isActive", checked)}
                />
              </Field>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="relative z-10 shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="relative z-10 cursor-pointer"
              disabled={saving}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void submit()
              }}
            >
              {saving
                ? editing
                  ? "Saving…"
                  : "Creating…"
                : editing
                  ? "Save changes"
                  : "Create sponsored product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SponsoredProductFormDialog({
  placement,
  slot,
  availableSections,
  open,
  onClose,
}: SponsoredProductFormDialogProps) {
  if (!open || !slot) {
    return null
  }

  return (
    <SponsoredProductForm
      key={placement?.slot ?? `create-${slot}`}
      placement={placement}
      slot={slot}
      availableSections={availableSections}
      onClose={onClose}
    />
  )
}
