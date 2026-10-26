import { cn } from "@/lib/utils"

const LOGO_SRC = "/NexCart-admin-logo-white.png"

/**
 * The source file is a wide transparent PNG with padding around the mark.
 * These insets crop to the drawn pixels: the cart, then the wordmark.
 */
const VIEW = {
  wordmark: "inset(30.16% 4.17% 24.1% 4.68%)",
  mark: "inset(30.16% 64.8% 24.1% 4.68%)",
} as const

type BrandLogoProps = {
  className?: string
  variant?: keyof typeof VIEW
}

export function BrandLogo({ className, variant = "wordmark" }: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="NexCart"
      style={{ objectViewBox: VIEW[variant] }}
      className={cn(
        "w-auto max-w-none object-cover",
        variant === "mark" ? "aspect-[1.6/1] h-8" : "aspect-[4.79/1] h-9",
        className
      )}
    />
  )
}
