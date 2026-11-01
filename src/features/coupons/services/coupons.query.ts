export const couponsKeys = {
  all: ["coupons"] as const,
  lists: () => ["coupons", "list"] as const,
  list: (params: Record<string, unknown>) =>
    ["coupons", "list", params] as const,
}
