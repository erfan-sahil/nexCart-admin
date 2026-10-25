import { UsersPage } from "@/features/users/components"

export function BuyersPage() {
  return (
    <UsersPage
      role="customer"
      emptyLabel="No buyer accounts match these filters."
    />
  )
}
