import { z } from "zod"

import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types"

const objectIdPattern = /^[a-f\d]{24}$/i
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  slug: z
    .string()
    .trim()
    .max(80, "Slug must be 80 characters or fewer.")
    .refine(
      (value) => value === "" || value.length >= 2,
      "Slug must be at least 2 characters."
    )
    .refine(
      (value) => value === "" || slugPattern.test(value),
      "Slug must be lowercase and URL-friendly."
    ),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer."),
  image: z
    .string()
    .trim()
    .max(2048, "Image URL must be 2048 characters or fewer.")
    .refine(
      (value) => value === "" || z.string().url().safeParse(value).success,
      "Image must be a valid URL."
    ),
  parentId: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || objectIdPattern.test(value),
      "Choose a valid parent category."
    ),
  sortOrder: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Sort order must be a whole number."
    )
    .refine((value) => {
      if (value === "") {
        return true
      }

      const order = Number(value)
      return order >= 0 && order <= 10_000
    }, "Sort order must be between 0 and 10000."),
  isActive: z.boolean(),
})

export type CategoryFormValues = z.input<typeof categoryFormSchema>
export type ParsedCategoryForm = z.output<typeof categoryFormSchema>

export function parseCategoryForm(
  values: CategoryFormValues,
  options?: { requireSlug?: boolean }
) {
  const schema = options?.requireSlug
    ? categoryFormSchema.superRefine((value, ctx) => {
        if (!value.slug) {
          ctx.addIssue({
            code: "custom",
            path: ["slug"],
            message: "Slug is required.",
          })
        }
      })
    : categoryFormSchema

  return schema.safeParse(values)
}

export function toCreatePayload(
  value: ParsedCategoryForm
): CreateCategoryPayload {
  const payload: CreateCategoryPayload = {
    name: value.name,
    isActive: value.isActive,
  }

  if (value.slug) {
    payload.slug = value.slug
  }

  if (value.description) {
    payload.description = value.description
  }

  if (value.image) {
    payload.image = value.image
  }

  if (value.parentId) {
    payload.parentId = value.parentId
  }

  if (value.sortOrder !== "") {
    payload.sortOrder = Number(value.sortOrder)
  }

  return payload
}

export function toUpdatePayload(
  current: Category,
  next: ParsedCategoryForm
): UpdateCategoryPayload {
  const payload: UpdateCategoryPayload = {}
  const parentId = next.parentId || null

  if (next.name !== current.name) {
    payload.name = next.name
  }

  if (next.slug !== current.slug) {
    payload.slug = next.slug
  }

  if (next.description !== current.description) {
    payload.description = next.description
  }

  if (next.image !== current.image) {
    payload.image = next.image
  }

  if (parentId !== current.parentId) {
    payload.parentId = parentId
  }

  if (next.isActive !== current.isActive) {
    payload.isActive = next.isActive
  }

  if (next.sortOrder !== "" && Number(next.sortOrder) !== current.sortOrder) {
    payload.sortOrder = Number(next.sortOrder)
  }

  return payload
}
