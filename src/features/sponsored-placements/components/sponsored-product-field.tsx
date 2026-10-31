import { useState } from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useProductsForModerationQuery } from "@/features/product-approvals/hooks"
import { useDebouncedValue } from "@/hooks"

type SponsoredProductFieldProps = {
  productId: string
  productLabel: string
  error?: string
  disabled?: boolean
  onChange: (next: { productId: string; productLabel: string }) => void
}

export function SponsoredProductField({
  productId,
  productLabel,
  error,
  disabled = false,
  onChange,
}: SponsoredProductFieldProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  const products = useProductsForModerationQuery({
    page: 1,
    limit: 20,
    approvalStatus: "approved",
    status: "active",
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  })

  const options = (products.data?.items ?? []).map((product) => ({
    value: product.id,
    label: product.name,
    description: product.store?.name
      ? `${product.store.name} · /${product.slug}`
      : `/${product.slug}`,
  }))

  if (
    productId &&
    productLabel &&
    !options.some((option) => option.value === productId)
  ) {
    options.unshift({
      value: productId,
      label: productLabel,
      description: "Selected product",
    })
  }

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor="sponsored-product">Product</FieldLabel>
      <SearchableSelect
        id="sponsored-product"
        value={productId || undefined}
        invalid={Boolean(error)}
        disabled={disabled}
        placeholder={
          products.isLoading
            ? "Loading products…"
            : "Search and select a product"
        }
        searchPlaceholder="Search approved products"
        emptyMessage={
          products.isError
            ? "Could not load products."
            : products.isFetching
              ? "Searching…"
              : "No approved products match that search."
        }
        options={options}
        onSearchChange={setSearch}
        onValueChange={(value) => {
          const selected = options.find((option) => option.value === value)
          onChange({
            productId: value,
            productLabel: selected?.label ?? value,
          })
        }}
      />
      <FieldDescription>
        Only approved, active, in-stock products from listed stores can be
        sponsored.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
