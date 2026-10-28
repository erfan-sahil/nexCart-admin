import { useMemo, useState, type FormEvent } from "react"
import { FolderTree } from "lucide-react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import { useAttributesQuery } from "@/features/attributes/hooks"
import type { Attribute } from "@/features/attributes/types"
import { ApiError } from "@/lib/api/errors"

import {
  attributeDraftErrors,
  attributeDraftSignature,
  toAttributeDraft,
  toReplaceAttributesPayload,
  type CategoryAttributeDraft,
} from "../attribute-drafts"
import {
  useCategoryAttributesQuery,
  useCategoryTreeQuery,
  useCreateCategoryMutation,
  useReplaceCategoryAttributesMutation,
  useUpdateCategoryMutation,
} from "../hooks"
import {
  CATEGORY_LEVEL_HINT,
  CATEGORY_LEVEL_LABEL,
  categoryLevelTitle,
} from "../labels"
import {
  parseCategoryForm,
  toCreatePayload,
  toUpdatePayload,
  type CategoryFormValues,
} from "../schema"
import { categoryHasChildren, parentChoices } from "../tree"
import { CategoryAttributesField } from "./category-attributes-field"
import { CategoryImageField } from "./category-image-field"
import type { Category, CategoryLevel } from "../types"

type CategoryCreateDialogProps = {
  open: boolean
  initialParent?: Category | null
  onClose: () => void
  onCreated: (parentId: string) => void
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

function zodFormMessage(error: ZodError) {
  const messages = [
    ...new Set(
      error.issues
        .map((issue) => issue.message)
        .filter((message) => message.length > 0)
    ),
  ]

  return messages.join("\n") || "Check the highlighted fields and try again."
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
  initialParent = null,
  onClose,
  onCreated,
}: {
  category: Category | null
  initialParent?: Category | null
  onClose: () => void
  onCreated?: (parentId: string) => void
}) {
  const createCategory = useCreateCategoryMutation()
  const updateCategory = useUpdateCategoryMutation()
  const replaceAttributes = useReplaceCategoryAttributesMutation()
  const tree = useCategoryTreeQuery()
  const catalog = useAttributesQuery({
    page: 1,
    limit: 100,
    isActive: true,
    sort: "name",
  })
  const savedAssignments = useCategoryAttributesQuery(category?.id)
  const [form, setForm] = useState<CategoryFormValues>(() =>
    category
      ? toForm(category)
      : { ...EMPTY_FORM, parentId: initialParent?.id ?? "" }
  )
  const parentAssignments = useCategoryAttributesQuery(
    category ? undefined : form.parentId || undefined
  )
  const [drafts, setDrafts] = useState<CategoryAttributeDraft[]>([])
  const [baseline, setBaseline] = useState<CategoryAttributeDraft[]>([])
  const [seedKey, setSeedKey] = useState<string | null>(null)
  const [savedCategoryId, setSavedCategoryId] = useState<string | null>(
    category?.id ?? null
  )
  const [showAttributeErrors, setShowAttributeErrors] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const saving =
    createCategory.isPending ||
    updateCategory.isPending ||
    replaceAttributes.isPending
  const busy = saving || uploadingImage
  const parents = useMemo(
    () => parentChoices(tree.data ?? [], category?.id),
    [category?.id, tree.data]
  )
  const hasChildren = category
    ? categoryHasChildren(tree.data ?? [], category.id)
    : false
  const selectedParent = parents.find((parent) => parent.id === form.parentId)
  const parentLevel =
    selectedParent?.level ??
    (form.parentId && form.parentId === initialParent?.id
      ? initialParent.level
      : null)
  const level = nextLevel(parentLevel)
  const parentLabel =
    selectedParent?.name ??
    (form.parentId === initialParent?.id ? initialParent?.name : undefined)
  const inherited = category
    ? (savedAssignments.data ?? []).filter((item) => item.inherited)
    : (parentAssignments.data ?? [])
  const inheritedKey = inherited
    .map((item) => item.attribute.id)
    .sort()
    .join(",")
  const assignmentKey =
    category && savedAssignments.data
      ? `${category.id}:${savedAssignments.data
          .map(
            (item) =>
              `${item.id}:${item.sortOrder}:${item.options
                .map((option) => option.id)
                .join(".")}`
          )
          .join(",")}`
      : null
  const knownAttributes = useMemo(() => {
    const attributes = new Map<string, Attribute>()

    for (const attribute of catalog.data?.items ?? []) {
      attributes.set(attribute.id, attribute)
    }

    for (const item of savedAssignments.data ?? []) {
      attributes.set(item.attribute.id, item.attribute)
    }

    for (const item of parentAssignments.data ?? []) {
      attributes.set(item.attribute.id, item.attribute)
    }

    return attributes
  }, [catalog.data?.items, parentAssignments.data, savedAssignments.data])
  const attributeErrors = useMemo(
    () => attributeDraftErrors(drafts, knownAttributes),
    [drafts, knownAttributes]
  )
  const attributesBlocked = Boolean(category) && savedAssignments.isError
  const assignmentsPending = Boolean(category) && savedAssignments.isPending
  const attributesDirty =
    attributeDraftSignature(drafts) !== attributeDraftSignature(baseline)

  if (assignmentKey && seedKey !== assignmentKey && savedAssignments.data) {
    const next = savedAssignments.data
      .filter((item) => !item.inherited)
      .map(toAttributeDraft)
    setSeedKey(assignmentKey)
    setDrafts(next)
    setBaseline(next)
  }

  if (!category && seedKey !== `parent:${inheritedKey}`) {
    const blocked = new Set(inherited.map((item) => item.attribute.id))
    setSeedKey(`parent:${inheritedKey}`)
    setDrafts((current) =>
      current.filter((draft) => !blocked.has(draft.attributeId))
    )
    setBaseline([])
  }

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

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    setFormError(null)

    let parsed: ReturnType<typeof parseCategoryForm>

    try {
      parsed = parseCategoryForm(form, { requireSlug: Boolean(category) })
    } catch (error) {
      setErrors({})
      setFormError(
        error instanceof Error
          ? error.message
          : "Check the highlighted fields and try again."
      )
      return
    }

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setFormError(zodFormMessage(parsed.error))
      return
    }

    setErrors({})

    if (!attributesBlocked && Object.keys(attributeErrors).length > 0) {
      setShowAttributeErrors(true)
      setFormError(
        [
          ...new Set(
            Object.values(attributeErrors).filter(
              (message) => message.length > 0
            )
          ),
        ].join("\n")
      )
      return
    }

    const shouldReplace =
      !attributesBlocked && (category ? attributesDirty : drafts.length > 0)

    try {
      let categoryId = savedCategoryId

      if (category) {
        const payload = toUpdatePayload(category, parsed.data)

        if (Object.keys(payload).length === 0 && !shouldReplace) {
          onClose()
          return
        }

        if (Object.keys(payload).length > 0) {
          await updateCategory.mutateAsync({ id: category.id, payload })
        }
      } else if (!categoryId) {
        const created = await createCategory.mutateAsync(
          toCreatePayload(parsed.data)
        )
        categoryId = created.id
        setSavedCategoryId(created.id)
        onCreated?.(parsed.data.parentId)
      }

      if (shouldReplace && categoryId) {
        await replaceAttributes.mutateAsync({
          id: categoryId,
          payload: toReplaceAttributesPayload(drafts, knownAttributes),
        })
      }

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
        if (!next && !busy) {
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
                {category
                  ? category.name
                  : level === 1
                    ? "New category"
                    : `New ${CATEGORY_LEVEL_LABEL[level].toLowerCase()}`}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {category
                  ? "Update this catalog category."
                  : parentLabel
                    ? `Add this under ${parentLabel}.`
                    : "Add a root category. You can nest two more levels under it."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          {formError ? (
            <p
              role="alert"
              className="px-6 pt-4 text-sm whitespace-pre-line text-destructive"
            >
              {formError}
            </p>
          ) : null}
          <ScrollArea
            type="auto"
            className="min-h-0 flex-1 overflow-hidden"
            viewportClassName="h-auto max-h-[min(32rem,calc(100dvh-16rem))]"
          >
            <FieldGroup className="gap-4 px-6 py-5">
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
                <SearchableSelect
                  id="category-parent"
                  value={form.parentId || ROOT_PARENT}
                  invalid={Boolean(errors.parentId)}
                  disabled={saving || tree.isLoading || hasChildren}
                  placeholder={
                    tree.isLoading
                      ? "Loading categories…"
                      : "None (root category)"
                  }
                  searchPlaceholder="Search categories"
                  emptyMessage="No categories match that search."
                  options={[
                    {
                      value: ROOT_PARENT,
                      label: tree.isLoading
                        ? "Loading categories…"
                        : "None (root category)",
                    },
                    ...(form.parentId &&
                    initialParent &&
                    form.parentId === initialParent.id &&
                    !parents.some((parent) => parent.id === initialParent.id)
                      ? [
                          {
                            value: initialParent.id,
                            label: `${categoryLevelTitle(initialParent.level)} · ${initialParent.name}`,
                          },
                        ]
                      : []),
                    ...parents.map((parent) => ({
                      value: parent.id,
                      label: parent.label,
                    })),
                  ]}
                  onValueChange={(value) =>
                    setField("parentId")(value === ROOT_PARENT ? "" : value)
                  }
                />
                <FieldDescription>
                  {hasChildren
                    ? "Move or delete child categories before changing the parent."
                    : category
                      ? `This category is ${categoryLevelTitle(level)}. ${CATEGORY_LEVEL_HINT[level]}.`
                      : `This will be ${categoryLevelTitle(level)}. ${CATEGORY_LEVEL_HINT[level]}.`}
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

              <CategoryImageField
                value={form.image}
                error={errors.image}
                disabled={saving}
                onChange={setField("image")}
                onPendingChange={setUploadingImage}
              />

              {category && savedAssignments.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Loading attributes…
                </p>
              ) : attributesBlocked ? (
                <p className="text-sm text-destructive">
                  Could not load this category&apos;s attributes. Other changes
                  can still be saved.
                </p>
              ) : (
                <CategoryAttributesField
                  catalog={catalog.data?.items ?? []}
                  attributesById={knownAttributes}
                  catalogLoading={catalog.isLoading}
                  catalogError={catalog.isError}
                  inherited={inherited}
                  inheritedLoading={
                    !category &&
                    Boolean(form.parentId) &&
                    parentAssignments.isLoading
                  }
                  drafts={drafts}
                  errors={showAttributeErrors ? attributeErrors : {}}
                  disabled={saving}
                  onChange={setDrafts}
                />
              )}

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

              <Field orientation="horizontal">
                <Checkbox
                  id="category-active"
                  checked={form.isActive}
                  disabled={saving}
                  onCheckedChange={(checked) =>
                    setField("isActive")(checked === true)
                  }
                />
                <FieldContent>
                  <FieldLabel htmlFor="category-active">Active</FieldLabel>
                  <FieldDescription>
                    Inactive categories stay out of the storefront.
                    {category
                      ? " Child categories are deactivated with this one."
                      : null}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="relative z-10 shrink-0 border-t border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="relative z-10 cursor-pointer"
              disabled={busy || assignmentsPending}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void submit()
              }}
            >
              {uploadingImage
                ? "Uploading…"
                : saving
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
  initialParent = null,
  onClose,
  onCreated,
}: CategoryCreateDialogProps) {
  if (!open) {
    return null
  }

  return (
    <CategoryForm
      key={initialParent?.id ?? "root"}
      category={null}
      initialParent={initialParent}
      onClose={onClose}
      onCreated={onCreated}
    />
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
