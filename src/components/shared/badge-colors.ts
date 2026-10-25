import type { BadgeColorCodes } from "./universal-badge"

export const badgeColors = {
  active: {
    background: "var(--brand-soft)",
    foreground: "var(--brand-text)",
    dot: "var(--brand)",
  },
  suspended: {
    background: "color-mix(in srgb, var(--destructive) 14%, transparent)",
    foreground: "var(--destructive)",
    dot: "var(--destructive)",
  },
  buyer: {
    background: "var(--brand-soft)",
    foreground: "var(--brand-text)",
    dot: "var(--brand)",
  },
  neutral: {
    background: "var(--secondary)",
    foreground: "var(--secondary-foreground)",
  },
} satisfies Record<string, BadgeColorCodes>
