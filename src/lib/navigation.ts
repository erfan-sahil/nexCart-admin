import {
  BadgePercent,
  Boxes,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  PackageSearch,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Tags,
  Ticket,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Sales, orders, and queues that need a decision today.",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        id: "orders",
        label: "Orders",
        description: "Platform orders, fulfillment state, and refunds.",
        icon: ShoppingBag,
      },
      {
        id: "coupons",
        label: "Coupons",
        description: "Discount codes, usage limits, and active windows.",
        icon: Ticket,
      },
      {
        id: "promotions",
        label: "Promotions",
        description: "Campaigns that run across stores and categories.",
        icon: Megaphone,
      },
      {
        id: "commission",
        label: "Commission",
        description: "Platform fees applied to vendor payouts.",
        icon: BadgePercent,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        id: "products",
        label: "Products",
        description: "Listings waiting for moderation before they go live.",
        icon: PackageSearch,
      },
      {
        id: "categories",
        label: "Categories",
        description: "The category tree shoppers browse.",
        icon: FolderTree,
      },
      {
        id: "attributes",
        label: "Attributes",
        description: "Shared attributes used by product variants.",
        icon: SlidersHorizontal,
      },
      {
        id: "brands",
        label: "Brands",
        description: "Brand records attached to catalog items.",
        icon: Tags,
      },
      {
        id: "units",
        label: "Units",
        description: "Units of measure used in the catalog.",
        icon: Boxes,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        id: "vendors",
        label: "Vendors",
        description: "Seller applications and store approvals.",
        icon: Store,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        description: "Platform-wide configuration.",
        icon: Settings,
      },
    ],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

export const DEFAULT_NAV_ID = NAV_ITEMS[0]?.id ?? "dashboard"

export function getNavItem(id: string) {
  return NAV_ITEMS.find((item) => item.id === id) ?? NAV_ITEMS[0]
}
