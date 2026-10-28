import { useMemo, useState } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  ATTRIBUTE_ROLE_LABEL,
  ATTRIBUTE_TYPE_LABEL,
} from "@/features/attributes/labels"
import type { Attribute } from "@/features/attributes/types"

import {
  isChoiceAttribute,
  nextAttributeSortOrder,
  type CategoryAttributeDraft,
} from "../attribute-drafts"
import type { CategoryAttributeAssignment } from "../types"

type CategoryAttributesFieldProps = {
  catalog: Attribute[]
  attributesById: Map<string, Attribute>
  catalogLoading: boolean
  catalogError: boolean
  inherited: CategoryAttributeAssignment[]
  inheritedLoading: boolean
  drafts: CategoryAttributeDraft[]
  errors: Record<string, string>
  disabled?: boolean
  onChange: (drafts: CategoryAttributeDraft[]) => void
}

function updateDraft(
  drafts: CategoryAttributeDraft[],
  attributeId: string,
  patch: (draft: CategoryAttributeDraft) => CategoryAttributeDraft
) {
  return drafts.map((draft) =>
    draft.attributeId === attributeId ? patch(draft) : draft
  )
}

export function CategoryAttributesField({
  catalog,
  attributesById,
  catalogLoading,
  catalogError,
  inherited,
  inheritedLoading,
  drafts,
  errors,
  disabled = false,
  onChange,
}: CategoryAttributesFieldProps) {
  const [search, setSearch] = useState("")
  const inheritedIds = useMemo(
    () => new Set(inherited.map((item) => item.attribute.id)),
    [inherited]
  )
  const selectedIds = useMemo(
    () => new Set(drafts.map((draft) => draft.attributeId)),
    [drafts]
  )
  const query = search.trim().toLowerCase()
  const choices = catalog.filter((attribute) => {
    if (inheritedIds.has(attribute.id)) {
      return false
    }

    if (!query) {
      return true
    }

    return (
      attribute.name.toLowerCase().includes(query) ||
      attribute.slug.toLowerCase().includes(query)
    )
  })

  const toggle = (attribute: Attribute) => {
    if (selectedIds.has(attribute.id)) {
      onChange(drafts.filter((draft) => draft.attributeId !== attribute.id))
      return
    }

    onChange([
      ...drafts,
      {
        attributeId: attribute.id,
        isRequired: false,
        isFilterable: attribute.isFilterable,
        sortOrder: nextAttributeSortOrder(drafts),
        options: isChoiceAttribute(attribute.type)
          ? [{ label: "", value: "" }]
          : [],
      },
    ])
  }

  return (
    <Field>
      <FieldLabel htmlFor="category-attribute-search">Attributes</FieldLabel>
      <FieldDescription>
        Choose which catalog attributes products in this category use. Select
        and multi-select attributes need an option list here.
      </FieldDescription>

      {inheritedLoading ? (
        <p className="text-sm text-muted-foreground">
          Loading parent attributes…
        </p>
      ) : inherited.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Already included from the parent:{" "}
          {inherited.map((item) => item.attribute.name).join(", ")}.
        </p>
      ) : null}

      {drafts.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {drafts.map((draft) => {
            const attribute = attributesById.get(draft.attributeId)
            const choice = attribute ? isChoiceAttribute(attribute.type) : false
            const error = errors[draft.attributeId]

            return (
              <li
                key={draft.attributeId}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {attribute?.name ?? "Attribute"}
                    </p>
                    {attribute ? (
                      <p className="text-xs text-muted-foreground">
                        {ATTRIBUTE_TYPE_LABEL[attribute.type]} ·{" "}
                        {ATTRIBUTE_ROLE_LABEL[attribute.role]}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer"
                    disabled={disabled}
                    aria-label={`Remove ${attribute?.name ?? "attribute"}`}
                    onClick={() =>
                      onChange(
                        drafts.filter(
                          (item) => item.attributeId !== draft.attributeId
                        )
                      )
                    }
                  >
                    <X />
                  </Button>
                </div>

                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={draft.isRequired}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange(
                        updateDraft(drafts, draft.attributeId, (current) => ({
                          ...current,
                          isRequired: event.target.checked,
                        }))
                      )
                    }
                  />
                  Required on products
                </label>

                {choice ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Options
                    </p>
                    {draft.options.map((option, index) => (
                      <div key={option.id ?? index} className="flex gap-2">
                        <Input
                          className="h-9"
                          value={option.label}
                          disabled={disabled}
                          placeholder="Option name"
                          aria-label={`Option ${index + 1} for ${attribute?.name ?? "attribute"}`}
                          onChange={(event) =>
                            onChange(
                              updateDraft(
                                drafts,
                                draft.attributeId,
                                (current) => ({
                                  ...current,
                                  options: current.options.map(
                                    (item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, label: event.target.value }
                                        : item
                                  ),
                                })
                              )
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          disabled={disabled || draft.options.length === 1}
                          aria-label="Remove option"
                          onClick={() =>
                            onChange(
                              updateDraft(
                                drafts,
                                draft.attributeId,
                                (current) => ({
                                  ...current,
                                  options: current.options.filter(
                                    (_, itemIndex) => itemIndex !== index
                                  ),
                                })
                              )
                            )
                          }
                        >
                          <X />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit cursor-pointer"
                      disabled={disabled}
                      onClick={() =>
                        onChange(
                          updateDraft(drafts, draft.attributeId, (current) => ({
                            ...current,
                            options: [
                              ...current.options,
                              { label: "", value: "" },
                            ],
                          }))
                        )
                      }
                    >
                      <Plus />
                      Add option
                    </Button>
                  </div>
                ) : null}

                <FieldError>{error}</FieldError>
              </li>
            )
          })}
        </ul>
      ) : null}

      <Input
        id="category-attribute-search"
        className="h-9"
        value={search}
        disabled={disabled || catalogLoading}
        placeholder="Search attributes"
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="max-h-48 overflow-y-auto rounded-lg border border-input">
        {catalogLoading ? (
          <p className="px-3 py-2.5 text-sm text-muted-foreground">
            Loading attributes…
          </p>
        ) : catalogError ? (
          <p className="px-3 py-2.5 text-sm text-destructive">
            Could not load attributes.
          </p>
        ) : choices.length === 0 ? (
          <p className="px-3 py-2.5 text-sm text-muted-foreground">
            {catalog.length === 0
              ? "No active attributes yet. Create them under Catalog, then Attributes."
              : query
                ? "No attributes match that search."
                : "Every active attribute is already included from the parent."}
          </p>
        ) : (
          <ul>
            {choices.map((attribute) => {
              const selected = selectedIds.has(attribute.id)

              return (
                <li key={attribute.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 px-3 py-2 hover:bg-muted/60">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-primary"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => toggle(attribute)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {attribute.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {ATTRIBUTE_TYPE_LABEL[attribute.type]} ·{" "}
                        {ATTRIBUTE_ROLE_LABEL[attribute.role]}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Field>
  )
}
