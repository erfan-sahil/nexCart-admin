import { useState } from "react"
import { Banknote } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/errors"

import { useCodMutations } from "../hooks"
import { formatMoney } from "../labels"
import type { AdminOrderDetail } from "../types/admin-orders.types"

type CodActionsCardProps = {
  order: AdminOrderDetail
}

export function CodActionsCard({ order }: CodActionsCardProps) {
  const { collect, remit, reconcile } = useCodMutations(order.id)
  const [amountCollected, setAmountCollected] = useState(
    String(order.payment.balanceDue || order.totals.grandTotal)
  )
  const [remittedAmount, setRemittedAmount] = useState(amountCollected)
  const [courierReference, setCourierReference] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (order.paymentMethod !== "cod") {
    return null
  }

  const pending = collect.isPending || remit.isPending || reconcile.isPending

  const handle = async (action: () => Promise<unknown>) => {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "COD update failed.")
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <Banknote className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">COD collection</h3>
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">
            {order.payment.codCollectionStatus.replaceAll("_", " ")}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <p className="text-sm">
          Balance due{" "}
          <span className="font-semibold tabular-nums">
            {formatMoney(order.currency, order.payment.balanceDue)}
          </span>
        </p>

        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="cod-collected">Amount collected</FieldLabel>
            <Input
              id="cod-collected"
              type="number"
              min={0}
              value={amountCollected}
              onChange={(event) => setAmountCollected(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cod-reference">Courier reference</FieldLabel>
            <Input
              id="cod-reference"
              value={courierReference}
              onChange={(event) => setCourierReference(event.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cod-remit">Remitted amount</FieldLabel>
            <Input
              id="cod-remit"
              type="number"
              min={0}
              value={remittedAmount}
              onChange={(event) => setRemittedAmount(event.target.value)}
            />
          </Field>
        </FieldGroup>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              void handle(() =>
                collect.mutateAsync({
                  amountCollected: Number(amountCollected),
                  ...(courierReference.trim()
                    ? { courierReference: courierReference.trim() }
                    : {}),
                })
              )
            }
          >
            Record collection
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              void handle(() =>
                remit.mutateAsync({ remittedAmount: Number(remittedAmount) })
              )
            }
          >
            Record remittance
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => void handle(() => reconcile.mutateAsync())}
          >
            Reconcile
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </section>
  )
}
