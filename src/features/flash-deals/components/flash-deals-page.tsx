"use client"

import { useState } from "react"
import {
  Loader2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Zap,
} from "lucide-react"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApiError } from "@/lib/api/errors"

import { formatDealDate } from "../datetime"
import { useFlashDealsManageQuery } from "../hooks"
import { FLASH_DEAL_STATUS_BADGE, FLASH_DEAL_STATUS_LABEL } from "../labels"
import {
  FLASH_DEAL_STATUSES,
  type FlashDealCampaign,
  type FlashDealStatus,
} from "../types"
import { FlashDealEndDialog } from "./flash-deal-end-dialog"
import { FlashDealFormDialog } from "./flash-deal-form-dialog"
import { FlashDealManageDialog } from "./flash-deal-manage-dialog"

export function FlashDealsPageContent() {
  const [status, setStatus] = useState<FlashDealStatus>("active")
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<FlashDealCampaign | null>(null)
  const [managingId, setManagingId] = useState<string | null>(null)
  const [ending, setEnding] = useState<FlashDealCampaign | null>(null)

  const dealsQuery = useFlashDealsManageQuery({ status, limit: 50 })
  const campaigns = dealsQuery.data?.items ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Zap className="size-6 text-primary" />
            Flash deals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a named deal with a schedule, then add products with their
            own discounts. The active deal name is the storefront section title.
          </p>
        </div>
        <Button
          type="button"
          className="cursor-pointer self-start"
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

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Deals</h2>
          {dealsQuery.isFetching && !dealsQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {FLASH_DEAL_STATUSES.map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={status === tab ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatus(tab)}
            >
              {FLASH_DEAL_STATUS_LABEL[tab]}
            </Button>
          ))}
        </div>

        {dealsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading deals…
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No {FLASH_DEAL_STATUS_LABEL[status].toLowerCase()} deals.
            </p>
            {status === "active" || status === "upcoming" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 cursor-pointer"
                onClick={() => {
                  setEditing(null)
                  setCreating(true)
                }}
              >
                <Plus />
                Create flash deal
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {campaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{campaign.name}</p>
                    <UniversalBadge
                      name={FLASH_DEAL_STATUS_LABEL[status]}
                      colors={FLASH_DEAL_STATUS_BADGE[status]}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {campaign.itemCount} product
                    {campaign.itemCount === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDealDate(campaign.startsAt)} →{" "}
                    {formatDealDate(campaign.endsAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setManagingId(campaign.id)}
                  >
                    <Package className="size-3.5" />
                    Products
                  </Button>
                  {status !== "ended" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer"
                          aria-label={`More actions for ${campaign.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setManagingId(campaign.id)}
                        >
                          Manage products
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setCreating(false)
                            setEditing(campaign)
                          }}
                        >
                          <Pencil className="size-3.5" />
                          Edit schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => setEnding(campaign)}
                        >
                          End deal now
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
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
        status={status}
        open={Boolean(managingId)}
        onClose={() => setManagingId(null)}
      />
      <FlashDealEndDialog
        campaign={ending}
        status={status}
        open={Boolean(ending)}
        onClose={() => setEnding(null)}
      />
    </div>
  )
}
