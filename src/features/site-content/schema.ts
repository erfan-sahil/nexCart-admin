import { z } from "zod"

import type { HeroInput } from "./types"

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
})

export type HeroFormValues = z.input<typeof heroFormSchema>

export const EMPTY_HERO_FORM: HeroFormValues = {
  eyebrow: "",
  title: "",
  description: "",
  image: "",
}

export function parseHeroForm(values: HeroFormValues) {
  return heroFormSchema.safeParse(values)
}

export function toHeroInput(
  values: z.output<typeof heroFormSchema>
): HeroInput {
  return {
    eyebrow: values.eyebrow,
    title: values.title,
    description: values.description,
    image: values.image,
  }
}
