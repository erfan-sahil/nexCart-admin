import { UsersPage } from "@/features/users/components"

export function VendorsPage() {
  return (
    <UsersPage
      role="vendor"
      emptyLabel="No vendor accounts match these filters."
      rowDetails
    />
  )
}
