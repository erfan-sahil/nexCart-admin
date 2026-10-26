import type { CategoryLevel } from "./types"

export const CATEGORY_LEVEL_LABEL: Record<CategoryLevel, string> = {
  1: "Root",
  2: "Subcategory",
  3: "Sub-subcategory",
}

export function categoryChildLabel(level: CategoryLevel, count: number) {
  if (count === 0 || level >= 3) {
    return null
  }

  if (level === 1) {
    return count === 1 ? "1 subcategory" : `${count} subcategories`
  }

  return count === 1 ? "1 sub-subcategory" : `${count} sub-subcategories`
}
