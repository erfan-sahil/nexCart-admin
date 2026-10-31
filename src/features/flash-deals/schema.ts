import { z } from "zod"

import { fromLocalInputValue, toLocalInputValue } from "./datetime"
import type {
  CreateFlashDealCampaignPayload,
  CreateFlashDealItemPayload,
  FlashDealCampaign,
  FlashDealItem,
  UpdateFlashDealCampaignPayload,
  UpdateFlashDealItemPayload,
} from "./types"

const objectIdPattern = /^[a-f\d]{24}$/i

const campaignFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(80, "Name must be 80 characters or fewer."),
    startsAt: z.string().trim().min(1, "Start time is required."),
    endsAt: z.string().trim().min(1, "End time is required."),
  })
  .superRefine((value, ctx) => {
    const startsAt = new Date(value.startsAt)
    const endsAt = new Date(value.endsAt)

    if (Number.isNaN(startsAt.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Enter a valid start time.",
      })
    }

    if (Number.isNaN(endsAt.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Enter a valid end time.",
      })
    }

    if (
      !Number.isNaN(startsAt.getTime()) &&
      !Number.isNaN(endsAt.getTime()) &&
      endsAt <= startsAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End time must be after the start time.",
      })
    }
  })

export type CampaignFormValues = z.input<typeof campaignFormSchema>
export type ParsedCampaignForm = z.output<typeof campaignFormSchema>

export const EMPTY_CAMPAIGN_FORM: CampaignFormValues = {
  name: "",
  startsAt: "",
  endsAt: "",
}

export function toCampaignForm(
  campaign: FlashDealCampaign
): CampaignFormValues {
  return {
    name: campaign.name,
    startsAt: toLocalInputValue(campaign.startsAt),
    endsAt: toLocalInputValue(campaign.endsAt),
  }
}

export function parseCampaignForm(values: CampaignFormValues) {
  return campaignFormSchema.safeParse(values)
}

export function toCreateCampaignPayload(
  values: ParsedCampaignForm
): CreateFlashDealCampaignPayload {
  return {
    name: values.name.trim(),
    startsAt: fromLocalInputValue(values.startsAt),
    endsAt: fromLocalInputValue(values.endsAt),
  }
}

export function toUpdateCampaignPayload(
  campaign: FlashDealCampaign,
  values: ParsedCampaignForm
): UpdateFlashDealCampaignPayload {
  const payload: UpdateFlashDealCampaignPayload = {}
  const startsAt = fromLocalInputValue(values.startsAt)
  const endsAt = fromLocalInputValue(values.endsAt)
  const name = values.name.trim()

  if (name !== campaign.name) {
    payload.name = name
  }

  if (startsAt !== new Date(campaign.startsAt).toISOString()) {
    payload.startsAt = startsAt
  }

  if (endsAt !== new Date(campaign.endsAt).toISOString()) {
    payload.endsAt = endsAt
  }

  return payload
}

const itemFormSchema = z
  .object({
    productId: z
      .string()
      .trim()
      .refine((value) => objectIdPattern.test(value), "Choose a product."),
    productLabel: z.string(),
    discountType: z.enum(["percent", "amount"]),
    discountValue: z
      .string()
      .trim()
      .min(1, "Discount value is required.")
      .refine(
        (value) => /^\d+(\.\d{1,2})?$/.test(value),
        "Enter a valid discount value."
      )
      .refine((value) => Number(value) > 0, "Discount must be greater than 0."),
  })
  .superRefine((value, ctx) => {
    if (value.discountType === "percent" && Number(value.discountValue) > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percent discount cannot exceed 100.",
      })
    }
  })

export type ItemFormValues = z.input<typeof itemFormSchema>
export type ParsedItemForm = z.output<typeof itemFormSchema>

export const EMPTY_ITEM_FORM: ItemFormValues = {
  productId: "",
  productLabel: "",
  discountType: "percent",
  discountValue: "10",
}

export function toItemForm(item: FlashDealItem): ItemFormValues {
  return {
    productId: item.productId,
    productLabel: `${item.productName} · ${item.storeName}`,
    discountType: item.discountType,
    discountValue: String(item.discountValue),
  }
}

export function parseItemForm(values: ItemFormValues) {
  return itemFormSchema.safeParse(values)
}

export function toCreateItemPayload(
  values: ParsedItemForm
): CreateFlashDealItemPayload {
  return {
    productId: values.productId,
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
  }
}

export function toUpdateItemPayload(
  item: FlashDealItem,
  values: ParsedItemForm
): UpdateFlashDealItemPayload {
  const payload: UpdateFlashDealItemPayload = {}
  const discountValue = Number(values.discountValue)

  if (values.discountType !== item.discountType) {
    payload.discountType = values.discountType
  }

  if (discountValue !== item.discountValue) {
    payload.discountValue = discountValue
  }

  return payload
}
