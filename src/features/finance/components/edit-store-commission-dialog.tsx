"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "@/lib/icons"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/errors"

import {
  setStoreCommission,
  type VendorEarningsRow,
} from "../services/admin-finance.api"

type EditStoreCommissionDialogProps = {
  store: VendorEarningsRow | null
  defaultCommissionRate: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function initialRate(store: VendorEarningsRow) {
  return store.hasOverride && store.commissionRate !== null
    ? store.commissionRate
    : store.effectiveCommissionRate
}

export function EditStoreCommissionDialog({
  store,
  defaultCommissionRate,
  open,
  onOpenChange,
}: EditStoreCommissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {store ? (
          <EditStoreCommissionForm
            key={store.storeId}
            store={store}
            defaultCommissionRate={defaultCommissionRate}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type EditStoreCommissionFormProps = {
  store: VendorEarningsRow
  defaultCommissionRate: number
  onClose: () => void
}

function EditStoreCommissionForm({
  store,
  defaultCommissionRate,
  onClose,
}: EditStoreCommissionFormProps) {
  const queryClient = useQueryClient()
  const [rate, setRate] = useState<number | "">(() => initialRate(store))
  const [error, setError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: (payload: { storeId: string; commissionRate: number | null }) =>
      setStoreCommission(payload.storeId, payload.commissionRate),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "commission"] }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "vendor-earnings"],
        }),
      ])
      onClose()
    },
  })

  const close = () => {
    if (save.isPending) {
      return
    }
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update commission</DialogTitle>
        <DialogDescription>
          Set a custom rate for{" "}
          <span className="font-medium text-foreground">{store.storeName}</span>
          . Use platform default to clear an override ({defaultCommissionRate}
          %).
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel htmlFor="editStoreCommissionRate">
          Commission rate (%)
        </FieldLabel>
        <Input
          id="editStoreCommissionRate"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={rate}
          onChange={(event) =>
            setRate(event.target.value === "" ? "" : Number(event.target.value))
          }
          placeholder={String(defaultCommissionRate)}
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DialogFooter className="gap-2 sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={save.isPending}
          onClick={async () => {
            setError(null)

            try {
              await save.mutateAsync({
                storeId: store.storeId,
                commissionRate: null,
              })
            } catch (err) {
              setError(
                err instanceof ApiError
                  ? err.message
                  : "Could not clear store commission."
              )
            }
          }}
        >
          Use platform default
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={save.isPending}
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={save.isPending || rate === ""}
            onClick={async () => {
              if (rate === "") {
                return
              }

              if (Number.isNaN(rate) || rate < 0 || rate > 100) {
                setError("Enter a rate between 0 and 100.")
                return
              }

              setError(null)

              try {
                await save.mutateAsync({
                  storeId: store.storeId,
                  commissionRate: Number(rate),
                })
              } catch (err) {
                setError(
                  err instanceof ApiError
                    ? err.message
                    : "Could not update store commission."
                )
              }
            }}
          >
            {save.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save rate"
            )}
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
