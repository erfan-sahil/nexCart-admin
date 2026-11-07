import { useState, type FormEvent } from "react"
import { Ticket } from "lucide-react"
import type { ZodError } from "zod"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/lib/api/errors"

import {
  COUPON_LIFECYCLE_BADGE,
  COUPON_LIFECYCLE_LABEL,
  formatUsageLimit,
  getCouponLifecycle,
} from "../labels"

import { useCreateCouponMutation, useUpdateCouponMutation } from "../hooks"
import {
  COUPON_FORM_FIELDS,
  EMPTY_COUPON_FORM,
  isCouponFormField,
  parseCouponForm,
  toCouponForm,
  toCreateCouponPayload,
  toUpdateCouponPayload,
  type CouponFormValues,
} from "../schema"
import type { Coupon } from "../types"

type CouponField = (typeof COUPON_FORM_FIELDS)[number]
type FieldErrors = Partial<Record<CouponField, string>>

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isCouponFormField(key) && !errors[key]) {
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

    if (isCouponFormField(key) && !fields[key]) {
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

type CouponFormDialogProps = {
  coupon: Coupon | null
  open: boolean
  onClose: () => void
}

const selectContentClassName =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

function FormSectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

function CouponForm({
  coupon,
  onClose,
}: {
  coupon: Coupon | null
  onClose: () => void
}) {
  const createCoupon = useCreateCouponMutation()
  const updateCoupon = useUpdateCouponMutation()
  const [form, setForm] = useState<CouponFormValues>(() =>
    coupon ? toCouponForm(coupon) : { ...EMPTY_COUPON_FORM }
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const saving = createCoupon.isPending || updateCoupon.isPending
  const editing = Boolean(coupon)
  const lifecycle = coupon ? getCouponLifecycle(coupon) : null

  const setField = <K extends keyof CouponFormValues>(
    key: K,
    value: CouponFormValues[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (isCouponFormField(key)) {
      setErrors((current) => {
        if (!current[key]) {
          return current
        }

        const next = { ...current }
        delete next[key]
        return next
      })
    }
    setFormError(null)
  }

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    const parsed = parseCouponForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(zodFormMessage(parsed.error))
      return
    }

    setErrors({})
    setFormError(null)

    try {
      if (coupon) {
        const payload = toUpdateCouponPayload(form)
        if (!payload.success) {
          setErrors(toFieldErrors(payload.error))
          setFormError(zodFormMessage(payload.error))
          return
        }

        await updateCoupon.mutateAsync({ id: coupon.id, payload: payload.data })
      } else {
        const payload = toCreateCouponPayload(form)
        if (!payload.success) {
          setErrors(toFieldErrors(payload.error))
          setFormError(zodFormMessage(payload.error))
          return
        }

        await createCoupon.mutateAsync(payload.data)
      }

      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        const mapped = errorsFromApi(error)
        setErrors(mapped.fields)
        setFormError(mapped.message)
        return
      }

      setFormError("Could not save coupon.")
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
              <Ticket className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle
                className={
                  editing
                    ? "truncate font-mono text-lg font-semibold"
                    : "truncate text-lg font-semibold"
                }
              >
                {editing ? coupon!.code : "New coupon"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {editing
                  ? coupon!.label ||
                    "Update discount, window, and usage limits."
                  : "Discount codes apply to merchandise subtotal at checkout."}
              </DialogDescription>
              {editing && lifecycle ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <UniversalBadge
                    name={COUPON_LIFECYCLE_LABEL[lifecycle]}
                    colors={COUPON_LIFECYCLE_BADGE[lifecycle]}
                  />
                  <UniversalBadge
                    name={coupon!.isEnabled ? "enabled" : "disabled"}
                    colors={
                      coupon!.isEnabled
                        ? badgeColors.active
                        : badgeColors.neutral
                    }
                  />
                  <UniversalBadge
                    name={formatUsageLimit(
                      coupon!.usageLimit,
                      coupon!.usedCount
                    )}
                    colors={badgeColors.neutral}
                    showDot={false}
                    className="normal-case"
                  />
                </div>
              ) : null}
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
              className="border-b border-destructive/20 bg-destructive/5 px-6 py-3 text-sm whitespace-pre-line text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <DialogBody
            scrollClassName="min-h-0 flex-1 overflow-hidden bg-muted/20"
            viewportClassName="h-auto max-h-[min(32rem,calc(100dvh-16rem))]"
          >
            <div className="space-y-6 px-6 py-5">
              <section className="space-y-4">
                <FormSectionLabel>Identity</FormSectionLabel>
                <FieldGroup className="gap-4">
                  <Field data-invalid={Boolean(errors.code) || undefined}>
                    <FieldLabel htmlFor="coupon-code">Code</FieldLabel>
                    <Input
                      id="coupon-code"
                      className="h-9 font-mono uppercase"
                      value={form.code}
                      onChange={(event) =>
                        setField("code", event.target.value.toUpperCase())
                      }
                      placeholder="SAVE10"
                      autoComplete="off"
                      disabled={saving}
                      aria-invalid={Boolean(errors.code)}
                    />
                    <FieldError>{errors.code}</FieldError>
                  </Field>

                  <Field data-invalid={Boolean(errors.label) || undefined}>
                    <FieldLabel htmlFor="coupon-label">
                      Label (optional)
                    </FieldLabel>
                    <Input
                      id="coupon-label"
                      className="h-9"
                      value={form.label}
                      onChange={(event) =>
                        setField("label", event.target.value)
                      }
                      placeholder="Summer sale"
                      disabled={saving}
                      aria-invalid={Boolean(errors.label)}
                    />
                    <FieldError>{errors.label}</FieldError>
                  </Field>
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <FormSectionLabel>Discount</FormSectionLabel>
                <FieldGroup className="gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      data-invalid={Boolean(errors.discountType) || undefined}
                    >
                      <FieldLabel htmlFor="coupon-discount-type">
                        Discount type
                      </FieldLabel>
                      <Select
                        value={form.discountType}
                        onValueChange={(value) =>
                          setField(
                            "discountType",
                            value as CouponFormValues["discountType"]
                          )
                        }
                        disabled={saving}
                      >
                        <SelectTrigger
                          id="coupon-discount-type"
                          className="h-9 w-full"
                          aria-invalid={Boolean(errors.discountType)}
                        >
                          <SelectValue placeholder="Choose discount type" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          align="start"
                          side="bottom"
                          sideOffset={6}
                          className={selectContentClassName}
                        >
                          <SelectItem
                            value="percent"
                            className="cursor-pointer"
                          >
                            Percent
                          </SelectItem>
                          <SelectItem value="amount" className="cursor-pointer">
                            Fixed amount
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError>{errors.discountType}</FieldError>
                    </Field>

                    <Field
                      data-invalid={Boolean(errors.discountValue) || undefined}
                    >
                      <FieldLabel htmlFor="coupon-discount-value">
                        Discount value
                      </FieldLabel>
                      <Input
                        id="coupon-discount-value"
                        className="h-9"
                        inputMode="decimal"
                        value={form.discountValue}
                        onChange={(event) =>
                          setField("discountValue", event.target.value)
                        }
                        disabled={saving}
                        aria-invalid={Boolean(errors.discountValue)}
                      />
                      <FieldError>{errors.discountValue}</FieldError>
                    </Field>
                  </div>

                  <Field
                    data-invalid={Boolean(errors.minimumSubtotal) || undefined}
                  >
                    <FieldLabel htmlFor="coupon-min-subtotal">
                      Minimum subtotal
                    </FieldLabel>
                    <Input
                      id="coupon-min-subtotal"
                      className="h-9"
                      inputMode="decimal"
                      value={form.minimumSubtotal}
                      onChange={(event) =>
                        setField("minimumSubtotal", event.target.value)
                      }
                      disabled={saving}
                      aria-invalid={Boolean(errors.minimumSubtotal)}
                    />
                    <FieldDescription>0 means no minimum.</FieldDescription>
                    <FieldError>{errors.minimumSubtotal}</FieldError>
                  </Field>
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <FormSectionLabel>Schedule</FormSectionLabel>
                <FieldGroup className="gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={Boolean(errors.startsAt) || undefined}>
                      <FieldLabel htmlFor="coupon-starts">Starts</FieldLabel>
                      <Input
                        id="coupon-starts"
                        className="h-9"
                        type="datetime-local"
                        value={form.startsAt}
                        onChange={(event) =>
                          setField("startsAt", event.target.value)
                        }
                        disabled={saving}
                        aria-invalid={Boolean(errors.startsAt)}
                      />
                      <FieldError>{errors.startsAt}</FieldError>
                    </Field>

                    <Field data-invalid={Boolean(errors.endsAt) || undefined}>
                      <FieldLabel htmlFor="coupon-ends">Ends</FieldLabel>
                      <Input
                        id="coupon-ends"
                        className="h-9"
                        type="datetime-local"
                        value={form.endsAt}
                        onChange={(event) =>
                          setField("endsAt", event.target.value)
                        }
                        disabled={saving}
                        aria-invalid={Boolean(errors.endsAt)}
                      />
                      <FieldError>{errors.endsAt}</FieldError>
                    </Field>
                  </div>
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <FormSectionLabel>Usage limits</FormSectionLabel>
                <FieldGroup className="gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      data-invalid={Boolean(errors.usageLimit) || undefined}
                    >
                      <FieldLabel htmlFor="coupon-usage-limit">
                        Total usage limit
                      </FieldLabel>
                      <Input
                        id="coupon-usage-limit"
                        className="h-9"
                        inputMode="numeric"
                        value={form.usageLimit}
                        onChange={(event) =>
                          setField("usageLimit", event.target.value)
                        }
                        placeholder="Unlimited"
                        disabled={saving}
                        aria-invalid={Boolean(errors.usageLimit)}
                      />
                      <FieldDescription>
                        Leave blank for unlimited redemptions.
                      </FieldDescription>
                      <FieldError>{errors.usageLimit}</FieldError>
                    </Field>

                    <Field
                      data-invalid={
                        Boolean(errors.perCustomerLimit) || undefined
                      }
                    >
                      <FieldLabel htmlFor="coupon-per-customer">
                        Per customer limit
                      </FieldLabel>
                      <Input
                        id="coupon-per-customer"
                        className="h-9"
                        inputMode="numeric"
                        value={form.perCustomerLimit}
                        onChange={(event) =>
                          setField("perCustomerLimit", event.target.value)
                        }
                        disabled={saving}
                        aria-invalid={Boolean(errors.perCustomerLimit)}
                      />
                      <FieldError>{errors.perCustomerLimit}</FieldError>
                    </Field>
                  </div>
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <FormSectionLabel>Status</FormSectionLabel>
                <Field className="flex flex-row items-center justify-between gap-4 rounded-xl border border-border/80 bg-card px-3.5 py-3">
                  <div className="min-w-0">
                    <FieldLabel htmlFor="coupon-enabled">Enabled</FieldLabel>
                    <FieldDescription>
                      Disabled coupons stay saved but cannot be applied at
                      checkout.
                    </FieldDescription>
                  </div>
                  <Switch
                    id="coupon-enabled"
                    checked={form.isEnabled}
                    disabled={saving}
                    onCheckedChange={(checked) =>
                      setField("isEnabled", checked)
                    }
                  />
                </Field>
              </section>
            </div>
          </DialogBody>

          <DialogFooter className="relative z-10 shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={saving}
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
                  : "Create coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CouponFormDialog({
  coupon,
  open,
  onClose,
}: CouponFormDialogProps) {
  if (!open) {
    return null
  }

  return (
    <CouponForm key={coupon?.id ?? "new"} coupon={coupon} onClose={onClose} />
  )
}
