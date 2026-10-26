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
  vendor: {
    background: "color-mix(in srgb, #0284c7 16%, transparent)",
    foreground: "color-mix(in srgb, #0284c7 55%, var(--foreground))",
  },
  draft: {
    background: "var(--secondary)",
    foreground: "var(--secondary-foreground)",
    dot: "var(--muted-foreground)",
  },
  submitted: {
    background: "color-mix(in srgb, #2563eb 16%, transparent)",
    foreground: "color-mix(in srgb, #2563eb 55%, var(--foreground))",
    dot: "#2563eb",
  },
  under_review: {
    background: "color-mix(in srgb, #d97706 16%, transparent)",
    foreground: "color-mix(in srgb, #d97706 58%, var(--foreground))",
    dot: "#d97706",
  },
  more_info_required: {
    background: "color-mix(in srgb, #8b5cf6 18%, transparent)",
    foreground: "color-mix(in srgb, #8b5cf6 42%, var(--foreground))",
    dot: "#8b5cf6",
  },
  approved: {
    background: "color-mix(in srgb, #16a34a 16%, transparent)",
    foreground: "color-mix(in srgb, #16a34a 62%, var(--foreground))",
    dot: "#16a34a",
  },
  rejected: {
    background: "color-mix(in srgb, #dc2626 14%, transparent)",
    foreground: "color-mix(in srgb, #dc2626 58%, var(--foreground))",
    dot: "#dc2626",
  },
  neutral: {
    background: "var(--secondary)",
    foreground: "var(--secondary-foreground)",
  },
} satisfies Record<string, BadgeColorCodes>
