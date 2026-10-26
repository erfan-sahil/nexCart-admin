import type { AuthUser, UserRole, UserStatus } from "@/features/auth/types"
import type { PaginationMeta } from "@/lib/api/types"

export type AdminUser = AuthUser

export type UserSort =
  | "createdAt"
  | "-createdAt"
  | "name"
  | "-name"
  | "email"
  | "-email"
  | "lastLoginAt"
  | "-lastLoginAt"

export type ListUsersParams = {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
  search?: string
  sort?: UserSort
}

export type ListUsersResult = {
  items: AdminUser[]
  pagination: PaginationMeta
}

export type UpdateUserPayload = {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export type UsersPageRole = Extract<UserRole, "customer" | "vendor">

export type AccountStatusPayload = {
  status: UserStatus
}
