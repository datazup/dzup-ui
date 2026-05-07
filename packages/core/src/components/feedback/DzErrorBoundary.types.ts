import type { ComponentPublicInstance } from 'vue'

export interface DzErrorBoundaryProps {
  onError?: (err: unknown, instance: ComponentPublicInstance | null, info: string) => void
}

export interface DzErrorBoundarySlots {
  default?: () => unknown
  fallback?: (props: { error: unknown; reset: () => void }) => unknown
}
