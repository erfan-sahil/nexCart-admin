import type { Attribute, AttributeType } from "@/features/attributes/types"

import type {
  CategoryAttributeAssignment,
  ReplaceCategoryAttributesPayload,
} from "./types"

export type CategoryAttributeDraftOption = {
  id?: string
  label: string
  value: string
}

export type CategoryAttributeDraft = {
  attributeId: string
  isRequired: boolean
  isFilterable: boolean
  sortOrder: number
  options: CategoryAttributeDraftOption[]
}

const optionValuePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isChoiceAttribute(type: AttributeType) {
  return type === "select" || type === "multiselect"
}

export function optionValueFromLabel(label: string) {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function toAttributeDraft(
  assignment: CategoryAttributeAssignment
): CategoryAttributeDraft {
  return {
    attributeId: assignment.attribute.id,
    isRequired: assignment.isRequired,
    isFilterable: assignment.isFilterable,
    sortOrder: assignment.sortOrder,
    options: assignment.options.map((option) => ({
      id: option.id,
      label: option.label,
      value: option.value,
    })),
  }
}

export function nextAttributeSortOrder(drafts: CategoryAttributeDraft[]) {
  return drafts.reduce((max, draft) => Math.max(max, draft.sortOrder), -1) + 1
}

export function attributeDraftSignature(drafts: CategoryAttributeDraft[]) {
  return JSON.stringify(
    [...drafts]
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder ||
          left.attributeId.localeCompare(right.attributeId)
      )
      .map((draft) => ({
        attributeId: draft.attributeId,
        isRequired: draft.isRequired,
        isFilterable: draft.isFilterable,
        sortOrder: draft.sortOrder,
        options: draft.options.map((option) => ({
          id: option.id ?? "",
          label: option.label.trim(),
        })),
      }))
  )
}

export function attributeDraftErrors(
  drafts: CategoryAttributeDraft[],
  attributes: Map<string, Pick<Attribute, "name" | "type">>
) {
  const errors: Record<string, string> = {}

  for (const draft of drafts) {
    const attribute = attributes.get(draft.attributeId)

    if (!attribute) {
      errors[draft.attributeId] = "This attribute is no longer available."
      continue
    }

    if (!isChoiceAttribute(attribute.type)) {
      continue
    }

    const labels = draft.options
      .map((option) => option.label.trim())
      .filter((label) => label.length > 0)

    if (labels.length === 0) {
      errors[draft.attributeId] = "Add at least one option."
      continue
    }

    const seen = new Set<string>()

    for (const label of labels) {
      const value = optionValueFromLabel(label)

      if (!optionValuePattern.test(value)) {
        errors[draft.attributeId] = `${label} needs letters or numbers.`
        break
      }

      if (seen.has(value)) {
        errors[draft.attributeId] = "Option names must be unique."
        break
      }

      seen.add(value)
    }
  }

  return errors
}

export function toReplaceAttributesPayload(
  drafts: CategoryAttributeDraft[],
  attributes: Map<string, Pick<Attribute, "type">>
): ReplaceCategoryAttributesPayload {
  return {
    attributes: [...drafts]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((draft) => {
        const type = attributes.get(draft.attributeId)?.type
        const choice = type ? isChoiceAttribute(type) : false
        const payload: ReplaceCategoryAttributesPayload["attributes"][number] =
          {
            attributeId: draft.attributeId,
            isRequired: draft.isRequired,
            isFilterable: draft.isFilterable,
            sortOrder: draft.sortOrder,
          }

        if (choice) {
          payload.options = draft.options.flatMap((option, index) => {
            const label = option.label.trim()

            if (!label) {
              return []
            }

            return [
              {
                ...(option.id ? { id: option.id } : {}),
                label,
                value: optionValueFromLabel(label),
                sortOrder: index,
                isActive: true as const,
              },
            ]
          })
        }

        return payload
      }),
  }
}
