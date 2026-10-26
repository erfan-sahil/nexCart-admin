import { useRef } from "react"
import {
  ChevronRight,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { categoryChildLabel } from "../labels"
import { categoryLevelTone } from "../level-style"
import type { Category, CategoryLevel, CategoryTreeNode } from "../types"
import { CategoryLevelBadge } from "./category-level-badge"

const TREE_COLUMNS = "sm:grid-cols-[minmax(0,1fr)_11.5rem_4.5rem_6.5rem_2.5rem]"

type CategoriesTreeProps = {
  nodes: CategoryTreeNode[]
  childCounts: Map<string, number>
  expandedIds: Set<string>
  filtering: boolean
  search: string
  isLoading: boolean
  errorMessage: string | null
  onToggle: (id: string) => void
  onRetry: () => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddChild: (category: Category) => void
  onCreate: () => void
}

function highlight(text: string, query: string) {
  const needle = query.trim()
  if (!needle) {
    return text
  }

  const index = text.toLowerCase().indexOf(needle.toLowerCase())
  if (index < 0) {
    return text
  }

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-brand-soft px-0.5 text-foreground">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  )
}

function CategoryBranchToggle({
  expanded,
  hasChildren,
  level,
  name,
  onToggle,
}: {
  expanded: boolean
  hasChildren: boolean
  level: CategoryLevel
  name: string
  onToggle: () => void
}) {
  const tone = categoryLevelTone(level)

  if (!hasChildren) {
    return (
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 ring-inset dark:ring-white/10",
          tone.badge
        )}
        aria-hidden
      >
        <span className={cn("size-1.5 rounded-full", tone.rail)} />
      </span>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        "group/toggle flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 transition-transform duration-200 outline-none ring-inset hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 dark:ring-white/10",
        tone.badge
      )}
      aria-expanded={expanded}
      aria-label={expanded ? `Collapse ${name}` : `Expand ${name}`}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
    >
      <ChevronRight
        className={cn(
          "size-3.5 transition-transform duration-200 ease-out group-hover/toggle:translate-x-px",
          expanded && "rotate-90 group-hover/toggle:translate-x-0"
        )}
      />
    </button>
  )
}

function CategoryThumbnail({ image }: { image: string }) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="size-9 shrink-0 rounded-md object-cover"
      />
    )
  }

  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
      aria-hidden
    >
      <ImageOff className="size-4" />
    </span>
  )
}

function CategoryBranch({
  node,
  depth,
  trail,
  childCounts,
  expandedIds,
  search,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: CategoryTreeNode
  depth: number
  trail: string[]
  childCounts: Map<string, number>
  expandedIds: Set<string>
  search: string
  onToggle: (id: string) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddChild: (category: Category) => void
}) {
  const { children, ...category } = node
  const hasChildren = children.length > 0
  const expanded = hasChildren && expandedIds.has(category.id)
  const totalChildren = childCounts.get(category.id) ?? children.length
  const childLabel = categoryChildLabel(category.level, totalChildren)
  const canAddChild = category.level < 3
  const tone = categoryLevelTone(category.level)
  const suppressRowClick = useRef(false)

  const holdRowClick = () => {
    suppressRowClick.current = true
    window.setTimeout(() => {
      suppressRowClick.current = false
    }, 250)
  }

  return (
    <li>
      <div
        className={cn(
          "grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-border px-3 py-2.5 transition-colors hover:bg-brand-soft/60 sm:items-center sm:px-4",
          TREE_COLUMNS,
          tone.row
        )}
        onClick={() => {
          if (suppressRowClick.current) {
            return
          }

          onEdit(category)
        }}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-2",
            depth === 1 && "ml-6 sm:ml-10",
            depth === 2 && "ml-12 sm:ml-[4.5rem]"
          )}
        >
          <span
            className={cn(
              "min-h-9 w-1 shrink-0 self-stretch rounded-full",
              tone.rail
            )}
            aria-hidden
          />
          <CategoryBranchToggle
            expanded={expanded}
            hasChildren={hasChildren}
            level={category.level}
            name={category.name}
            onToggle={() => onToggle(category.id)}
          />
          <CategoryThumbnail image={category.image} />
          <div className="min-w-0">
            <div className="flex h-9 min-w-0 flex-col justify-center">
              <p
                className={cn(
                  "truncate text-sm leading-5 text-foreground",
                  category.level === 1 ? "font-semibold" : "font-medium"
                )}
              >
                {highlight(category.name, search)}
              </p>
              <p className="truncate text-xs leading-4 text-muted-foreground">
                {trail.map((name, index) => {
                  const ancestorLevel = (index + 1) as 1 | 2
                  return (
                    <span key={`${name}-${index}`}>
                      {index > 0 ? (
                        <span className="px-1 text-border">/</span>
                      ) : null}
                      <span className={categoryLevelTone(ancestorLevel).crumb}>
                        {highlight(name, search)}
                      </span>
                      <span className="px-1 text-border">/</span>
                    </span>
                  )
                })}
                {highlight(category.slug, search)}
                {childLabel ? <span> · {childLabel}</span> : null}
                {matchCount(totalChildren, children.length)}
              </p>
            </div>
            <div className="mt-1.5 sm:hidden">
              <CategoryLevelBadge level={category.level} />
            </div>
          </div>
        </div>

        <div className="hidden sm:block">
          <CategoryLevelBadge level={category.level} />
        </div>
        <span className="hidden text-muted-foreground tabular-nums sm:block">
          {category.sortOrder}
        </span>
        <div className="flex items-center justify-end gap-2 sm:justify-start">
          <UniversalBadge
            name={category.isActive ? "active" : "inactive"}
            colors={
              category.isActive ? badgeColors.active : badgeColors.neutral
            }
          />
          <div
            className="sm:hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <CategoryActions
              category={category}
              canAddChild={canAddChild}
              onInteract={holdRowClick}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          </div>
        </div>
        <div
          className="hidden justify-end sm:flex"
          onClick={(event) => event.stopPropagation()}
        >
          <CategoryActions
            category={category}
            canAddChild={canAddChild}
            onInteract={holdRowClick}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        </div>
      </div>
      {expanded ? (
        <ul>
          {children.map((child) => (
            <CategoryBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              trail={[...trail, category.name]}
              childCounts={childCounts}
              expandedIds={expandedIds}
              search={search}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function matchCount(total: number, visible: number) {
  if (total === 0 || visible >= total) {
    return null
  }

  return (
    <span>
      {" "}
      · {visible} of {total} shown
    </span>
  )
}

function CategoryActions({
  category,
  canAddChild,
  onInteract,
  onEdit,
  onDelete,
  onAddChild,
}: {
  category: Category
  canAddChild: boolean
  onInteract: () => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddChild: (category: Category) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label={`Actions for ${category.name}`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerDown={onInteract}
      >
        {canAddChild ? (
          <>
            <DropdownMenuItem
              onSelect={() => {
                window.setTimeout(() => onAddChild(category), 0)
              }}
            >
              <Plus />
              {category.level === 1 ? "Add subcategory" : "Add sub-subcategory"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          onSelect={() => {
            window.setTimeout(() => onEdit(category), 0)
          }}
        >
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            window.setTimeout(() => onDelete(category), 0)
          }}
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TreeSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-border px-4 py-3"
        >
          <div className="size-9 animate-pulse rounded-md bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-2.5 w-24 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CategoriesTree({
  nodes,
  childCounts,
  expandedIds,
  filtering,
  search,
  isLoading,
  errorMessage,
  onToggle,
  onRetry,
  onEdit,
  onDelete,
  onAddChild,
  onCreate,
}: CategoriesTreeProps) {
  return (
    <div>
      <div
        className={cn(
          "hidden items-center gap-2 border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid",
          TREE_COLUMNS
        )}
      >
        <span>Category</span>
        <span>Level</span>
        <span>Sort</span>
        <span>Status</span>
        <span className="sr-only">Actions</span>
      </div>

      {isLoading ? (
        <TreeSkeleton />
      ) : errorMessage ? (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 cursor-pointer"
            onClick={onRetry}
          >
            Try again
          </Button>
        </div>
      ) : nodes.length === 0 ? (
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <p className="text-sm font-medium">
            {filtering
              ? "No categories match these filters"
              : "No categories yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtering
              ? "Try another name, level, or status. Matching categories stay under their parent so the path stays visible."
              : "Start with a root category, then add a subcategory and a sub-subcategory under it."}
          </p>
          {filtering ? null : (
            <Button
              type="button"
              className="mt-4 cursor-pointer"
              onClick={onCreate}
            >
              <Plus />
              New category
            </Button>
          )}
        </div>
      ) : (
        <ul>
          {nodes.map((node) => (
            <CategoryBranch
              key={node.id}
              node={node}
              depth={0}
              trail={[]}
              childCounts={childCounts}
              expandedIds={expandedIds}
              search={search}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
