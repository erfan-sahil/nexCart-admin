import { AdminPageIntro } from "@/components/shared"
import { SiteSettingsPage } from "@/features/site-settings/components"

export function DeliveryChargePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageIntro />
      <SiteSettingsPage />
    </div>
  )
}
