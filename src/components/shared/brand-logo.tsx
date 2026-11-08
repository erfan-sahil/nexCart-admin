import { cn } from "@/lib/utils"

const LOGO_SRC = {
  light: "/NexCart-admin-logo-black.png",
  dark: "/NexCart-admin-logo-white-3.png",
} as const

/** Crops the cart icon only (collapsed sidebar). */
const MARK_VIEW = "inset(30.16% 64.8% 24.1% 4.68%)"

type BrandLogoProps = {
  className?: string
  variant?: "wordmark" | "mark"
}

export function BrandLogo({ className, variant = "wordmark" }: BrandLogoProps) {
  const isMark = variant === "mark"

  const cropStyle = isMark ? { objectViewBox: MARK_VIEW } : undefined

  const imageClassName = cn(
    "absolute inset-0 size-full",
    isMark ? "object-cover" : "object-contain object-left"
  )

  return (
    <span
      className={cn(
        "relative inline-block shrink-0",
        isMark ? "aspect-[1.6/1] h-8" : "aspect-[2079/756] h-9 max-w-full",
        className
      )}
    >
      <img
        src={LOGO_SRC.light}
        alt="NexCart"
        style={cropStyle}
        className={cn(imageClassName, "dark:hidden")}
      />
      <img
        src={LOGO_SRC.dark}
        alt=""
        aria-hidden
        style={cropStyle}
        className={cn(imageClassName, "hidden dark:block")}
      />
    </span>
  )
}
