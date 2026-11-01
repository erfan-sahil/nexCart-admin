export function toLocalInputValue(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function fromLocalInputValue(value: string) {
  return new Date(value).toISOString()
}

export function formatDealDate(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}
