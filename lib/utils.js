import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateSignUrl(accessToken, baseUrl = process.env.NEXT_PUBLIC_APP_URL || "") {

  return `${baseUrl}/${accessToken}`
}

