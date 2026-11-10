import { Star } from "@/lib/icons"

import { cn } from "@/lib/utils"

type ReviewStarsProps = {
  rating: number
  className?: string
}

export function ReviewStars({ rating, className }: ReviewStarsProps) {
  const value = Math.max(0, Math.min(5, Math.round(rating)))

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < value

        return (
          <Star
            key={index}
            weight={filled ? "bold" : "linear"}
            className={cn(
              "size-3.5",
              filled ? "text-amber-400" : "text-muted-foreground/40"
            )}
          />
        )
      })}
    </span>
  )
}
