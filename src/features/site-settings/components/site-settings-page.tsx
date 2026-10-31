import { useEffect, useState, type ComponentProps } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/lib/api/errors"

import { useSaveSiteSettingsMutation, useSiteSettingsQuery } from "../hooks"
import { siteSettingsSchema, type SiteSettingsFormValues } from "../schema"

const EMPTY_FORM: SiteSettingsFormValues = {
  deliveryFee: 100,
  freeDeliveryEnabled: false,
  freeDeliveryMinAmount: 0,
}

function MoneyField({
  id,
  currency,
  invalid,
  ...field
}: {
  id: string
  currency: string
  invalid?: boolean
} & Omit<ComponentProps<typeof InputGroupInput>, "id" | "type">) {
  return (
    <InputGroup className="h-10 max-w-xs bg-background">
      <InputGroupAddon>
        <InputGroupText className="font-medium tracking-wide">
          {currency}
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        className="h-10 tabular-nums"
        aria-invalid={invalid}
        {...field}
      />
    </InputGroup>
  )
}

function amountValue(value: number) {
  return Number.isFinite(value) ? value : ""
}

function onAmountChange(onChange: (value: number) => void, raw: string) {
  onChange(raw === "" ? Number.NaN : Number(raw))
}

export function SiteSettingsPage() {
  const settingsQuery = useSiteSettingsQuery()
  const saveSettings = useSaveSiteSettingsMutation()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const currency = settingsQuery.data?.currency ?? "BDT"

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: EMPTY_FORM,
  })

  const isDirty = form.formState.isDirty

  useEffect(() => {
    if (!settingsQuery.data || isDirty) {
      return
    }

    form.reset({
      deliveryFee: settingsQuery.data.deliveryFee,
      freeDeliveryEnabled: settingsQuery.data.freeDeliveryEnabled,
      freeDeliveryMinAmount: settingsQuery.data.freeDeliveryMinAmount,
    })
  }, [form, isDirty, settingsQuery.data])

  const freeDeliveryEnabled = useWatch({
    control: form.control,
    name: "freeDeliveryEnabled",
  })

  const onSubmit = async (values: SiteSettingsFormValues) => {
    setError(null)
    setSaved(false)

    try {
      const savedSettings = await saveSettings.mutateAsync(values)
      form.reset({
        deliveryFee: savedSettings.deliveryFee,
        freeDeliveryEnabled: savedSettings.freeDeliveryEnabled,
        freeDeliveryMinAmount: savedSettings.freeDeliveryMinAmount,
      })
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not save site settings. Please try again."
      )
    }
  }

  if (settingsQuery.isLoading) {
    return (
      <section className="flex w-full max-w-2xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-16 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading site settings…
      </section>
    )
  }

  if (settingsQuery.isError) {
    const message =
      settingsQuery.error instanceof ApiError
        ? settingsQuery.error.message
        : "Could not load site settings."

    return (
      <section className="flex w-full max-w-2xl flex-col items-start gap-3 rounded-xl border border-border bg-card px-4 py-8 shadow-sm">
        <p className="text-sm text-destructive">{message}</p>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => void settingsQuery.refetch()}
        >
          Try again
        </Button>
      </section>
    )
  }

  return (
    <form
      className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {error ? (
        <p
          role="alert"
          className="border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:px-5"
        >
          {error}
        </p>
      ) : null}

      <div className="divide-y divide-border">
        <Controller
          name="deliveryFee"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="grid gap-3 px-4 py-4 sm:px-5">
              <div>
                <label htmlFor="delivery-fee" className="text-sm font-medium">
                  Delivery fee
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Charged when an order does not qualify for free delivery.
                </p>
              </div>
              <MoneyField
                id="delivery-fee"
                currency={currency}
                invalid={fieldState.invalid}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={amountValue(field.value)}
                onChange={(event) =>
                  onAmountChange(field.onChange, event.target.value)
                }
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </div>
          )}
        />

        <Controller
          name="freeDeliveryEnabled"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <label htmlFor="free-delivery" className="text-sm font-medium">
                  Free delivery
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Waive shipment once the order subtotal reaches an amount.
                </p>
              </div>
              <Switch
                id="free-delivery"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />

        {freeDeliveryEnabled ? (
          <Controller
            name="freeDeliveryMinAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="grid gap-3 px-4 py-4 sm:px-5">
                <div>
                  <label
                    htmlFor="free-delivery-amount"
                    className="text-sm font-medium"
                  >
                    Free delivery after
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Order subtotal in {currency}, before the delivery fee.
                  </p>
                </div>
                <MoneyField
                  id="free-delivery-amount"
                  currency={currency}
                  invalid={fieldState.invalid}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={amountValue(field.value)}
                  onChange={(event) =>
                    onAmountChange(field.onChange, event.target.value)
                  }
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </div>
            )}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
        <p className="mr-auto text-sm text-muted-foreground" aria-live="polite">
          {saved && !isDirty ? "Saved." : ""}
        </p>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={saveSettings.isPending}
        >
          {saveSettings.isPending ? <Loader2 className="animate-spin" /> : null}
          Save settings
        </Button>
      </div>
    </form>
  )
}
