import { useMemo } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/ui/searchable-select"
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

function attributeDescription(attribute: Attribute) {
  return `${ATTRIBUTE_TYPE_LABEL[attribute.type]} · ${ATTRIBUTE_ROLE_LABEL[attribute.role]}`
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
  const inheritedIds = useMemo(
    () => new Set(inherited.map((item) => item.attribute.id)),
    [inherited]
  )
  const selectedIds = useMemo(
    () => new Set(drafts.map((draft) => draft.attributeId)),
    [drafts]
  )
  const options = catalog
    .filter(
      (attribute) =>
        !inheritedIds.has(attribute.id) && !selectedIds.has(attribute.id)
    )
    .map((attribute) => ({
      value: attribute.id,
      label: attribute.name,
      description: attributeDescription(attribute),
    }))

  const add = (attributeId: string) => {
    const attribute = catalog.find((item) => item.id === attributeId)

    if (!attribute || selectedIds.has(attribute.id)) {
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

  const remove = (attributeId: string) => {
    onChange(drafts.filter((draft) => draft.attributeId !== attributeId))
  }

  return (
    <Field>
      <FieldLabel htmlFor="category-attribute-select">Attributes</FieldLabel>
      <FieldDescription>
        Search and select the attributes products in this category should fill
        in. Select and multi-select attributes need an option list here.
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

      {catalogError ? (
        <p className="text-sm text-destructive">Could not load attributes.</p>
      ) : (
        <SearchableSelect
          id="category-attribute-select"
          clearOnSelect
          disabled={disabled || catalogLoading}
          placeholder={
            catalogLoading ? "Loading attributes…" : "Select an attribute"
          }
          searchPlaceholder="Search attributes"
          emptyMessage={
            catalog.length === 0
              ? "No active attributes yet."
              : options.length === 0
                ? "Every active attribute is already included."
                : "No attributes match that search."
          }
          options={options}
          onValueChange={add}
        />
      )}

      {drafts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {drafts.map((draft) => {
            const attribute = attributesById.get(draft.attributeId)
            const choice = attribute ? isChoiceAttribute(attribute.type) : false
            const error = errors[draft.attributeId]
            const requiredId = `category-attribute-required-${draft.attributeId}`

            return (
              <Card key={draft.attributeId} size="sm">
                <CardHeader className="border-b">
                  <CardTitle>{attribute?.name ?? "Attribute"}</CardTitle>
                  <CardDescription>
                    {attribute
                      ? attributeDescription(attribute)
                      : "Catalog attribute"}
                  </CardDescription>
                  <CardAction>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer"
                      disabled={disabled}
                      aria-label={`Remove ${attribute?.name ?? "attribute"}`}
                      onClick={() => remove(draft.attributeId)}
                    >
                      <X />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <label
                    htmlFor={requiredId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      id={requiredId}
                      checked={draft.isRequired}
                      disabled={disabled}
                      onCheckedChange={(checked) =>
                        onChange(
                          updateDraft(drafts, draft.attributeId, (current) => ({
                            ...current,
                            isRequired: checked === true,
                          }))
                        )
                      }
                    />
                    Required on products
                  </label>

                  {choice ? (
                    <div className="flex flex-col gap-2">
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
                                          ? {
                                              ...item,
                                              label: event.target.value,
                                            }
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
                            updateDraft(
                              drafts,
                              draft.attributeId,
                              (current) => ({
                                ...current,
                                options: [
                                  ...current.options,
                                  { label: "", value: "" },
                                ],
                              })
                            )
                          )
                        }
                      >
                        <Plus />
                        Add option
                      </Button>
                    </div>
                  ) : null}

                  <FieldError>{error}</FieldError>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}
    </Field>
  )
}
