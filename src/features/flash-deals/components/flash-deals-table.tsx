import {
  Loader2,
  MoreHorizontal,
  Package,
  Pencil,
  Power,
  PowerOff,
  Square,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatDealDate } from "../datetime"
import {
  FLASH_DEAL_ACTIVITY_BADGE,
  FLASH_DEAL_ACTIVITY_LABEL,
  getFlashDealActivity,
} from "../labels"
import type { FlashDealCampaign } from "../types"

type FlashDealsTableProps = {
  items: FlashDealCampaign[]
  isLoading: boolean
  isToggling: boolean
  emptyMessage: string
  onManage: (campaign: FlashDealCampaign) => void
  onEdit: (campaign: FlashDealCampaign) => void
  onToggleEnabled: (campaign: FlashDealCampaign, isEnabled: boolean) => void
  onEnd: (campaign: FlashDealCampaign) => void
}

export function FlashDealsTable({
  items,
  isLoading,
  isToggling,
  emptyMessage,
  onManage,
  onEdit,
  onToggleEnabled,
  onEnd,
}: FlashDealsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading deals…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 px-3">Deal</TableHead>
            <TableHead className="h-9 px-3">Activity</TableHead>
            <TableHead className="h-9 px-3">Times</TableHead>
            <TableHead className="h-9 px-3">Products</TableHead>
            <TableHead className="h-9 w-14 px-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((campaign) => {
            const ended = campaign.lifecycle === "ended"
            const activity = getFlashDealActivity(campaign)

            return (
              <TableRow key={campaign.id}>
                <TableCell className="max-w-56 px-3 py-1.5 align-middle">
                  <p className="truncate text-sm font-medium">
                    {campaign.name}
                  </p>
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle">
                  <UniversalBadge
                    name={FLASH_DEAL_ACTIVITY_LABEL[activity]}
                    colors={FLASH_DEAL_ACTIVITY_BADGE[activity]}
                  />
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle whitespace-nowrap">
                  <div className="text-xs leading-snug">
                    <p>{formatDealDate(campaign.startsAt)}</p>
                    <p className="text-muted-foreground">
                      → {formatDealDate(campaign.endsAt)}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle text-sm whitespace-nowrap">
                  <span className="tabular-nums">{campaign.itemCount}</span>
                  <span className="ml-1 text-muted-foreground">
                    {campaign.itemCount === 1 ? "product" : "products"}
                  </span>
                </TableCell>

                <TableCell className="px-3 py-1.5 text-right align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                        aria-label={`Actions for ${campaign.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onManage(campaign)}
                      >
                        <Package className="size-3.5" />
                        Manage products
                      </DropdownMenuItem>
                      {!ended ? (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onEdit(campaign)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={isToggling}
                            onClick={() =>
                              onToggleEnabled(campaign, !campaign.isEnabled)
                            }
                          >
                            {campaign.isEnabled ? (
                              <>
                                <PowerOff className="size-3.5" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="size-3.5" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => onEnd(campaign)}
                          >
                            <Square className="size-3.5" />
                            End deal
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
