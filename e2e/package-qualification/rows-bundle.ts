import type { RowResult } from './matrix.ts'
import type { Stage } from './stage.ts'
/**
 * Rows 2 and 6 — consumer production build, and per-component tree-shaking with
 * the optional engine measured separately (TASK-S2-O1).
 *
 * Both rows are Vite production builds of a consumer that resolves `@dzup-ui/*`
 * out of a **packed tarball**, so they share this module. The distinction from
 * the pre-existing `validate:tree-shake` matters and is the reason row 6 was not
 * simply cited:
 *
 * - `packages/tooling/src/tree-shake-check.ts` aliases `@dzup-ui/core` to
 *   `packages/core/src`. It measures **source**, which no consumer receives.
 * - It externalises `reka-ui`, `@floating-ui/vue`, `@internationalized/date` and
 *   `lucide-vue-next` in every build, so the optional engine's contribution is
 *   subtracted before anything is measured. doc-08 row 6 asks for exactly that
 *   number, so a lane that externalises it cannot answer the row.
 *
 * Here the engine is measured by difference: the same entry is built twice,
 * identical but for whether `reka-ui` is external, and the delta is the engine's
 * contribution to that component.
 *
 * `vite` is imported through its Node API rather than shelled out to. `npx` is
 * not used anywhere in this repository's gates.
 *
 * @module e2e/package-qualification/rows-bundle
 */
import { Buffer } from 'node:buffer'
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import { sentinelPresent } from '../../packages/tooling/src/tree-shake-sentinel.ts'
import { SECOND_TIER_ABSENT } from './matrix.ts'

/** Components built one at a time, matching the pre-existing lane's set. */
const COMPONENTS = ['DzButton', 'DzInput', 'DzSelect', 'DzAlert'] as const

/** Must never appear in a single-component bundle. */
const SENTINELS = ['DzDataGrid', 'DzGantt', 'DzKanban'] as const

/** The optional engine whose cost row 6 asks to see on its own. */
const ENGINE = 'reka-ui'

/** Peers a consumer supplies; always external in a library build. */
const ALWAYS_EXTERNAL = ['vue']

/** First-party runtime deps of core, external unless a variant bundles them. */
const CORE_RUNTIME = [
  '@floating-ui/vue',
  '@internationalized/date',
  'lucide-vue-next',
  'clsx',
  'tailwind-merge',
  'tailwind-variants',
  'qrcode-generator',
]

interface BuildOutcome {
  bytes: number
  gzip: number
  code: string
}

async function libBuild(stage: Stage, name: string, source: string, external: string[]): Promise<BuildOutcome> {
  const dir = join(stage.consumer, 'builds', name)
  mkdirSync(dir, { recursive: true })
  const entry = join(dir, 'entry.js')
  writeFileSync(entry, source)

  const outDir = join(dir, 'out')
  await build({
    root: stage.consumer,
    logLevel: 'silent',
    resolve: { conditions: ['import', 'module', 'default'] },
    build: {
      outDir,
      emptyOutDir: true,
      minify: 'esbuild',
      cssCodeSplit: false,
      lib: { entry, formats: ['es'], fileName: 'bundle' },
      rollupOptions: { external },
      write: true,
    },
  })

  let bytes = 0
  let code = ''
  for (const file of readdirSync(outDir)) {
    const full = join(outDir, file)
    bytes += statSync(full).size
    // `.mjs` matters, and missing it is not cosmetic. Vite's `es` lib format
    // emits `bundle.mjs`; a matcher that only accepted `.js` collected NO code,
    // gzipped the empty string to a constant 20 bytes, and made every sentinel
    // check pass against an empty haystack. This lane reported a green row 6
    // that way on its first run. Kept explicit so it cannot regress silently.
    if (file.endsWith('.js') || file.endsWith('.mjs'))
      code += readFileSync(full, 'utf8')
  }
  if (code === '')
    throw new Error(`lib build for "${name}" emitted no JavaScript — refusing to measure an empty bundle`)
  return { bytes, gzip: gzipSync(Buffer.from(code)).length, code }
}

/**
 * Row 2 — a consumer production build from the tarball.
 *
 * Deliberately imports from the **root barrel and a family subpath and the
 * stylesheet**, because those are three different resolution paths through
 * `exports` and a consumer uses all three. The row is green only if the build
 * completes and emits both JS and CSS.
 *
 * `@dzup-ui/core/resolver` is deliberately **not** in this entry. It is a
 * build-time (Node) entry point — a Tailwind resolver that calls
 * `createRequire` — and bundling it into a browser build is a consumer error,
 * not a packaging defect: Vite substitutes `__vite-browser-external` for
 * `node:module` and the build fails on a `createRequire` that was never meant to
 * reach a browser. The first run of this lane made exactly that mistake and
 * reported the library red for it. Node-side resolution of every export
 * subpath, resolver included, is row 1's job and `validate:published-imports`
 * already imports all 31 of them under plain Node.
 */
export async function rowConsumerBuild(stage: Stage): Promise<RowResult> {
  const evidence = ['e2e/package-qualification/rows-bundle.ts (rowConsumerBuild)']
  try {
    const outcome = await libBuild(
      stage,
      'consumer-app',
      [
        `import { DzButton, DzAlert } from '@dzup-ui/core'`,
        `import { DzCard } from '@dzup-ui/core/cards'`,
        `import { DzThemeProvider } from '@dzup-ui/core/providers'`,
        `import '@dzup-ui/core/styles'`,
        `export { DzButton, DzAlert, DzCard, DzThemeProvider }`,
        '',
      ].join('\n'),
      [...ALWAYS_EXTERNAL, ENGINE, ...CORE_RUNTIME],
    )

    const cssEmitted = readdirSync(join(stage.consumer, 'builds', 'consumer-app', 'out')).some(f => f.endsWith('.css'))
    if (!cssEmitted) {
      return {
        n: 2,
        title: 'Vite production build of a consumer app',
        verdict: 'red',
        reason: 'the build completed but emitted no CSS, so `@dzup-ui/core/styles` did not resolve from the tarball',
        evidence,
        cited: false,
        secondTier: 'blocked',
        secondTierReason: SECOND_TIER_ABSENT,
      }
    }

    return {
      n: 2,
      title: 'Vite production build of a consumer app',
      verdict: 'green',
      reason: `production build from the packed tarball succeeded (${outcome.bytes} B emitted, CSS present)`,
      evidence,
      detail: { bytes: outcome.bytes, gzip: outcome.gzip, entryPaths: ['.', './cards', './providers', './styles'] },
      cited: false,
      secondTier: 'blocked',
      secondTierReason: SECOND_TIER_ABSENT,
    }
  }
  catch (error) {
    return {
      n: 2,
      title: 'Vite production build of a consumer app',
      verdict: 'red',
      reason: `consumer production build failed: ${(error as Error).message.split('\n')[0]}`,
      evidence,
      cited: false,
      secondTier: 'blocked',
      secondTierReason: SECOND_TIER_ABSENT,
    }
  }
}

export interface TreeShakeMeasurement {
  component: string
  /** Engine external — the library's own cost. */
  libraryGzip: number
  /** Engine bundled — library plus engine. */
  withEngineGzip: number
  /** The number doc-08 row 6 asks for. */
  engineGzip: number
  sentinelsPresent: string[]
}

/**
 * Row 6 — per-component tree-shaking from the tarball, engine measured alone.
 *
 * Red when a sentinel component survives into a single-component bundle. The
 * engine delta is reported whatever its size: row 6 asks for the measurement,
 * and this task does not invent a budget to pass or fail it against. Setting
 * that budget is an owner act, raised as a decision in the handoff.
 */
export async function rowTreeShake(stage: Stage): Promise<RowResult> {
  const evidence = ['e2e/package-qualification/rows-bundle.ts (rowTreeShake)']
  const measurements: TreeShakeMeasurement[] = []

  try {
    for (const component of COMPONENTS) {
      const source = `export { ${component} } from '@dzup-ui/core'\n`

      const library = await libBuild(stage, `shake-${component}-lib`, source, [
        ...ALWAYS_EXTERNAL,
        ENGINE,
        ...CORE_RUNTIME,
      ])
      const withEngine = await libBuild(stage, `shake-${component}-engine`, source, [
        ...ALWAYS_EXTERNAL,
        ...CORE_RUNTIME,
      ])

      measurements.push({
        component,
        libraryGzip: library.gzip,
        withEngineGzip: withEngine.gzip,
        engineGzip: withEngine.gzip - library.gzip,
        sentinelsPresent: SENTINELS.filter(s => sentinelPresent(library.code, s)),
      })
    }
  }
  catch (error) {
    return {
      n: 6,
      title: 'Individual-component tree-shaking, optional engine measured separately',
      verdict: 'red',
      reason: `a tree-shake build failed: ${(error as Error).message.split('\n')[0]}`,
      evidence,
      detail: { measurements },
      cited: false,
      secondTier: 'blocked',
      secondTierReason: SECOND_TIER_ABSENT,
    }
  }

  const leaked = measurements.filter(m => m.sentinelsPresent.length > 0)
  const verdict = leaked.length === 0 ? 'green' : 'red'
  const reason = leaked.length === 0
    ? `${measurements.length} components built from the tarball; no sentinel survived; engine (${ENGINE}) measured separately per component`
    : `sentinel components survived tree-shaking: ${leaked.map(m => `${m.component} → ${m.sentinelsPresent.join(', ')}`).join('; ')}`

  return {
    n: 6,
    title: 'Individual-component tree-shaking, optional engine measured separately',
    verdict,
    reason,
    evidence,
    detail: { engine: ENGINE, measurements },
    cited: false,
    secondTier: 'blocked',
    secondTierReason: SECOND_TIER_ABSENT,
  }
}
