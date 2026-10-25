export type ApiFieldError = {
  path: string
  message: string
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiMeta = {
  pagination?: PaginationMeta
}

export type ApiSuccess<T> = {
  success: true
  message: string
  data: T
  meta?: ApiMeta
  requestId: string
}

export type ApiErrorBody = {
  success: false
  message: string
  code: string
  requestId?: string
  errors?: ApiFieldError[]
}
