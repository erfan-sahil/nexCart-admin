"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus, Search, Ticket } from "lucide-react"

import { AdminPageIntro } from "@/components/shared"
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
import { ApiError } from "@/lib/api/errors"
import { useDebouncedValue } from "@/hooks"

import { CouponDetailsDialog } from "./coupon-details-dialog"
import { CouponFormDialog } from "./coupon-form-dialog"
import { CouponsTable } from "./coupons-table"
import { useCouponsQuery, useSetCouponEnabledMutation } from "../hooks"
import { COUPON_FILTER_LABEL } from "../labels"
import type { Coupon, CouponEnabledFilter } from "../types"

const FILTERS: CouponEnabledFilter[] = ["all", "enabled", "disabled"]

export function CouponsPageContent() {
  const [filter, setFilter] = useState<CouponEnabledFilter>("all")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState<Coupon | null>(null)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  const listParams = useMemo(
    () => ({
      enabled: filter,
      limit: 50,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch, filter]
  )

  const couponsQuery = useCouponsQuery(listParams)
  const setEnabled = useSetCouponEnabledMutation()
  const coupons = couponsQuery.data?.items ?? []

  const onToggleEnabled = async (coupon: Coupon, isEnabled: boolean) => {
    setToggleError(null)

    try {
      await setEnabled.mutateAsync({ id: coupon.id, isEnabled })
    } catch (error) {
      setToggleError(
        error instanceof ApiError
          ? error.message
          : "Could not update coupon status."
      )
    }
  }

  const emptyMessage = debouncedSearch
    ? `No coupons match “${debouncedSearch}”.`
    : `No ${COUPON_FILTER_LABEL[filter].toLowerCase()}.`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageIntro />
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New coupon
        </Button>
      </div>

      <FieldGroup className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor="coupon-search">Search</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="coupon-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by code or label"
            />
          </InputGroup>
        </Field>

        <Field className="w-full sm:w-44">
          <FieldLabel>Filter</FieldLabel>
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as CouponEnabledFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTERS.map((item) => (
                <SelectItem key={item} value={item}>
                  {COUPON_FILTER_LABEL[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      {toggleError ? (
        <p className="text-sm text-destructive">{toggleError}</p>
      ) : null}

      {couponsQuery.isError ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <Ticket className="size-4 shrink-0" />
          Could not load coupons. Try again shortly.
        </div>
      ) : null}

      <CouponsTable
        items={coupons}
        isLoading={couponsQuery.isLoading}
        isToggling={setEnabled.isPending}
        emptyMessage={emptyMessage}
        onView={setViewing}
        onEdit={setEditing}
        onToggleEnabled={onToggleEnabled}
      />

      {couponsQuery.isFetching && !couponsQuery.isLoading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Refreshing…
        </p>
      ) : null}

      <CouponDetailsDialog
        coupon={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onEdit={() => {
          if (!viewing) {
            return
          }

          const coupon = viewing
          setViewing(null)
          setEditing(coupon)
        }}
      />

      <CouponFormDialog
        open={creating}
        coupon={null}
        onClose={() => setCreating(false)}
      />

      <CouponFormDialog
        open={Boolean(editing)}
        coupon={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  )
}
