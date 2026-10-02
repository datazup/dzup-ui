import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
// Plain Node proves the packed export without Vitest aliases or transforms.
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'

// The evidence runner builds and packs the package, then extracts it here.
// This directory is outside the repository, with no workspace aliases/links.
const fixture = process.env.DZUP_RESOLUTION_CONSUMER_ROOT
const compiler = process.env.DZUP_RESOLUTION_TSC
assert.ok(fixture, 'set DZUP_RESOLUTION_CONSUMER_ROOT to the isolated packed consumer')
assert.ok(compiler, 'set DZUP_RESOLUTION_TSC to the TypeScript compiler')

function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: fixture, encoding: 'utf8' })
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
}

test('a packed public resolution export works without workspace aliases or TS loaders', () => {
  const manifest = JSON.parse(readFileSync(join(fixture, 'node_modules/@dzup-ui/testing/package.json'), 'utf8'))
  assert.notEqual(manifest.private, true)
  writeFileSync(join(fixture, 'package.json'), JSON.stringify({ type: 'module' }))
  // A minimal library checkout proves that the consumer chooses exports and
  // peers from the supplied root, rather than the helper's installed location.
  const library = join(fixture, 'library')
  mkdirSync(join(library, 'packages/core/dist'), { recursive: true })
  writeFileSync(join(library, 'packages/core/package.json'), JSON.stringify({
    name: '@dzup-ui/core',
    type: 'module',
    exports: { '.': { import: './dist/index.js' }, './providers': { import: './dist/providers.js' } },
    peerDependencies: { 'vue': '^3.5.0', 'reka-ui': '^2.0.0' },
  }))
  writeFileSync(join(library, 'packages/core/dist/index.js'), 'export const marker = "core"\n')
  writeFileSync(join(library, 'packages/core/dist/providers.js'), 'export const marker = "providers"\n')
  writeFileSync(join(fixture, 'consumer.mjs'), `
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { createDzupResolution, toViteAliases } from '@dzup-ui/testing/resolution'
const result = createDzupResolution({ mode: 'externalized', root: ${JSON.stringify(library)}, packages: ['@dzup-ui/core'] })
assert.deepEqual(result.dedupe, ['reka-ui', 'vue'])
assert.deepEqual(result.optimizeDeps.exclude, [])
assert.deepEqual(result.alias.map(entry => entry.find), ['@dzup-ui/core/providers', '@dzup-ui/core'])
assert.deepEqual(toViteAliases(result), result.alias.map(({ find, replacement }) => ({ find, replacement })))
for (const entry of result.alias) {
  assert.equal(entry.origin, 'exports')
  const loaded = await import(pathToFileURL(entry.replacement).href)
  assert.equal(loaded.marker, entry.find.endsWith('/providers') ? 'providers' : 'core')
}
`)
  run([join(fixture, 'consumer.mjs')])
  writeFileSync(join(fixture, 'consumer.ts'), `
import { createDzupResolution, toViteAliases } from '@dzup-ui/testing/resolution'
import type { DzupResolution, DzupResolutionMode, DzupResolutionOptions } from '@dzup-ui/testing/resolution'
const mode: DzupResolutionMode = 'externalized'
const options: DzupResolutionOptions = { mode, root: ${JSON.stringify(library)}, packages: ['@dzup-ui/core'] }
const resolution: DzupResolution = createDzupResolution(options)
toViteAliases(resolution)
`)
  run([compiler, '--noEmit', '--strict', '--skipLibCheck', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', join(fixture, 'consumer.ts')])
})

test('the external guide uses the tested public import', () => {
  const guide = readFileSync(resolve(import.meta.dirname, '../../..', 'docs/resolution-external-consumers.md'), 'utf8')
  assert.match(guide, /import \{ createDzupResolution \} from '@dzup-ui\/testing\/resolution'/)
  assert.doesNotMatch(guide, /from '@dzup-ui\/tooling\/resolution'/)
})
