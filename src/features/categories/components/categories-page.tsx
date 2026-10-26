import { useMemo, useState } from "react"
import { Loader2, Plus, Search } from "lucide-react"

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

import { useCategoriesQuery, useCategoryTreeQuery } from "../hooks"
import { CATEGORY_LEVEL_LABEL } from "../labels"
import { flattenCategories } from "../tree"
import { CATEGORY_LEVELS, type CategoryLevel } from "../types"
import { CategoriesTable } from "./categories-table"
import { CategoryCreateDialog } from "./category-create-dialog"

export function CategoriesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState<CategoryLevel | "">("")
  const [status, setStatus] = useState<"active" | "inactive" | "">("")
  const [creating, setCreating] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "sortOrder" as const,
      ...(level ? { level } : {}),
      ...(status ? { isActive: status === "active" } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, level, status, debouncedSearch]
  )

  const categories = useCategoriesQuery(params)
  const tree = useCategoryTreeQuery()
  const items = categories.data?.items ?? []
  const pagination = categories.data?.pagination
  const parentNames = useMemo(() => {
    const names = new Map<string, string>()

    for (const category of flattenCategories(tree.data ?? [])) {
      names.set(category.id, category.name)
    }

    return names
  }, [tree.data])
  const errorMessage =
    categories.error instanceof ApiError
      ? categories.error.message
      : categories.isError
        ? "Could not load categories."
        : null

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
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Category name"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-48">
            <FieldLabel htmlFor="category-level-filter">Level</FieldLabel>
            <Select
              value={level ? String(level) : "all"}
              onValueChange={(value) => {
                setLevel(
                  value === "all" ? "" : (Number(value) as CategoryLevel)
                )
                setPage(1)
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
                    {CATEGORY_LEVEL_LABEL[option]}
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
                setPage(1)
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
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold">Categories</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          <div className="flex items-center gap-3">
            {categories.isFetching && !categories.isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            ) : null}
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => setCreating(true)}
            >
              <Plus />
              New category
            </Button>
          </div>
        </div>
        <CategoriesTable
          items={items}
          parentNames={parentNames}
          isLoading={categories.isLoading}
          isFetching={categories.isFetching}
          errorMessage={errorMessage}
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => void categories.refetch()}
        />
      </section>

      <CategoryCreateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => setPage(1)}
      />
    </div>
  )
}
