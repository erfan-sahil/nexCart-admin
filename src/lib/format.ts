const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

const dateOnly = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
})

export function formatDateTime(value: string | null) {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateTime.format(date)
}

export function formatDate(value: string | null) {
  if (!value) {
    return "—"
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateOnly.format(date)
}

export function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}
