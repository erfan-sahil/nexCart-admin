import { useState } from "react"
import { Loader2, Package, Star } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { resolveAssetUrl } from "@/lib/api/assets"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import { APPROVAL_BADGE, STATUS_BADGE } from "../badges"
import { useProductVariantsQuery } from "../hooks"
import {
  attributeLabel,
  attributeValue,
  formatPrice,
  formatPriceRange,
  formatVariantCount,
} from "../lib/format"
import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../labels"
import type { Product, ProductImage, ProductVariant } from "../types"

export function ProductApprovalDetails({ product }: { product: Product }) {
  const variants = useProductVariantsQuery(product.id)
  const images = product.images
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
  const specs = product.attributes.filter(
    (attribute) => attribute.role === "spec"
  )
  const stock =
    product.offer.variantCount === 0
      ? "No variants"
      : product.offer.inStock
        ? "In stock"
        : "Out of stock"
  const loadedVariants = variants.data
  const loadedEveryVariant =
    loadedVariants !== undefined &&
    loadedVariants.pagination.total <= loadedVariants.items.length
  const activeVariants =
    loadedVariants?.items.filter((variant) => variant.status === "active")
      .length ?? 0
  const blocksApproval =
    product.approvalStatus === "submitted" &&
    (product.status !== "active" ||
      product.images.length === 0 ||
      !product.thumbnail ||
      (loadedEveryVariant && activeVariants === 0))

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <ProductGallery images={images} name={product.name} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-brand-text">
            {product.category.name || "Uncategorized"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.store.name || "Unknown store"}
            {product.store.slug ? ` · ${product.store.slug}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <UniversalBadge
              name={PRODUCT_APPROVAL_LABEL[product.approvalStatus]}
              colors={APPROVAL_BADGE[product.approvalStatus]}
              className="normal-case"
            />
            <UniversalBadge
              name={PRODUCT_STATUS_LABEL[product.status]}
              colors={STATUS_BADGE[product.status]}
              className="normal-case"
            />
            <UniversalBadge
              name={product.isPublished ? "Published" : "Unpublished"}
              colors={
                product.isPublished ? badgeColors.approved : badgeColors.draft
              }
              className="normal-case"
            />
            {product.isFeatured ? (
              <UniversalBadge
                name="Featured"
                icon={Star}
                colors={badgeColors.vendor}
                showDot={false}
                className="normal-case"
              />
            ) : null}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-3 overflow-hidden rounded-lg border border-border">
        <Stat label="Price" value={formatPriceRange(product.offer)} />
        <Stat
          label="Stock"
          value={stock}
          detail={
            product.offer.variantCount === 0
              ? "Nothing to sell"
              : formatVariantCount(product.offer.variantCount)
          }
        />
        <Stat
          label="Updated"
          value={formatDateTime(product.updatedAt)}
          detail={`Created ${formatDateTime(product.createdAt)}`}
        />
      </dl>

      {product.reviewNote ? (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            product.approvalStatus === "rejected"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-foreground"
          )}
        >
          {product.reviewNote}
        </p>
      ) : null}

      {blocksApproval ? (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          Approval needs an active listing, at least one image, and one active
          variant.
        </p>
      ) : null}

      <section className="flex flex-col gap-1.5">
        <SectionTitle>Description</SectionTitle>
        {product.shortDescription ? (
          <p className="text-sm font-medium text-foreground">
            {product.shortDescription}
          </p>
        ) : null}
        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
          {product.description || "No description yet."}
        </p>
      </section>

      <section className="flex flex-col gap-1.5">
        <SectionTitle>Details</SectionTitle>
        <dl className="overflow-hidden rounded-lg border border-border">
          <SpecRow label="Slug" value={product.slug} />
          {specs.map((attribute) => (
            <SpecRow
              key={attribute.attributeId}
              label={attributeLabel(attribute)}
              value={attributeValue(attribute)}
            />
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-1.5">
        <SectionTitle>Variants</SectionTitle>
        <VariantList
          isLoading={variants.isLoading}
          errorMessage={
            variants.isError
              ? variants.error instanceof ApiError
                ? variants.error.message
                : "Could not load variants."
              : null
          }
          items={variants.data?.items ?? []}
          total={variants.data?.pagination.total ?? 0}
          onRetry={() => void variants.refetch()}
        />
      </section>

      {product.tags.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <SectionTitle>Tags</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <UniversalBadge
                key={tag}
                name={tag}
                colors={badgeColors.neutral}
                showDot={false}
                className="normal-case"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function VariantList({
  isLoading,
  errorMessage,
  items,
  total,
  onRetry,
}: {
  isLoading: boolean
  errorMessage: string | null
  items: ProductVariant[]
  total: number
  onRetry: () => void
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading variants
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-border px-3 py-3">
        <p className="text-sm text-destructive">{errorMessage}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 cursor-pointer"
          onClick={onRetry}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
        This product has no variants.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {items.map((variant) => {
        const options = variant.attributes
          .map((attribute) => attributeValue(attribute))
          .filter((value) => value !== "—")

        return (
          <div
            key={variant.id}
            className="grid gap-2 border-b border-border px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{variant.sku}</p>
              <p className="truncate text-xs text-muted-foreground">
                {options.length > 0 ? options.join(" · ") : "No options"}
                {variant.isDefault ? " · Default" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="text-sm tabular-nums">
                {formatPrice(variant.currentPrice)}
              </span>
              {variant.currentPrice !== variant.price ? (
                <span className="text-xs text-muted-foreground tabular-nums line-through">
                  {formatPrice(variant.price)}
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground tabular-nums">
                {variant.stock} in stock
              </span>
              <UniversalBadge
                name={PRODUCT_STATUS_LABEL[variant.status]}
                colors={STATUS_BADGE[variant.status]}
                className="normal-case"
              />
            </div>
          </div>
        )
      })}
      {total > items.length ? (
        <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          Showing {items.length} of {total} variants.
        </p>
      ) : null}
    </div>
  )
}

function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[]
  name: string
}) {
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const visible = images.filter((image) => !failed[image.id])
  const [activeId, setActiveId] = useState(visible[0]?.id)
  const active = visible.find((image) => image.id === activeId) ?? visible[0]

  if (!active) {
    return (
      <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:size-28">
        <Package className="size-5" />
      </span>
    )
  }

  return (
    <div className="flex w-24 shrink-0 flex-col gap-1.5 sm:w-28">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl bg-muted sm:size-28">
        <img
          src={resolveAssetUrl(active.url)}
          alt={active.alt || name}
          className="max-h-full max-w-full object-contain"
          onError={() =>
            setFailed((current) => ({ ...current, [active.id]: true }))
          }
        />
      </div>
      {visible.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto">
          {visible.map((image) => (
            <button
              key={image.id}
              type="button"
              aria-label={image.alt || "Show image"}
              aria-pressed={image.id === active.id}
              className={cn(
                "size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-muted",
                image.id === active.id && "border-brand ring-1 ring-brand"
              )}
              onClick={() => setActiveId(image.id)}
            >
              <img
                src={resolveAssetUrl(image.url)}
                alt=""
                className="size-full object-cover"
                onError={() =>
                  setFailed((current) => ({ ...current, [image.id]: true }))
                }
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="min-w-0 px-3 py-3 not-first:border-l not-first:border-border">
      <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
      {detail ? (
        <dd className="truncate text-xs text-muted-foreground">{detail}</dd>
      ) : null}
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm wrap-break-word">{value}</dd>
    </div>
  )
}
