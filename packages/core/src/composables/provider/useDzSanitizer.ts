import type { DzSanitizerAdapter, DzSanitizerOptions } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import { DZ_SANITIZER_KEY } from '@dzup-ui/contracts'
import { inject, provide } from 'vue'
import { DZ_ESCAPING_SANITIZER, resolveSanitizer } from '../../security/sanitize.ts'

/**
 * The application's HTML sanitizer (TASK-R3-O2, ADR-20 amendment A6).
 *
 * The eleventh concern, and the first one added since P4-01. 08-11 doc 06 asks
 * for a **central sanitizer adapter configurable once per application**: allowed
 * schemes, a Trusted Types policy name and size ceilings set at the root rather
 * than re-solved by every component that renders rich content. Pro's QUAL-04
 * closeout records the shared adapter as blocked on Core having no provider
 * seam — correctly, because a Pro-only provider would be a second provider, and
 * ADR-20 §9 forbids exactly that.
 *
 * Resolution order, and it is the same three steps every consumer gets:
 * **instance → nearest provider → Core default.**
 *
 * @module @dzup-ui/core/composables/provider/useDzSanitizer
 */

/**
 * Resolve the sanitizer this component should use.
 *
 * @param instance A per-instance override — the component's own prop, when it
 * has one. Highest precedence, matching ADR-20 §6 step 1: an explicit prop is
 * what the author of that line wrote. Partial: `{ limits: { maxDepth: 8 } }` on
 * one component tightens the ceiling without discarding the host's adapter.
 *
 * @returns A complete adapter. **Never throws for a missing provider** — the
 * ADR-20 §2 property that lets a consumer adopt one component without adopting
 * an architecture. With nothing installed anywhere it is the escaping default,
 * which is safe rather than convenient.
 *
 * @throws {Error} in development only, when a provider above has explicitly set
 * `:sanitizer="null"`. That is a host saying "I will supply one" and then not;
 * a silent fallback would turn a configuration mistake into a rendering
 * difference nobody looks for. In production the same state falls back to the
 * escaping default, because failing closed beats throwing in a user's face.
 */
export function useDzSanitizer(instance?: DzSanitizerOptions | null): DzSanitizerAdapter {
  const injected = inject(DZ_SANITIZER_KEY, undefined)

  if (injected === null) {
    if (import.meta.env?.DEV) {
      throw new Error(
        '[dzup-ui] A DzProvider above this component set `sanitizer` to null, '
        + 'which means "the host supplies one" — but nothing supplied it. Pass a '
        + '`sanitize` function to DzProvider, or remove the null to fall back to '
        + 'the escaping default.',
      )
    }
    return resolveSanitizer(() => instance, DZ_ESCAPING_SANITIZER)
  }

  return resolveSanitizer(() => instance, injected ?? DZ_ESCAPING_SANITIZER)
}

/**
 * Build the adapter a provider installs, folding its props over what it
 * inherited.
 *
 * Exported from this module but **not from the barrel**, like every other
 * `createDz*`/`provideDz*`: `DzProvider` is the one sanctioned writer, and a
 * second writer is how an application ends up with two policies.
 *
 * `null` is passed through rather than resolved, so that the "host promised an
 * adapter and did not deliver" state stays distinguishable from "no host said
 * anything" — the first is a bug worth a dev-mode throw, the second is the
 * documented default.
 */
export function createDzSanitizer(
  options: Readonly<Ref<DzSanitizerOptions | null | undefined>>,
  inherited: DzSanitizerAdapter | null | undefined,
): DzSanitizerAdapter | null {
  if (options.value === null)
    return null

  return resolveSanitizer(() => options.value, inherited ?? DZ_ESCAPING_SANITIZER)
}

export function provideDzSanitizer(sanitizer: DzSanitizerAdapter | null): void {
  provide(DZ_SANITIZER_KEY, sanitizer)
}
