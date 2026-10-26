import {
  CalendarClock,
  Eye,
  Filter,
  Hash,
  History,
  Layers,
  Link2,
  Pencil,
  SlidersHorizontal,
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
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ATTRIBUTE_ROLE_LABEL, ATTRIBUTE_TYPE_LABEL } from "../labels"
import type { Attribute } from "../types"

type AttributeDetailsDialogProps = {
  attribute: Attribute | null
  open: boolean
  onClose: () => void
  onEdit: (attribute: Attribute) => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

const VALUE_MODE_LABEL = {
  open: "Open value",
  choice: "Choice list",
} as const

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: typeof Type
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

export function AttributeDetailsDialog({
  attribute,
  open,
  onClose,
  onEdit,
}: AttributeDetailsDialogProps) {
  if (!open || !attribute) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <SlidersHorizontal className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {attribute.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Catalog attribute
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={attribute.isActive ? "active" : "inactive"}
                  colors={
                    attribute.isActive
                      ? badgeColors.active
                      : badgeColors.neutral
                  }
                />
                <UniversalBadge
                  name={ATTRIBUTE_ROLE_LABEL[attribute.role]}
                  colors={
                    attribute.role === "variant"
                      ? badgeColors.vendor
                      : badgeColors.buyer
                  }
                  showDot={false}
                />
                <UniversalBadge
                  name={ATTRIBUTE_TYPE_LABEL[attribute.type]}
                  colors={badgeColors.neutral}
                  showDot={false}
                  className="normal-case"
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
              <SectionLabel>Definition</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Link2}
                  label="Slug"
                  value={attribute.slug}
                  tone="brand"
                />
                <DetailItem
                  icon={Type}
                  label="Type"
                  value={ATTRIBUTE_TYPE_LABEL[attribute.type]}
                  tone="violet"
                />
                <DetailItem
                  icon={Layers}
                  label="Role"
                  value={ATTRIBUTE_ROLE_LABEL[attribute.role]}
                  tone="brand"
                />
                <DetailItem
                  icon={Eye}
                  label="Value mode"
                  value={VALUE_MODE_LABEL[attribute.valueMode]}
                  tone="violet"
                />
                <DetailItem
                  icon={Hash}
                  label="Unit"
                  value={attribute.unit || "No unit"}
                  tone="amber"
                />
                <DetailItem
                  icon={Filter}
                  label="Filterable"
                  value={attribute.isFilterable ? "Yes" : "No"}
                  tone={attribute.isFilterable ? "emerald" : "amber"}
                />
                <DetailItem
                  icon={SlidersHorizontal}
                  label="Description"
                  value={attribute.description || "No description"}
                  tone="brand"
                  className="sm:col-span-2"
                />
              </dl>
            </section>

            <section className="space-y-3">
              <SectionLabel>Record</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={CalendarClock}
                  label="Created"
                  value={formatDateTime(attribute.createdAt)}
                  tone="brand"
                />
                <DetailItem
                  icon={History}
                  label="Last updated"
                  value={formatDateTime(attribute.updatedAt)}
                  tone="emerald"
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
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => onEdit(attribute)}
          >
            <Pencil />
            Edit attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
