import type { ProductAttribute, ProductOffer } from "../types"

const priceFormat = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
})

export function formatPrice(value: number) {
  return priceFormat.format(value)
}

export function formatPriceRange(offer: ProductOffer) {
  const { minPrice, maxPrice } = offer

  if (minPrice === null || maxPrice === null) {
    return "No price"
  }

  if (minPrice === maxPrice) {
    return priceFormat.format(minPrice)
  }

  return `${priceFormat.format(minPrice)} – ${priceFormat.format(maxPrice)}`
}

export function formatVariantCount(count: number) {
  return count === 1 ? "1 variant" : `${count} variants`
}

export function attributeLabel(attribute: ProductAttribute) {
  return attribute.unit && attribute.type !== "number"
    ? `${attribute.name} (${attribute.unit})`
    : attribute.name || "Attribute"
}

export function attributeValue(attribute: ProductAttribute) {
  if (attribute.type === "text") {
    return attribute.text || "—"
  }

  if (attribute.type === "number") {
    if (attribute.number === null) {
      return "—"
    }

    return attribute.unit
      ? `${attribute.number} ${attribute.unit}`
      : String(attribute.number)
  }

  if (attribute.type === "boolean") {
    if (attribute.boolean === null) {
      return "—"
    }

    return attribute.boolean ? "Yes" : "No"
  }

  const labels = attribute.options
    .map((option) => option.label)
    .filter((label) => label.length > 0)

  return labels.length > 0 ? labels.join(", ") : "—"
}
