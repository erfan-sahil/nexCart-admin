import { cn } from "@/lib/utils"

import { CATEGORY_LEVEL_HINT, CATEGORY_LEVEL_LABEL } from "../labels"
import { categoryLevelTone } from "../level-style"
import type { CategoryLevel } from "../types"

export function CategoryLevelBadge({ level }: { level: CategoryLevel }) {
  const tone = categoryLevelTone(level)

  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1.5 rounded-md pr-2 pl-0.5",
        tone.badge
      )}
      title={`${CATEGORY_LEVEL_LABEL[level]}. ${CATEGORY_LEVEL_HINT[level]}.`}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold tabular-nums",
          tone.mark
        )}
        aria-hidden
      >
        {level}
      </span>
      <span className="truncate text-xs font-medium">
        {CATEGORY_LEVEL_LABEL[level]}
      </span>
      <span className="sr-only">. {CATEGORY_LEVEL_HINT[level]}.</span>
    </span>
  )
}
