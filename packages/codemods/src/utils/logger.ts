/**
 * Logger and stats utilities for codemod output.
 *
 * Keeps a running tally of processed / modified / skipped / errored files
 * and prints a human-readable summary at the end of a run.
 */

import process from 'node:process'

/** Aggregated statistics for a codemod run. */
export interface TransformStats {
  filesProcessed: number
  filesModified: number
  filesSkipped: number
  filesErrored: number
  errors: ReadonlyArray<{ file: string, error: string }>
}

export class CodemodLogger {
  private stats: {
    filesProcessed: number
    filesModified: number
    filesSkipped: number
    filesErrored: number
    errors: Array<{ file: string, error: string }>
  } = {
    filesProcessed: 0,
    filesModified: 0,
    filesSkipped: 0,
    filesErrored: 0,
    errors: [],
  }

  incrementProcessed(): void {
    this.stats.filesProcessed++
  }

  incrementModified(): void {
    this.stats.filesModified++
  }

  incrementSkipped(): void {
    this.stats.filesSkipped++
  }

  logError(file: string, error: string): void {
    this.stats.errors.push({ file, error })
    this.stats.filesErrored++
  }

  getStats(): TransformStats {
    return { ...this.stats, errors: [...this.stats.errors] }
  }

  printSummary(): void {
    const { filesProcessed, filesModified, filesSkipped, filesErrored, errors } = this.stats

    process.stdout.write('\n=== Codemod Summary ===\n')
    process.stdout.write(`Files processed: ${String(filesProcessed)}\n`)
    process.stdout.write(`Files modified:  ${String(filesModified)}\n`)
    process.stdout.write(`Files skipped:   ${String(filesSkipped)}\n`)

    if (filesErrored > 0) {
      process.stdout.write(`Files errored:   ${String(filesErrored)}\n`)
    }

    if (errors.length > 0) {
      process.stdout.write('\nErrors:\n')
      for (const { file, error } of errors) {
        process.stdout.write(`  ${file}: ${error}\n`)
      }
    }

    process.stdout.write('\n')
  }
}
