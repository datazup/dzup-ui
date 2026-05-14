import { onBeforeUnmount, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'dz-theme'
const RESOLVED_KEY = 'data-theme'

let singleton: ReturnType<typeof create> | null = null

function readStored(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

function systemPrefers(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(RESOLVED_KEY, resolved)
}

function create() {
  const mode = ref<ThemeMode>(readStored())
  const resolved = ref<'light' | 'dark'>(mode.value === 'system' ? systemPrefers() : mode.value)

  applyTheme(resolved.value)

  const media =
    typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')

  function onSystemChange(): void {
    if (mode.value === 'system') {
      resolved.value = systemPrefers()
      applyTheme(resolved.value)
    }
  }

  media?.addEventListener('change', onSystemChange)

  watch(mode, (next) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    resolved.value = next === 'system' ? systemPrefers() : next
    applyTheme(resolved.value)
  })

  function dispose(): void {
    media?.removeEventListener('change', onSystemChange)
  }

  return { mode, resolved, dispose }
}

export function useTheme() {
  if (!singleton) {
    singleton = create()
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => singleton?.dispose(), { once: true })
    }
  }
  onBeforeUnmount(() => {
    /* keep singleton alive across page navigations */
  })
  return { mode: singleton.mode, resolved: singleton.resolved }
}

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
