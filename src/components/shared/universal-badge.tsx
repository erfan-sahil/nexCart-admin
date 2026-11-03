import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
    <Badge
      variant="outline"
      data-icon={Icon ? "inline-start" : undefined}
      className={cn("border-transparent capitalize shadow-none", className)}
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
      }}
    >
      {Icon ? <Icon data-icon="inline-start" aria-hidden /> : null}
      {showDot ? (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: colors.dot ?? colors.foreground }}
          aria-hidden
        />
      ) : null}
      {name}
    </Badge>
  )
}
