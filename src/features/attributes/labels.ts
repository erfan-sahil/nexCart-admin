import type { AttributeRole, AttributeType } from "./types"

export const ATTRIBUTE_TYPE_LABEL: Record<AttributeType, string> = {
  text: "Text",
  number: "Number",
  boolean: "Yes / no",
  select: "Single select",
  multiselect: "Multi select",
}

export const ATTRIBUTE_ROLE_LABEL: Record<AttributeRole, string> = {
  spec: "Specification",
  variant: "Variant",
}
