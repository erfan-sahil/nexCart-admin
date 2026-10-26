import {
  CalendarClock,
  FolderTree,
  Hash,
  History,
  Image as ImageIcon,
  ImageOff,
  Layers,
  Link2,
  Network,
  Text,
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

import {
  CATEGORY_LEVEL_HINT,
  categoryChildLabel,
  categoryLevelTitle,
} from "../labels"
import type { Category } from "../types"
import { CategoryLevelBadge } from "./category-level-badge"

type CategoryDetailsDialogProps = {
  category: Category | null
  path: string
  childCount: number
  open: boolean
  onClose: () => void
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
  icon: typeof Link2
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

function childSummary(category: Category, childCount: number) {
  if (category.level >= 3) {
    return "None. This is the deepest level."
  }

  return categoryChildLabel(category.level, childCount) ?? "No child categories"
}

export function CategoryDetailsDialog({
  category,
  path,
  childCount,
  open,
  onClose,
}: CategoryDetailsDialogProps) {
  if (!open || !category) {
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
            {category.image ? (
              <img
                src={category.image}
                alt=""
                className="size-14 shrink-0 rounded-2xl object-cover shadow-sm ring-4 ring-background"
              />
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
                <FolderTree className="size-6" />
              </span>
            )}
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {category.name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {categoryLevelTitle(category.level)}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <CategoryLevelBadge level={category.level} />
                <UniversalBadge
                  name={category.isActive ? "active" : "inactive"}
                  colors={
                    category.isActive ? badgeColors.active : badgeColors.neutral
                  }
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
              <SectionLabel>Catalog</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Link2}
                  label="Slug"
                  value={category.slug}
                  tone="brand"
                />
                <DetailItem
                  icon={Layers}
                  label="Level"
                  value={`${categoryLevelTitle(category.level)}. ${CATEGORY_LEVEL_HINT[category.level]}.`}
                  tone="violet"
                />
                <DetailItem
                  icon={FolderTree}
                  label="Parent path"
                  value={path}
                  tone="amber"
                />
                <DetailItem
                  icon={Hash}
                  label="Sort order"
                  value={String(category.sortOrder)}
                  tone="brand"
                />
                <DetailItem
                  icon={Network}
                  label="Children"
                  value={childSummary(category, childCount)}
                  tone="emerald"
                  className="sm:col-span-2"
                />
                <DetailItem
                  icon={category.image ? ImageIcon : ImageOff}
                  label="Image"
                  value={category.image ? "Uploaded" : "No image"}
                  tone="amber"
                />
                <DetailItem
                  icon={Text}
                  label="Description"
                  value={category.description || "No description"}
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
                  value={formatDateTime(category.createdAt)}
                  tone="brand"
                />
                <DetailItem
                  icon={History}
                  label="Last updated"
                  value={formatDateTime(category.updatedAt)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
