/**
 * Vapor-interop smoke (TASK-N5-03).
 *
 * The compatibility statement this repository publishes is:
 *
 *   > @dzup-ui/core is a **virtual-DOM** component library. It is not compiled
 *   > in Vapor mode and does not intend to be. A Vue application that uses
 *   > Vapor mode can still use these components, because Vue 3.6 ships
 *   > `vaporInteropPlugin`, which lets a Vapor component render a vDOM child.
 *
 * A statement of that shape is worth exactly as much as the run behind it, and
 * the failure mode is specific: "our components work under Vapor" is very easy
 * to *assert* from the architecture (they are ordinary vDOM SFCs, so of course
 * they do) and the assertion would survive right up until somebody tried it.
 * This mounts a real Vapor application whose root is a Vapor component, renders
 * a real dzup-ui component inside it through the interop plugin, and asserts on
 * the DOM that comes out.
 *
 * **Three outcomes, and they are kept distinguishable on purpose.** A check
 * that cannot run and a check that passed must never look the same, and
 * neither may look like a defect in this library:
 *
 *   1. **Vue < 3.6** — `vaporInteropPlugin` does not exist. Reports
 *      `unverified` by name, with the command that would verify it. Does not
 *      fail.
 *   2. **Vue >= 3.6, but the process holds two Vue builds** — reports
 *      `unverified` for a *different*, named reason (see below). Does not fail.
 *   3. **Vue >= 3.6, one Vue build** — mounts for real and asserts hard. This
 *      is the only outcome entitled to back the README statement.
 *
 * **Why outcome 2 exists.** `vue`'s CJS build carries no Vapor runtime at all:
 * `vue/package.json` routes the `node` import condition to `index.js` →
 * `dist/vue.cjs.js`, and only `dist/vue.runtime.esm-bundler.js` does
 * `export * from "@vue/runtime-vapor"`. Under Vitest's default resolution the
 * bare `vue` specifier therefore has no `createVaporApp` on it:
 *
 *     node -e "const m = await import('vue'); console.log('createVaporApp' in m)"
 *     false        # vue@3.6.0-rc.6
 *
 * Reaching past that to `@vue/runtime-vapor` finds the exports but not a
 * working runtime — the vapor esm-bundler build imports `initFeatureFlags` from
 * `@vue/runtime-dom`, which only its esm-bundler build re-exports (from
 * runtime-core), so a vapor app built on the CJS runtime-dom dies in
 * `prepareApp` with `(0 , initFeatureFlags) is not a function`. **Two Vue
 * builds in one process is not a state anybody ships**, and a red run in it is
 * a measurement of the seam between them, not of Vapor interop.
 *
 * `packages/tooling/scripts/vue-next.vitest.config.ts` is the config that
 * removes the seam, by aliasing `vue` to Vue's own single-file
 * `runtime-with-vapor` build. `yarn test:vue-next:vapor` uses it. That command
 * is the one — and the only one — whose green result may be quoted.
 */

import { describe, expect, it } from 'vitest'
import { version as vueVersion } from 'vue'
import * as vue from 'vue'
import DzButton from '../src/components/buttons/DzButton.vue'

/** The verify command, named once so every message points at the same thing. */
const VERIFY_WITH = 'yarn test:vue-next:vapor'

/** Vapor interop landed in 3.6. Parsed, not string-matched: `3.10` must not read as older than `3.6`. */
export function supportsVapor(version: string): boolean {
  const [major, minor] = version.split('.').map(part => Number.parseInt(part, 10))
  if (major === undefined || minor === undefined || Number.isNaN(major) || Number.isNaN(minor))
    return false
  return major > 3 || (major === 3 && minor >= 6)
}

const runtime = vue as unknown as Record<string, unknown>

/**
 * Whether the `vue` this process loaded carries the Vapor runtime itself.
 *
 * This is the outcome-2 discriminator, and it is a fact rather than a guess: if
 * `createVaporApp` is on the same module object that `DzButton` was compiled
 * against, then one Vue build is serving both halves of the interop and the
 * question is answerable. If it is absent, any vapor runtime we could reach
 * would come from a second build, and the mount below would measure the seam.
 */
const singleRuntime = typeof runtime.createVaporApp === 'function'
const vaporAvailable = supportsVapor(vueVersion) && singleRuntime

describe('vapor interop', () => {
  it('states which Vue this run is evidence about', () => {
    // Always runs, on every Vue. Without it the suite is silent about the one
    // fact that decides what the rest of this file means.
    expect(vueVersion).toBeTypeOf('string')
    console.warn(
      `· vapor-interop: vue ${vueVersion} — ${
        vaporAvailable
          ? 'single Vue runtime with vaporInteropPlugin, running for real'
          : 'VERIFICATION NOT PERFORMED'
      }`,
    )
  })

  it.skipIf(vaporAvailable)('is UNVERIFIED on this install, and says which reason', () => {
    const reason = !supportsVapor(vueVersion)
      ? `vue ${vueVersion} predates 3.6, where Vapor mode and \`vaporInteropPlugin\` arrive`
      : `vue ${vueVersion} is 3.6+, but the \`vue\` module this process loaded has no `
        + '`createVaporApp` — its CJS build carries no Vapor runtime, so the vapor and vDOM '
        + 'halves would come from two different Vue builds and the result would describe the '
        + 'seam between them rather than the interop'

    console.warn(
      `· vapor-interop: UNRUN — ${reason}. Nothing here has been verified; do not quote the `
      + `Vapor compatibility statement as tested from this run. Verify with \`${VERIFY_WITH}\`.`,
    )

    // The reason must be one of the two known ones. A third cause would mean
    // this file is silently reporting `unverified` for something nobody has
    // looked at, which is how a permanently-unrun check goes unnoticed.
    expect(!supportsVapor(vueVersion) || !singleRuntime).toBe(true)
  })

  it.runIf(vaporAvailable)('renders a vDOM dzup-ui component inside a Vapor app', () => {
    const createVaporApp = runtime.createVaporApp as
      ((component: unknown) => { use: (p: unknown) => unknown, mount: (el: Element) => unknown })
    const defineVaporComponent = runtime.defineVaporComponent as (setup: () => unknown) => unknown
    const createComponent = runtime.createComponent as
      (component: unknown, props?: Record<string, () => unknown>) => unknown
    const vaporInteropPlugin = runtime.vaporInteropPlugin

    // Asserted rather than assumed. If a later RC renames one of these, the
    // failure should name the missing export instead of surfacing as an
    // inscrutable "x is not a function" three frames deep.
    for (const [name, value] of Object.entries({
      createVaporApp,
      defineVaporComponent,
      createComponent,
      vaporInteropPlugin,
    })) {
      expect(value, `vue@${vueVersion} does not export \`${name}\``).toBeDefined()
    }

    // A Vapor root rendering a vDOM child: the exact direction the interop
    // plugin exists for, and the exact direction a consumer of this library
    // needs. Written with the runtime helpers rather than a `<script setup
    // vapor>` SFC on purpose — an SFC would need a Vapor-capable compiler in
    // the default lane's transform pipeline, which would make Vue 3.5 runs fail
    // to collect this file.
    const VaporRoot = defineVaporComponent(() =>
      createComponent(DzButton, { 'tone': () => 'primary', 'data-testid': () => 'vapor-child' }),
    )

    const host = document.createElement('div')
    document.body.append(host)

    const app = createVaporApp(VaporRoot)
    app.use(vaporInteropPlugin)
    app.mount(host)

    const button = host.querySelector('button')
    expect(button, 'the vDOM component did not render inside the Vapor app').not.toBeNull()
    expect(button?.getAttribute('data-tone')).toBe('primary')

    host.remove()
  })
})
