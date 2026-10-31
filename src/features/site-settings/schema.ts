import { z } from "zod"

const amount = (label: string, max: number) =>
  z
    .number({ invalid_type_error: `Enter the ${label}.` })
    .finite(`Enter the ${label}.`)
    .min(0, `${label} cannot be negative.`)
    .max(max, `${label} is too large.`)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
      `${label} can have at most 2 decimal places.`
    )

export const siteSettingsSchema = z
  .object({
    deliveryFee: amount("delivery fee", 100_000),
    freeDeliveryEnabled: z.boolean(),
    freeDeliveryMinAmount: amount("free delivery amount", 10_000_000),
  })
  .superRefine((value, context) => {
    if (value.freeDeliveryEnabled && value.freeDeliveryMinAmount <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["freeDeliveryMinAmount"],
        message: "Enter the order amount that unlocks free delivery.",
      })
    }
  })

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>
