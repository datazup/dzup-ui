import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// eslint-disable-next-line test/no-import-node-test -- This prose gate must run without a UI dependency installation.
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const read = path => readFileSync(resolve(root, path), 'utf8')
const json = path => JSON.parse(read(path))
function row(path, id) {
  return read(path).split('\n').find(line =>
    line.startsWith(`| ${id} |`) || line.startsWith(`| **${id}**`))
}

test('architecture reference counts the same Vue files as the token generator', () => {
  const count = readdirSync(resolve(root, 'packages/core/src/components'), { recursive: true }).filter(path => path.endsWith('.vue')).length
  const stated = read('CLAUDE.md').match(/\*\*(\d+)\*\* `\.vue` files/)
  assert.ok(stated, 'component count must remain visible')
  assert.equal(Number(stated[1]), count)
})

test('README run-count claim agrees with both Lighthouse configurations', () => {
  const desktop = json('apps/landing/lighthouserc.json').ci.collect.numberOfRuns
  const mobile = json('apps/landing/lighthouserc.mobile.json').ci.collect.numberOfRuns
  assert.equal(desktop, mobile)
  assert.match(read('README.md'), new RegExp(`median of ${desktop} runs`))
})

test('install dependency prose accounts for every Core dependency and its peers', () => {
  const manifest = json('packages/core/package.json')
  const install = read('apps/docs/guide/getting-started.md').split('## Generate the component utilities')[0]
  for (const dependency of Object.keys(manifest.dependencies))
    assert.ok(install.includes(`\`${dependency}\``), `install prose omits ${dependency}`)
  assert.match(install, /Vue and Reka UI are peers/)
})

test('PL-O2 records the landed public helper while retaining the tooling owner decision', () => {
  assert.ok(json('packages/testing/package.json').exports['./resolution'])
  const ledger = 'docs/program-2026-09-22-planning/EXECUTION-STATUS.md'
  assert.match(row(ledger, 'TASK-PL-O2'), /\[x\]/)
  assert.match(row(ledger, 'TASK-PL-O2'), /@dzup-ui\/testing\/resolution/)
  assert.match(row(ledger, 'PL-D1'), /open.*tooling|tooling.*open/)
})

test('ADR execution row records actual acceptance rather than pending signatures', () => {
  const ledger = 'docs/program-2026-09-22-architecture/EXECUTION-STATUS.md'
  const status = row(ledger, 'TASK-S0-O3')
  assert.match(status, /accepted.*2026-09-26/i)
  assert.doesNotMatch(status.split(' | ')[4], /signatures are still/)
  for (const prefix of ['ADR-18', 'ADR-19', 'ADR-20']) {
    // Resolve the actual ADR filename rather than duplicating its slug.
    const actual = readdirSync(resolve(root, 'docs/adr')).find(name => name.startsWith(prefix))
    assert.match(read(`docs/adr/${actual}`), /Status:\*\*\s+Accepted/)
  }
})

test('decision rows separate implemented stale/version gates from release qualification', () => {
  const register = 'docs/program-2026-09-04/reports/owner-decision-register-2026-09.md'
  const ceiling = json('packages/tooling/src/validators/capability-matrix-ceilings.json').staleCells.ceiling
  assert.ok(Number.isInteger(ceiling) && ceiling >= 0)
  assert.match(row(register, 'D143'), /implemented/i)
  assert.match(json('package.json').scripts['version-packages'], /sync:mcp-version/)
  assert.match(row(register, 'D146'), /implemented/i)
  assert.match(row(register, 'D146'), /qualification|publication/i)
})
