export const VENDOR_APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "more_info_required",
  "approved",
  "rejected",
] as const

export type VendorApplicationStatus =
  (typeof VENDOR_APPLICATION_STATUSES)[number]

export type VendorDocumentType = "nid" | "passport"

export type VendorBusinessType = "individual" | "company"

export type VendorApplicationSort =
  | "updatedAt"
  | "-updatedAt"
  | "submittedAt"
  | "-submittedAt"
  | "createdAt"
  | "-createdAt"

export type VendorAddress = {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type VendorApplicationSummary = {
  id: string
  userId: string
  status: VendorApplicationStatus
  fullName: string
  email: string
  phone: string
  storeName: string
  businessType: VendorBusinessType | null
  submittedAt: string | null
  updatedAt: string
}

export type VendorApplicationStatusEvent = {
  status: VendorApplicationStatus
  note: string
  actorId: string
  createdAt: string
}

export type VendorApplication = {
  id: string
  userId: string
  status: VendorApplicationStatus
  personal: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string | null
    address: VendorAddress
  }
  identity: {
    documentType: VendorDocumentType | null
    documentNumber: string
    documentImages: string[]
    selfieUrl: string
  }
  business: {
    storeName: string
    businessType: VendorBusinessType | null
    address: VendorAddress
    tradeLicense: {
      number: string
      documentUrl: string
    } | null
    tax: {
      taxId: string
      documentUrl: string
    } | null
  }
  selling: {
    categoryIds: string[]
    description: string
  }
  reviewNote: string
  submittedAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  statusHistory: VendorApplicationStatusEvent[]
  createdAt: string
  updatedAt: string
}

export type ListVendorApplicationsParams = {
  page?: number
  limit?: number
  status?: VendorApplicationStatus
  search?: string
  includeDrafts?: boolean
  sort?: VendorApplicationSort
}

export type ListVendorApplicationsResult = {
  items: VendorApplicationSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
