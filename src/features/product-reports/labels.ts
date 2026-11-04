import { badgeColors } from "@/components/shared"

import type {
  ProductReportStatus,
  ProductReportType,
  StatusFilter,
} from "./types"

export const PRODUCT_REPORT_TYPE_LABEL: Record<ProductReportType, string> = {
  misleading_listing: "Misleading listing",
  counterfeit: "Counterfeit",
  prohibited: "Prohibited item",
  inappropriate_content: "Inappropriate content",
  pricing: "Pricing issue",
  safety: "Safety concern",
  spam: "Spam or scam",
  other: "Other",
}

export const PRODUCT_REPORT_STATUS_LABEL: Record<ProductReportStatus, string> =
  {
    open: "Open",
    reviewed: "Reviewed",
    dismissed: "Dismissed",
  }

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: "All statuses",
  open: "Open",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
}

export const PRODUCT_REPORT_STATUS_BADGE = {
  open: badgeColors.under_review,
  reviewed: badgeColors.approved,
  dismissed: badgeColors.neutral,
} as const
