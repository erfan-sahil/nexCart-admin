import { useRef, useState, type DragEvent } from "react"
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { badgeColors, UniversalBadge } from "@/components/shared"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/lib/api/errors"

import { useHeroQuery, useSaveHeroMutation } from "../hooks"
import { HERO_ACTIVE_LIMIT, HERO_SLIDE_LIMIT } from "../schema"
import type { HeroSlide } from "../types"
import { HeroFormDialog } from "./hero-form-dialog"

type EditorState = { mode: "create" } | { mode: "edit"; index: number } | null

function placeSlide(slides: HeroSlide[], from: number, to: number) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= slides.length ||
    to >= slides.length
  ) {
    return slides
  }

  const next = [...slides]
  const [moved] = next.splice(from, 1)

  if (!moved) {
    return slides
  }

  next.splice(to, 0, moved)
  return next
}

function HeroPositionControl({
  index,
  total,
  disabled,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  index: number
  total: number
  disabled: boolean
  onMove: (direction: -1 | 1) => void
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void
  onDragEnd: () => void
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        draggable={!disabled}
        disabled={disabled}
        aria-label={`Drag hero ${index + 1} to a new position`}
        className="flex cursor-grab items-center border-r border-border px-1 text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="flex w-7 flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 cursor-pointer rounded-none"
          aria-label={`Move hero ${index + 1} up`}
          disabled={disabled || index === 0}
          onClick={() => onMove(-1)}
        >
          <ChevronUp />
        </Button>
        <span className="flex h-5 items-center justify-center border-y border-border text-[10px] font-medium text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 cursor-pointer rounded-none"
          aria-label={`Move hero ${index + 1} down`}
          disabled={disabled || index === total - 1}
          onClick={() => onMove(1)}
        >
          <ChevronDown />
        </Button>
      </div>
    </div>
  )
}

export function HeroSectionPage() {
  const hero = useHeroQuery()
  const saveHero = useSaveHeroMutation()
  const [editor, setEditor] = useState<EditorState>(null)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const dragIndex = useRef<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const slides = hero.data?.slides ?? []
  const atLimit = slides.length >= HERO_SLIDE_LIMIT

  const persist = async (next: HeroSlide[]) => {
    setListError(null)
    await saveHero.mutateAsync({ slides: next })
  }

  const saveSlide = async (slide: HeroSlide) => {
    if (!editor) {
      return
    }

    const next =
      editor.mode === "edit"
        ? slides.map((item, index) => (index === editor.index ? slide : item))
        : [...slides, slide]

    await persist(next)
    setEditor(null)
  }

  const reportListError = (error: unknown, fallback: string) => {
    setListError(error instanceof ApiError ? error.message : fallback)
  }

  const reorder = async (from: number, to: number) => {
    const next = placeSlide(slides, from, to)

    if (next === slides) {
      return
    }

    try {
      await persist(next)
    } catch (error) {
      reportListError(error, "Could not reorder heroes. Please try again.")
    }
  }

  const setActive = async (index: number, isActive: boolean) => {
    const slide = slides[index]

    if (!slide || slide.isActive === isActive) {
      return
    }

    const activeCount = slides.filter((item) => item.isActive).length

    if (isActive && activeCount >= HERO_ACTIVE_LIMIT) {
      return
    }

    try {
      await persist(
        slides.map((item, itemIndex) =>
          itemIndex === index ? { ...item, isActive } : item
        )
      )
    } catch (error) {
      reportListError(error, "Could not update this hero. Please try again.")
    }
  }

  const markDrop = (index: number | null) => {
    const items = listRef.current?.children

    if (!items) {
      return
    }

    Array.from(items).forEach((item, itemIndex) => {
      if (itemIndex === index) {
        item.setAttribute("data-drop", "")
      } else {
        item.removeAttribute("data-drop")
      }
    })
  }

  const startDrag =
    (index: number) => (event: DragEvent<HTMLButtonElement>) => {
      dragIndex.current = index
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("text/plain", String(index))
    }

  const endDrag = () => {
    dragIndex.current = null
    markDrop(null)
  }

  const dragOver = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault()
    const from = dragIndex.current
    markDrop(from === null || from === index ? null : index)
  }

  const dropOn = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault()
    const from = dragIndex.current
    endDrag()

    if (from === null) {
      return
    }

    void reorder(from, index)
  }

  const remove = async () => {
    if (deletingIndex === null) {
      return
    }

    try {
      await persist(slides.filter((_, index) => index !== deletingIndex))
      setDeletingIndex(null)
    } catch (error) {
      reportListError(error, "Could not delete this hero. Please try again.")
    }
  }

  if (hero.isPending) {
    return (
      <section className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading heroes…
      </section>
    )
  }

  if (hero.isError) {
    const message =
      hero.error instanceof ApiError
        ? hero.error.message
        : "Could not load heroes."

    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 rounded-xl border border-border bg-card px-4 py-16 text-center">
        <p className="text-sm text-destructive">{message}</p>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => void hero.refetch()}
        >
          Try again
        </Button>
      </section>
    )
  }

  const deleting = deletingIndex === null ? null : slides[deletingIndex]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      {listError ? (
        <p className="text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-medium">Heroes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {slides.length === 0
                ? `No heroes yet. ${HERO_ACTIVE_LIMIT} can be active at once.`
                : `${slides.filter((slide) => slide.isActive).length} of ${HERO_ACTIVE_LIMIT} active`}
            </p>
          </div>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={atLimit || saveHero.isPending}
            onClick={() => setEditor({ mode: "create" })}
          >
            <Plus />
            Add hero
          </Button>
        </div>

        {slides.length === 0 ? (
          <div className="px-4 py-16 text-center sm:px-6">
            <p className="text-sm font-medium">Add the first hero</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Each hero has its own eyebrow, title, description, and image. Only{" "}
              {HERO_ACTIVE_LIMIT} can be active on the homepage at once.
            </p>
          </div>
        ) : (
          <ul ref={listRef}>
            {slides.map((slide, index) => {
              const activationBlocked =
                !slide.isActive &&
                slides.filter((item) => item.isActive).length >=
                  HERO_ACTIVE_LIMIT

              return (
                <li
                  key={`${slide.image}-${index}`}
                  className="flex flex-col gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0 data-[drop]:bg-primary/5 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  onDragOver={dragOver(index)}
                  onDrop={dropOn(index)}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                    <img
                      src={slide.image}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-lg object-cover sm:h-20 sm:w-32"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                        {slide.eyebrow}
                      </p>
                      <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium">
                        <span className="truncate">{slide.title}</span>
                        <UniversalBadge
                          name={slide.isActive ? "active" : "inactive"}
                          colors={
                            slide.isActive
                              ? badgeColors.active
                              : badgeColors.neutral
                          }
                        />
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <HeroPositionControl
                      index={index}
                      total={slides.length}
                      disabled={saveHero.isPending}
                      onMove={(direction) =>
                        void reorder(index, index + direction)
                      }
                      onDragStart={startDrag(index)}
                      onDragEnd={endDrag}
                    />
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
                      <Switch
                        id={`hero-list-active-${index}`}
                        checked={slide.isActive}
                        disabled={saveHero.isPending || activationBlocked}
                        aria-label={
                          slide.isActive
                            ? `Deactivate ${slide.title}`
                            : `Activate ${slide.title}`
                        }
                        title={
                          activationBlocked
                            ? "Three heroes are already active"
                            : undefined
                        }
                        onCheckedChange={(checked) =>
                          void setActive(index, checked)
                        }
                      />
                      <Label
                        htmlFor={`hero-list-active-${index}`}
                        className="cursor-pointer text-xs font-medium"
                      >
                        {slide.isActive ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          aria-label="Hero actions"
                          disabled={saveHero.isPending}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setEditor({ mode: "edit", index })}
                        >
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => setDeletingIndex(index)}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {editor ? (
        <HeroFormDialog
          key={editor.mode === "edit" ? `edit-${editor.index}` : "create"}
          slide={editor.mode === "edit" ? (slides[editor.index] ?? null) : null}
          activationBlocked={
            slides.filter((slide, index) => {
              if (!slide.isActive) {
                return false
              }

              return editor.mode === "create" || index !== editor.index
            }).length >= HERO_ACTIVE_LIMIT
          }
          saving={saveHero.isPending}
          onClose={() => {
            if (!saveHero.isPending) {
              setEditor(null)
            }
          }}
          onSubmit={saveSlide}
        />
      ) : null}

      <Dialog
        open={deletingIndex !== null}
        onOpenChange={(next) => {
          if (!next && !saveHero.isPending) {
            setDeletingIndex(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete hero</DialogTitle>
            <DialogDescription>
              {deleting
                ? `Remove “${deleting.title}” from the homepage heroes.`
                : "Remove this hero from the homepage."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={saveHero.isPending}
              onClick={() => setDeletingIndex(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              disabled={saveHero.isPending}
              onClick={() => void remove()}
            >
              {saveHero.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
