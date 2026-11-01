import { useState, type FormEvent } from "react"
import { Ticket } from "lucide-react"
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
import { ApiError } from "@/lib/api/errors"

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
            <FieldLabel htmlFor="coupon-label">Label (optional)</FieldLabel>
            <Input
              id="coupon-label"
              className="h-9"
              value={form.label}
              onChange={(event) => setField("label", event.target.value)}
              placeholder="Summer sale"
              disabled={saving}
              aria-invalid={Boolean(errors.label)}
            />
            <FieldError>{errors.label}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.discountType) || undefined}>
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
                  <SelectItem value="percent" className="cursor-pointer">
                    Percent
                  </SelectItem>
                  <SelectItem value="amount" className="cursor-pointer">
                    Fixed amount
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError>{errors.discountType}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.discountValue) || undefined}>
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

          <Field data-invalid={Boolean(errors.minimumSubtotal) || undefined}>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.startsAt) || undefined}>
              <FieldLabel htmlFor="coupon-starts">Starts</FieldLabel>
              <Input
                id="coupon-starts"
                className="h-9"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setField("startsAt", event.target.value)}
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
                onChange={(event) => setField("endsAt", event.target.value)}
                disabled={saving}
                aria-invalid={Boolean(errors.endsAt)}
              />
              <FieldError>{errors.endsAt}</FieldError>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.usageLimit) || undefined}>
              <FieldLabel htmlFor="coupon-usage-limit">
                Total usage limit
              </FieldLabel>
              <Input
                id="coupon-usage-limit"
                className="h-9"
                inputMode="numeric"
                value={form.usageLimit}
                onChange={(event) => setField("usageLimit", event.target.value)}
                placeholder="Unlimited"
                disabled={saving}
                aria-invalid={Boolean(errors.usageLimit)}
              />
              <FieldDescription>
                Leave blank for unlimited redemptions.
              </FieldDescription>
              <FieldError>{errors.usageLimit}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.perCustomerLimit) || undefined}>
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

          <Field orientation="horizontal" className="items-center gap-2">
            <Checkbox
              id="coupon-enabled"
              checked={form.isEnabled}
              onCheckedChange={(checked) =>
                setField("isEnabled", checked === true)
              }
              disabled={saving}
            />
            <FieldLabel htmlFor="coupon-enabled" className="font-normal">
              Coupon is enabled
            </FieldLabel>
          </Field>
        </FieldGroup>
      </ScrollArea>

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
        <Button type="submit" className="cursor-pointer" disabled={saving}>
          {saving ? "Saving…" : coupon ? "Save changes" : "Create coupon"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CouponFormDialog({
  coupon,
  open,
  onClose,
}: CouponFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-5 text-primary" />
            {coupon ? "Edit coupon" : "New coupon"}
          </DialogTitle>
          <DialogDescription>
            Discount codes apply to merchandise subtotal at checkout. Only
            admins can create them.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CouponForm
            key={coupon?.id ?? "new"}
            coupon={coupon}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
