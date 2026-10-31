"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { listProductsForModeration } from "@/features/product-approvals/services/product-approvals.api"
import { ApiError } from "@/lib/api/errors"

import {
  useSponsoredPlacementsQuery,
  useUpsertSponsoredMutation,
} from "../services/sponsored-placements.query"
import type { SponsoredSection } from "../services/sponsored-placements.api"

const SECTIONS: SponsoredSection[] = ["top-selling", "trending", "new-arrivals"]

function SlotCard({ slot }: { slot: "1" | "2" }) {
  const query = useSponsoredPlacementsQuery()
  const save = useUpsertSponsoredMutation(slot)
  const row = query.data?.find((entry) => entry.slot === slot)

  const [productSearch, setProductSearch] = useState(row?.productName ?? "")
  const [productId, setProductId] = useState(row?.productId ?? "")
  const [section, setSection] = useState<SponsoredSection>(
    row?.section ?? "top-selling"
  )
  const [title, setTitle] = useState(row?.title ?? "")
  const [subtitle, setSubtitle] = useState(row?.subtitle ?? "")
  const [ctaLabel, setCtaLabel] = useState(row?.ctaLabel ?? "")
  const [image, setImage] = useState(row?.image ?? "")
  const [isActive, setIsActive] = useState(row?.isActive ?? false)

  const findProduct = async () => {
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

  const onSave = () => {
    if (!productId) return
    save.mutate({
      productId,
      section,
      title: title.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      ctaLabel: ctaLabel.trim() || undefined,
      image: image.trim() || undefined,
      isActive,
    })
  }

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Sponsored card {slot}</h2>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel>Section</FieldLabel>
          <Select
            value={section}
            onValueChange={(value) => setSection(value as SponsoredSection)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Product</FieldLabel>
          <div className="flex gap-2">
            <Input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search product"
            />
            <Button type="button" variant="outline" onClick={findProduct}>
              Find
            </Button>
          </div>
        </Field>
        <Field>
          <FieldLabel>Title override</FieldLabel>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Subtitle override</FieldLabel>
          <Input
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>CTA label</FieldLabel>
          <Input
            value={ctaLabel}
            onChange={(event) => setCtaLabel(event.target.value)}
            placeholder="Shop now"
          />
        </Field>
        <Field>
          <FieldLabel>Image URL override</FieldLabel>
          <Input
            value={image}
            onChange={(event) => setImage(event.target.value)}
          />
        </Field>
      </FieldGroup>
      <Button
        type="button"
        onClick={onSave}
        disabled={save.isPending || !productId}
      >
        Save card {slot}
      </Button>
    </section>
  )
}

export function SponsoredAdsPageContent() {
  const query = useSponsoredPlacementsQuery()

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading sponsored placements…
      </div>
    )
  }

  if (query.error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {query.error instanceof ApiError
          ? query.error.message
          : "Could not load sponsored placements."}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sponsored ads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two homepage cards. Each card uses a different section and product.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SlotCard slot="1" />
        <SlotCard slot="2" />
      </div>
    </div>
  )
}
