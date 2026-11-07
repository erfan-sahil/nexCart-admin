import {
  AlignLeft,
  Hash,
  Layers,
  MousePointerClick,
  Package,
  Pencil,
  Type,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import {
  SPONSORED_SECTION_LABEL,
  SPONSORED_STATUS_BADGE,
  SPONSORED_STATUS_LABEL,
} from "../labels"
import type { SponsoredPlacement } from "../services/sponsored-placements.api"

type SponsoredProductDetailsDialogProps = {
  placement: SponsoredPlacement | null
  open: boolean
  onClose: () => void
  onEdit: () => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: typeof Package
  label: string
  value: string
  tone: DetailTone
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium wrap-break-word text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

export function SponsoredProductDetailsDialog({
  placement,
  open,
  onClose,
  onEdit,
}: SponsoredProductDetailsDialogProps) {
  if (!open || !placement) {
    return null
  }

  const status = placement.isActive ? "active" : "inactive"
  const sectionLabel = placement.section
    ? SPONSORED_SECTION_LABEL[placement.section]
    : "Not set"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <MousePointerClick className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {placement.productName || "Sponsored product"}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {sectionLabel}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={SPONSORED_STATUS_LABEL[status]}
                  colors={SPONSORED_STATUS_BADGE[status]}
                />
                <UniversalBadge
                  name={`Slot ${placement.slot}`}
                  colors={badgeColors.neutral}
                  showDot={false}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea
          type="auto"
          className="max-h-[calc(100dvh-16rem)] bg-muted/20"
          viewportClassName="max-h-[calc(100dvh-16rem)]"
        >
          <div className="space-y-5 px-6 py-5">
            <section className="space-y-3">
              <SectionLabel>Placement</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Package}
                  label="Product"
                  value={placement.productName || "—"}
                  tone="brand"
                />
                <DetailItem
                  icon={Hash}
                  label="Product ID"
                  value={placement.productId || "—"}
                  tone="violet"
                  className="sm:col-span-2"
                />
                <DetailItem
                  icon={Layers}
                  label="Section"
                  value={sectionLabel}
                  tone="emerald"
                />
                <DetailItem
                  icon={Hash}
                  label="Slot"
                  value={placement.slot}
                  tone="amber"
                />
              </dl>
            </section>

            <section className="space-y-3">
              <SectionLabel>Storefront copy</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Type}
                  label="Headline"
                  value={placement.title || "Default product title"}
                  tone="brand"
                />
                <DetailItem
                  icon={MousePointerClick}
                  label="CTA label"
                  value={placement.ctaLabel || "Shop now"}
                  tone="violet"
                />
                <DetailItem
                  icon={AlignLeft}
                  label="Subtitle"
                  value={placement.subtitle || "No subtitle"}
                  tone="amber"
                  className="sm:col-span-2"
                />
              </dl>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
          <Button type="button" className="cursor-pointer" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
