import { useMemo } from "react"
import {
  CalendarClock,
  FolderTree,
  Hash,
  History,
  Image as ImageIcon,
  ImageOff,
  Layers,
  Link2,
  Loader2,
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
import {
  ATTRIBUTE_ROLE_LABEL,
  ATTRIBUTE_TYPE_LABEL,
} from "@/features/attributes/labels"
import type { AttributeRole } from "@/features/attributes/types"
import { ApiError } from "@/lib/api/errors"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useCategoryAttributesQuery } from "../hooks"
import {
  CATEGORY_LEVEL_HINT,
  categoryChildLabel,
  categoryLevelTitle,
} from "../labels"
import type { Category, CategoryAttributeAssignment } from "../types"
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

const VALUE_MODE_LABEL = {
  open: "Open value",
  choice: "Choice list",
} as const

function childSummary(category: Category, childCount: number) {
  if (category.level >= 3) {
    return "None. This is the deepest level."
  }

  return categoryChildLabel(category.level, childCount) ?? "No child categories"
}

function countLabel(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

function AssignmentMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-3.5 py-2.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium wrap-break-word text-foreground">
        {value}
      </dd>
    </div>
  )
}

function AssignmentCard({
  assignment,
}: {
  assignment: CategoryAttributeAssignment
}) {
  const { attribute } = assignment
  const options = assignment.options
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)

  return (
    <article className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {attribute.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {attribute.description || "No description"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
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
          <UniversalBadge
            name={assignment.isRequired ? "required" : "optional"}
            colors={
              assignment.isRequired ? badgeColors.submitted : badgeColors.draft
            }
          />
          {assignment.inherited ? (
            <UniversalBadge
              name="inherited"
              colors={badgeColors.under_review}
            />
          ) : null}
          {!attribute.isActive ? (
            <UniversalBadge name="inactive" colors={badgeColors.neutral} />
          ) : null}
        </div>
      </div>
      <dl className="grid gap-px border-t border-border/70 bg-border/70 sm:grid-cols-3">
        <AssignmentMeta label="Slug" value={attribute.slug} />
        <AssignmentMeta
          label="Value mode"
          value={VALUE_MODE_LABEL[attribute.valueMode]}
        />
        <AssignmentMeta label="Unit" value={attribute.unit || "No unit"} />
        <AssignmentMeta
          label="Filterable"
          value={assignment.isFilterable ? "Yes" : "No"}
        />
        <AssignmentMeta
          label="Sort order"
          value={String(assignment.sortOrder)}
        />
        <AssignmentMeta
          label="Source"
          value={assignment.inherited ? "Parent category" : "This category"}
        />
      </dl>
      {attribute.valueMode === "choice" ? (
        <div className="border-t border-border/70 px-3.5 py-3">
          <p className="text-xs font-medium text-muted-foreground">Options</p>
          {options.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1.5">
              {options.map((option) => (
                <li
                  key={option.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1.5"
                >
                  <span className="min-w-0 text-sm">
                    <span className="font-medium text-foreground">
                      {option.label}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {option.value}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      #{option.sortOrder}
                    </span>
                    {!option.isActive ? (
                      <UniversalBadge
                        name="inactive"
                        colors={badgeColors.neutral}
                      />
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No options defined.
            </p>
          )}
        </div>
      ) : null}
    </article>
  )
}

function AttributeGroup({
  title,
  empty,
  items,
}: {
  title: string
  empty: string
  items: CategoryAttributeAssignment[]
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">
        {title}
        <span className="ml-1.5 font-normal text-muted-foreground">
          {items.length}
        </span>
      </h4>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-card px-3.5 py-3 text-sm text-muted-foreground">
          {empty}
        </p>
      )}
    </div>
  )
}

function AttributesSection({ categoryId }: { categoryId: string }) {
  const attributes = useCategoryAttributesQuery(categoryId)
  const grouped = useMemo(() => {
    const items = attributes.data ?? []
    const byRole = (role: AttributeRole) =>
      items.filter((item) => item.attribute.role === role)

    return {
      specs: byRole("spec"),
      variants: byRole("variant"),
    }
  }, [attributes.data])

  return (
    <section className="space-y-3">
      <SectionLabel>Attributes</SectionLabel>
      {attributes.isLoading ? (
        <p className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3.5 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading specifications and variant attributes
        </p>
      ) : attributes.isError ? (
        <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
          <p className="text-sm text-destructive">
            {attributes.error instanceof ApiError
              ? attributes.error.message
              : "Could not load attributes."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 cursor-pointer"
            onClick={() => void attributes.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {countLabel(
              grouped.specs.length,
              "specification",
              "specifications"
            )}
            {" · "}
            {countLabel(
              grouped.variants.length,
              "variant attribute",
              "variant attributes"
            )}
            . Child categories inherit these assignments.
          </p>
          <AttributeGroup
            title="Specifications"
            empty="No specification attributes."
            items={grouped.specs}
          />
          <AttributeGroup
            title="Variant axes"
            empty="No variant attributes. Products in this category cannot offer option-based variants."
            items={grouped.variants}
          />
        </div>
      )}
    </section>
  )
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
                  value={category.image || "No image"}
                  tone="amber"
                  className="sm:col-span-2"
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

            <AttributesSection categoryId={category.id} />

            <section className="space-y-3">
              <SectionLabel>Record</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Hash}
                  label="Record id"
                  value={category.id}
                  tone="violet"
                  className="sm:col-span-2"
                />
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
