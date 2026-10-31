"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus, Search, Zap } from "lucide-react"

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

import {
  useFlashDealsManageQuery,
  useSetFlashDealEnabledMutation,
} from "../hooks"
import { FLASH_DEAL_FILTER_LABEL } from "../labels"
import {
  FLASH_DEAL_FILTERS,
  type FlashDealCampaign,
  type FlashDealFilter,
} from "../types"
import { FlashDealEndDialog } from "./flash-deal-end-dialog"
import { FlashDealFormDialog } from "./flash-deal-form-dialog"
import { FlashDealManageDialog } from "./flash-deal-manage-dialog"
import { FlashDealsTable } from "./flash-deals-table"

export function FlashDealsPageContent() {
  const [filter, setFilter] = useState<FlashDealFilter>("all")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<FlashDealCampaign | null>(null)
  const [managingId, setManagingId] = useState<string | null>(null)
  const [ending, setEnding] = useState<FlashDealCampaign | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  const listParams = useMemo(
    () => ({
      status: filter,
      limit: 50,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch, filter]
  )

  const dealsQuery = useFlashDealsManageQuery(listParams)
  const setEnabled = useSetFlashDealEnabledMutation()
  const campaigns = dealsQuery.data?.items ?? []

  const onToggleEnabled = async (
    campaign: FlashDealCampaign,
    isEnabled: boolean
  ) => {
    setToggleError(null)

    try {
      await setEnabled.mutateAsync({ id: campaign.id, isEnabled })
    } catch (error) {
      setToggleError(
        error instanceof ApiError
          ? error.message
          : "Could not update flash deal status."
      )
    }
  }

  const emptyMessage = debouncedSearch
    ? `No deals match “${debouncedSearch}”.`
    : `No ${FLASH_DEAL_FILTER_LABEL[filter].toLowerCase()}.`

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Zap className="size-6 shrink-0 text-primary" />
            Flash deals
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Create a named deal with a schedule, then add products with their
            own discounts. Only one flash deal can be active at a time; the
            active deal name is the storefront section title.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 cursor-pointer self-start whitespace-nowrap"
          onClick={() => {
            setEditing(null)
            setCreating(true)
          }}
        >
          <Plus />
          Create flash deal
        </Button>
      </div>

      {dealsQuery.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {dealsQuery.error instanceof ApiError
            ? dealsQuery.error.message
            : "Could not load flash deals."}
        </p>
      ) : null}

      {toggleError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {toggleError}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <FieldGroup className="gap-4 sm:flex-row sm:items-end">
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor="flash-deal-search">Search</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  id="flash-deal-search"
                  className="h-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search flash deals"
                />
              </InputGroup>
            </Field>
            <Field className="sm:w-52">
              <FieldLabel htmlFor="flash-deal-filter">Filter</FieldLabel>
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as FlashDealFilter)}
              >
                <SelectTrigger id="flash-deal-filter" className="h-10! w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {FLASH_DEAL_FILTERS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {FLASH_DEAL_FILTER_LABEL[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Deals</h2>
          {dealsQuery.isFetching && !dealsQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <FlashDealsTable
          items={campaigns}
          isLoading={dealsQuery.isLoading}
          isToggling={setEnabled.isPending}
          emptyMessage={emptyMessage}
          onManage={(campaign) => setManagingId(campaign.id)}
          onEdit={(campaign) => {
            setCreating(false)
            setEditing(campaign)
          }}
          onToggleEnabled={(campaign, isEnabled) =>
            void onToggleEnabled(campaign, isEnabled)
          }
          onEnd={setEnding}
        />

        {!dealsQuery.isLoading &&
        campaigns.length === 0 &&
        filter !== "ended" ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer whitespace-nowrap"
              onClick={() => {
                setEditing(null)
                setCreating(true)
              }}
            >
              <Plus />
              Create flash deal
            </Button>
          </div>
        ) : null}
      </section>

      <FlashDealFormDialog
        campaign={null}
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(campaign) => setManagingId(campaign.id)}
      />
      <FlashDealFormDialog
        campaign={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
      <FlashDealManageDialog
        campaignId={managingId}
        open={Boolean(managingId)}
        onClose={() => setManagingId(null)}
      />
      <FlashDealEndDialog
        campaign={ending}
        open={Boolean(ending)}
        onClose={() => setEnding(null)}
      />
    </div>
  )
}
