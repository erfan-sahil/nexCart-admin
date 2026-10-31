export const flashDealsKeys = {
  all: ["flash-deals"] as const,
  lists: () => ["flash-deals", "manage"] as const,
  list: (params: Record<string, unknown>) =>
    ["flash-deals", "manage", params] as const,
  detail: (id: string) => ["flash-deals", "detail", id] as const,
}
