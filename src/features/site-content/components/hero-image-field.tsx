import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ApiError } from "@/lib/api/errors"

import { uploadHeroImage } from "../services"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type HeroImageFieldProps = {
  value: string
  error?: string
  disabled?: boolean
  onChange: (value: string) => void
  onPendingChange?: (pending: boolean) => void
}

export function HeroImageField({
  value,
  error,
  disabled = false,
  onChange,
  onPendingChange,
}: HeroImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const message = localError || error
  const busy = disabled || uploading

  const chooseFile = () => {
    if (!busy) {
      inputRef.current?.click()
    }
  }

  const onFile = async (list: FileList | null) => {
    const file = list?.[0]
    if (inputRef.current) {
      inputRef.current.value = ""
    }

    if (!file || busy) {
      return
    }

    if (!IMAGE_TYPES.includes(file.type)) {
      setLocalError("Upload a JPEG, PNG, WebP, or GIF image.")
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setLocalError("Image must be 5 MB or smaller.")
      return
    }

    setUploading(true)
    onPendingChange?.(true)
    setLocalError(null)

    try {
      onChange(await uploadHeroImage(file))
    } catch (uploadError) {
      setLocalError(
        uploadError instanceof ApiError
          ? uploadError.message
          : "Could not upload this image. Please try again."
      )
    } finally {
      setUploading(false)
      onPendingChange?.(false)
    }
  }

  return (
    <Field data-invalid={Boolean(message) || undefined}>
      <FieldLabel htmlFor="hero-image">Image</FieldLabel>
      <input
        ref={inputRef}
        id="hero-image"
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={busy}
        onChange={(event) => void onFile(event.target.files)}
      />
      {value ? (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <img
            src={value}
            alt=""
            className="aspect-[16/9] max-h-56 w-full object-cover"
          />
          <div className="flex flex-wrap gap-2 p-3">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={chooseFile}
              disabled={busy}
            >
              {uploading ? "Uploading…" : "Replace"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setLocalError(null)
                onChange("")
              }}
              disabled={busy}
            >
              <X />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={chooseFile}
          className="flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground transition-colors hover:border-primary/50 disabled:cursor-not-allowed"
        >
          <ImagePlus className="size-5" />
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      )}
      <FieldDescription>JPEG, PNG, WebP, or GIF. Up to 5 MB.</FieldDescription>
      <FieldError>{message}</FieldError>
    </Field>
  )
}
