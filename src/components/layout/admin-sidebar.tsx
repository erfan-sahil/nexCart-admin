import { cn } from "@/lib/utils"
import { NAV_GROUPS, type NavItem } from "@/lib/navigation"
import { X } from "lucide-react"

type AdminSidebarProps = {
  activeId: string
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: (id: string) => void
  onClose: () => void
}

function NavButton({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate: (id: string) => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      title={item.label}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(item.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none",
        active &&
          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
        collapsed && "lg:justify-center lg:px-2"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", collapsed && "lg:sr-only")}>
        {item.label}
      </span>
    </button>
  )
}

export function AdminSidebar({
  activeId,
  collapsed,
  mobileOpen,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  return (
    <aside
      id="admin-sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:translate-x-0",
        collapsed ? "lg:w-[4.75rem]" : "lg:w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-sidebar-border px-4",
          collapsed && "lg:justify-center lg:px-2"
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
          N
        </span>
        <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
          <p className="truncate text-sm font-semibold">NexCart</p>
          <p className="truncate text-xs text-sidebar-foreground/60">Admin</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        aria-label="Admin"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p
              className={cn(
                "px-3 pb-1 text-xs font-medium tracking-wide text-sidebar-foreground/50 uppercase",
                collapsed && "lg:sr-only"
              )}
            >
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={item.id === activeId}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
            A
          </span>
          <div className={cn("min-w-0", collapsed && "lg:hidden")}>
            <p className="truncate text-sm font-medium">Platform admin</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Full access
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
