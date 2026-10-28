const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

const assetOrigin = API_URL.replace(/\/api\/?$/, "")

export function resolveAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${assetOrigin}${normalized}`
}
