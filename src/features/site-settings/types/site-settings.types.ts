export type SiteSettings = {
  deliveryFee: number
  freeDeliveryEnabled: boolean
  freeDeliveryMinAmount: number
  currency: string
}

export type UpdateSiteSettingsPayload = {
  deliveryFee: number
  freeDeliveryEnabled: boolean
  freeDeliveryMinAmount: number
}
