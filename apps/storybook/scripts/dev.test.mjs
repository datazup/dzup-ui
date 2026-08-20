import { expect, it } from 'vitest'
import { main, preparationEnvironment } from './dev.mjs'

it('preparation removes remote-development host state only for generated artifacts', () => {
  const prepared = preparationEnvironment({
    APP_ENV: 'development-remote',
    VITE_PUBLIC_URL: 'https://dzup-ui-storybook.dev.dziphost.com/',
    VITE_PORT: '6006',
    KEEP: 'value',
  })

  expect(prepared).toEqual({ VITE_PORT: '6006', KEEP: 'value' })
})

it('remote development is restored for the Storybook server after preparation', async () => {
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

  expect(calls).toHaveLength(6)
  for (const call of calls.slice(0, 5)) {
    expect(call.options.env.APP_ENV).toBeUndefined()
    expect(call.options.env.VITE_PUBLIC_URL).toBeUndefined()
  }
  expect(calls[5].options.env).toBe(env)
  expect(calls[5].args).toEqual([
    'workspace',
    '@dzup-ui/storybook',
    'exec',
    'storybook',
    'dev',
    '-p',
    '6006',
    '--host',
    '0.0.0.0',
  ])
})
