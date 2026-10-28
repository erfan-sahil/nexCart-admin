import { AlignLeft, Hash, Pencil, Type } from "lucide-react"

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

import type { HeroSlide } from "../types"

type HeroDetailsDialogProps = {
  slide: HeroSlide | null
  position: number
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

export function HeroDetailsDialog({
  slide,
  position,
  open,
  onClose,
  onEdit,
}: HeroDetailsDialogProps) {
  if (!open || !slide) {
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <img
              src={slide.image}
              alt=""
              className="size-14 shrink-0 rounded-2xl object-cover shadow-sm ring-4 ring-background"
            />
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {slide.title}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Homepage hero
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={slide.isActive ? "active" : "inactive"}
                  colors={
                    slide.isActive ? badgeColors.active : badgeColors.neutral
                  }
                />
                <UniversalBadge
                  name={`Position ${position}`}
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
            <img
              src={slide.image}
              alt={slide.title}
              className="aspect-[16/9] w-full rounded-xl border border-border/80 object-cover"
            />
            <section className="space-y-3">
              <SectionLabel>Copy</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Type}
                  label="Eyebrow"
                  value={slide.eyebrow}
                  tone="brand"
                />
                <DetailItem
                  icon={Hash}
                  label="Position"
                  value={String(position)}
                  tone="violet"
                />
                <DetailItem
                  icon={AlignLeft}
                  label="Description"
                  value={slide.description}
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
