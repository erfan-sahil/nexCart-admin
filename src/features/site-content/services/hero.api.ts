import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { Hero, HeroInput } from "../types"

export async function getHero() {
  try {
    const { data } = await api.get<ApiSuccess<Hero>>("/hero")
    return data.data
  } catch (error) {
    const apiError = toApiError(error)

    if (apiError.status === 404) {
      return null
    }

    throw apiError
  }
}

export async function saveHero(input: HeroInput) {
  try {
    const { data } = await api.put<ApiSuccess<Hero>>("/hero", input)
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function uploadHeroImage(file: File) {
  const body = new FormData()
  body.append("image", file, file.name)

  try {
    const { data } = await api.post<ApiSuccess<{ url: string }>>(
      "/hero/image",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (payload, headers) => {
          if (
            headers &&
            typeof headers === "object" &&
            "delete" in headers &&
            typeof headers.delete === "function"
          ) {
            headers.delete("Content-Type")
          }

          return payload
        },
      }
    )

    return data.data.url
  } catch (error) {
    throw toApiError(error)
  }
}
