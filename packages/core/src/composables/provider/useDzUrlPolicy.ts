import type { DzUrlPolicy, DzUrlPolicyOptions, DzUrlSink } from '@dzup-ui/contracts'
import type { Ref } from 'vue'
import type { DzResolvedUrlPolicy } from '../../security/url-policy.ts'
import { DZ_URL_POLICY_KEY } from '@dzup-ui/contracts'
import { inject, provide } from 'vue'
import {
  applyUrlPolicy,
  DZ_DEFAULT_URL_POLICY,
  resolveUrlPolicy,
} from '../../security/url-policy.ts'

/**
 * The application's URL policy (TASK-R2-O4, ADR-20 amendment A7).
 *
 * The twelfth concern. 08-11 doc 06 asks for a URL/DOM policy on the navigation
 * sinks; TASK-N1-O5 then *measured* that none existed — 54 deviations across
 * six components, severity high — and recorded the design so that closing it
 * would be a decision rather than a design exercise. This is that design: an
 * allowlist after WHATWG normalization, rejection by omission, and one escape
 * hatch at the provider.
 *
 * Resolution order, the same three steps every consumer gets:
 * **instance → nearest provider → Core default.**
 *
 * @module @dzup-ui/core/composables/provider/useDzUrlPolicy
 */

/**
 * Resolve the URL policy this component should enforce.
 *
 * @param instance A per-instance override. Present for symmetry with the other
 * eleven concerns and used by the specs; **no component exposes it as a prop**,
 * because a per-instance opt-out is the failure mode the provider-level hatch
 * exists to avoid.
 *
 * @returns A complete policy. Never throws, and never resolves to something
 * more permissive than {@link DZ_DEFAULT_URL_POLICY} by accident: with nothing
 * injected the default *is* the answer, so a tree that forgot its provider is
 * the strict tree rather than the open one.
 */
export function useDzUrlPolicy(instance?: DzUrlPolicyOptions | null): DzResolvedUrlPolicy {
  const injected = inject(DZ_URL_POLICY_KEY, undefined)
  return resolveUrlPolicy(() => instance, injected ?? DZ_DEFAULT_URL_POLICY)
}

/**
 * The component-facing half: a policy already bound to one component's name.
 *
 * Off the barrel, like `useDzMotionAttribute` and for the same reason — it is a
 * rendering detail of the six components that own a navigation sink, not a
 * concern a host configures. A host configures `url-policy` on `DzProvider` and
 * reads it back with {@link useDzUrlPolicy}.
 *
 * @param component The exported name, exactly as the quality matrix spells it —
 * it is what the dev warning names and what a host's `allow` function switches
 * on. For a compound sub-part this is the **sub-part's** own name
 * (`DzMenuItem`), not the declarer's: the warning has to point at the file a
 * reader would open.
 * @param sink Which threat model applies. Defaults to `navigation`, which is
 * the only sink the library filters.
 */
export function useDzUrlGuard(
  component: string,
  sink: DzUrlSink = 'navigation',
): (raw: string | undefined | null, prop?: string) => { href: string | undefined, rejected: boolean } {
  const policy = useDzUrlPolicy()
  return (raw, prop = 'href') => applyUrlPolicy(policy, raw, { component, prop, sink })
}

/**
 * Build the policy a provider installs, folding its props over what it
 * inherited.
 *
 * Exported from this module but **not from the barrel**, like every other
 * `createDz*`/`provideDz*`: `DzProvider` is the one sanctioned writer, and a
 * second writer is how an application ends up with two policies — which, for
 * this concern in particular, means a subtree that is quietly open.
 */
export function createDzUrlPolicy(
  options: Readonly<Ref<DzUrlPolicyOptions | undefined>>,
  inherited: DzUrlPolicy | undefined,
): DzResolvedUrlPolicy {
  return resolveUrlPolicy(() => options.value, inherited ?? DZ_DEFAULT_URL_POLICY)
}

export function provideDzUrlPolicy(policy: DzUrlPolicy): void {
  provide(DZ_URL_POLICY_KEY, policy)
}
