import { useState } from "react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SearchableSelectOption = {
  value: string
  label: string
  description?: string
}

type SearchableSelectProps = {
  id?: string
  value?: string
  options: SearchableSelectOption[]
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  invalid?: boolean
  clearOnSelect?: boolean
  onValueChange: (value: string) => void
  onSearchChange?: (value: string) => void
}

const contentClass =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

export function SearchableSelect({
  id,
  value,
  options,
  placeholder,
  searchPlaceholder = "Search",
  emptyMessage = "No matches.",
  disabled = false,
  invalid = false,
  clearOnSelect = false,
  onValueChange,
  onSearchChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [pick, setPick] = useState(0)
  const query = search.trim().toLowerCase()
  const visible = options.filter((option) => {
    if (!query || option.value === value) {
      return true
    }

    return (
      option.label.toLowerCase().includes(query) ||
      (option.description?.toLowerCase().includes(query) ?? false)
    )
  })

  const updateSearch = (next: string) => {
    setSearch(next)
    onSearchChange?.(next)
  }

  return (
    <Select
      key={clearOnSelect ? pick : undefined}
      value={clearOnSelect ? undefined : value}
      open={open}
      disabled={disabled}
      onOpenChange={(next) => {
        setOpen(next)

        if (!next) {
          updateSearch("")
        }
      }}
      onValueChange={(next) => {
        onValueChange(next)

        if (clearOnSelect) {
          updateSearch("")
          setOpen(false)
          setPick((current) => current + 1)
        }
      }}
    >
      <SelectTrigger
        id={id}
        className="h-9! w-full cursor-pointer"
        aria-invalid={invalid}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        className={contentClass}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const content = event.currentTarget
          window.setTimeout(() => {
            content.querySelector("input")?.focus()
          }, 0)
        }}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div
          className="sticky top-0 z-10 bg-popover p-1"
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Input
            value={search}
            className="h-8"
            placeholder={searchPlaceholder}
            onChange={(event) => updateSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
          />
        </div>
        {visible.length === 0 ? (
          <p className="px-2 py-3 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          visible.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                {option.description ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
