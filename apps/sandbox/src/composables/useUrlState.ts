import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type Codec<T> = {
  decode: (raw: string) => T
  encode: (val: T) => string
}

const stringCodec: Codec<string> = {
  decode: (raw) => raw,
  encode: (val) => val,
}

const numberCodec: Codec<number> = {
  decode: (raw) => Number(raw),
  encode: (val) => String(val),
}

const booleanCodec: Codec<boolean> = {
  decode: (raw) => raw === '1' || raw === 'true',
  encode: (val) => (val ? '1' : '0'),
}

function pickCodec<T>(defaultValue: T): Codec<T> {
  if (typeof defaultValue === 'number') return numberCodec as unknown as Codec<T>
  if (typeof defaultValue === 'boolean') return booleanCodec as unknown as Codec<T>
  return stringCodec as unknown as Codec<T>
}

/**
 * Binds a reactive ref to a query-string key. Reads on mount, writes (replace) on change.
 * Refs reflect URL state so users can deep-link demo configs.
 */
export function useUrlState<T extends string | number | boolean>(
  key: string,
  defaultValue: T,
  codec?: Codec<T>,
): Ref<T> {
  const route = useRoute()
  const router = useRouter()
  const resolved = codec ?? pickCodec(defaultValue)

  const initial = route.query[key]
  const initialValue =
    typeof initial === 'string' && initial.length > 0
      ? safeDecode(resolved, initial, defaultValue)
      : defaultValue

  const state = ref(initialValue) as Ref<T>

  const stop = watch(state, (next) => {
    const encoded = resolved.encode(next)
    const current = route.query[key]
    const isDefault = encoded === resolved.encode(defaultValue)
    if (isDefault && current === undefined) return
    const nextQuery = { ...route.query }
    if (isDefault) {
      delete nextQuery[key]
    } else if (current !== encoded) {
      nextQuery[key] = encoded
    } else {
      return
    }
    void router.replace({ query: nextQuery })
  })

  onBeforeUnmount(stop)

  return state
}

function safeDecode<T>(codec: Codec<T>, raw: string, fallback: T): T {
  try {
    const decoded = codec.decode(raw)
    if (typeof fallback === 'number' && Number.isNaN(decoded as unknown as number)) {
      return fallback
    }
    return decoded
  } catch {
    return fallback
  }
}
