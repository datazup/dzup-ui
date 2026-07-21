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
 * NON-BLOCKING BY DEFAULT: per the task ("track build time + total size as a
 * non-blocking CI metric first, promote to a budget once a baseline is trusted"),
 * it always exits 0 so a size change never fails the Storybook build. Pass
 * `--max-mb <n>` to promote it to an enforced budget once a baseline is trusted;
 * it then exits 1 when the total on-disk size exceeds <n> MB.
 *
 * Units match the landing size check (`apps/landing/scripts/check-bundle-budget.ts`)
 * and the library budget: gzip is level 9.
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs                              # metric report (exit 0)
 *   node scripts/check-bundle-size.mjs --badge storybook-static/size-badge.json
 *   node scripts/check-bundle-size.mjs --max-mb 18                 # enforced budget (exit 1 over)
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
const staticDir = join(appRoot, 'storybook-static')

const KB = 1024
const MB = 1024 * 1024

/** gzip these text-ish artifacts to report the on-the-wire figure alongside raw. */
const COMPRESSIBLE = /\.(?:js|mjs|css|html|json|svg|map)$/

function formatBytes(bytes) {
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

function argValue(args, flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : undefined
}

function main() {
  const args = process.argv.slice(2)
  const badgePath = argValue(args, '--badge')
  const maxMbRaw = argValue(args, '--max-mb')
  const maxMb = maxMbRaw !== undefined ? Number(maxMbRaw) : undefined

  if (!existsSync(staticDir)) {
    console.error(
      `Storybook build output not found: ${staticDir}\n`
      + 'Run `yarn workspace @dzup-ui/storybook build` first.',
    )
    process.exit(1)
    return
  }

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

  console.log('\n=== Storybook static build size (TASK-X.7 metric) ===\n')
  console.log(`  Total on-disk     ${formatBytes(totalBytes).padStart(10)}   (${files.length} files)`)
  console.log(`  assets/ subtotal  ${formatBytes(assetsBytes).padStart(10)}`)
  console.log(`  JS chunks         ${String(chunkCount).padStart(10)}`)
  console.log('\n  Largest artifacts:')
  for (const f of largest) {
    const gz = f.gzip != null ? `  (gzip ${formatBytes(f.gzip)})` : ''
    console.log(`    ${formatBytes(f.size).padStart(10)}  ${f.rel}${gz}`)
  }

  if (badgePath) {
    const badge = {
      schemaVersion: 1,
      label: 'storybook build',
      message: formatBytes(totalBytes),
      color: 'blue',
    }
    const outPath = resolve(process.cwd(), badgePath)
    writeFileSync(outPath, JSON.stringify(badge, null, 2))
    console.log(`\nWrote size badge → ${outPath}`)
  }

  console.log(`\n${'='.repeat(56)}`)

  if (maxMb !== undefined && !Number.isNaN(maxMb)) {
    const over = totalBytes > maxMb * MB
    console.log(
      over
        ? `Storybook build ${formatBytes(totalBytes)} EXCEEDS budget ${maxMb} MB.`
        : `Storybook build ${formatBytes(totalBytes)} within budget ${maxMb} MB.`,
    )
    process.exit(over ? 1 : 0)
    return
  }

  console.log(`Storybook build size: ${formatBytes(totalBytes)} (non-blocking metric).`)
  process.exit(0)
}

main()
