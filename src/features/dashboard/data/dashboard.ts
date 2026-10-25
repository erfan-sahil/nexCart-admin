export type Stat = {
  label: string
  value: string
  change: string
  hint: string
}

export type SalesPoint = {
  label: string
  amount: string
  share: number
}

export type OrderRow = {
  id: string
  store: string
  total: string
  status: "Paid" | "Packing" | "Refund review"
}

export type VendorRow = {
  store: string
  category: string
  submitted: string
}

export const STATS: Stat[] = [
  {
    label: "Gross sales",
    value: "$48,290",
    change: "+12.4%",
    hint: "Last 7 days",
  },
  {
    label: "Orders",
    value: "1,284",
    change: "+4.1%",
    hint: "312 still open",
  },
  {
    label: "Vendor reviews",
    value: "18",
    change: "6 new",
    hint: "Waiting on approval",
  },
  {
    label: "Catalog flags",
    value: "27",
    change: "9 urgent",
    hint: "Products in moderation",
  },
]

export const SALES: SalesPoint[] = [
  { label: "Mon", amount: "$5.1k", share: 46 },
  { label: "Tue", amount: "$6.4k", share: 58 },
  { label: "Wed", amount: "$7.8k", share: 72 },
  { label: "Thu", amount: "$6.1k", share: 55 },
  { label: "Fri", amount: "$9.2k", share: 86 },
  { label: "Sat", amount: "$10.4k", share: 100 },
  { label: "Sun", amount: "$8.3k", share: 78 },
]

export const ORDERS: OrderRow[] = [
  {
    id: "NC-10482",
    store: "Northwind Home",
    total: "$186.00",
    status: "Paid",
  },
  {
    id: "NC-10479",
    store: "Atlas Audio",
    total: "$64.50",
    status: "Packing",
  },
  {
    id: "NC-10471",
    store: "Lumen Studio",
    total: "$240.00",
    status: "Refund review",
  },
  {
    id: "NC-10466",
    store: "Field & Co.",
    total: "$92.20",
    status: "Paid",
  },
]

export const VENDORS: VendorRow[] = [
  {
    store: "Harbor Goods",
    category: "Home",
    submitted: "2h ago",
  },
  {
    store: "Paper Lantern",
    category: "Stationery",
    submitted: "5h ago",
  },
  {
    store: "Kiln & Clay",
    category: "Handmade",
    submitted: "Yesterday",
  },
]
