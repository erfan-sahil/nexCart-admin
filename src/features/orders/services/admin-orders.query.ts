import type {
  ListAdminOrdersParams,
  ListAdminReturnsParams,
  ListAdminVendorOrdersParams,
  ListAdminVendorReturnShipmentsParams,
} from "../types/admin-orders.types"

export const adminOrderKeys = {
  all: ["admin-orders"] as const,
  list: (params: ListAdminOrdersParams) =>
    [...adminOrderKeys.all, "list", params] as const,
  detail: (id: string) => [...adminOrderKeys.all, "detail", id] as const,
  vendorList: (params: ListAdminVendorOrdersParams) =>
    [...adminOrderKeys.all, "vendor-list", params] as const,
  returns: (params: ListAdminReturnsParams) =>
    [...adminOrderKeys.all, "returns", params] as const,
  returnDetail: (id: string) => [...adminOrderKeys.all, "return", id] as const,
  vendorReturns: (params: ListAdminVendorReturnShipmentsParams) =>
    [...adminOrderKeys.all, "vendor-returns", params] as const,
}
