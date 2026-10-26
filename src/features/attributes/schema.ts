import { z } from "zod"

import {
  ATTRIBUTE_ROLES,
  ATTRIBUTE_TYPES,
  VARIANT_ATTRIBUTE_TYPES,
  type CreateAttributePayload,
} from "./types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createAttributeFormSchema = z
  .object({
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
      .max(500, "Description must be 500 characters or fewer."),
    type: z.enum(ATTRIBUTE_TYPES),
    role: z.enum(ATTRIBUTE_ROLES),
    unit: z.string().trim().max(16, "Unit must be 16 characters or fewer."),
    isFilterable: z.boolean(),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const variantTypes: readonly string[] = VARIANT_ATTRIBUTE_TYPES

    if (value.role === "variant" && !variantTypes.includes(value.type)) {
      ctx.addIssue({
        code: "custom",
        path: ["type"],
        message:
          "A variant attribute must be text, number, or a single select.",
      })
    }

    if (value.unit && value.type !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Only number attributes can have a unit.",
      })
    }
  })
  .transform((value): CreateAttributePayload => {
    const payload: CreateAttributePayload = {
      name: value.name,
      type: value.type,
      role: value.role,
      isFilterable: value.isFilterable,
      isActive: value.isActive,
    }

    if (value.slug) {
      payload.slug = value.slug
    }

    if (value.description) {
      payload.description = value.description
    }

    if (value.type === "number" && value.unit) {
      payload.unit = value.unit
    }

    return payload
  })

export type AttributeFormValues = z.input<typeof createAttributeFormSchema>
