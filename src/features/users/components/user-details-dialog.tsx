import {
  BadgeCheck,
  CalendarClock,
  Clock3,
  History,
  Mail,
  Pencil,
  Phone,
  Store,
  UserRound,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDateTime, fullName } from "@/lib/format"
import { cn } from "@/lib/utils"

import type { AdminUser } from "../types"

type UserDetailsDialogProps = {
  user: AdminUser | null
  open: boolean
  onClose: () => void
  onEdit: (user: AdminUser) => void
}

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const ACCOUNT_COPY = {
  customer: {
    badge: "Buyer",
    description: "Buyer account",
    edit: "Edit buyer",
    icon: UserRound,
    colors: badgeColors.buyer,
  },
  vendor: {
    badge: "Vendor",
    description: "Vendor account",
    edit: "Edit vendor",
    icon: Store,
    colors: badgeColors.vendor,
  },
} as const

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

function initials(user: AdminUser) {
  const letters = `${user.firstName} ${user.lastName}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return letters || "?"
}

function DetailItem({
  icon: Icon,
  label,
  value,
  tone,
  nowrap = false,
  className,
}: {
  icon: typeof Phone
  label: string
  value: string
  tone: DetailTone
  nowrap?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
        nowrap && "min-w-max flex-1",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className={cn(nowrap ? "shrink-0" : "min-w-0 flex-1")}>
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        <dd
          className={cn(
            "mt-0.5 text-sm font-medium text-foreground",
            nowrap ? "whitespace-nowrap" : "wrap-break-word"
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
}

export function UserDetailsDialog({
  user,
  open,
  onClose,
  onEdit,
}: UserDetailsDialogProps) {
  if (!open || !user) {
    return null
  }

  const name = fullName(user.firstName, user.lastName)
  const account =
    user.role === "vendor" ? ACCOUNT_COPY.vendor : ACCOUNT_COPY.customer
  const AccountIcon = account.icon

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {initials(user)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                {account.description}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <UniversalBadge
                  name={user.status}
                  colors={badgeColors[user.status]}
                />
                <UniversalBadge
                  name={account.badge}
                  icon={AccountIcon}
                  colors={account.colors}
                  showDot={false}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea
          type="auto"
          className="max-h-[calc(100dvh-16rem)] bg-muted/20"
          viewportClassName="max-h-[calc(100dvh-16rem)]"
        >
          <div className="space-y-5 px-6 py-5">
            <section className="space-y-3">
              <SectionLabel>Contact</SectionLabel>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={UserRound}
                  label="First name"
                  value={user.firstName}
                  tone="brand"
                />
                <DetailItem
                  icon={UserRound}
                  label="Last name"
                  value={user.lastName}
                  tone="brand"
                />
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={user.email}
                  tone="violet"
                  className="sm:col-span-2"
                />
                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={user.phone ?? "No phone on file"}
                  tone="emerald"
                />
                <DetailItem
                  icon={BadgeCheck}
                  label="Email verification"
                  value={user.emailVerified ? "Verified" : "Not verified"}
                  tone={user.emailVerified ? "emerald" : "amber"}
                />
              </dl>
            </section>

            <section className="space-y-3">
              <SectionLabel>Account</SectionLabel>
              <dl className="flex flex-wrap gap-3">
                <DetailItem
                  icon={Clock3}
                  label="Last login"
                  value={formatDateTime(user.lastLoginAt)}
                  tone="amber"
                  nowrap
                />
                <DetailItem
                  icon={CalendarClock}
                  label="Joined"
                  value={formatDateTime(user.createdAt)}
                  tone="brand"
                  nowrap
                />
                <DetailItem
                  icon={History}
                  label="Last updated"
                  value={formatDateTime(user.updatedAt)}
                  tone="emerald"
                  nowrap
                />
              </dl>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => onEdit(user)}
          >
            <Pencil />
            {account.edit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
