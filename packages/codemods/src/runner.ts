/**
 * Codemod runner.
 *
 * Discovers files, applies a jscodeshift-compatible transform, handles
 * Vue SFC extraction, and reports results.
 *
 * @module
 */

import type { TransformStats } from './utils/logger.js'
import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { globSync } from 'glob'
import { CodemodLogger } from './utils/logger.js'
import { extractScriptFromVue, isVueFile, replaceScriptInVue } from './utils/vue-sfc.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A jscodeshift-compatible transform function. */
export type TransformFn = (
  file: { path: string, source: string },
  api: { jscodeshift: JscodeshiftAPI, stats: () => void },
  options: Record<string, unknown>,
) => string | null

/**
 * Minimal jscodeshift API surface used by the runner.
 * We import jscodeshift lazily so the module can be loaded without it
 * installed (e.g. for type-checking only).
 */
interface JscodeshiftAPI {
  (source: string): unknown
  withParser: (parser: string) => JscodeshiftAPI
  [key: string]: unknown
}

/** Options accepted by {@link CodemodRunner}. */
export interface RunnerOptions {
  /** When true, do not write files — only report what would change. */
  dryRun?: boolean
  /** File extensions to process (without leading dot). */
  extensions?: string[]
  /** Glob patterns to ignore. */
  ignore?: string[]
  /** jscodeshift parser to use. */
  parser?: 'babel' | 'ts' | 'tsx'
  /** Print per-file status messages. */
  verbose?: boolean
}

interface ResolvedOptions {
  dryRun: boolean
  extensions: string[]
  ignore: string[]
  parser: 'babel' | 'ts' | 'tsx'
  verbose: boolean
}

/** Result returned by {@link CodemodRunner.run}. */
export interface RunResult {
  success: boolean
  stats: TransformStats
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export class CodemodRunner {
  private readonly logger = new CodemodLogger()
  private readonly options: ResolvedOptions

  constructor(options: RunnerOptions = {}) {
    this.options = {
      dryRun: options.dryRun ?? false,
      extensions: options.extensions ?? ['js', 'jsx', 'ts', 'tsx', 'vue'],
      ignore: options.ignore ?? ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      parser: options.parser ?? 'tsx',
      verbose: options.verbose ?? false,
    }
  }

  /**
   * Run a transform against all matching files under `targetPath`.
   *
   * @param transform - The transform function (default export of a codemod file).
   * @param targetPath - Directory to scan for files.
   * @returns A {@link RunResult} with success status and statistics.
   */
  async run(transform: TransformFn, targetPath: string): Promise<RunResult> {
    const files = this.findFiles(targetPath)

    if (this.options.verbose) {
      process.stdout.write(`Found ${String(files.length)} file(s) in ${targetPath}\n`)
    }

    if (files.length === 0) {
      process.stdout.write('No files to transform.\n')
      return { success: true, stats: this.logger.getStats() }
    }

    // Lazy-import jscodeshift so the module can load without it.
    const jscodeshift = await this.loadJscodeshift()

    for (const file of files) {
      this.processFile(file, transform, jscodeshift)
    }

    this.logger.printSummary()

    return {
      success: this.logger.getStats().filesErrored === 0,
      stats: this.logger.getStats(),
    }
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private findFiles(targetPath: string): string[] {
    const exts = this.options.extensions.join(',')
    const pattern = `${targetPath}/**/*.{${exts}}`
    return globSync(pattern, {
      ignore: this.options.ignore,
      absolute: true,
    })
  }

  private processFile(
    filePath: string,
    transform: TransformFn,
    jscodeshift: JscodeshiftAPI,
  ): void {
    this.logger.incrementProcessed()

    try {
      const source = readFileSync(filePath, 'utf-8')
      let result: string | null = null

      if (isVueFile(filePath)) {
        result = this.transformVueFile(filePath, source, transform, jscodeshift)
      }
      else {
        result = this.transformJsFile(filePath, source, transform, jscodeshift)
      }

      if (result !== null && result !== source) {
        if (!this.options.dryRun) {
          writeFileSync(filePath, result, 'utf-8')
        }
        this.logger.incrementModified()
        if (this.options.verbose) {
          process.stdout.write(`  modified: ${filePath}\n`)
        }
      }
      else {
        this.logger.incrementSkipped()
        if (this.options.verbose) {
          process.stdout.write(`  skipped:  ${filePath}\n`)
        }
      }
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.logError(filePath, message)
      if (this.options.verbose) {
        process.stderr.write(`  error:    ${filePath}: ${message}\n`)
      }
    }
  }

  private transformJsFile(
    filePath: string,
    source: string,
    transform: TransformFn,
    jscodeshift: JscodeshiftAPI,
  ): string | null {
    const fileInfo = { path: filePath, source }
    const api = {
      jscodeshift: jscodeshift.withParser(this.options.parser),
      stats: () => {},
    }
    return transform(fileInfo, api, { dryRun: this.options.dryRun })
  }

  private transformVueFile(
    filePath: string,
    source: string,
    transform: TransformFn,
    jscodeshift: JscodeshiftAPI,
  ): string | null {
    // Many transforms handle Vue files themselves (template + script).
    // Try the transform on the whole file first — if the transform is
    // Vue-aware it will handle extraction internally.
    const wholeFileResult = transform(
      { path: filePath, source },
      { jscodeshift: jscodeshift.withParser(this.options.parser), stats: () => {} },
      { dryRun: this.options.dryRun },
    )

    if (wholeFileResult !== null) {
      return wholeFileResult
    }

    // Fallback: extract script and transform it in isolation.
    const extraction = extractScriptFromVue(source)
    if (!extraction)
      return null

    const scriptResult = this.transformJsFile(
      filePath,
      extraction.script,
      transform,
      jscodeshift,
    )

    if (scriptResult !== null && scriptResult !== extraction.script) {
      return replaceScriptInVue(source, scriptResult, extraction)
    }

    return null
  }

  private async loadJscodeshift(): Promise<JscodeshiftAPI> {
    try {
      const mod = await import('jscodeshift')
      return (mod.default ?? mod) as JscodeshiftAPI
    }
    catch {
      throw new Error(
        'jscodeshift is required but not installed. Run: yarn add jscodeshift',
      )
    }
  }
}
