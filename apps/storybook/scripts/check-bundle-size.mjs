/**
 * check-bundle-size.mjs — size metric for the Storybook *static build*
 * (TASK-X.7 follow-up, see docs/storybook-decisions.md).
 *
 * WHY: the library bundle budgets (`packages/tooling/src/bundle-budget-check.ts`,
 * `yarn validate:bundle`) cover the shipped packages under `packages/*\/dist`, but
 * nothing tracked the *docs* build — `apps/storybook/storybook-static`. A docs
 * build that quietly balloons (a heavy addon, an un-lazy dataset baked into a story
 * chunk, a duplicated vendor) slows the hosted Storybook with no signal. This walks
 * the static output and reports the total on-disk size, the `assets/` subtotal, the
 * JS-chunk count, and the largest artifacts (raw + gzip) — the same signals recorded
 * as the June 2026 baseline in docs/storybook-decisions.md (TASK-X.7).
 *
 * TWO NUMBERS, NOT ONE (UI-LAZY-BUDGET-20261009-R2). The total is what the host
 * stores; the EAGER GRAPH is what a visitor downloads before any story renders:
 * every `type="module"` script and `rel="modulepreload"` link in `iframe.html`,
 * plus their transitive static imports. A story chunk or an engine reached only
 * through `import()` is on demand and belongs to the total alone. A total-only
 * budget cannot tell the two apart — in dzup-ui-pro it hid 9.3 MiB of dead
 * worker output while blocking a security bump of an on-demand engine (R1) —
 * so `--max-eager-mb <n>` budgets the eager graph separately and the eager
 * chunk list is printed on every run. An engine appearing in that list is a
 * lazy-loading regression, not a budget problem.
 *
 * NON-BLOCKING BY DEFAULT: per the task ("track build time + total size as a
 * non-blocking CI metric first, promote to a budget once a baseline is trusted"),
 * it always exits 0 so a size change never fails the Storybook build. Pass
 * `--max-mb <n>` to promote it to an enforced budget once a baseline is trusted;
 * it then exits 1 when the total on-disk size exceeds <n> MB.
 *
 * THE CEILING IS RECORDED ELSEWHERE (TASK-R1-O5). `--max-mb` is the *call*; the
 * number, its seed measurement and the reason for it live in
 * `packages/tooling/src/validators/docs-size-ceilings.json` under
 * `storybookStatic`, beside the docs site's. `yarn validate:docs-size` measures
 * the same directory inside `validate:all` and fails when this flag and that
 * file disagree — one number, two consumers, the drift asserted rather than
 * hoped for. `--gallery-max-mb` is a separate budget for the `DZUP_GALLERY=1`
 * visual-fixture build and is not covered by that ratchet. `--max-eager-mb` is
 * seeded here: measured 2,469,635 B (2.36 MB) on 2026-10-09 at dzup-ui
 * `59a397a4` — three chunks: the Storybook `iframe` runtime 2.33 MB (which
 * carries `@storybook/addon-a11y`'s statically imported axe), the Vitest
 * mocker entry 27.9 kB and the preload helper 1.2 kB; no story or vendor
 * chunk. Budget 2.75 MiB, about 15 % above the seed.
 *
 * Units match the landing size check (`apps/landing/scripts/check-bundle-budget.ts`)
 * and the library budget: gzip is level 9.
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs                              # metric report (exit 0)
 *   node scripts/check-bundle-size.mjs --badge storybook-static/size-badge.json
 *   node scripts/check-bundle-size.mjs --max-mb 18                 # enforced budget (exit 1 over)
 *   node scripts/check-bundle-size.mjs --max-mb 18 --max-eager-mb 3  # plus the eager-graph budget
 *   DZUP_GALLERY=1 node scripts/check-bundle-size.mjs --max-mb 18 --gallery-max-mb 24
 *                                                                  # separate visual-fixture budget
 *
 * Run from CI after `storybook build` (see the `check:size` package script and the
 * `storybook` job in .github/workflows/ci.yml).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const defaultStaticDir = join(appRoot, 'storybook-static')

const KB = 1024
const MB = 1024 * 1024

/** gzip these text-ish artifacts to report the on-the-wire figure alongside raw. */
const COMPRESSIBLE = /\.(?:js|mjs|css|html|json|svg|map)$/

export function formatBytes(bytes) {
  if (bytes < KB)
    return `${bytes} B`
  if (bytes < MB)
    return `${(bytes / KB).toFixed(1)} kB`
  return `${(bytes / MB).toFixed(2)} MB`
}

/** Recursively collect every file under `dir` as { path, size }. */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...walk(full))
    else if (entry.isFile())
      out.push({ path: full, size: statSync(full).size })
  }
  return out
}

/**
 * The JavaScript the entry HTML loads before anything else: `type="module"`
 * scripts and `rel="modulepreload"` links, as static-relative paths. Classic
 * scripts, stylesheets and icons are not part of the module graph.
 */
export function entryReferences(html) {
  const refs = []
  for (const match of html.matchAll(/<(script|link)\s([^>]*)>/g)) {
    const [, tag, attrs] = match
    const attr = name => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
    let href
    if (tag === 'script' && attr('type') === 'module')
      href = attr('src')
    else if (tag === 'link' && attr('rel') === 'modulepreload')
      href = attr('href')
    if (!href || !href.endsWith('.js'))
      continue
    const normalized = href.replace(/^\.?\//, '')
    if (!refs.includes(normalized))
      refs.push(normalized)
  }
  return refs
}

/**
 * Relative static imports of a built chunk: `import … from "./x.js"`,
 * `import "./x.js"`, `export … from "./x.js"`. A dynamic `import("./x.js")`
 * is deliberately NOT matched — that is the lazy edge this metric exists to
 * keep lazy.
 */
export function staticImports(source) {
  const out = []
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*)["'](\.{1,2}\/[^"']+\.js)["']/g))
    out.push(match[1])
  return out
}

/**
 * Every chunk reachable from the entry references through static imports,
 * with its on-disk size. Paths are static-relative, POSIX separators.
 */
export function eagerClosure(staticDir, roots) {
  const seen = new Map()
  const queue = [...roots]
  while (queue.length > 0) {
    const rel = queue.shift()
    if (seen.has(rel))
      continue
    const full = join(staticDir, rel)
    if (!existsSync(full))
      continue
    const source = readFileSync(full, 'utf8')
    seen.set(rel, statSync(full).size)
    const base = dirname(rel)
    for (const spec of staticImports(source)) {
      const next = relative(staticDir, resolve(staticDir, base, spec)).replace(/\\/g, '/')
      if (!seen.has(next))
        queue.push(next)
    }
  }
  return [...seen.entries()].map(([rel, size]) => ({ rel, size })).sort((a, b) => b.size - a.size)
}

/** Measure a static build: total, assets subtotal, chunk count, largest files, eager graph. */
export function measure(staticDir = defaultStaticDir) {
  const files = walk(staticDir)
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)

  const assetsPrefix = join(staticDir, 'assets')
  const assetsBytes = files
    .filter(f => f.path.startsWith(assetsPrefix))
    .reduce((sum, f) => sum + f.size, 0)

  const chunkCount = files.filter(f => /\.js$/.test(f.path)).length

  const largest = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map(f => ({
      rel: relative(staticDir, f.path).replace(/\\/g, '/'),
      size: f.size,
      gzip: COMPRESSIBLE.test(f.path) ? gzipSync(readFileSync(f.path), { level: 9 }).length : null,
    }))

  const iframe = join(staticDir, 'iframe.html')
  const eager = existsSync(iframe) ? eagerClosure(staticDir, entryReferences(readFileSync(iframe, 'utf8'))) : []
  const eagerBytes = eager.reduce((sum, f) => sum + f.size, 0)

  return { files: files.length, totalBytes, assetsBytes, chunkCount, largest, eager, eagerBytes }
}

/** Compare a measurement with the budgets that were asked for; `undefined` means not enforced. */
export function evaluate(measured, { maxBytes, maxEagerBytes } = {}) {
  const findings = []
  if (maxEagerBytes !== undefined) {
    findings.push({
      name: 'eager graph (iframe.html static closure)',
      actual: measured.eagerBytes,
      limit: maxEagerBytes,
      ok: measured.eagerBytes <= maxEagerBytes,
    })
  }
  if (maxBytes !== undefined) {
    findings.push({
      name: 'total on-disk',
      actual: measured.totalBytes,
      limit: maxBytes,
      ok: measured.totalBytes <= maxBytes,
    })
  }
  return { findings, ok: findings.every(f => f.ok) }
}

function argValue(args, flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}

function numberArg(args, flag) {
  const raw = argValue(args, flag)
  if (raw === undefined)
    return undefined
  const value = Number(raw)
  return Number.isNaN(value) ? undefined : value
}

function main() {
  const args = process.argv.slice(2)
  const badgePath = argValue(args, '--badge')
  const maxMb = process.env.DZUP_GALLERY === '1' && argValue(args, '--gallery-max-mb') !== undefined
    ? numberArg(args, '--gallery-max-mb')
    : numberArg(args, '--max-mb')
  const maxEagerMb = numberArg(args, '--max-eager-mb')
  const staticDir = defaultStaticDir

  if (!existsSync(staticDir)) {
    console.error(
      `Storybook build output not found: ${staticDir}\n`
      + 'Run `yarn workspace @dzup-ui/storybook build` first.',
    )
    process.exit(1)
    return
  }

  const measured = measure(staticDir)

  console.log('\n=== Storybook static build size (TASK-X.7 metric) ===\n')
  console.log(`  Total on-disk     ${formatBytes(measured.totalBytes).padStart(10)}   (${measured.files} files)`)
  console.log(`  assets/ subtotal  ${formatBytes(measured.assetsBytes).padStart(10)}`)
  console.log(`  JS chunks         ${String(measured.chunkCount).padStart(10)}`)
  console.log(`  Eager graph       ${formatBytes(measured.eagerBytes).padStart(10)}   (${measured.eager.length} chunks loaded before any story)`)
  console.log('\n  Largest artifacts:')
  for (const f of measured.largest) {
    const gz = f.gzip != null ? `  (gzip ${formatBytes(f.gzip)})` : ''
    console.log(`    ${formatBytes(f.size).padStart(10)}  ${f.rel}${gz}`)
  }
  console.log('\n  Eager chunks (iframe.html module scripts + modulepreloads + their static imports):')
  for (const f of measured.eager)
    console.log(`    ${formatBytes(f.size).padStart(10)}  ${f.rel}`)

  if (badgePath) {
    const badge = {
      schemaVersion: 1,
      label: 'storybook build',
      message: formatBytes(measured.totalBytes),
      color: 'blue',
    }
    const outPath = resolve(process.cwd(), badgePath)
    writeFileSync(outPath, JSON.stringify(badge, null, 2))
    console.log(`\nWrote size badge → ${outPath}`)
  }

  console.log(`\n${'='.repeat(56)}`)

  const limits = {
    maxBytes: maxMb !== undefined ? Math.round(maxMb * MB) : undefined,
    maxEagerBytes: maxEagerMb !== undefined ? Math.round(maxEagerMb * MB) : undefined,
  }
  if (limits.maxBytes === undefined && limits.maxEagerBytes === undefined) {
    console.log(`Storybook build size: ${formatBytes(measured.totalBytes)} (non-blocking metric).`)
    process.exit(0)
    return
  }

  const verdict = evaluate(measured, limits)
  for (const finding of verdict.findings) {
    // Exact bytes, and the overage, beside the human figure — TASK-R1-O5.
    // On 2026-09-21 this line printed `Storybook build 25.00 MB EXCEEDS budget
    // 25 MB` and failed CI (TASK-R1-O4's handoff, `storybook` job). Every word
    // of it was true: the build was 26,232,563 B against a 26,214,400 B budget,
    // over by 18,163 B — which two decimal places on 25 MB cannot show. A gate
    // whose failure message reads as its own bug is a gate somebody switches
    // off, so the number that decided the exit code is now the number printed.
    const exact = `${finding.actual.toLocaleString('en-US')} B vs ${finding.limit.toLocaleString('en-US')} B`
    console.log(
      finding.ok
        ? `Storybook ${finding.name} ${formatBytes(finding.actual)} within budget ${formatBytes(finding.limit)}, `
        + `${formatBytes(finding.limit - finding.actual)} spare — ${exact}.`
        : `Storybook ${finding.name} ${formatBytes(finding.actual)} EXCEEDS budget ${formatBytes(finding.limit)} `
          + `by ${formatBytes(finding.actual - finding.limit)} — ${exact}.`,
    )
  }
  if (!verdict.ok) {
    console.log(
      '\nThe total ceiling is recorded ONCE, in '
      + 'packages/tooling/src/validators/docs-size-ceilings.json (`storybookStatic`), and '
      + '`yarn validate:docs-size` fails when this `--max-mb` and that file disagree. Raising '
      + 'one means raising both, deliberately, with the reason written down. The eager budget '
      + 'is seeded in this script\'s header: inspect the eager chunk list above first — an engine '
      + 'or a story chunk there is a lazy-loading regression, not a budget problem.',
    )
  }
  process.exit(verdict.ok ? 0 : 1)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main()
