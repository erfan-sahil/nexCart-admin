import { useMatches } from "react-router"

import type { PageHandle } from "@/app/navigation"

const FALLBACK: PageHandle = {
  title: "NexCart",
  description: "Admin",
}

function isPageHandle(handle: unknown): handle is PageHandle {
  if (!handle || typeof handle !== "object") {
    return false
  }

  return (
    "title" in handle &&
    "description" in handle &&
    typeof handle.title === "string" &&
    typeof handle.description === "string"
  )
}

export function usePageMeta() {
  const matches = useMatches()

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle
    if (isPageHandle(handle)) {
      return handle
    }
  }

  return FALLBACK
}
