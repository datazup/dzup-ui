#!/usr/bin/env node

/**
 * dzup-codemod CLI entry point.
 *
 * Usage:
 *   dzup-codemod <transform> <target-directory> [options]
 *
 * Transforms:
 *   rename-imports   Rewrite old import paths to @dzip-ui/core and @dzip-ui/pro
 *   rename-props     Rename deprecated props to vNext equivalents
 *   rename-events    Rename deprecated events to vNext equivalents
 *   all              Run all transforms in sequence
 *
 * Options:
 *   --dry-run        Preview changes without writing files
 *   --verbose        Print per-file status
 *   --extensions     Comma-separated file extensions (default: js,jsx,ts,tsx,vue)
 *   --parser         jscodeshift parser: babel | ts | tsx (default: tsx)
 *   --help           Show this help message
 *
 * Examples:
 *   dzup-codemod rename-imports ./src
 *   dzup-codemod all ./src --dry-run --verbose
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const TRANSFORMS = ['rename-imports', 'rename-props', 'rename-events', 'all']

function printHelp() {
  process.stdout.write(`
dzup-codemod - Migrate from old dzip-ui to vNext

Usage:
  dzup-codemod <transform> <target-directory> [options]

Transforms:
  rename-imports   Rewrite old import paths to @dzip-ui/core and @dzip-ui/pro
  rename-props     Rename deprecated props to vNext equivalents
  rename-events    Rename deprecated events to vNext equivalents
  all              Run all transforms in sequence

Options:
  --dry-run        Preview changes without writing files
  --verbose        Print per-file status
  --extensions     Comma-separated file extensions (default: js,jsx,ts,tsx,vue)
  --parser         jscodeshift parser: babel | ts | tsx (default: tsx)
  --help           Show this help message

Examples:
  dzup-codemod rename-imports ./src
  dzup-codemod all ./src --dry-run --verbose
`)
}

function parseArgs(argv) {
  const args = argv.slice(2)
  const opts = {
    transform: undefined,
    target: undefined,
    dryRun: false,
    verbose: false,
    extensions: undefined,
    parser: undefined,
    help: false,
  }

  const positional = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      opts.help = true
    }
    else if (arg === '--dry-run') {
      opts.dryRun = true
    }
    else if (arg === '--verbose' || arg === '-v') {
      opts.verbose = true
    }
    else if (arg === '--extensions' && i + 1 < args.length) {
      opts.extensions = args[++i].split(',')
    }
    else if (arg === '--parser' && i + 1 < args.length) {
      opts.parser = args[++i]
    }
    else if (!arg.startsWith('--')) {
      positional.push(arg)
    }
  }

  opts.transform = positional[0]
  opts.target = positional[1]

  return opts
}

async function loadTransform(name) {
  const modulePath = new URL(`../src/transforms/${name}.ts`, import.meta.url)
  // In production this would point to compiled JS; for development with
  // tsx / ts-node the .ts extension works directly.
  try {
    const mod = await import(modulePath.href)
    return mod.default ?? mod.transformer
  }
  catch {
    // Fallback: try .js extension (compiled output)
    const jsPath = new URL(`../src/transforms/${name}.js`, import.meta.url)
    const mod = await import(jsPath.href)
    return mod.default ?? mod.transformer
  }
}

async function main() {
  const opts = parseArgs(process.argv)

  if (opts.help || !opts.transform || !opts.target) {
    printHelp()
    process.exit(opts.help ? 0 : 1)
  }

  if (!TRANSFORMS.includes(opts.transform)) {
    process.stderr.write(
      `Unknown transform: ${opts.transform}\nAvailable: ${TRANSFORMS.join(', ')}\n`,
    )
    process.exit(1)
  }

  const targetPath = resolve(process.cwd(), opts.target)
  if (!existsSync(targetPath)) {
    process.stderr.write(`Target directory does not exist: ${targetPath}\n`)
    process.exit(1)
  }

  // Dynamically import the runner
  const { CodemodRunner } = await import('../src/runner.ts')

  const runnerOpts = {
    dryRun: opts.dryRun,
    verbose: opts.verbose,
  }

  if (opts.extensions)
    runnerOpts.extensions = opts.extensions
  if (opts.parser)
    runnerOpts.parser = opts.parser

  const runner = new CodemodRunner(runnerOpts)

  const transformNames
    = opts.transform === 'all'
      ? ['rename-imports', 'rename-props', 'rename-events']
      : [opts.transform]

  let allSuccess = true

  for (const name of transformNames) {
    process.stdout.write(`\nRunning transform: ${name}\n`)
    process.stdout.write(`${'─'.repeat(40)}\n`)

    const transform = await loadTransform(name)
    const result = await runner.run(transform, targetPath)

    if (!result.success) {
      allSuccess = false
    }
  }

  process.exit(allSuccess ? 0 : 1)
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`)
  process.exit(1)
})
