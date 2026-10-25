export type UserRole = "customer" | "vendor" | "admin"

export type UserStatus = "active" | "suspended"

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  avatarUrl: string
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type AuthSession = {
  user: AuthUser
  sessionId: string
  accessToken: string
  tokenType: "Bearer"
  expiresIn: number
}

export type LoginPayload = {
  email: string
  password: string
}
