import { useEffect } from "react"
import { Menu, Moon, PanelLeft, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/app/providers/theme-provider"
import { useAuthStore } from "@/features/auth/store"
import { usePageMeta } from "@/hooks"

type AdminHeaderProps = {
  collapsed: boolean
  mobileOpen: boolean
  onOpenMobile: () => void
  onToggleCollapsed: () => void
}

export function AdminHeader({
  collapsed,
  mobileOpen,
  onOpenMobile,
  onToggleCollapsed,
}: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { title, description } = usePageMeta()
  const user = useAuthStore((state) => state.user)
  const isDark = theme === "dark"
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date())

  useEffect(() => {
    document.title = `${title} · NexCart Admin`
  }, [title])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        aria-controls="admin-sidebar"
        aria-expanded={mobileOpen}
        onClick={onOpenMobile}
      >
        <Menu />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="hidden lg:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        onClick={onToggleCollapsed}
      >
        <PanelLeft />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>

      <p className="hidden text-sm text-muted-foreground md:block">{today}</p>
      {user ? (
        <p className="hidden max-w-40 truncate text-sm text-muted-foreground lg:block">
          {user.firstName} {user.lastName}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </header>
  )
}
