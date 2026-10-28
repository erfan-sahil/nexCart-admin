import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { HeroSection } from "../types"

const EMPTY_HERO: HeroSection = { slides: [] }

export async function getHero() {
  try {
    const { data } = await api.get<ApiSuccess<HeroSection>>("/hero")
    return data.data
  } catch (error) {
    const apiError = toApiError(error)

    if (apiError.status === 404) {
      return EMPTY_HERO
    }

    throw apiError
  }
}

export async function saveHero(input: HeroSection) {
  try {
    const { data } = await api.put<ApiSuccess<HeroSection>>("/hero", input)
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
