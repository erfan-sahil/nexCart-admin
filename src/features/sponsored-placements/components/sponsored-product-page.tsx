"use client"

import { useMemo, useState } from "react"
import { Loader2, MousePointerClick, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

import { SPONSORED_SECTIONS } from "../services/sponsored-placements.api"
import type {
  SponsoredPlacement,
  SponsoredSection,
  SponsoredSlot,
} from "../services/sponsored-placements.api"
import {
  useSponsoredPlacementsQuery,
  useUpsertSponsoredMutation,
} from "../services/sponsored-placements.query"
import { SponsoredProductFormDialog } from "./sponsored-product-form-dialog"
import { SponsoredProductsTable } from "./sponsored-products-table"

function configuredPlacements(rows: SponsoredPlacement[]) {
  return rows.filter((row) => Boolean(row.productId && row.section))
}

function usedSections(rows: SponsoredPlacement[]) {
  return new Set(
    configuredPlacements(rows)
      .map((row) => row.section)
      .filter((section): section is SponsoredSection => Boolean(section))
  )
}

function nextFreeSlot(rows: SponsoredPlacement[]): SponsoredSlot | null {
  return rows.find((row) => !row.productId)?.slot ?? null
}

export function SponsoredProductPageContent() {
  const query = useSponsoredPlacementsQuery()
  const upsert = useUpsertSponsoredMutation()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<SponsoredPlacement | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  const rows = useMemo(() => query.data ?? [], [query.data])
  const items = useMemo(() => configuredPlacements(rows), [rows])
  const taken = useMemo(() => usedSections(rows), [rows])
  const availableSections = useMemo(
    () => SPONSORED_SECTIONS.filter((section) => !taken.has(section)),
    [taken]
  )
  const createSlot = nextFreeSlot(rows)
  const canCreate = Boolean(createSlot) && availableSections.length > 0

  const onToggleActive = async (
    placement: SponsoredPlacement,
    isActive: boolean
  ) => {
    if (!placement.productId || !placement.section) {
      return
    }

    setToggleError(null)

    try {
      await upsert.mutateAsync({
        slot: placement.slot,
        payload: {
          productId: placement.productId,
          section: placement.section,
          title: placement.title || undefined,
          subtitle: placement.subtitle || undefined,
          ctaLabel: placement.ctaLabel || undefined,
          isActive,
        },
      })
    } catch (error) {
      setToggleError(
        error instanceof ApiError
          ? error.message
          : "Could not update sponsored product status."
      )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <MousePointerClick className="size-6 shrink-0 text-primary" />
            Sponsored product
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Promote one product on Top selling and one on New arrivals. Each
            section can only have a single sponsored product.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 cursor-pointer self-start whitespace-nowrap"
          disabled={!canCreate}
          onClick={() => {
            setEditing(null)
            setCreating(true)
          }}
        >
          <Plus />
          Create sponsored product
        </Button>
      </div>

      {query.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {query.error instanceof ApiError
            ? query.error.message
            : "Could not load sponsored products."}
        </p>
      ) : null}

      {toggleError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {toggleError}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Placements ({items.length}/2)</h2>
          {query.isFetching && !query.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <SponsoredProductsTable
          items={items}
          isLoading={query.isLoading}
          isToggling={upsert.isPending}
          emptyMessage="No sponsored products yet. Create one for Top selling or New arrivals."
          onEdit={(placement) => {
            setCreating(false)
            setEditing(placement)
          }}
          onToggleActive={(placement, isActive) =>
            void onToggleActive(placement, isActive)
          }
        />

        {!query.isLoading && items.length === 0 ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer whitespace-nowrap"
              disabled={!canCreate}
              onClick={() => {
                setEditing(null)
                setCreating(true)
              }}
            >
              <Plus />
              Create sponsored product
            </Button>
          </div>
        ) : null}
      </section>

      <SponsoredProductFormDialog
        placement={null}
        slot={createSlot}
        availableSections={availableSections}
        open={creating && canCreate}
        onClose={() => setCreating(false)}
      />
      <SponsoredProductFormDialog
        placement={editing}
        slot={editing?.slot ?? null}
        availableSections={
          editing?.section
            ? [
                editing.section,
                ...availableSections.filter(
                  (section) => section !== editing.section
                ),
              ]
            : availableSections
        }
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
    </div>
  )
}
