"use client"

import { useState } from "react"
import { Loader2, Plus, Zap } from "lucide-react"

import { UniversalBadge, badgeColors } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listProductsForModeration } from "@/features/product-approvals/services/product-approvals.api"
import { ApiError } from "@/lib/api/errors"

import {
  useCreateFlashDealMutation,
  useEndFlashDealMutation,
  useFlashDealSettingsQuery,
  useFlashDealsManageQuery,
  useUpdateFlashDealSettingsMutation,
} from "../services/flash-deals.query"
import type { FlashDealDiscountType } from "../services/flash-deals.api"

const STATUSES = ["active", "upcoming", "ended"] as const

function toLocalInputValue(iso: string) {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

function fromLocalInputValue(value: string) {
  return new Date(value).toISOString()
}

export function FlashDealsPageContent() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("active")
  const [sectionTitleDraft, setSectionTitleDraft] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [productId, setProductId] = useState("")
  const [discountType, setDiscountType] =
    useState<FlashDealDiscountType>("percent")
  const [discountValue, setDiscountValue] = useState("10")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")

  const settingsQuery = useFlashDealSettingsQuery()
  const dealsQuery = useFlashDealsManageQuery({ status, limit: 50 })
  const updateSettings = useUpdateFlashDealSettingsMutation()
  const createDeal = useCreateFlashDealMutation()
  const endDeal = useEndFlashDealMutation()

  const settingsTitle = settingsQuery.data?.sectionTitle ?? "Flash deals"
  const sectionTitle = sectionTitleDraft || settingsTitle

  const saveSettings = () => {
    const trimmed = sectionTitle.trim()
    if (!trimmed) return
    updateSettings.mutate(trimmed)
  }

  const create = async () => {
    if (!productId || !startsAt || !endsAt) return

    await createDeal.mutateAsync({
      productId,
      discountType,
      discountValue: Number(discountValue),
      startsAt: fromLocalInputValue(startsAt),
      endsAt: fromLocalInputValue(endsAt),
    })

    setProductId("")
    setProductSearch("")
    setStartsAt("")
    setEndsAt("")
  }

  const pickProduct = async () => {
    const result = await listProductsForModeration({
      search: productSearch.trim(),
      limit: 1,
      page: 1,
    })
    const product = result.items[0]
    if (product) {
      setProductId(product.id)
      setProductSearch(product.name)
    }
  }

  const deals = dealsQuery.data?.items ?? []
  const error = settingsQuery.error ?? dealsQuery.error

  return (
    <div className="space-y-8">
      <div>
        <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Zap className="size-6 text-primary" />
          Flash deals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-only timed discounts. Vendor discounts never appear here.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof ApiError
            ? error.message
            : "Could not load flash deals."}
        </p>
      ) : null}

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-sm font-medium">Storefront section title</h2>
        <FieldGroup className="max-w-md">
          <Field>
            <FieldLabel htmlFor="section-title">Title</FieldLabel>
            <Input
              id="section-title"
              value={sectionTitleDraft || settingsTitle}
              onChange={(event) => setSectionTitleDraft(event.target.value)}
              placeholder="Flash deals"
            />
          </Field>
        </FieldGroup>
        <Button
          type="button"
          onClick={saveSettings}
          disabled={updateSettings.isPending}
        >
          Save title
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h2 className="text-sm font-medium">Create deal</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <FieldGroup>
            <Field>
              <FieldLabel>Product search</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search approved products"
                />
                <Button type="button" variant="outline" onClick={pickProduct}>
                  Find
                </Button>
              </div>
              {productId ? (
                <p className="text-xs text-muted-foreground">
                  Selected id: {productId}
                </p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel>Discount</FieldLabel>
              <div className="flex gap-2">
                <Select
                  value={discountType}
                  onValueChange={(value) =>
                    setDiscountType(value as FlashDealDiscountType)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  inputMode="decimal"
                />
              </div>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <FieldLabel>Starts</FieldLabel>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Ends</FieldLabel>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </Field>
          </FieldGroup>
        </div>
        <Button
          type="button"
          onClick={create}
          disabled={createDeal.isPending || !productId}
        >
          <Plus className="size-4" />
          Create flash deal
        </Button>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={status === tab ? "default" : "outline"}
              className="capitalize"
              onClick={() => setStatus(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
        {dealsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : deals.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No {status} deals.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {deals.map((deal) => (
              <li
                key={deal.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{deal.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {deal.storeName} · {deal.discountType} {deal.discountValue}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {toLocalInputValue(deal.startsAt)} →{" "}
                    {toLocalInputValue(deal.endsAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <UniversalBadge name={status} colors={badgeColors.neutral} />
                  {status !== "ended" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={endDeal.isPending}
                      onClick={() => endDeal.mutate(deal.id)}
                    >
                      End now
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
