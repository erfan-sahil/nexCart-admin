import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  approveProduct,
  getProduct,
  listProductVariants,
  listProductsForModeration,
  productApprovalsQueryKey,
  rejectProduct,
} from "../services"
import type { ListProductsParams } from "../types"

export type ProductReviewAction =
  | { type: "approve"; id: string; note?: string }
  | { type: "reject"; id: string; note: string }

export function useProductsForModerationQuery(params: ListProductsParams) {
  return useQuery({
    queryKey: productApprovalsQueryKey.list(params),
    queryFn: () => listProductsForModeration(params),
    placeholderData: keepPreviousData,
  })
}

export function useProductQuery(id: string | null) {
  return useQuery({
    queryKey: productApprovalsQueryKey.detail(id ?? ""),
    queryFn: () => getProduct(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useProductVariantsQuery(id: string | null) {
  return useQuery({
    queryKey: productApprovalsQueryKey.variants(id ?? ""),
    queryFn: () => listProductVariants(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useReviewProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (action: ProductReviewAction) => {
      if (action.type === "approve") {
        return approveProduct(action.id, action.note)
      }

      return rejectProduct(action.id, action.note)
    },
    onSuccess: async (product) => {
      queryClient.setQueryData(
        productApprovalsQueryKey.detail(product.id),
        product
      )
      await queryClient.invalidateQueries({
        queryKey: productApprovalsQueryKey.lists(),
      })
    },
  })
}
