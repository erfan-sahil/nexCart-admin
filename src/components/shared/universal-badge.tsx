import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type BadgeColorCodes = {
  background: string
  foreground: string
  dot?: string
}

type UniversalBadgeProps = {
  name: string
  icon?: LucideIcon
  colors: BadgeColorCodes
  showDot?: boolean
  className?: string
}

export function UniversalBadge({
  name,
  icon: Icon,
  colors,
  showDot = !Icon,
  className,
}: UniversalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap capitalize",
        className
      )}
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
    >
      {Icon ? <Icon className="size-3 shrink-0" aria-hidden /> : null}
      {showDot ? (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: colors.dot ?? colors.foreground }}
          aria-hidden
        />
      ) : null}
      {name}
    </span>
  )
}
