import {
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Store,
  UserRound,
} from "lucide-react"

import { formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

import {
  BUSINESS_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
  STATUS_LABEL,
} from "../labels"
import type { VendorAddress, VendorApplication } from "../types"

type DetailTone = "brand" | "emerald" | "amber" | "violet"

const TONE_CLASS: Record<DetailTone, string> = {
  brand: "bg-brand/15 text-brand-text",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

const IMAGE_EXTENSION = /\.(avif|gif|jpe?g|png|webp)(\?|$)/i

function display(value: string) {
  const trimmed = value.trim()

  return trimmed || "—"
}

function formatAddress(address: VendorAddress) {
  const street = [address.line1, address.line2].filter(Boolean).join(", ")
  const locality = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ")
  const lines = [street, locality, address.country].filter(Boolean)

  return lines.length > 0 ? lines.join("\n") : "—"
}

function isImageUrl(url: string) {
  try {
    return IMAGE_EXTENSION.test(new URL(url).pathname)
  } catch {
    return IMAGE_EXTENSION.test(url)
  }
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-brand-text uppercase">
      {children}
    </h3>
  )
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
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium wrap-break-word whitespace-pre-line text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}

function FilePreview({ url, label }: { url: string; label: string }) {
  const image = isImageUrl(url)

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-card p-2 pr-3 transition-colors hover:bg-muted"
    >
      {image ? (
        <img
          src={url}
          alt=""
          className="size-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <FileText className="size-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          Open file
          <ExternalLink className="size-3" />
        </span>
      </span>
    </a>
  )
}

type VendorApplicationDetailsProps = {
  application: VendorApplication
  categoryNames: Map<string, string> | undefined
}

export function VendorApplicationDetails({
  application,
  categoryNames,
}: VendorApplicationDetailsProps) {
  const { personal, identity, business, selling } = application
  const history = [...application.statusHistory].reverse()

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <SectionLabel>Applicant</SectionLabel>
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            icon={UserRound}
            label="Full name"
            value={display(personal.fullName)}
            tone="brand"
          />
          <DetailItem
            icon={Calendar}
            label="Date of birth"
            value={formatDate(personal.dateOfBirth)}
            tone="amber"
          />
          <DetailItem
            icon={Mail}
            label="Email"
            value={display(personal.email)}
            tone="violet"
          />
          <DetailItem
            icon={Phone}
            label="Phone"
            value={display(personal.phone)}
            tone="emerald"
          />
          <DetailItem
            icon={MapPin}
            label="Home address"
            value={formatAddress(personal.address)}
            tone="brand"
            className="sm:col-span-2"
          />
        </dl>
      </section>

      <section className="space-y-3">
        <SectionLabel>Identity</SectionLabel>
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            icon={FileText}
            label="Document"
            value={
              identity.documentType
                ? DOCUMENT_TYPE_LABEL[identity.documentType]
                : "—"
            }
            tone="violet"
          />
          <DetailItem
            icon={FileText}
            label="Document number"
            value={display(identity.documentNumber)}
            tone="violet"
          />
        </dl>
        <div className="grid gap-3 sm:grid-cols-2">
          {identity.documentImages.map((url, index) => (
            <FilePreview
              key={url}
              url={url}
              label={`Identity document ${index + 1}`}
            />
          ))}
          {identity.selfieUrl ? (
            <FilePreview url={identity.selfieUrl} label="Selfie" />
          ) : null}
        </div>
        {identity.documentImages.length === 0 && !identity.selfieUrl ? (
          <p className="text-sm text-muted-foreground">No files uploaded.</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <SectionLabel>Business</SectionLabel>
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            icon={Store}
            label="Store name"
            value={display(business.storeName)}
            tone="brand"
          />
          <DetailItem
            icon={Building2}
            label="Business type"
            value={
              business.businessType
                ? BUSINESS_TYPE_LABEL[business.businessType]
                : "—"
            }
            tone="emerald"
          />
          <DetailItem
            icon={MapPin}
            label="Business address"
            value={formatAddress(business.address)}
            tone="amber"
            className="sm:col-span-2"
          />
          <DetailItem
            icon={FileText}
            label="Trade license"
            value={display(business.tradeLicense?.number ?? "")}
            tone="violet"
          />
          <DetailItem
            icon={FileText}
            label="Tax ID"
            value={display(business.tax?.taxId ?? "")}
            tone="violet"
          />
        </dl>
        <div className="grid gap-3 sm:grid-cols-2">
          {business.tradeLicense?.documentUrl ? (
            <FilePreview
              url={business.tradeLicense.documentUrl}
              label="Trade license"
            />
          ) : null}
          {business.tax?.documentUrl ? (
            <FilePreview url={business.tax.documentUrl} label="Tax document" />
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Selling</SectionLabel>
        <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            Categories
          </p>
          {selling.categoryIds.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {selling.categoryIds.map((id) => (
                <li
                  key={id}
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-text"
                >
                  {categoryNames?.get(id) ?? "Unknown category"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm font-medium">—</p>
          )}
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Description
          </p>
          <p className="mt-1 text-sm leading-6 wrap-break-word whitespace-pre-line text-foreground">
            {display(selling.description)}
          </p>
        </div>
      </section>

      {application.reviewNote ? (
        <section className="space-y-3">
          <SectionLabel>Latest note</SectionLabel>
          <p className="rounded-xl border border-border/80 bg-card px-3.5 py-3 text-sm leading-6 wrap-break-word whitespace-pre-line text-foreground">
            {application.reviewNote}
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionLabel>History</SectionLabel>
        <ol className="space-y-3">
          {history.map((event, index) => (
            <li
              key={`${event.createdAt}-${event.status}-${index}`}
              className="flex gap-3"
            >
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {STATUS_LABEL[event.status]}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    ·{" "}
                    {event.actorId === application.userId
                      ? "Applicant"
                      : "Admin"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </p>
                {event.note ? (
                  <p className="mt-1 text-sm wrap-break-word whitespace-pre-line text-foreground">
                    {event.note}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
