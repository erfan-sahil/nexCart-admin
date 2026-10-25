import {
  BadgeCheck,
  CalendarClock,
  Clock3,
  History,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { UserStatus } from "@/features/auth/types"
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

const STATUS_BADGE: Record<UserStatus, string> = {
  active: "border-transparent bg-card text-brand-text",
  suspended: "border-transparent",
}

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
  className,
}: {
  icon: typeof Phone
  label: string
  value: string
  tone: DetailTone
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3",
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
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium break-words text-foreground">
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-sm ring-4 ring-background">
              {initials(user)}
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {name}
              </DialogTitle>
              <DialogDescription className="mt-1 truncate text-foreground/70">
                Buyer account
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={
                    user.status === "suspended" ? "destructive" : "secondary"
                  }
                  className={cn("capitalize", STATUS_BADGE[user.status])}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      user.status === "active" ? "bg-brand" : "bg-destructive"
                    )}
                  />
                  {user.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-brand/25 bg-white/70 text-brand-text dark:bg-white/10"
                >
                  Buyer
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 bg-muted/20 px-6 py-5">
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
            <dl className="grid gap-3 sm:grid-cols-3">
              <DetailItem
                icon={Clock3}
                label="Last login"
                value={formatDateTime(user.lastLoginAt)}
                tone="amber"
              />
              <DetailItem
                icon={CalendarClock}
                label="Joined"
                value={formatDateTime(user.createdAt)}
                tone="brand"
              />
              <DetailItem
                icon={History}
                label="Last updated"
                value={formatDateTime(user.updatedAt)}
                tone="emerald"
              />
            </dl>
          </section>
        </div>

        <DialogFooter className="border-t border-border bg-card px-6 py-4">
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
            Edit buyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
