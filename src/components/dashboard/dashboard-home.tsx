import { ORDERS, SALES, STATS, VENDORS } from "@/lib/dashboard"

const STATUS_CLASS = {
  Paid: "bg-brand-soft text-brand-text",
  Packing: "bg-secondary text-secondary-foreground",
  "Refund review": "bg-destructive/10 text-destructive",
} as const

export function DashboardHome() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium text-brand-text">{stat.change}</span>
              <span className="px-1.5">·</span>
              {stat.hint}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5 xl:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Sales this week</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Sample snapshot until live orders are connected.
              </p>
            </div>
            <p className="text-sm font-medium text-brand-text">$53.3k</p>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
            {SALES.map((point) => (
              <div
                key={point.label}
                className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
              >
                <div className="flex h-36 items-end">
                  <div
                    className="w-full rounded-md bg-primary"
                    style={{
                      height: `${point.share}%`,
                      backgroundImage:
                        "linear-gradient(to top, var(--brand-deep), var(--brand))",
                    }}
                    title={`${point.label} ${point.amount}`}
                  />
                </div>
                <span className="truncate text-center text-[11px] text-muted-foreground">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Vendor reviews</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Stores waiting for approval.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {VENDORS.map((vendor) => (
              <li
                key={vendor.store}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{vendor.store}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {vendor.category}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {vendor.submitted}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest platform orders.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium sm:px-5">Order</th>
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium sm:px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium sm:px-5">{order.id}</td>
                  <td className="px-4 py-3">{order.store}</td>
                  <td className="px-4 py-3">{order.total}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
