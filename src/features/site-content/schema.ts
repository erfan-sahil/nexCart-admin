import { z } from "zod"

import type { HeroSlide } from "./types"

export const HERO_SLIDE_LIMIT = 8
export const HERO_ACTIVE_LIMIT = 3

const heroFormSchema = z.object({
  eyebrow: z
    .string()
    .trim()
    .min(1, "Eyebrow is required.")
    .max(60, "Eyebrow must be 60 characters or fewer."),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(140, "Title must be 140 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(400, "Description must be 400 characters or fewer."),
  image: z
    .string()
    .trim()
    .min(1, "Upload the hero image before saving.")
    .max(2048, "Image URL must be 2048 characters or fewer.")
    .refine(
      (value) => z.string().url().safeParse(value).success,
      "Image must be a valid URL."
    ),
  isActive: z.boolean(),
})

export type HeroFormValues = z.input<typeof heroFormSchema>

export const EMPTY_HERO_FORM: HeroFormValues = {
  eyebrow: "",
  title: "",
  description: "",
  image: "",
  isActive: true,
}

export function parseHeroForm(values: HeroFormValues) {
  return heroFormSchema.safeParse(values)
}

export function toHeroSlide(
  values: z.output<typeof heroFormSchema>
): HeroSlide {
  return {
    eyebrow: values.eyebrow,
    title: values.title,
    description: values.description,
    image: values.image,
    isActive: values.isActive,
  }
}
