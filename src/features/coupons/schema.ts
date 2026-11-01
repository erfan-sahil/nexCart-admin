import { z } from "zod"

import { fromLocalInputValue, toLocalInputValue } from "./datetime"
import type { Coupon, CreateCouponPayload, UpdateCouponPayload } from "./types"

const objectIdPattern = /^[a-f\d]{24}$/i

export const COUPON_FORM_FIELDS = [
  "code",
  "label",
  "discountType",
  "discountValue",
  "minimumSubtotal",
  "startsAt",
  "endsAt",
  "usageLimit",
  "perCustomerLimit",
  "isEnabled",
] as const

export type CouponFormValues = {
  code: string
  label: string
  discountType: "percent" | "amount"
  discountValue: string
  minimumSubtotal: string
  startsAt: string
  endsAt: string
  usageLimit: string
  perCustomerLimit: string
  isEnabled: boolean
}

export const EMPTY_COUPON_FORM: CouponFormValues = {
  code: "",
  label: "",
  discountType: "percent",
  discountValue: "",
  minimumSubtotal: "0",
  startsAt: "",
  endsAt: "",
  usageLimit: "",
  perCustomerLimit: "1",
  isEnabled: true,
}

const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required.")
      .max(32, "Code must be 32 characters or fewer."),
    label: z.string().trim().max(80, "Label must be 80 characters or fewer."),
    discountType: z.enum(["percent", "amount"]),
    discountValue: z
      .string()
      .trim()
      .min(1, "Discount value is required.")
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
        message: "Enter a positive number.",
      }),
    minimumSubtotal: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
        {
          message: "Enter zero or a positive number.",
        }
      ),
    startsAt: z.string().trim().min(1, "Start time is required."),
    endsAt: z.string().trim().min(1, "End time is required."),
    usageLimit: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" ||
          (!Number.isNaN(Number(value)) &&
            Number.isInteger(Number(value)) &&
            Number(value) >= 1),
        { message: "Leave blank for unlimited or enter a whole number ≥ 1." }
      ),
    perCustomerLimit: z
      .string()
      .trim()
      .min(1, "Per-customer limit is required.")
      .refine(
        (value) =>
          !Number.isNaN(Number(value)) &&
          Number.isInteger(Number(value)) &&
          Number(value) >= 1,
        { message: "Enter a whole number ≥ 1." }
      ),
    isEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const discountValue = Number(value.discountValue)

    if (value.discountType === "percent" && discountValue > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percent discount cannot exceed 100.",
      })
    }

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
        message: "End time must be after start time.",
      })
    }
  })

export function parseCouponForm(values: CouponFormValues) {
  return couponFormSchema.safeParse(values)
}

export function toCouponForm(coupon: Coupon): CouponFormValues {
  return {
    code: coupon.code,
    label: coupon.label,
    discountType: coupon.discountType,
    discountValue: String(coupon.discountValue),
    minimumSubtotal: String(coupon.minimumSubtotal),
    startsAt: toLocalInputValue(coupon.startsAt),
    endsAt: toLocalInputValue(coupon.endsAt),
    usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
    perCustomerLimit: String(coupon.perCustomerLimit),
    isEnabled: coupon.isEnabled,
  }
}

function toPayload(
  values: z.infer<typeof couponFormSchema>
): CreateCouponPayload {
  return {
    code: values.code.trim().toUpperCase(),
    label: values.label.trim(),
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    minimumSubtotal:
      values.minimumSubtotal.trim() === "" ? 0 : Number(values.minimumSubtotal),
    startsAt: fromLocalInputValue(values.startsAt),
    endsAt: fromLocalInputValue(values.endsAt),
    usageLimit:
      values.usageLimit.trim() === "" ? null : Number(values.usageLimit),
    perCustomerLimit: Number(values.perCustomerLimit),
    isEnabled: values.isEnabled,
  }
}

export function toCreateCouponPayload(values: CouponFormValues) {
  const parsed = parseCouponForm(values)

  if (!parsed.success) {
    return parsed
  }

  return { success: true as const, data: toPayload(parsed.data) }
}

export function toUpdateCouponPayload(values: CouponFormValues) {
  const parsed = parseCouponForm(values)

  if (!parsed.success) {
    return parsed
  }

  return {
    success: true as const,
    data: toPayload(parsed.data) as UpdateCouponPayload,
  }
}

export function isCouponFormField(
  value: string
): value is (typeof COUPON_FORM_FIELDS)[number] {
  return COUPON_FORM_FIELDS.some((field) => field === value)
}

export { objectIdPattern }
