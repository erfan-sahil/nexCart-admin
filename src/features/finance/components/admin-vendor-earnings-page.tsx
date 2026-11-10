"use client"

import { useQuery } from "@tanstack/react-query"
import {
  ArrowDownToLine,
  Clock,
  Landmark,
  Loader2,
  Search,
  Wallet,
} from "@/lib/icons"
import { useMemo, useState } from "react"
import { Link } from "react-router"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks"
import { ApiError } from "@/lib/api/errors"

import { ReleaseSettlementDialog } from "./release-settlement-dialog"
import { VendorEarningsDetailsDialog } from "./vendor-earnings-details-dialog"
import {
  BalanceMixBar,
  FinanceLayout,
  FinancePageIntro,
  FinanceStatCard,
  FinanceStatGrid,
  FinanceStatSkeleton,
  FinanceTablePagination,
  FinanceTableSkeleton,
  StoreAvatar,
} from "./finance-ui"
import { sumVendorEarnings } from "../lib/aggregates"
import { formatBdt } from "../lib/format"
import {
  listVendorEarnings,
  type VendorEarningsRow,
} from "../services/admin-finance.api"

export function AdminVendorEarningsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [selectedStore, setSelectedStore] = useState<VendorEarningsRow | null>(
    null
  )
  const [releaseStore, setReleaseStore] = useState<VendorEarningsRow | null>(
    null
  )
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 250)

  const query = useQuery({
    queryKey: ["admin", "vendor-earnings", page, pageSize],
    queryFn: () => listVendorEarnings(page, pageSize),
  })

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items])
  const pagination = query.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  const filtered = useMemo(() => {
    if (!debouncedSearch) {
      return items
    }

    return items.filter(
      (row) =>
        row.storeName.toLowerCase().includes(debouncedSearch) ||
        row.storeId.toLowerCase().includes(debouncedSearch)
    )
  }, [debouncedSearch, items])

  const totals = sumVendorEarnings(items)
  const totalBalance = totals.totalBalance

  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : query.isError
        ? "Could not load vendor earnings."
        : null

  const showPagination = !query.isLoading && !errorMessage && total > 0

  return (
    <FinanceLayout>
      <FinancePageIntro
        title="Vendor earnings"
        description="Pending settlement, withdrawable balance, and paid-out totals for every active store. Use Make eligible to release pending funds early while automatic settlement continues to run."
        aside={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/finance/commissions">Commission rates</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/finance/withdrawals">Review withdrawals</Link>
            </Button>
          </div>
        }
      />

      {query.isLoading ? (
        <FinanceStatSkeleton />
      ) : (
        <FinanceStatGrid>
          <FinanceStatCard
            icon={Landmark}
            tone="brand"
            label="Total tracked"
            value={formatBdt(totalBalance)}
            detail="Pending, available, and withdrawn combined on this page"
          />
          <FinanceStatCard
            icon={Clock}
            tone="warning"
            label="Pending settlement"
            value={formatBdt(totals.pendingSettlement)}
            detail="Still inside the settlement hold window"
          />
          <FinanceStatCard
            icon={Wallet}
            tone="success"
            label="Available balance"
            value={formatBdt(totals.availableBalance)}
            detail="Eligible for withdrawal requests"
          />
          <FinanceStatCard
            icon={ArrowDownToLine}
            tone="info"
            label="Withdrawn"
            value={formatBdt(totals.withdrawnBalance)}
            detail="Already removed from available (requested or paid)"
          />
        </FinanceStatGrid>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm font-semibold">Store ledger balances</h2>
              <UniversalBadge
                name={pagination ? String(pagination.total) : "—"}
                colors={badgeColors.neutral}
                showDot={false}
                className="normal-case tabular-nums"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Search by store name or id. Click a row to view store details.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {query.isFetching && !query.isLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Refreshing
              </span>
            ) : null}
            <InputGroup className="h-9 w-full min-w-48 sm:w-56">
              <InputGroupAddon>
                <Search className="size-4" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stores"
                aria-label="Search stores"
              />
            </InputGroup>
          </div>
        </div>

        {query.isLoading ? (
          <FinanceTableSkeleton />
        ) : errorMessage ? (
          <div className="px-4 py-12 text-center sm:px-5">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
            {debouncedSearch
              ? "No stores match your search on this page."
              : "No vendor balances to show yet."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Balance mix</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Withdrawn</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow
                      key={row.storeId}
                      className="cursor-pointer"
                      tabIndex={0}
                      aria-label={`View details for ${row.storeName}`}
                      onClick={() => setSelectedStore(row)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          setSelectedStore(row)
                        }
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <StoreAvatar name={row.storeName} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {row.storeName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {row.storeId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <BalanceMixBar
                          pending={row.pendingSettlement}
                          available={row.availableBalance}
                          withdrawn={row.withdrawnBalance}
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBdt(row.pendingSettlement)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBdt(row.availableBalance)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {formatBdt(row.withdrawnBalance)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatBdt(row.totalBalance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          disabled={row.pendingSettlement <= 0}
                          onClick={(event) => {
                            event.stopPropagation()
                            setReleaseStore(row)
                          }}
                        >
                          Make eligible
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {showPagination ? (
              <FinanceTablePagination
                page={pagination?.page ?? page}
                pageSize={pagination?.limit ?? pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                isFetching={query.isFetching}
              />
            ) : null}
          </>
        )}
      </section>

      <VendorEarningsDetailsDialog
        store={selectedStore}
        open={selectedStore !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStore(null)
          }
        }}
        onBalancesChanged={() => {
          void query.refetch()
        }}
      />

      <ReleaseSettlementDialog
        store={releaseStore}
        open={releaseStore !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReleaseStore(null)
          }
        }}
        onReleased={() => {
          void query.refetch()
        }}
      />
    </FinanceLayout>
  )
}
