import { z } from "zod"

import {
  SPONSORED_SECTIONS,
  type SponsoredPlacement,
  type SponsoredSection,
  type UpsertSponsoredPayload,
} from "./services/sponsored-placements.api"

const objectIdPattern = /^[a-f\d]{24}$/i

const sponsoredFormSchema = z.object({
  section: z.enum(SPONSORED_SECTIONS),
  productId: z
    .string()
    .trim()
    .min(1, "Choose a product.")
    .regex(objectIdPattern, "Choose a valid product."),
  productName: z.string(),
  title: z.string().trim().max(120, "Title must be 120 characters or fewer."),
  subtitle: z
    .string()
    .trim()
    .max(240, "Subtitle must be 240 characters or fewer."),
  ctaLabel: z
    .string()
    .trim()
    .max(40, "CTA label must be 40 characters or fewer."),
  isActive: z.boolean(),
})

export type SponsoredFormValues = z.input<typeof sponsoredFormSchema>
export type ParsedSponsoredForm = z.output<typeof sponsoredFormSchema>

export const EMPTY_SPONSORED_FORM: SponsoredFormValues = {
  section: "top-selling",
  productId: "",
  productName: "",
  title: "",
  subtitle: "",
  ctaLabel: "",
  isActive: true,
}

export function toSponsoredForm(
  placement: SponsoredPlacement
): SponsoredFormValues {
  return {
    section: (placement.section ?? "top-selling") as SponsoredSection,
    productId: placement.productId ?? "",
    productName: placement.productName ?? "",
    title: placement.title ?? "",
    subtitle: placement.subtitle ?? "",
    ctaLabel: placement.ctaLabel ?? "",
    isActive: placement.isActive,
  }
}

export function parseSponsoredForm(values: SponsoredFormValues) {
  return sponsoredFormSchema.safeParse(values)
}

export function toUpsertPayload(
  values: ParsedSponsoredForm
): UpsertSponsoredPayload {
  return {
    productId: values.productId,
    section: values.section,
    title: values.title || undefined,
    subtitle: values.subtitle || undefined,
    ctaLabel: values.ctaLabel || undefined,
    isActive: values.isActive,
  }
}
