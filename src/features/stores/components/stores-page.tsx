import { useCallback, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import {
  AdminPageIntro,
  badgeColors,
  UniversalBadge,
} from "@/components/shared"
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

import { useAdminStoresQuery } from "../hooks"
import { VISIBILITY_FILTER_LABEL } from "../labels"
import type { AdminStoreSummary, StoreVisibilityFilter } from "../types"
import { StoreDeleteDialog } from "./store-delete-dialog"
import { StoreDetailDialog } from "./store-detail-dialog"
import { StoreSuspensionDialog } from "./store-suspension-dialog"
import { StoresTable } from "./stores-table"

const VISIBILITY_FILTERS: StoreVisibilityFilter[] = ["all", "listed", "hidden"]

export function StoresPageContent() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [visibility, setVisibility] = useState<StoreVisibilityFilter>("all")
  const [selected, setSelected] = useState<AdminStoreSummary | null>(null)
  const [banTarget, setBanTarget] = useState<AdminStoreSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminStoreSummary | null>(
    null
  )
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-joinedAt" as const,
      ...(visibility !== "all" ? { visibility } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, visibility, debouncedSearch]
  )

  const storesQuery = useAdminStoresQuery(params)
  const items = storesQuery.data?.items ?? []
  const pagination = storesQuery.data?.pagination
  const errorMessage =
    storesQuery.error instanceof ApiError
      ? storesQuery.error.message
      : storesQuery.isError
        ? "Could not load stores."
        : null

  const handleOpen = useCallback((store: AdminStoreSummary) => {
    setSelected(store)
  }, [])

  const handleBan = useCallback((store: AdminStoreSummary) => {
    setBanTarget(store)
  }, [])

  const handleDelete = useCallback((store: AdminStoreSummary) => {
    setDeleteTarget(store)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageIntro />

      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="admin-store-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="admin-store-search"
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search by store name"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-52">
            <FieldLabel htmlFor="admin-store-visibility">Visibility</FieldLabel>
            <Select
              value={visibility}
              onValueChange={(value) => {
                setVisibility(value as StoreVisibilityFilter)
                setPage(1)
              }}
            >
              <SelectTrigger
                id="admin-store-visibility"
                className="h-10! w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {VISIBILITY_FILTERS.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {VISIBILITY_FILTER_LABEL[filter]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold">Stores</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {storesQuery.isFetching && !storesQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <StoresTable
          items={items}
          isLoading={storesQuery.isLoading}
          isFetching={storesQuery.isFetching}
          errorMessage={errorMessage}
          emptyLabel={
            debouncedSearch || visibility !== "all"
              ? "No stores match these filters."
              : "No vendor stores have been created yet."
          }
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onRetry={() => void storesQuery.refetch()}
          onOpen={handleOpen}
          onBan={handleBan}
          onDelete={handleDelete}
        />
      </section>

      <StoreDetailDialog
        store={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />

      <StoreSuspensionDialog
        store={banTarget}
        open={Boolean(banTarget)}
        onClose={() => setBanTarget(null)}
        onSuccess={(updated) => {
          setSelected((current) =>
            current?.id === updated.id ? updated : current
          )
        }}
      />

      <StoreDeleteDialog
        store={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => {
          setSelected(null)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
