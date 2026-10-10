import {
  BadgeCheck,
  BadgePercent,
  Banknote,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FolderTree,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  Megaphone,
  MousePointerClick,
  PackageSearch,
  Receipt,
  Repeat,
  Scale,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tags,
  Ticket,
  Undo2,
  UserRound,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"

type NavPageShape = {
  kind: "page"
  label: string
  path: string
  description: string
  icon: LucideIcon
}

type NavGroupShape = {
  kind: "group"
  label: string
  icon: LucideIcon
  children: readonly NavPageShape[]
}

type NavShape = NavPageShape | NavGroupShape

function defineNav<const T extends readonly NavShape[]>(nav: T) {
  return nav
}

export const NAV = defineNav([
  {
    kind: "page",
    label: "Dashboard",
    path: "/",
    description: "Sales, orders, and queues that need a decision today.",
    icon: LayoutDashboard,
  },
  {
    kind: "group",
    label: "Users",
    icon: Users,
    children: [
      {
        kind: "page",
        label: "Buyers",
        path: "/users/buyers",
        description: "Customer accounts that shop on the marketplace.",
        icon: UserRound,
      },
      {
        kind: "page",
        label: "Vendors",
        path: "/users/vendors",
        description: "Approved sellers and their store status.",
        icon: Store,
      },
      {
        kind: "page",
        label: "Vendor Applications",
        path: "/users/vendor-applications",
        description: "Seller applications waiting for a decision.",
        icon: ClipboardList,
      },
    ],
  },
  {
    kind: "group",
    label: "Catalog",
    icon: FolderTree,
    children: [
      {
        kind: "page",
        label: "Categories",
        path: "/catalog/categories",
        description: "The category tree shoppers browse.",
        icon: FolderTree,
      },
      {
        kind: "page",
        label: "Attributes",
        path: "/catalog/attributes",
        description: "Shared attributes used by product variants.",
        icon: SlidersHorizontal,
      },
      {
        kind: "page",
        label: "Brands",
        path: "/catalog/brands",
        description: "Brand records attached to catalog items.",
        icon: Tags,
      },
      {
        kind: "page",
        label: "Product Approvals",
        path: "/catalog/product-approvals",
        description: "Listings waiting for moderation before they go live.",
        icon: PackageSearch,
      },
    ],
  },
  {
    kind: "group",
    label: "Commerce",
    icon: ShoppingBag,
    children: [
      {
        kind: "page",
        label: "All Orders",
        path: "/commerce/orders",
        description: "Platform orders and fulfillment state.",
        icon: ShoppingBag,
      },
      {
        kind: "page",
        label: "Payments",
        path: "/commerce/payments",
        description: "Charges, captures, and payment status.",
        icon: CreditCard,
      },
      {
        kind: "page",
        label: "Returns & Refunds",
        path: "/commerce/returns",
        description: "Return requests and refund decisions.",
        icon: Undo2,
      },
      {
        kind: "page",
        label: "Disputes",
        path: "/commerce/disputes",
        description: "Buyer and vendor disputes that need a ruling.",
        icon: Scale,
      },
    ],
  },
  {
    kind: "group",
    label: "Finance",
    icon: Wallet,
    children: [
      {
        kind: "page",
        label: "Commissions",
        path: "/finance/commissions",
        description: "Platform fees applied to vendor sales.",
        icon: BadgePercent,
      },
      {
        kind: "page",
        label: "Vendor Earnings",
        path: "/finance/vendor-earnings",
        description: "What each vendor has earned and what is still held.",
        icon: CircleDollarSign,
      },
      {
        kind: "page",
        label: "Withdrawals",
        path: "/finance/withdrawals",
        description: "Vendor payout requests and their status.",
        icon: Banknote,
      },
      {
        kind: "page",
        label: "Settlements",
        path: "/finance/settlements",
        description: "Completed payout batches and settlement records.",
        icon: Receipt,
      },
    ],
  },
  {
    kind: "group",
    label: "Marketing",
    icon: Megaphone,
    children: [
      {
        kind: "page",
        label: "Banners",
        path: "/marketing/banners",
        description: "Homepage and campaign banners.",
        icon: Images,
      },
      {
        kind: "page",
        label: "Featured Products",
        path: "/marketing/featured-products",
        description: "Products highlighted across the storefront.",
        icon: Star,
      },
      {
        kind: "page",
        label: "Featured Categories",
        path: "/marketing/featured-categories",
        description: "Categories promoted on the storefront.",
        icon: Sparkles,
      },
      {
        kind: "page",
        label: "Collections",
        path: "/marketing/collections",
        description: "Curated product groups for campaigns.",
        icon: LayoutGrid,
      },
      {
        kind: "page",
        label: "Coupons",
        path: "/marketing/coupons",
        description: "Discount codes, usage limits, and active windows.",
        icon: Ticket,
      },
      {
        kind: "page",
        label: "Flash Deals",
        path: "/marketing/flash-deals",
        description: "Time-boxed deals with a start and an end.",
        icon: Zap,
      },
    ],
  },
  {
    kind: "group",
    label: "Monetization",
    icon: BadgeCheck,
    children: [
      {
        kind: "page",
        label: "Vendor Plans",
        path: "/monetization/vendor-plans",
        description: "Subscription plans vendors can buy.",
        icon: BadgeCheck,
      },
      {
        kind: "page",
        label: "Subscriptions",
        path: "/monetization/subscriptions",
        description: "Active vendor plan subscriptions.",
        icon: Repeat,
      },
      {
        kind: "page",
        label: "Sponsored Ads",
        path: "/monetization/sponsored-ads",
        description: "Paid placements running on the storefront.",
        icon: MousePointerClick,
      },
    ],
  },
  {
    kind: "page",
    label: "Reports",
    path: "/reports",
    description: "Sales, catalog, and vendor performance.",
    icon: BarChart3,
  },
  {
    kind: "page",
    label: "Support",
    path: "/support",
    description: "Tickets and conversations that need a reply.",
    icon: LifeBuoy,
  },
  {
    kind: "page",
    label: "Settings",
    path: "/settings",
    description: "Platform-wide configuration.",
    icon: Settings,
  },
])

export type NavEntry = (typeof NAV)[number]
export type NavGroup = Extract<NavEntry, { kind: "group" }>
export type NavPage = Extract<
  NavEntry | NavGroup["children"][number],
  { kind: "page" }
>

type ExtractPaths<T> = T extends readonly (infer Item)[]
  ? Item extends { path: infer Path extends string }
    ? Path
    : Item extends { children: infer Children }
      ? ExtractPaths<Children>
      : never
  : never

export type AdminPath = ExtractPaths<typeof NAV>

export type PageHandle = {
  title: string
  description: string
}

export function isNavGroup(
  entry: NavEntry
): entry is Extract<NavEntry, { kind: "group" }> {
  return entry.kind === "group"
}

export function pathSegment(path: string) {
  return path.split("/").filter(Boolean).at(-1) ?? ""
}

export function groupBase(group: NavGroup) {
  const [base] = group.children[0].path.split("/").filter(Boolean)
  return base ?? ""
}
