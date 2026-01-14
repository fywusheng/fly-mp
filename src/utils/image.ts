const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL

export function getImageUrl(path: string): string {
  return `${BASE_URL}${path}`
}
