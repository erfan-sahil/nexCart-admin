import { useEffect, useState } from "react"

import { DashboardHome } from "@/components/dashboard/dashboard-home"
import { SectionView } from "@/components/dashboard/section-view"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { DEFAULT_NAV_ID, getNavItem } from "@/lib/navigation"

export function AdminShell() {
  const [activeId, setActiveId] = useState(DEFAULT_NAV_ID)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeItem = getNavItem(activeId)

  useEffect(() => {
    if (!mobileOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileOpen])

  const navigate = (id: string) => {
    setActiveId(id)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar
        activeId={activeId}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={navigate}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={activeItem?.label ?? "Dashboard"}
          description={activeItem?.description ?? ""}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onOpenMobile={() => setMobileOpen(true)}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {activeId === "dashboard" ? (
            <DashboardHome />
          ) : (
            <SectionView
              title={activeItem?.label ?? "Section"}
              description={activeItem?.description ?? ""}
            />
          )}
        </main>
      </div>
    </div>
  )
}
