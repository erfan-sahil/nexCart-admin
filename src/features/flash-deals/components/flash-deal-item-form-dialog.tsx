import { useState, type FormEvent } from "react"
import { Package } from "lucide-react"
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
import { ApiError } from "@/lib/api/errors"

import {
  useAddFlashDealItemMutation,
  useUpdateFlashDealItemMutation,
} from "../hooks"
import {
  EMPTY_ITEM_FORM,
  parseItemForm,
  toCreateItemPayload,
  toItemForm,
  toUpdateItemPayload,
  type ItemFormValues,
} from "../schema"
import type { FlashDealCampaign, FlashDealItem } from "../types"
import { FlashDealProductField } from "./flash-deal-product-field"

const FORM_FIELDS = ["productId", "discountType", "discountValue"] as const
type ItemField = (typeof FORM_FIELDS)[number]
type FieldErrors = Partial<Record<ItemField, string>>

function isItemField(value: string): value is ItemField {
  return FORM_FIELDS.some((field) => field === value)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isItemField(key) && !errors[key]) {
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

    if (isItemField(key) && !fields[key]) {
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

type FlashDealItemFormDialogProps = {
  campaign: FlashDealCampaign
  item: FlashDealItem | null
  open: boolean
  onClose: () => void
}

function FlashDealItemForm({
  campaign,
  item,
  onClose,
}: {
  campaign: FlashDealCampaign
  item: FlashDealItem | null
  onClose: () => void
}) {
  const addItem = useAddFlashDealItemMutation(campaign.id)
  const updateItem = useUpdateFlashDealItemMutation(campaign.id)
  const [form, setForm] = useState<ItemFormValues>(() =>
    item ? toItemForm(item) : { ...EMPTY_ITEM_FORM }
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const saving = addItem.isPending || updateItem.isPending

  const setField = <K extends keyof ItemFormValues>(
    key: K,
    value: ItemFormValues[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (isItemField(key)) {
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
    const parsed = parseItemForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(zodFormMessage(parsed.error))
      return
    }

    setErrors({})
    setFormError(null)

    try {
      if (item) {
        const payload = toUpdateItemPayload(item, parsed.data)

        if (Object.keys(payload).length === 0) {
          onClose()
          return
        }

        await updateItem.mutateAsync({ itemId: item.id, payload })
      } else {
        await addItem.mutateAsync(toCreateItemPayload(parsed.data))
      }

      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next.fields)
        setFormError(next.message)
        return
      }

      setFormError(
        item
          ? "Could not update this product. Please try again."
          : "Could not add this product. Please try again."
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
              <Package className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {item ? item.productName : "Add product"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {item
                  ? `Update the discount for ${campaign.name}.`
                  : `Add a product to ${campaign.name}. It uses the deal schedule automatically.`}
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
              <FlashDealProductField
                productId={form.productId}
                productLabel={form.productLabel}
                error={errors.productId}
                disabled={saving}
                locked={Boolean(item)}
                onChange={({ productId, productLabel }) => {
                  setForm((current) => ({
                    ...current,
                    productId,
                    productLabel,
                  }))
                  setErrors((current) => {
                    if (!current.productId) {
                      return current
                    }

                    const next = { ...current }
                    delete next.productId
                    return next
                  })
                  setFormError(null)
                }}
              />

              <Field data-invalid={Boolean(errors.discountType) || undefined}>
                <FieldLabel htmlFor="flash-deal-item-discount-type">
                  Discount type
                </FieldLabel>
                <Select
                  value={form.discountType}
                  disabled={saving}
                  onValueChange={(value) =>
                    setField(
                      "discountType",
                      value as ItemFormValues["discountType"]
                    )
                  }
                >
                  <SelectTrigger
                    id="flash-deal-item-discount-type"
                    className="h-9 w-full"
                    aria-invalid={Boolean(errors.discountType)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="amount">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError>{errors.discountType}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.discountValue) || undefined}>
                <FieldLabel htmlFor="flash-deal-item-discount-value">
                  Discount value
                </FieldLabel>
                <Input
                  id="flash-deal-item-discount-value"
                  className="h-9"
                  inputMode="decimal"
                  value={form.discountValue}
                  disabled={saving}
                  aria-invalid={Boolean(errors.discountValue)}
                  onChange={(event) =>
                    setField("discountValue", event.target.value)
                  }
                />
                <FieldDescription>
                  {form.discountType === "percent"
                    ? "Percent off this product’s variant list prices."
                    : "Fixed amount off this product’s variant list prices."}
                </FieldDescription>
                <FieldError>{errors.discountValue}</FieldError>
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
                ? item
                  ? "Saving…"
                  : "Adding…"
                : item
                  ? "Save changes"
                  : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function FlashDealItemFormDialog({
  campaign,
  item,
  open,
  onClose,
}: FlashDealItemFormDialogProps) {
  if (!open) {
    return null
  }

  return (
    <FlashDealItemForm
      key={item?.id ?? `add-${campaign.id}`}
      campaign={campaign}
      item={item}
      onClose={onClose}
    />
  )
}
