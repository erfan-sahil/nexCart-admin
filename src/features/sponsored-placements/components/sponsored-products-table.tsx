import { Loader2, MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react"

import { UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import {
  SPONSORED_SECTION_LABEL,
  SPONSORED_STATUS_BADGE,
  SPONSORED_STATUS_LABEL,
} from "../labels"
import type { SponsoredPlacement } from "../services/sponsored-placements.api"

type SponsoredProductsTableProps = {
  items: SponsoredPlacement[]
  isLoading: boolean
  isToggling: boolean
  emptyMessage: string
  onEdit: (placement: SponsoredPlacement) => void
  onToggleActive: (placement: SponsoredPlacement, isActive: boolean) => void
}

export function SponsoredProductsTable({
  items,
  isLoading,
  isToggling,
  emptyMessage,
  onEdit,
  onToggleActive,
}: SponsoredProductsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading sponsored products…
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
            <TableHead className="h-9 px-3">Product</TableHead>
            <TableHead className="h-9 px-3">Section</TableHead>
            <TableHead className="h-9 px-3">Status</TableHead>
            <TableHead className="h-9 px-3">CTA</TableHead>
            <TableHead className="h-9 w-14 px-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((placement) => {
            const status = placement.isActive ? "active" : "inactive"
            const sectionLabel = placement.section
              ? SPONSORED_SECTION_LABEL[placement.section]
              : "—"

            return (
              <TableRow key={placement.slot}>
                <TableCell className="max-w-64 px-3 py-1.5 align-middle">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {placement.productName || "Untitled product"}
                    </p>
                    {placement.title ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {placement.title}
                      </p>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle text-sm whitespace-nowrap">
                  {sectionLabel}
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle">
                  <UniversalBadge
                    name={SPONSORED_STATUS_LABEL[status]}
                    colors={SPONSORED_STATUS_BADGE[status]}
                  />
                </TableCell>

                <TableCell className="px-3 py-1.5 align-middle text-sm whitespace-nowrap text-muted-foreground">
                  {placement.ctaLabel || "Shop now"}
                </TableCell>

                <TableCell className="px-3 py-1.5 text-right align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                        aria-label={`Actions for ${placement.productName || `slot ${placement.slot}`}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEdit(placement)}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        disabled={isToggling}
                        onClick={() =>
                          onToggleActive(placement, !placement.isActive)
                        }
                      >
                        {placement.isActive ? (
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
