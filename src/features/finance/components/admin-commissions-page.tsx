"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api/errors"

import {
  getCommissionSettings,
  listVendorEarnings,
  updateCommissionSettings,
} from "../services/admin-finance.api"

export function AdminCommissionsPage() {
  const settings = useQuery({
    queryKey: ["admin", "commission", "settings"],
    queryFn: getCommissionSettings,
  })
  const earnings = useQuery({
    queryKey: ["admin", "commission", "vendor-earnings"],
    queryFn: () => listVendorEarnings(1, 50),
  })

  const queryClient = useQueryClient()
  const [rate, setRate] = useState<number | "">("")
  const [holdDays, setHoldDays] = useState<number | "">("")
  const [error, setError] = useState<string | null>(null)

  const saveSettings = useMutation({
    mutationFn: updateCommissionSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "commission"] })
    },
  })

  if (settings.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const current = settings.data

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Commissions</h1>
        <p className="text-sm text-muted-foreground">
          Platform default rate and settlement hold. Store overrides use the
          store id below.
        </p>
      </div>

      <form
        className="grid max-w-md gap-4"
        onSubmit={async (event) => {
          event.preventDefault()
          setError(null)
          try {
            await saveSettings.mutateAsync({
              defaultCommissionRate: Number(
                rate || current?.defaultCommissionRate || 10
              ),
              settlementHoldDays: Number(
                holdDays || current?.settlementHoldDays || 7
              ),
            })
          } catch (err) {
            setError(
              err instanceof ApiError ? err.message : "Could not save settings."
            )
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="defaultRate">Default commission (%)</Label>
          <Input
            id="defaultRate"
            type="number"
            min={0}
            max={100}
            placeholder={String(current?.defaultCommissionRate ?? 10)}
            value={rate}
            onChange={(e) =>
              setRate(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="holdDays">Settlement hold (days)</Label>
          <Input
            id="holdDays"
            type="number"
            min={0}
            max={90}
            placeholder={String(current?.settlementHoldDays ?? 7)}
            value={holdDays}
            onChange={(e) =>
              setHoldDays(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={saveSettings.isPending}>
          Save platform settings
        </Button>
      </form>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Vendor earnings</h2>
        {earnings.isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(earnings.data?.items ?? []).map((row) => (
                <TableRow key={row.storeId}>
                  <TableCell>{row.storeName}</TableCell>
                  <TableCell>৳{row.pendingSettlement.toFixed(2)}</TableCell>
                  <TableCell>৳{row.availableBalance.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
