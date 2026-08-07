import assert from 'node:assert/strict'
import test from 'node:test'
import { main, preparationEnvironment } from './dev.mjs'

test('preparation removes remote-development host state only for generated artifacts', () => {
  const prepared = preparationEnvironment({
    APP_ENV: 'development-remote',
    VITE_PUBLIC_URL: 'https://dzup-ui-storybook.dev.dziphost.com/',
    VITE_PORT: '6006',
    KEEP: 'value',
  })

  assert.deepEqual(prepared, { VITE_PORT: '6006', KEEP: 'value' })
})

test('remote development is restored for the Storybook server after preparation', async () => {
  const calls = []
  const env = {
    APP_ENV: 'development-remote',
    VITE_PUBLIC_URL: 'https://dzup-ui-storybook.dev.dziphost.com/',
  }

  await main({
    argv: ['--host', '0.0.0.0'],
    env,
    command: 'yarn',
    cwd: '/workspace/ui/dzup-ui',
    execute: async (command, args, options) => calls.push({ command, args, options }),
  })

  assert.equal(calls.length, 6)
  for (const call of calls.slice(0, 5)) {
    assert.equal(call.options.env.APP_ENV, undefined)
    assert.equal(call.options.env.VITE_PUBLIC_URL, undefined)
  }
  assert.equal(calls[5].options.env, env)
  assert.deepEqual(calls[5].args, [
    'workspace', '@dzup-ui/storybook', 'exec', 'storybook', 'dev', '-p', '6006', '--host', '0.0.0.0',
  ])
})
