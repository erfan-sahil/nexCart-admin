import type { ReactNode } from "react"

import { usePageMeta } from "@/hooks"
import { cn } from "@/lib/utils"

type AdminPageIntroProps = {
  title?: ReactNode
  description?: string
  className?: string
  trailing?: ReactNode
}

export function AdminPageIntro({
  title,
  description,
  className,
  trailing,
}: AdminPageIntroProps) {
  const meta = usePageMeta()
  const resolvedTitle = title ?? meta.title
  const resolvedDescription = description ?? meta.intro ?? meta.description

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {resolvedTitle}
        </h1>
        {trailing}
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {resolvedDescription}
      </p>
    </div>
  )
}
