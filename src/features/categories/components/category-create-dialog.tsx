import { useMemo, useState, type FormEvent } from "react"
import { FolderTree } from "lucide-react"
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

import {
  useCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../hooks"
import { CATEGORY_LEVEL_LABEL } from "../labels"
import {
  parseCategoryForm,
  toCreatePayload,
  toUpdatePayload,
  type CategoryFormValues,
} from "../schema"
import { categoryHasChildren, parentChoices } from "../tree"
import type { Category, CategoryLevel } from "../types"

type CategoryCreateDialogProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

type CategoryField =
  "name" | "slug" | "description" | "image" | "parentId" | "sortOrder"

type FieldErrors = Partial<Record<CategoryField, string>>

function toForm(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId ?? "",
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  }
}

const EMPTY_FORM: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  parentId: "",
  sortOrder: "0",
  isActive: true,
}

const ROOT_PARENT = "root"

const CATEGORY_FIELDS = new Set<CategoryField>([
  "name",
  "slug",
  "description",
  "image",
  "parentId",
  "sortOrder",
])

function isCategoryField(value: string): value is CategoryField {
  return CATEGORY_FIELDS.has(value as CategoryField)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isCategoryField(key) && !errors[key]) {
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

    if (isCategoryField(key) && !fields[key]) {
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

function nextLevel(parentLevel: CategoryLevel | null): CategoryLevel {
  if (parentLevel === 1) {
    return 2
  }

  if (parentLevel === 2) {
    return 3
  }

  return 1
}

function CategoryForm({
  category,
  onClose,
  onCreated,
}: {
  category: Category | null
  onClose: () => void
  onCreated?: () => void
}) {
  const createCategory = useCreateCategoryMutation()
  const updateCategory = useUpdateCategoryMutation()
  const tree = useCategoryTreeQuery()
  const saving = createCategory.isPending || updateCategory.isPending
  const [form, setForm] = useState<CategoryFormValues>(() =>
    category ? toForm(category) : EMPTY_FORM
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const parents = useMemo(
    () => parentChoices(tree.data ?? [], category?.id),
    [category?.id, tree.data]
  )
  const hasChildren = category
    ? categoryHasChildren(tree.data ?? [], category.id)
    : false
  const selectedParent = parents.find((parent) => parent.id === form.parentId)
  const level = nextLevel(selectedParent?.level ?? null)

  const setField =
    <K extends keyof CategoryFormValues>(key: K) =>
    (value: CategoryFormValues[K]) => {
      setForm((current) => ({ ...current, [key]: value }))
      if (isCategoryField(key)) {
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

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const parsed = parseCategoryForm(form, { requireSlug: Boolean(category) })

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      return
    }

    setErrors({})

    try {
      if (category) {
        const payload = toUpdatePayload(category, parsed.data)

        if (Object.keys(payload).length === 0) {
          onClose()
          return
        }

        await updateCategory.mutateAsync({ id: category.id, payload })
        onClose()
        return
      }

      await createCategory.mutateAsync(toCreatePayload(parsed.data))
      onCreated?.()
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error)
        setErrors(next.fields)
        setFormError(next.message)
        return
      }

      setFormError(
        category
          ? "Could not update this category. Please try again."
          : "Could not create this category. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !saving) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <FolderTree className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {category ? category.name : "New category"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {category
                  ? "Update this catalog category."
                  : "Add a root, subcategory, or sub-subcategory to the catalog."}
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
                <FieldLabel htmlFor="category-name">Name</FieldLabel>
                <Input
                  id="category-name"
                  className="h-9"
                  value={form.name}
                  onChange={(event) => setField("name")(event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  disabled={saving}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.slug) || undefined}>
                <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
                <Input
                  id="category-slug"
                  className="h-9"
                  value={form.slug}
                  onChange={(event) => setField("slug")(event.target.value)}
                  aria-invalid={Boolean(errors.slug)}
                  disabled={saving}
                  placeholder="home-appliances"
                  spellCheck={false}
                />
                <FieldDescription>
                  {category
                    ? "Lowercase and URL-friendly."
                    : "Leave blank to generate one from the name."}
                </FieldDescription>
                <FieldError>{errors.slug}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.parentId) || undefined}>
                <FieldLabel htmlFor="category-parent">Parent</FieldLabel>
                <Select
                  value={form.parentId || ROOT_PARENT}
                  onValueChange={(value) =>
                    setField("parentId")(value === ROOT_PARENT ? "" : value)
                  }
                  disabled={saving || tree.isLoading || hasChildren}
                >
                  <SelectTrigger
                    id="category-parent"
                    className="h-9! w-full cursor-pointer"
                    aria-invalid={Boolean(errors.parentId)}
                  >
                    <SelectValue
                      placeholder={
                        tree.isLoading ? "Loading categories…" : "Root category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    collisionPadding={16}
                    className="pointer-events-auto z-[70] w-(--radix-select-trigger-width)"
                  >
                    <SelectItem value={ROOT_PARENT} className="cursor-pointer">
                      None (root category)
                    </SelectItem>
                    {parents.map((parent) => (
                      <SelectItem
                        key={parent.id}
                        value={parent.id}
                        className="cursor-pointer"
                      >
                        {parent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {hasChildren
                    ? "Move or delete child categories before changing the parent."
                    : category
                      ? `This category is a ${CATEGORY_LEVEL_LABEL[level].toLowerCase()}.`
                      : `This will be a ${CATEGORY_LEVEL_LABEL[level].toLowerCase()}.`}
                  {!category && tree.isError
                    ? " Parent categories could not be loaded, so only a root category can be created."
                    : null}
                </FieldDescription>
                <FieldError>{errors.parentId}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.description) || undefined}>
                <FieldLabel htmlFor="category-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="category-description"
                  value={form.description}
                  onChange={(event) =>
                    setField("description")(event.target.value)
                  }
                  aria-invalid={Boolean(errors.description)}
                  disabled={saving}
                />
                <FieldError>{errors.description}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.image) || undefined}>
                <FieldLabel htmlFor="category-image">Image URL</FieldLabel>
                <Input
                  id="category-image"
                  className="h-9"
                  value={form.image}
                  onChange={(event) => setField("image")(event.target.value)}
                  aria-invalid={Boolean(errors.image)}
                  disabled={saving}
                  placeholder="https://"
                  spellCheck={false}
                />
                <FieldError>{errors.image}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.sortOrder) || undefined}>
                <FieldLabel htmlFor="category-sort-order">
                  Sort order
                </FieldLabel>
                <Input
                  id="category-sort-order"
                  className="h-9"
                  inputMode="numeric"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setField("sortOrder")(event.target.value)
                  }
                  aria-invalid={Boolean(errors.sortOrder)}
                  disabled={saving}
                />
                <FieldDescription>
                  Lower numbers appear first. Use 0 to 10000.
                </FieldDescription>
                <FieldError>{errors.sortOrder}</FieldError>
              </Field>

              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  checked={form.isActive}
                  onChange={(event) =>
                    setField("isActive")(event.target.checked)
                  }
                  disabled={saving}
                />
                <span>
                  <span className="block text-sm font-medium">Active</span>
                  <span className="block text-sm text-muted-foreground">
                    Inactive categories stay out of the storefront.
                    {category
                      ? " Child categories are deactivated with this one."
                      : null}
                  </span>
                </span>
              </label>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={saving}>
              {saving
                ? category
                  ? "Saving…"
                  : "Creating…"
                : category
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CategoryCreateDialog({
  open,
  onClose,
  onCreated,
}: CategoryCreateDialogProps) {
  if (!open) {
    return null
  }

  return (
    <CategoryForm category={null} onClose={onClose} onCreated={onCreated} />
  )
}

type CategoryEditDialogProps = {
  category: Category | null
  open: boolean
  onClose: () => void
}

export function CategoryEditDialog({
  category,
  open,
  onClose,
}: CategoryEditDialogProps) {
  if (!open || !category) {
    return null
  }

  return (
    <CategoryForm key={category.id} category={category} onClose={onClose} />
  )
}
