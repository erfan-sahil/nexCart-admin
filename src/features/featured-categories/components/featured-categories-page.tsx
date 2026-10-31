import { ArrowDown, ArrowUp, Loader2 } from "lucide-react"

import { UniversalBadge, badgeColors } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/lib/api/errors"

import {
  useFeaturedCategoriesQuery,
  useRootCategoriesQuery,
  useSetCategoryFeaturedMutation,
  useUpdateFeaturedOrderMutation,
} from "../services/featured-categories.query"

const MAX_FEATURED = 8

export function FeaturedCategoriesPageContent() {
  const featuredQuery = useFeaturedCategoriesQuery()
  const rootsQuery = useRootCategoriesQuery()
  const setFeatured = useSetCategoryFeaturedMutation()
  const reorder = useUpdateFeaturedOrderMutation()

  const featured = featuredQuery.data ?? []
  const roots = rootsQuery.data ?? []
  const featuredIds = new Set(featured.map((item) => item.id))
  const loading = featuredQuery.isLoading || rootsQuery.isLoading
  const error = featuredQuery.error ?? rootsQuery.error

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= featured.length) {
      return
    }

    const ids = featured.map((item) => item.id)
    ;[ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Featured categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose up to {MAX_FEATURED} root categories for the storefront
          homepage strip.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading categories…
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof ApiError
            ? error.message
            : "Could not load categories."}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Homepage order</h2>
              <UniversalBadge
                name={`${featured.length}/${MAX_FEATURED}`}
                colors={badgeColors.neutral}
              />
            </div>
            {featured.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No featured categories yet. Turn on a root category below.
              </p>
            ) : (
              <ul className="divide-y rounded-xl border bg-card">
                {featured.map((category, index) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{category.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        /{category.slug}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(index, -1)}
                        aria-label={`Move ${category.name} up`}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          index === featured.length - 1 || reorder.isPending
                        }
                        onClick={() => move(index, 1)}
                        aria-label={`Move ${category.name} down`}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium">Root categories</h2>
            <ul className="divide-y rounded-xl border bg-card">
              {roots.map((category) => {
                const isFeatured = featuredIds.has(category.id)
                const atCap = featured.length >= MAX_FEATURED && !isFeatured

                return (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{category.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        /{category.slug}
                      </p>
                    </div>
                    <Switch
                      checked={isFeatured}
                      disabled={
                        atCap || setFeatured.isPending || !category.isActive
                      }
                      onCheckedChange={(checked) =>
                        setFeatured.mutate({
                          id: category.id,
                          isFeatured: checked,
                        })
                      }
                      aria-label={`Feature ${category.name}`}
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
