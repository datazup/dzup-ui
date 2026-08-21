/**
 * Nuxt consumer fixtures (TASK-OSS-P1-03).
 *
 * Each fixture is a real Nuxt app, installed from the packed tarballs, staged
 * outside this repository, and built. What it proves is what a workspace alias
 * cannot: that the artifacts a consumer installs actually work.
 *
 * The suite is **not** in the default `yarn test` lane — it lives under
 * `packages/nuxt/test/`, while the root `vitest.config.ts` includes only the
 * plural `tests` directory of each package.
 * One fixture install is ~800 packages and one build is ~60s, so it runs
 * explicitly:
 *
 *   yarn test:nuxt-fixtures:pack       # pack tarballs, stage the fixtures
 *   yarn test:nuxt-fixtures:install    # npm install each staged fixture
 *   yarn test:nuxt-fixtures            # build them and assert
 *
 * A fixture that has not been packed, staged, or installed is reported
 * **unrun** with the command that would fix it. It is never silently skipped:
 * an unrun cell and a passing cell must not look the same.
 */

import type { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const HERE = dirname(fileURLToPath(import.meta.url))
const STAGE_MANIFEST = resolve(HERE, '.tarballs/stage.json')

/** One Nuxt production build, on a machine that may be cold. */
const BUILD_TIMEOUT_MS = 600_000

interface StagedFixture {
  fixture: string
  dir: string
  status: 'ready' | 'unrun'
  missing: string[]
}

interface StageManifest {
  stageRoot: string
  tarballs: Record<string, string>
  fixtures: StagedFixture[]
}

function readStage(): StageManifest | undefined {
  if (!existsSync(STAGE_MANIFEST))
    return undefined
  return JSON.parse(readFileSync(STAGE_MANIFEST, 'utf8')) as StageManifest
}

const stage = readStage()

/**
 * Build one fixture and return its combined output plus the emitted HTML.
 *
 * Async, and both streams are captured. A synchronous `execSync` blocks the
 * vitest worker for the whole ~60s build, which starves the reporter RPC and
 * surfaces as `Timeout calling "onTaskUpdate"` — a failure that has nothing to
 * do with the fixture. And the Nuxt module's diagnostics go to **stderr**, so
 * reading stdout alone would report a missing message that was in fact printed.
 */
async function generate(dir: string): Promise<{ output: string, html: string }> {
  const output = await new Promise<string>((resolveOutput, reject) => {
    // One quoted command string rather than an args array: `npm` is a `.cmd`
    // shim on Windows, and `shell: true` with args concatenates instead of
    // escaping them (DEP0190).
    const child = spawn('npm run generate', { cwd: dir, shell: true })
    let combined = ''
    const collect = (chunk: Buffer): void => {
      combined += chunk.toString()
    }

    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.on('error', reject)
    child.on('close', (code) => {
      resolveOutput(code === 0
        ? combined
        : `${combined}
[exit code ${code}]`)
    })
  })

  const index = join(dir, '.output/public/index.html')
  return { output, html: existsSync(index) ? readFileSync(index, 'utf8') : '' }
}

/**
 * The `<style>` blocks Nuxt inlines, in document order.
 *
 * Nuxt inlines critical CSS rather than emitting `<link>` elements, so the
 * ordering assertion has to read the blocks, not the links.
 */
function styleBlocks(html: string): string[] {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1] ?? '')
}

function fixtureOf(name: string): StagedFixture | undefined {
  return stage?.fixtures.find(entry => entry.fixture === name)
}

/** Ready to build: staged, rendered, and installed. */
function isRunnable(name: string): boolean {
  const entry = fixtureOf(name)
  return entry !== undefined
    && entry.status === 'ready'
    && existsSync(join(entry.dir, 'node_modules'))
}

function dirOf(name: string): string {
  const entry = fixtureOf(name)
  if (entry === undefined)
    throw new Error(`fixture ${name} is not staged`)
  return entry.dir
}

describe('fixture harness', () => {
  it('has been packed and staged', () => {
    expect(
      stage,
      'run `yarn test:nuxt-fixtures:pack` first — nothing has been packed or staged',
    ).toBeDefined()
  })

  it.runIf(stage !== undefined)('stages the fixtures outside this repository', () => {
    // A fixture kept inside the monorepo resolves the repository's own nuxt,
    // nitropack and vite through Node's upward directory walk, and stops being
    // a consumer test at all.
    const repoRoot = resolve(HERE, '../../..')
    expect(stage!.stageRoot.startsWith(repoRoot)).toBe(false)
  })

  it.runIf(stage !== undefined)('reports every fixture it could not stage', () => {
    for (const entry of stage!.fixtures.filter(f => f.status === 'unrun')) {
      // Visible, not silent. `core-pro` is unrun on any checkout without a Pro
      // tarball, which is every checkout today.
      expect(entry.missing.length, `${entry.fixture} is unrun for no stated reason`)
        .toBeGreaterThan(0)
      console.warn(`· ${entry.fixture}: unrun — needs ${entry.missing.join(', ')}`)
    }
  })

  it.runIf(stage !== undefined)('names the tarballs it installed, not workspace paths', () => {
    for (const [name, tarball] of Object.entries(stage!.tarballs)) {
      expect(tarball.endsWith('.tgz'), `${name} is not a tarball`).toBe(true)
      expect(existsSync(tarball), `${name} tarball is missing`).toBe(true)
    }
  })
})

describe('core-only', () => {
  it.runIf(isRunnable('core-only'))('auto-imports DzButton from the installed tarball', async () => {
    const { html } = await generate(dirOf('core-only'))

    expect(html).toContain('data-testid="core-button"')
    // Not just present — rendered as the real component, with the variant
    // classes and data attributes its contract declares.
    expect(html).toMatch(/<button[^>]*data-testid="core-button"/)
    expect(html).toContain('data-tone="primary"')
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('core-only'))('is unrun', () => {
    console.warn('· core-only: unrun — run `yarn test:nuxt-fixtures:install`')
  })
})

describe('custom-prefix', () => {
  it.runIf(isRunnable('custom-prefix'))('registers <XButton> and imports the real export', async () => {
    const { html } = await generate(dirOf('custom-prefix'))

    // The tag is renamed; the component behind it is still DzButton.
    expect(html).toContain('data-testid="prefixed-button"')
    expect(html).toMatch(/<button[^>]*data-testid="prefixed-button"/)
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('custom-prefix'))('is unrun', () => {
    console.warn('· custom-prefix: unrun — run `yarn test:nuxt-fixtures:install`')
  })
})

describe('css-order', () => {
  it.runIf(isRunnable('css-order'))('loads tokens before component styles', async () => {
    const { html } = await generate(dirOf('css-order'))
    const blocks = styleBlocks(html)

    const tokens = blocks.findIndex(block => /--dz-primary\s*:/.test(block))
    const components = blocks.findIndex(block => block.includes('dz-prose'))

    expect(tokens, 'no token stylesheet reached the page').toBeGreaterThanOrEqual(0)
    expect(components, 'no component stylesheet reached the page').toBeGreaterThanOrEqual(0)
    // Not cosmetic: the component sheet reads `var(--dz-*)`, so loading it
    // first paints the first frame with unresolved custom properties.
    expect(tokens).toBeLessThan(components)
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('css-order'))('is unrun', () => {
    console.warn('· css-order: unrun — run `yarn test:nuxt-fixtures:install`')
  })
})

describe('ssr-hydration', () => {
  it.runIf(isRunnable('ssr-hydration'))('renders on the server', async () => {
    const { html } = await generate(dirOf('ssr-hydration'))

    // Server-rendered, not an empty shell the client fills in: the markup and
    // the interpolated text are both in the HTML the server produced.
    expect(html).toContain('data-testid="ssr-button"')
    expect(html).toContain('Rendered on the server: 0')
    expect(html).toContain('data-theme')
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('ssr-hydration'))('is unrun', () => {
    console.warn('· ssr-hydration: unrun — run `yarn test:nuxt-fixtures:install`')
  })
})

describe('pro-missing', () => {
  it.runIf(isRunnable('pro-missing'))('builds with Core and says why Pro is absent', async () => {
    const { output, html } = await generate(dirOf('pro-missing'))

    // The build must not fail: a half-configured option should not cost a
    // consumer their whole app.
    expect(html).toContain('data-testid="core-button"')

    // And it must be diagnosable. The message names the package, the option,
    // and the command that fixes it — the alternative is a Vite resolution
    // error pointing at a package the consumer never typed.
    expect(output).toContain('includePro is true')
    expect(output).toContain('@dzup-ui-pro/pro')
    expect(output).toContain('dzupUi.includePro')
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('pro-missing'))('is unrun', () => {
    console.warn('· pro-missing: unrun — run `yarn test:nuxt-fixtures:install`')
  })
})

describe('optional-peer', () => {
  it.runIf(isRunnable('optional-peer'))('installs reka-ui as a required peer, and needs it', async () => {
    const { html } = await generate(dirOf('optional-peer'))

    // This fixture was written to prove a peer is *optional*, and measuring it
    // proved the opposite. `@dzup-ui/core` declares `reka-ui` in
    // `peerDependencies` with no `peerDependenciesMeta.optional`, so npm 7+
    // installs it automatically even though this fixture never asks for it —
    // and removing it fails the build with `Rollup failed to resolve import
    // "reka-ui"` for an app whose only component is `<DzButton>`.
    //
    // So the assertion records the contract that exists: reka-ui is required.
    // Making it genuinely optional is an owner decision, and it needs two
    // things — `peerDependenciesMeta` on the package, and a registration
    // strategy that does not pull a Reka-backed component into a Button-only
    // app.
    expect(existsSync(join(dirOf('optional-peer'), 'node_modules/reka-ui'))).toBe(true)
    expect(html).toContain('data-testid="core-button"')
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('optional-peer'))('is unrun', () => {
    console.warn('· optional-peer: unrun — run `yarn test:nuxt-fixtures:install`')
  })
})

describe('core-pro', () => {
  it.runIf(isRunnable('core-pro'))('auto-imports a Pro component from its tarball', async () => {
    const { html } = await generate(dirOf('core-pro'))

    expect(html).toContain('data-testid="core-button"')
    expect(html).toContain('data-testid="pro-component"')
  }, BUILD_TIMEOUT_MS)

  it.skipIf(isRunnable('core-pro'))('is unrun without a Pro tarball', () => {
    // Not a skip for convenience. Pro publishes no tarball and no ownership
    // manifest, so this cell is genuinely unmeasured, and P1's exit criterion
    // ("representative Pro components import by Nuxt auto-import") is unmet.
    console.warn(
      `· core-pro: unrun — set DZUP_PRO_TARBALL to a tarball from a Pro checkout, `
      + 'then re-run `yarn test:nuxt-fixtures:pack` and `:install`.',
    )
    expect(process.env.DZUP_PRO_TARBALL ?? '').toBe('')
  })
})
