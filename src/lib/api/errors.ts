import axios from "axios"

import type { ApiErrorBody } from "./types"

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly fields: ApiErrorBody["errors"]

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = "ApiError"
    this.status = status
    this.code = body.code
    this.fields = body.errors
  }
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data

    if (body && body.success === false) {
      return new ApiError(error.response?.status ?? 0, body)
    }

    if (!error.response) {
      return new ApiError(0, {
        success: false,
        message: "Could not reach the server. Check that the API is running.",
        code: "NETWORK_ERROR",
      })
    }
  }

  return new ApiError(0, {
    success: false,
    message: "Something went wrong. Please try again.",
    code: "UNKNOWN",
  })
}
