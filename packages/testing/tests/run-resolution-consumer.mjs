import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, symlinkSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

export const root = resolve(import.meta.dirname, '../../..')
const require = createRequire(join(root, 'package.json'))

export function runYarn(args) {
  // Yarn supplies its own executable; no global Yarn version or install needed.
  assert.ok(process.env.npm_execpath, 'invoke this gate with yarn test:resolution:packed or yarn test:csp:packed')
  execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    timeout: 600_000,
  })
}

export function createConsumer(prefix) {
  const stage = mkdtempSync(join(tmpdir(), prefix))
  assert.ok(!stage.startsWith(`${root}/`), 'packed consumers must be outside the repository')
  mkdirSync(join(stage, 'node_modules/@dzup-ui'), { recursive: true })
  return stage
}

export function packPackage(name, stage) {
  const tarball = join(stage, `${name}.tgz`)
  runYarn(['workspace', `@dzup-ui/${name}`, 'pack', '--out', tarball])
  const target = join(stage, 'node_modules/@dzup-ui', name)
  mkdirSync(target, { recursive: true })
  execFileSync('tar', ['-xzf', tarball, '--strip-components=1', '-C', target])
  return target
}

export function linkConsumerDependencies(stage) {
  // Only external dependencies are reused. Every @dzup-ui package under test
  // must come from a tarball, never a source alias or workspace package link.
  const modules = join(root, 'node_modules')
  for (const name of readdirSync(modules)) {
    if (name.startsWith('.') || name === '@dzup-ui')
      continue
    const target = join(stage, 'node_modules', name)
    if (!existsSync(target))
      symlinkSync(join(modules, name), target)
  }
}

function main() {
  const stage = createConsumer('dzup-resolution-')
  console.warn(`Packed resolution evidence: ${stage}`)
  runYarn(['workspace', '@dzup-ui/testing', 'build'])
  packPackage('testing', stage)
  execFileSync(process.execPath, ['--test', join(import.meta.dirname, 'resolution-consumer.test.mjs')], {
    cwd: stage,
    env: {
      ...process.env,
      DZUP_RESOLUTION_CONSUMER_ROOT: stage,
      DZUP_RESOLUTION_TSC: require.resolve('typescript/bin/tsc'),
    },
    stdio: 'inherit',
    timeout: 120_000,
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main()
