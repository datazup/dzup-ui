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
 * THE CEILING IS RECORDED ELSEWHERE (TASK-R1-O5). `--max-mb` is the *call*; the
 * number, its seed measurement and the reason for it live in
 * `packages/tooling/src/validators/docs-size-ceilings.json` under
 * `storybookStatic`, beside the docs site's. `yarn validate:docs-size` measures
 * the same directory inside `validate:all` and fails when this flag and that
 * file disagree — one number, two consumers, the drift asserted rather than
 * hoped for. `--gallery-max-mb` is a separate budget for the `DZUP_GALLERY=1`
 * visual-fixture build and is not covered by that ratchet.
 *
 * Units match the landing size check (`apps/landing/scripts/check-bundle-budget.ts`)
 * and the library budget: gzip is level 9.
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs                              # metric report (exit 0)
 *   node scripts/check-bundle-size.mjs --badge storybook-static/size-badge.json
 *   node scripts/check-bundle-size.mjs --max-mb 18                 # enforced budget (exit 1 over)
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
  const galleryMaxMbRaw = argValue(args, '--gallery-max-mb')
  const selectedMaxMbRaw = process.env.DZUP_GALLERY === '1' && galleryMaxMbRaw !== undefined
    ? galleryMaxMbRaw
    : maxMbRaw
  const maxMb = selectedMaxMbRaw !== undefined ? Number(selectedMaxMbRaw) : undefined

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
    // Exact bytes, and the overage, beside the human figure — TASK-R1-O5.
    // On 2026-09-21 this line printed `Storybook build 25.00 MB EXCEEDS budget
    // 25 MB` and failed CI (TASK-R1-O4's handoff, `storybook` job). Every word
    // of it was true: the build was 26,232,563 B against a 26,214,400 B budget,
    // over by 18,163 B — which two decimal places on 25 MB cannot show. A gate
    // whose failure message reads as its own bug is a gate somebody switches
    // off, so the number that decided the exit code is now the number printed.
    const budgetBytes = Math.round(maxMb * MB)
    const over = totalBytes > budgetBytes
    const exact = `${totalBytes.toLocaleString('en-US')} B vs ${budgetBytes.toLocaleString('en-US')} B`
    console.log(
      over
        ? `Storybook build ${formatBytes(totalBytes)} EXCEEDS budget ${maxMb} MB `
        + `by ${formatBytes(totalBytes - budgetBytes)} — ${exact}.`
        : `Storybook build ${formatBytes(totalBytes)} within budget ${maxMb} MB, `
          + `${formatBytes(budgetBytes - totalBytes)} spare — ${exact}.`,
    )
    if (over) {
      console.log(
        '\nThe ceiling is recorded ONCE, in '
        + 'packages/tooling/src/validators/docs-size-ceilings.json (`storybookStatic`), and '
        + '`yarn validate:docs-size` fails when this `--max-mb` and that file disagree. Raising '
        + 'one means raising both, deliberately, with the reason written down.',
      )
    }
    process.exit(over ? 1 : 0)
    return
  }

  console.log(`Storybook build size: ${formatBytes(totalBytes)} (non-blocking metric).`)
  process.exit(0)
}

main()
