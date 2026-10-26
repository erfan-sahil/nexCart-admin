import { z } from "zod"

import {
  ATTRIBUTE_ROLES,
  ATTRIBUTE_TYPES,
  VARIANT_ATTRIBUTE_TYPES,
  type Attribute,
  type CreateAttributePayload,
  type UpdateAttributePayload,
} from "./types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const attributeFormSchema = z
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

export type AttributeFormValues = z.input<typeof attributeFormSchema>
export type ParsedAttributeForm = z.output<typeof attributeFormSchema>

export function parseAttributeForm(
  values: AttributeFormValues,
  options?: { requireSlug?: boolean }
) {
  const schema = options?.requireSlug
    ? attributeFormSchema.superRefine((value, ctx) => {
        if (!value.slug) {
          ctx.addIssue({
            code: "custom",
            path: ["slug"],
            message: "Slug is required.",
          })
        }
      })
    : attributeFormSchema

  return schema.safeParse(values)
}

export function toCreatePayload(
  value: ParsedAttributeForm
): CreateAttributePayload {
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
}

export function toUpdatePayload(
  current: Attribute,
  next: ParsedAttributeForm
): UpdateAttributePayload {
  const payload: UpdateAttributePayload = {}

  if (next.name !== current.name) {
    payload.name = next.name
  }

  if (next.slug !== current.slug) {
    payload.slug = next.slug
  }

  if (next.description !== current.description) {
    payload.description = next.description
  }

  if (next.type !== current.type) {
    payload.type = next.type
  }

  if (next.role !== current.role) {
    payload.role = next.role
  }

  if (next.type === "number" && next.unit !== current.unit) {
    payload.unit = next.unit
  }

  if (next.isFilterable !== current.isFilterable) {
    payload.isFilterable = next.isFilterable
  }

  if (next.isActive !== current.isActive) {
    payload.isActive = next.isActive
  }

  return payload
}
