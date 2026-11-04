import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  adminReviewKeys,
  deleteAdminReview,
  listAdminReviews,
} from "../services"
import type { ListReviewsParams } from "../types"

export function useAdminReviewsQuery(params: ListReviewsParams) {
  return useQuery({
    queryKey: adminReviewKeys.list(params),
    queryFn: () => listAdminReviews(params),
    placeholderData: keepPreviousData,
  })
}

export function useDeleteAdminReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => deleteAdminReview(reviewId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminReviewKeys.lists(),
      })
    },
  })
}
