import { useMemo, useState } from "react"
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Loader2,
  Plus,
  Search,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import { useCategoryTreeQuery } from "../hooks"
import { CATEGORY_LEVEL_HINT, categoryLevelTitle } from "../labels"
import {
  categoryBranchIds,
  categoryChildCounts,
  countMatchingCategories,
  filterCategoryTree,
  flattenCategories,
} from "../tree"
import {
  CATEGORY_LEVELS,
  type Category,
  type CategoryLevel,
  type CategoryTreeNode,
} from "../types"
import { CategoriesTree } from "./categories-tree"
import { CategoryLevelBadge } from "./category-level-badge"
import {
  CategoryCreateDialog,
  CategoryEditDialog,
} from "./category-create-dialog"
import { CategoryDeleteDialog } from "./category-delete-dialog"
import { CategoryDetailsDialog } from "./category-details-dialog"

function ancestorPath(nodes: CategoryTreeNode[], category: Category) {
  const names = new Map(
    flattenCategories(nodes).map((item) => [item.id, item.name])
  )
  const trail = category.ancestors
    .map((id) => names.get(id))
    .filter((name): name is string => Boolean(name))

  return trail.length > 0 ? trail.join(" / ") : "None"
}

export function CategoriesPage() {
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState<CategoryLevel | "">("")
  const [status, setStatus] = useState<"active" | "inactive" | "">("")
  const [expanded, setExpanded] = useState<Set<string> | null>(null)
  const [createParent, setCreateParent] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState<Category | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const tree = useCategoryTreeQuery()
  const nodes = useMemo(() => tree.data ?? [], [tree.data])
  const filtering = Boolean(debouncedSearch || level || status)
  const filter = useMemo(
    () => ({
      search: debouncedSearch,
      level,
      status,
    }),
    [debouncedSearch, level, status]
  )
  const visibleNodes = useMemo(
    () => filterCategoryTree(nodes, filter),
    [nodes, filter]
  )
  const total = flattenCategories(nodes).length
  const matches = countMatchingCategories(nodes, filter)
  const childCounts = useMemo(() => categoryChildCounts(nodes), [nodes])
  const openIds = useMemo(() => {
    if (filtering) {
      return new Set(categoryBranchIds(visibleNodes))
    }

    return expanded ?? new Set(categoryBranchIds(nodes))
  }, [expanded, filtering, nodes, visibleNodes])
  const errorMessage =
    tree.error instanceof ApiError
      ? tree.error.message
      : tree.isError
        ? "Could not load categories."
        : null

  const toggleBranch = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current ?? categoryBranchIds(nodes))

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  const revealParent = (parentId: string) => {
    if (!parentId) {
      return
    }

    setExpanded((current) => {
      const next = new Set(current ?? categoryBranchIds(nodes))
      next.add(parentId)
      return next
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="category-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="category-search"
                className="h-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Category name"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-64">
            <FieldLabel htmlFor="category-level-filter">Level</FieldLabel>
            <Select
              value={level ? String(level) : "all"}
              onValueChange={(value) => {
                setLevel(
                  value === "all" ? "" : (Number(value) as CategoryLevel)
                )
              }}
            >
              <SelectTrigger
                id="category-level-filter"
                className="h-10! w-full"
              >
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All levels</SelectItem>
                {CATEGORY_LEVELS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {categoryLevelTitle(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="sm:w-40">
            <FieldLabel htmlFor="category-status-filter">Status</FieldLabel>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(
                  value === "all" ? "" : (value as "active" | "inactive")
                )
              }}
            >
              <SelectTrigger
                id="category-status-filter"
                className="h-10! w-full"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold">Categories</h2>
                <UniversalBadge
                  name={
                    tree.isLoading
                      ? "—"
                      : filtering
                        ? `${matches} of ${total}`
                        : String(total)
                  }
                  colors={badgeColors.neutral}
                  showDot={false}
                  className="normal-case tabular-nums"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {filtering
                  ? "Parents stay visible so each match keeps its place in the tree."
                  : "Depth is the number on each row. Level 1 is a root, level 2 sits under it, and level 3 is the deepest."}
              </p>
              <ul className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
                {CATEGORY_LEVELS.map((option) => (
                  <li key={option} className="flex items-center gap-2">
                    <CategoryLevelBadge level={option} />
                    <span className="text-xs text-muted-foreground">
                      {CATEGORY_LEVEL_HINT[option]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {tree.isFetching && !tree.isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Refreshing
                </span>
              ) : null}
              <Button
                type="button"
                className="cursor-pointer"
                onClick={() => {
                  setEditing(null)
                  setCreateParent(null)
                  setCreating(true)
                }}
              >
                <Plus />
                New category
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={tree.isLoading || filtering || nodes.length === 0}
              onClick={() => setExpanded(new Set(categoryBranchIds(nodes)))}
            >
              <ChevronsUpDown />
              Expand all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={tree.isLoading || filtering || nodes.length === 0}
              onClick={() => setExpanded(new Set())}
            >
              <ChevronsDownUp />
              Collapse all
            </Button>
          </div>
        </div>
        <CategoriesTree
          nodes={visibleNodes}
          childCounts={childCounts}
          expandedIds={openIds}
          filtering={filtering}
          search={debouncedSearch}
          isLoading={tree.isLoading}
          errorMessage={errorMessage}
          onToggle={toggleBranch}
          onRetry={() => void tree.refetch()}
          onView={setViewing}
          onEdit={setEditing}
          onDelete={setDeleting}
          onAddChild={(category) => {
            setExpanded((current) => {
              const next = new Set(current ?? categoryBranchIds(nodes))
              next.add(category.id)
              return next
            })
            setEditing(null)
            setCreateParent(category)
            setCreating(true)
          }}
          onCreate={() => {
            setEditing(null)
            setCreateParent(null)
            setCreating(true)
          }}
        />
      </section>

      <CategoryDetailsDialog
        category={viewing}
        path={viewing ? ancestorPath(nodes, viewing) : "None"}
        childCount={viewing ? (childCounts.get(viewing.id) ?? 0) : 0}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onEdit={(category) => {
          setViewing(null)
          setEditing(category)
        }}
      />
      <CategoryCreateDialog
        open={creating}
        initialParent={createParent}
        onClose={() => setCreating(false)}
        onCreated={revealParent}
      />
      <CategoryEditDialog
        category={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
      <CategoryDeleteDialog
        category={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onDeleted={() => undefined}
      />
    </div>
  )
}
