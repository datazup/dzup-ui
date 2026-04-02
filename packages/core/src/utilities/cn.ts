import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names using clsx + tailwind-merge (ADR-10).
 * All components use this to merge internal classes with consumer-provided `class` attribute.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
