import type { VisualLaneId } from './platform.ts'
import process from 'node:process'
import { describeEnvironment, platformVerdict, readPlatformAuthority } from './platform.ts'

/**
 * The visual lane's platform preflight (TASK-S1-O3).
 *
 * Runs **before** the tokens build, the Storybook build and the browser — which
 * is the point. The in-run guard (`platform-guard.ts`) is the backstop for
 * somebody invoking `playwright test e2e/visual` directly; this is the one that
 * makes a wrong-platform run cost one second instead of four minutes, and, more
 * importantly, makes it impossible for a wrong-platform run to reach the code
 * that writes a PNG.
 *
 * Usage:
 *   tsx e2e/visual/preflight-platform.ts gallery theme-recipe
 *   tsx e2e/visual/preflight-platform.ts component-baselines
 *
 * Exit 0 when every named lane may run here; exit 1 with ONE refusal otherwise.
 */

let authority
try {
  authority = readPlatformAuthority()
}
catch (error) {
  console.error(`\n✗ visual:platform\n\n${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
}

// The set of lanes is read from the ledger, never hardcoded here. A second list
// would drift the first time a lane is added, and it would drift *silently* —
// the preflight would decline to check a lane that exists, which is the one
// failure mode this whole file is against.
const declared = authority.lanes.map(l => l.id)

function isLaneId(value: string): value is VisualLaneId {
  return declared.includes(value)
}

const requested = process.argv.slice(2).filter(arg => !arg.startsWith('-'))
const lanes: VisualLaneId[] = []

for (const arg of requested) {
  if (!isLaneId(arg)) {
    console.error(
      `visual:platform: unknown lane \`${arg}\`. Lanes declared in `
      + `e2e/visual/visual-baselines.json: ${declared.join(', ')}.`,
    )
    process.exit(1)
  }
  lanes.push(arg)
}

if (lanes.length === 0)
  lanes.push(...declared as VisualLaneId[])

const verdicts = lanes.map(id => platformVerdict(authority, id))
const refused = verdicts.filter(v => !v.ok)

console.warn('Visual lane — platform preflight (TASK-S1-O3)\n')
console.warn(`  authoritative  ${authority.authoritative}   (CI runs ${authority.ciPlatform})`)
console.warn(`  this run       ${describeEnvironment(verdicts[0]!.environment)}\n`)
for (const v of verdicts) {
  const mark = v.ok ? '✓' : '✗'
  console.warn(`  ${mark} ${v.lane.id.padEnd(20)} images for ${v.lane.capturedOn.padEnd(7)} · ${v.lane.role}`)
}

if (refused.length === 0) {
  console.warn('\n✓ visual:platform: every requested lane is on its authoritative platform.')
  process.exit(0)
}

// ONE refusal, whatever the number of refused lanes: the first is the cause and
// the rest are the same cause repeated. Their names are listed so the reader
// knows the scope without reading four copies of the same paragraph.
const [first] = refused
console.error(`\n✗ visual:platform — ${refused.length} lane(s) refused: ${refused.map(v => v.lane.id).join(', ')}\n`)
console.error(first!.ok ? '' : first!.message)
console.error('')
process.exit(1)
