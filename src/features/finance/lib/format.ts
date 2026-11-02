const dateTimeFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatFinanceDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateTimeFormat.format(date)
}

export function formatListRange(page: number, limit: number, total: number) {
  if (total === 0) {
    return "No records"
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${start}–${end} of ${total}`
}

export function maskAccountNumber(value: string | undefined) {
  if (!value) {
    return "—"
  }

  const trimmed = value.replace(/\s/g, "")

  if (trimmed.length <= 4) {
    return trimmed
  }

  return `•••• ${trimmed.slice(-4)}`
}

export function storeInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}
