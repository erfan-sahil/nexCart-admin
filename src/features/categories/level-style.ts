import type { CategoryLevel } from "./types"

const LEVEL_TONE: Record<
  CategoryLevel,
  { badge: string; mark: string; rail: string; row: string; crumb: string }
> = {
  1: {
    badge: "bg-brand-soft text-brand-text",
    mark: "bg-brand text-brand-foreground",
    rail: "bg-brand",
    row: "",
    crumb: "text-brand-text",
  },
  2: {
    badge: "bg-amber-500/15 text-amber-950 dark:text-amber-100",
    mark: "bg-amber-500 text-white",
    rail: "bg-amber-500",
    row: "bg-amber-500/5",
    crumb: "text-amber-800 dark:text-amber-200",
  },
  3: {
    badge: "bg-violet-500/15 text-violet-950 dark:text-violet-100",
    mark: "bg-violet-500 text-white",
    rail: "bg-violet-500",
    row: "bg-violet-500/10",
    crumb: "text-violet-800 dark:text-violet-200",
  },
}

export function categoryLevelTone(level: CategoryLevel) {
  return LEVEL_TONE[level]
}
