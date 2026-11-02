"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  listAdminWithdrawals,
  reviewWithdrawal,
} from "../services/admin-finance.api"

export function AdminWithdrawalsPage() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: () =>
      listAdminWithdrawals({ page: 1, limit: 50, status: "pending" }),
  })

  const review = useMutation({
    mutationFn: reviewWithdrawal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "withdrawals"],
      })
    },
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Withdrawals</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(query.data?.items ?? []).map((row) => (
            <TableRow key={row.id}>
              <TableCell>৳{row.amount.toFixed(2)}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.method}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={review.isPending}
                  onClick={() =>
                    review.mutate({
                      withdrawalId: row.id,
                      body: { action: "approve" },
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={review.isPending}
                  onClick={() =>
                    review.mutate({
                      withdrawalId: row.id,
                      body: { action: "reject", reviewNote: "Rejected" },
                    })
                  }
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
