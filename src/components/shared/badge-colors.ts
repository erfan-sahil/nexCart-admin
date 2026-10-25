import type { BadgeColorCodes } from "./universal-badge"

export const badgeColors = {
  active: {
    background: "color-mix(in srgb, #16a34a 16%, transparent)",
    foreground: "color-mix(in srgb, #16a34a 62%, var(--foreground))",
    dot: "#16a34a",
  },
  suspended: {
    background: "color-mix(in srgb, #dc2626 14%, transparent)",
    foreground: "color-mix(in srgb, #dc2626 58%, var(--foreground))",
    dot: "#dc2626",
  },
  buyer: {
    background: "color-mix(in srgb, #8b5cf6 18%, transparent)",
    foreground: "color-mix(in srgb, #8b5cf6 42%, var(--foreground))",
  },
  neutral: {
    background: "var(--secondary)",
    foreground: "var(--secondary-foreground)",
  },
} satisfies Record<string, BadgeColorCodes>
