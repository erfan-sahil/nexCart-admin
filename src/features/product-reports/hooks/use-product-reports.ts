import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  listProductReports,
  productReportKeys,
  updateProductReportStatus,
} from "../services"
import type {
  ListProductReportsParams,
  UpdateProductReportStatusPayload,
} from "../types"

export function useProductReportsQuery(params: ListProductReportsParams) {
  return useQuery({
    queryKey: productReportKeys.list(params),
    queryFn: () => listProductReports(params),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateProductReportStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      payload,
    }: {
      reportId: string
      payload: UpdateProductReportStatusPayload
    }) => updateProductReportStatus(reportId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productReportKeys.lists(),
      })
    },
  })
}
