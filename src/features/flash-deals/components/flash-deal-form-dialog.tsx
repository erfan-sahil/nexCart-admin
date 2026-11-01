import { useState, type FormEvent } from "react"
import { Zap } from "lucide-react"
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
import { ApiError } from "@/lib/api/errors"

import {
  useCreateFlashDealMutation,
  useUpdateFlashDealMutation,
} from "../hooks"
import {
  EMPTY_CAMPAIGN_FORM,
  parseCampaignForm,
  toCampaignForm,
  toCreateCampaignPayload,
  toUpdateCampaignPayload,
  type CampaignFormValues,
} from "../schema"
import type { FlashDealCampaign } from "../types"

const FORM_FIELDS = ["name", "startsAt", "endsAt"] as const
type CampaignField = (typeof FORM_FIELDS)[number]
type FieldErrors = Partial<Record<CampaignField, string>>

function isCampaignField(value: string): value is CampaignField {
  return FORM_FIELDS.some((field) => field === value)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isCampaignField(key) && !errors[key]) {
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

    if (isCampaignField(key) && !fields[key]) {
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

type FlashDealFormDialogProps = {
  campaign: FlashDealCampaign | null
  open: boolean
  onClose: () => void
  onCreated?: (campaign: FlashDealCampaign) => void
}

function FlashDealForm({
  campaign,
  onClose,
  onCreated,
}: {
  campaign: FlashDealCampaign | null
  onClose: () => void
  onCreated?: (campaign: FlashDealCampaign) => void
}) {
  const createDeal = useCreateFlashDealMutation()
  const updateDeal = useUpdateFlashDealMutation()
  const [form, setForm] = useState<CampaignFormValues>(() =>
    campaign ? toCampaignForm(campaign) : { ...EMPTY_CAMPAIGN_FORM }
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const saving = createDeal.isPending || updateDeal.isPending

  const setField = <K extends keyof CampaignFormValues>(
    key: K,
    value: CampaignFormValues[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (isCampaignField(key)) {
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
    const parsed = parseCampaignForm(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(zodFormMessage(parsed.error))
      return
    }

    setErrors({})
    setFormError(null)

    try {
      if (campaign) {
        const payload = toUpdateCampaignPayload(campaign, parsed.data)

        if (Object.keys(payload).length === 0) {
          onClose()
          return
        }

        await updateDeal.mutateAsync({ id: campaign.id, payload })
      } else {
        const created = await createDeal.mutateAsync(
          toCreateCampaignPayload(parsed.data)
        )
        onCreated?.(created)
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
        campaign
          ? "Could not update this flash deal. Please try again."
          : "Could not create this flash deal. Please try again."
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
              <Zap className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {campaign ? campaign.name : "New flash deal"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {campaign
                  ? "Update the name and schedule. Only one flash deal can be active at a time."
                  : "Name the deal and set its window. Only one flash deal can run at a time—schedules cannot overlap."}
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
              <Field data-invalid={Boolean(errors.name) || undefined}>
                <FieldLabel htmlFor="flash-deal-name">Name</FieldLabel>
                <Input
                  id="flash-deal-name"
                  className="h-9"
                  value={form.name}
                  maxLength={80}
                  disabled={saving}
                  aria-invalid={Boolean(errors.name)}
                  autoFocus
                  onChange={(event) => setField("name", event.target.value)}
                />
                <FieldDescription>
                  Shown as the storefront flash deals section title when this
                  deal is active.
                </FieldDescription>
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.startsAt) || undefined}>
                <FieldLabel htmlFor="flash-deal-starts-at">Starts</FieldLabel>
                <Input
                  id="flash-deal-starts-at"
                  type="datetime-local"
                  className="h-9"
                  value={form.startsAt}
                  disabled={saving}
                  aria-invalid={Boolean(errors.startsAt)}
                  onChange={(event) => setField("startsAt", event.target.value)}
                />
                <FieldError>{errors.startsAt}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.endsAt) || undefined}>
                <FieldLabel htmlFor="flash-deal-ends-at">Ends</FieldLabel>
                <Input
                  id="flash-deal-ends-at"
                  type="datetime-local"
                  className="h-9"
                  value={form.endsAt}
                  disabled={saving}
                  aria-invalid={Boolean(errors.endsAt)}
                  onChange={(event) => setField("endsAt", event.target.value)}
                />
                <FieldDescription>
                  All products in this deal share this schedule.
                </FieldDescription>
                <FieldError>{errors.endsAt}</FieldError>
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
                ? campaign
                  ? "Saving…"
                  : "Creating…"
                : campaign
                  ? "Save changes"
                  : "Create flash deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function FlashDealFormDialog({
  campaign,
  open,
  onClose,
  onCreated,
}: FlashDealFormDialogProps) {
  if (!open) {
    return null
  }

  return (
    <FlashDealForm
      key={campaign?.id ?? "create"}
      campaign={campaign}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}
