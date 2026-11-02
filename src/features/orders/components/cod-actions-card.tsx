import { useState } from "react"

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
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold">COD reconciliation</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Collection status:{" "}
        {order.payment.codCollectionStatus.replaceAll("_", " ")}
      </p>
      <p className="mt-2 text-sm">
        Balance due{" "}
        <span className="font-medium tabular-nums">
          {formatMoney(order.currency, order.payment.balanceDue)}
        </span>
      </p>

      <FieldGroup className="mt-4 gap-3 sm:grid-cols-2">
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

      <div className="mt-4 flex flex-wrap gap-2">
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

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  )
}
