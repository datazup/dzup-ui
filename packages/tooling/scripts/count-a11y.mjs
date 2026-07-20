/* eslint-disable no-console -- ad-hoc CLI report; console.log is its output */
// Ad-hoc: parse a Vitest JSON report from the storybook a11y run at test:'error'
// and print per-family FAILING-STORY counts (one assertion == one story export).
// Usage: node packages/tooling/scripts/count-a11y.mjs <path-to-json>
import { readFileSync } from 'node:fs'
import process from 'node:process'

const file = process.argv[2] ?? 'apps/storybook/a11y-report/a11y-results.json'
const json = JSON.parse(readFileSync(file, 'utf8'))

const FAMILY_ORDER = [
  'buttons',
  'inputs',
  'forms',
  'cards',
  'data',
  'feedback',
  'layout',
  'navigation',
  'overlays',
  'media',
  'typography',
]

const famFail = Object.fromEntries(FAMILY_ORDER.map(f => [f, 0]))
const famTotal = Object.fromEntries(FAMILY_ORDER.map(f => [f, 0]))
let other = 0

const results = json.testResults ?? json.tests ?? []
for (const tr of results) {
  const name = (tr.name ?? tr.file ?? '').replace(/\\/g, '/')
  const m = name.match(/stories\/([^/]+)\//)
  const fam = m?.[1]
  const assertions = tr.assertionResults ?? tr.tasks ?? []
  for (const a of assertions) {
    const status = a.status ?? a.state ?? a.result?.state
    if (fam && fam in famTotal) {
      famTotal[fam]++
      if (status === 'failed' || status === 'fail')
        famFail[fam]++
    }
    else if (status === 'failed' || status === 'fail') {
      other++
    }
  }
}

console.log('Family        Failing / Total')
let sum = 0
for (const f of FAMILY_ORDER) {
  console.log(`${f.padEnd(12)}  ${String(famFail[f]).padStart(4)} / ${famTotal[f]}`)
  sum += famFail[f]
}
console.log(`${'(other)'.padEnd(12)}  ${String(other).padStart(4)}`)
console.log(`TOTAL failing stories: ${sum + other}`)
