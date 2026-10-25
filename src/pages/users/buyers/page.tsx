import { UsersPage } from "@/features/users/components/users-page"

export function BuyersPage() {
  return (
    <UsersPage
      role="customer"
      emptyLabel="No buyer accounts match these filters."
    />
  )
}
