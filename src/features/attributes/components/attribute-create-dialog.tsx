import { useState, type FormEvent } from "react"
import { SlidersHorizontal } from "lucide-react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

import { useCreateAttributeMutation } from "../hooks"
import { ATTRIBUTE_ROLE_LABEL, ATTRIBUTE_TYPE_LABEL } from "../labels"
import { createAttributeFormSchema, type AttributeFormValues } from "../schema"
import {
  ATTRIBUTE_ROLES,
  ATTRIBUTE_TYPES,
  VARIANT_ATTRIBUTE_TYPES,
  type AttributeRole,
  type AttributeType,
} from "../types"

type AttributeCreateDialogProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

type AttributeField = "name" | "slug" | "description" | "type" | "role" | "unit"

type FieldErrors = Partial<Record<AttributeField, string>>

const EMPTY_FORM: AttributeFormValues = {
  name: "",
  slug: "",
  description: "",
  type: "text",
  role: "spec",
  unit: "",
  isFilterable: true,
  isActive: true,
}

const ATTRIBUTE_FIELDS = new Set<AttributeField>([
  "name",
  "slug",
  "description",
  "type",
  "role",
  "unit",
])

function isAttributeField(value: string): value is AttributeField {
  return ATTRIBUTE_FIELDS.has(value as AttributeField)
}

function isVariantType(type: AttributeType) {
  return (VARIANT_ATTRIBUTE_TYPES as readonly string[]).includes(type)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isAttributeField(key) && !errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
}

function errorsFromApi(error: ApiError) {
  const fields: FieldErrors = {}
  let hasUnmapped = false

  for (const field of error.fields ?? []) {
    const key = field.path.split(".")[0] ?? ""

    if (isAttributeField(key) && !fields[key]) {
      fields[key] = field.message
    } else {
      hasUnmapped = true
    }
  }

  const message =
    Object.keys(fields).length > 0 &&
    !hasUnmapped &&
    error.message === "Validation failed"
      ? null
      : error.message

  return { fields, message }
}

function AttributeCreateForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const createAttribute = useCreateAttributeMutation()
  const [form, setForm] = useState<AttributeFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const setField =
    <K extends keyof AttributeFormValues>(key: K) =>
    (value: AttributeFormValues[K]) => {
      setForm((current) => ({ ...current, [key]: value }))
      if (isAttributeField(key)) {
        setErrors((current) => {
          if (!current[key]) {
            return current
          }

          const next = { ...current }
          delete next[key]
          return next
        })
      }
    }

  const changeType = (type: AttributeType) => {
    setForm((current) => ({
      ...current,
      type,
      unit: type === "number" ? current.unit : "",
      role:
        current.role === "variant" && !isVariantType(type)
          ? "spec"
          : current.role,
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next.type
      delete next.unit
      delete next.role
      return next
    })
  }

  const changeRole = (role: AttributeRole) => {
    setForm((current) => ({
      ...current,
      role,
      type:
        role === "variant" && !isVariantType(current.type)
          ? "text"
          : current.type,
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next.role
      delete next.type
      return next
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const parsed = createAttributeFormSchema.safeParse(form)

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      return
    }

    setErrors({})

    try {
      await createAttribute.mutateAsync(parsed.data)
      onCreated()
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next.fields)
        setFormError(next.message)
        return
      }

      setFormError("Could not create this attribute. Please try again.")
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !createAttribute.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <SlidersHorizontal className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold">
                New attribute
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                Shared fields used by product specs and variants.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-col"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <ScrollArea
            type="auto"
            className="max-h-[calc(100dvh-16rem)]"
            viewportClassName="max-h-[calc(100dvh-16rem)]"
          >
            <FieldGroup className="gap-4 px-6 py-5">
              {formError ? (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              ) : null}

              <Field data-invalid={Boolean(errors.name) || undefined}>
                <FieldLabel htmlFor="attribute-name">Name</FieldLabel>
                <Input
                  id="attribute-name"
                  className="h-9"
                  value={form.name}
                  onChange={(event) => setField("name")(event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  disabled={createAttribute.isPending}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.slug) || undefined}>
                <FieldLabel htmlFor="attribute-slug">Slug</FieldLabel>
                <Input
                  id="attribute-slug"
                  className="h-9"
                  value={form.slug}
                  onChange={(event) => setField("slug")(event.target.value)}
                  aria-invalid={Boolean(errors.slug)}
                  disabled={createAttribute.isPending}
                  placeholder="color"
                  spellCheck={false}
                />
                <FieldDescription>
                  Leave blank to generate one from the name.
                </FieldDescription>
                <FieldError>{errors.slug}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.description) || undefined}>
                <FieldLabel htmlFor="attribute-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="attribute-description"
                  value={form.description}
                  onChange={(event) =>
                    setField("description")(event.target.value)
                  }
                  aria-invalid={Boolean(errors.description)}
                  disabled={createAttribute.isPending}
                />
                <FieldError>{errors.description}</FieldError>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.type) || undefined}>
                  <FieldLabel htmlFor="attribute-type">Type</FieldLabel>
                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      changeType(value as AttributeType)
                    }
                    disabled={createAttribute.isPending}
                  >
                    <SelectTrigger
                      id="attribute-type"
                      className="h-9! w-full cursor-pointer"
                      aria-invalid={Boolean(errors.type)}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTRIBUTE_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          disabled={
                            form.role === "variant" && !isVariantType(type)
                          }
                        >
                          {ATTRIBUTE_TYPE_LABEL[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.type}</FieldError>
                </Field>

                <Field data-invalid={Boolean(errors.role) || undefined}>
                  <FieldLabel htmlFor="attribute-role">Role</FieldLabel>
                  <Select
                    value={form.role}
                    onValueChange={(value) =>
                      changeRole(value as AttributeRole)
                    }
                    disabled={createAttribute.isPending}
                  >
                    <SelectTrigger
                      id="attribute-role"
                      className="h-9! w-full cursor-pointer"
                      aria-invalid={Boolean(errors.role)}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTRIBUTE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ATTRIBUTE_ROLE_LABEL[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.role}</FieldError>
                </Field>
              </div>

              {form.role === "variant" ? (
                <p className="text-sm text-muted-foreground">
                  Variant attributes can be text, number, or a single select.
                </p>
              ) : null}

              {form.type === "number" ? (
                <Field data-invalid={Boolean(errors.unit) || undefined}>
                  <FieldLabel htmlFor="attribute-unit">Unit</FieldLabel>
                  <Input
                    id="attribute-unit"
                    className="h-9"
                    value={form.unit}
                    onChange={(event) => setField("unit")(event.target.value)}
                    aria-invalid={Boolean(errors.unit)}
                    disabled={createAttribute.isPending}
                    placeholder="kg"
                    maxLength={16}
                  />
                  <FieldDescription>
                    Optional. Shown beside numeric values.
                  </FieldDescription>
                  <FieldError>{errors.unit}</FieldError>
                </Field>
              ) : null}

              <div className="grid gap-3">
                <label className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={form.isFilterable}
                    onChange={(event) =>
                      setField("isFilterable")(event.target.checked)
                    }
                    disabled={createAttribute.isPending}
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Filterable
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Shoppers can filter products by this attribute.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={form.isActive}
                    onChange={(event) =>
                      setField("isActive")(event.target.checked)
                    }
                    disabled={createAttribute.isPending}
                  />
                  <span>
                    <span className="block text-sm font-medium">Active</span>
                    <span className="block text-sm text-muted-foreground">
                      Inactive attributes stay out of new product forms.
                    </span>
                  </span>
                </label>
              </div>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={createAttribute.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={createAttribute.isPending}
            >
              {createAttribute.isPending ? "Creating…" : "Create attribute"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AttributeCreateDialog({
  open,
  onClose,
  onCreated,
}: AttributeCreateDialogProps) {
  if (!open) {
    return null
  }

  return <AttributeCreateForm onClose={onClose} onCreated={onCreated} />
}
