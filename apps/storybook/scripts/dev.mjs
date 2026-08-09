import { spawn } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PREPARATION_COMMANDS = [
  ['workspace', '@dzup-ui/landing', 'build:counts'],
  ['workspace', '@dzup-ui/storybook', 'build:releases'],
  ['workspace', '@dzup-ui/storybook', 'build:playground'],
  ['workspace', '@dzup-ui/storybook', 'build:llms'],
  ['workspace', '@dzup-ui/storybook', 'build:playground-snippets'],
]

export function preparationEnvironment(env) {
  const prepared = { ...env }
  delete prepared.APP_ENV
  delete prepared.VITE_PUBLIC_URL
  return prepared
}

export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options)
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0)
        resolve()
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })
}

export async function main({
  argv = process.argv.slice(2),
  env = process.env,
  command = process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
  cwd = fileURLToPath(new URL('../../..', import.meta.url)),
  execute = run,
} = {}) {
  const preparedEnv = preparationEnvironment(env)
  for (const args of PREPARATION_COMMANDS) {
    await execute(command, args, { cwd, env: preparedEnv, stdio: 'inherit' })
  }
  await execute(command, ['workspace', '@dzup-ui/storybook', 'exec', 'storybook', 'dev', '-p', '6006', ...argv], {
    cwd,
    env,
    stdio: 'inherit',
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
