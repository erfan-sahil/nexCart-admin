import { useCallback, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
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

import { useVendorApplicationsQuery } from "../hooks"
import { STATUS_LABEL } from "../labels"
import {
  VENDOR_APPLICATION_STATUSES,
  type VendorApplicationStatus,
  type VendorApplicationSummary,
} from "../types"
import { VendorApplicationDialog } from "./vendor-application-dialog"
import { VendorApplicationsTable } from "./vendor-applications-table"

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  ...VENDOR_APPLICATION_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABEL[status],
  })),
] as const

export function VendorApplicationsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<VendorApplicationStatus | "">("")
  const [selected, setSelected] = useState<{
    id: string
    mode: "details" | "review"
  } | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "-updatedAt" as const,
      ...(status ? { status } : { includeDrafts: true }),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, status, debouncedSearch]
  )

  const applications = useVendorApplicationsQuery(params)
  const items = applications.data?.items ?? []
  const pagination = applications.data?.pagination
  const errorMessage =
    applications.error instanceof ApiError
      ? applications.error.message
      : applications.isError
        ? "Could not load vendor applications."
        : null

  const handleOpen = useCallback((application: VendorApplicationSummary) => {
    setSelected({ id: application.id, mode: "details" })
  }, [])

  const handleReview = useCallback((application: VendorApplicationSummary) => {
    setSelected({ id: application.id, mode: "review" })
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="application-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="application-search"
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Name, email, phone, or store"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-56">
            <FieldLabel htmlFor="application-status">Status</FieldLabel>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(
                  value === "all" ? "" : (value as VendorApplicationStatus)
                )
                setPage(1)
              }}
            >
              <SelectTrigger id="application-status" className="h-10! w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent align="end">
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
            <h2 className="text-sm font-semibold">Applications</h2>
            <UniversalBadge
              name={pagination ? String(pagination.total) : "—"}
              colors={badgeColors.neutral}
              showDot={false}
              className="normal-case tabular-nums"
            />
          </div>
          {applications.isFetching && !applications.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <VendorApplicationsTable
          items={items}
          isLoading={applications.isLoading}
          isFetching={applications.isFetching}
          errorMessage={errorMessage}
          emptyLabel="No vendor applications match these filters."
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => void applications.refetch()}
          onOpen={handleOpen}
          onReview={handleReview}
        />
      </section>

      <VendorApplicationDialog
        applicationId={selected?.id ?? null}
        mode={selected?.mode ?? "details"}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
