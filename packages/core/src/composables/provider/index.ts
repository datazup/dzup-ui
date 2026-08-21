/**
 * Provider composables — the read side of the ADR-20 contract
 * (TASK-OSS-P4-01).
 *
 * Ten concerns an application configures once. Every one has a typed default,
 * so **every component works with no provider mounted** — the property that
 * lets a consumer adopt one component without adopting an architecture.
 *
 * `useDzTheme` is `useTheme` under the name the rest of the family uses; the
 * theme contract has shipped since ADR-09 and is not changed here — which makes
 * it **the one composable of the ten that still requires a provider**. It
 * throws without a `DzThemeProvider` unless called with `{ optional: true }`,
 * because theme has no sensible default for an application that has not chosen
 * one. The other nine resolve to `DZ_PROVIDER_DEFAULTS` and never throw.
 *
 * **The `provideDz*` half is deliberately not exported from this barrel.**
 * Three reasons, in order of weight:
 *
 *   1. `DzProvider` (TASK-OSS-P4-02) is the one sanctioned writer. Publishing
 *      the write half invites an application to build a second provider, which
 *      ADR-20 §9 forbids for Pro and discourages generally — two providers mean
 *      two locales and two merge rules.
 *   2. The public surface the packet specifies is exactly these ten readers.
 *   3. Ownership schema 1.1.0 has no `utility` kind, so twelve exported helpers
 *      would each land as `unclassified` and push that ratchet up by twelve.
 *      A ceiling that rises to accommodate new code is not a ceiling.
 *
 * `DzProvider` and the specs import the writers from the individual modules by
 * relative path, which is the same code without the public promise.
 *
 * @module @dzup-ui/core/composables/provider
 */

export { useTheme as useDzTheme } from '../../providers/useTheme.ts'

export {
  useDzDefaults,
  useDzMotion,
  useDzNonce,
  useDzPortalTarget,
  useDzTestIds,
} from './useDzEnvironment.ts'

export { useDzFormats } from './useDzFormats.ts'

export { useDzDirection, useDzLocale } from './useDzLocale.ts'

export type { DzMessageReader } from './useDzMessages.ts'

export { useDzMessages } from './useDzMessages.ts'
