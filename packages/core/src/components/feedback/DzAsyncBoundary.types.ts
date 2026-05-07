import type { ComponentPublicInstance } from 'vue'

export interface DzAsyncBoundaryProps {
  onError?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void
  timeout?: number
  delay?: number
}

export interface DzAsyncBoundaryEmits {
  timeout: []
}

export interface DzAsyncBoundarySlots {
  default?: () => unknown
  loading?: () => unknown
  error?: (props: { error: unknown; reset: () => void }) => unknown
}
