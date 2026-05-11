/* eslint-disable no-console */
/**
 * Generates an app-local DESIGN.md to dzup-ui implementation plan.
 *
 * The command is intentionally read-only. It inspects a target app, confirms
 * dzup-ui usage, inventories likely token/style/control touch points, and
 * writes a filled DESIGN_TO_DZUP_UI_PLAN.md for a follow-up implementation.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import process from 'node:process'

export interface DesignApplicationPlanOptions {
  appPath: string
  designPath: string
  tokensPath?: string
  mappingPath?: string
  outputPath?: string
}

export interface PackageUsage {
  packagePath: string | null
  usesCore: boolean
  usesTokens: boolean
  packageManager: string | null
}

export interface StyleUsage {
  coreStylesImports: string[]
  tokenCssImports: string[]
  themeProviderFiles: string[]
  dataThemeFiles: string[]
  candidateOverrideFiles: string[]
}

export interface ControlInventory {
  rawButtons: string[]
  rawInputs: string[]
  rawTextareas: string[]
  rawSelects: string[]
  rawTables: string[]
  dzupUiFiles: string[]
}

export interface GeneratedDesignApplicationPlan {
  markdown: string
  outputPath: string
  usage: PackageUsage
  styles: StyleUsage
  controls: ControlInventory
}

interface CliOptions extends Partial<DesignApplicationPlanOptions> {
  help: boolean
}

const DEFAULT_DESIGN_OUTPUT = 'DESIGN_TO_DZUP_UI_PLAN.md'

function uniq(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function readText(path: string): string {
  return readFileSync(path, 'utf8')
}

function rel(rootDir: string, path: string): string {
  return relative(rootDir, path).replaceAll('\\', '/')
}

function listFiles(rootDir: string, options: { extensions?: Set<string>, maxFiles?: number } = {}): string[] {
  const maxFiles = options.maxFiles ?? 5000
  const ignored = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.nuxt', '.output', '.vite'])
  const files: string[] = []

  function visit(dir: string): void {
    if (files.length >= maxFiles)
      return

    for (const entry of readdirSync(dir)) {
      if (ignored.has(entry))
        continue

      const fullPath = join(dir, entry)
      const stats = statSync(fullPath)
      if (stats.isDirectory()) {
        visit(fullPath)
        continue
      }

      if (!stats.isFile())
        continue

      if (options.extensions && !options.extensions.has(extname(entry)))
        continue

      files.push(fullPath)
    }
  }

  visit(rootDir)
  return files
}

function findNearestPackageJson(appDir: string): string | null {
  const packagePath = join(appDir, 'package.json')
  return existsSync(packagePath) ? packagePath : null
}

function readJsonObject(path: string): Record<string, unknown> {
  return JSON.parse(readText(path)) as Record<string, unknown>
}

function getDependencyNames(pkg: Record<string, unknown>): Set<string> {
  const names = new Set<string>()
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = pkg[key]
    if (!deps || typeof deps !== 'object' || Array.isArray(deps))
      continue

    for (const name of Object.keys(deps))
      names.add(name)
  }
  return names
}

function detectPackageUsage(appDir: string): PackageUsage {
  const packagePath = findNearestPackageJson(appDir)
  if (!packagePath) {
    return {
      packagePath: null,
      usesCore: false,
      usesTokens: false,
      packageManager: null,
    }
  }

  const pkg = readJsonObject(packagePath)
  const deps = getDependencyNames(pkg)
  return {
    packagePath,
    usesCore: deps.has('@dzup-ui/core'),
    usesTokens: deps.has('@dzup-ui/tokens'),
    packageManager: typeof pkg.packageManager === 'string' ? pkg.packageManager : null,
  }
}

function inspectStyleUsage(appDir: string, sourceFiles: string[]): StyleUsage {
  const styleCandidates = sourceFiles.filter((file) => {
    const extension = extname(file)
    return extension === '.css' || extension === '.scss' || extension === '.vue' || extension === '.ts' || extension === '.js'
  })

  const coreStylesImports: string[] = []
  const tokenCssImports: string[] = []
  const themeProviderFiles: string[] = []
  const dataThemeFiles: string[] = []
  const candidateOverrideFiles: string[] = []

  for (const file of styleCandidates) {
    const source = readText(file)
    const relativePath = rel(appDir, file)

    if (source.includes('@dzup-ui/core/styles'))
      coreStylesImports.push(relativePath)
    if (source.includes('@dzup-ui/tokens/css') || source.includes('@dzup-ui/tokens/tokens.css'))
      tokenCssImports.push(relativePath)
    if (source.includes('DzThemeProvider'))
      themeProviderFiles.push(relativePath)
    if (source.includes('data-theme') || source.includes('[data-theme'))
      dataThemeFiles.push(relativePath)

    const lowerName = basename(file).toLowerCase()
    if (
      (extname(file) === '.css' || extname(file) === '.scss')
      && (lowerName.includes('token') || lowerName.includes('theme') || lowerName.includes('main') || lowerName.includes('style'))
    ) {
      candidateOverrideFiles.push(relativePath)
    }
  }

  return {
    coreStylesImports: uniq(coreStylesImports),
    tokenCssImports: uniq(tokenCssImports),
    themeProviderFiles: uniq(themeProviderFiles),
    dataThemeFiles: uniq(dataThemeFiles),
    candidateOverrideFiles: uniq(candidateOverrideFiles),
  }
}

function inspectControls(appDir: string, sourceFiles: string[]): ControlInventory {
  const vueFiles = sourceFiles.filter(file => extname(file) === '.vue')
  const rawButtons: string[] = []
  const rawInputs: string[] = []
  const rawTextareas: string[] = []
  const rawSelects: string[] = []
  const rawTables: string[] = []
  const dzupUiFiles: string[] = []

  for (const file of vueFiles) {
    const source = readText(file)
    const relativePath = rel(appDir, file)
    if (/<button(?:\s|>)/.test(source))
      rawButtons.push(relativePath)
    if (/<input(?:\s|>)/.test(source))
      rawInputs.push(relativePath)
    if (/<textarea(?:\s|>)/.test(source))
      rawTextareas.push(relativePath)
    if (/<select(?:\s|>)/.test(source))
      rawSelects.push(relativePath)
    if (/<table(?:\s|>)/.test(source))
      rawTables.push(relativePath)
    if (source.includes('@dzup-ui/core') || /<Dz[A-Z][A-Za-z0-9]*/.test(source))
      dzupUiFiles.push(relativePath)
  }

  return {
    rawButtons: uniq(rawButtons),
    rawInputs: uniq(rawInputs),
    rawTextareas: uniq(rawTextareas),
    rawSelects: uniq(rawSelects),
    rawTables: uniq(rawTables),
    dzupUiFiles: uniq(dzupUiFiles),
  }
}

function readDesignExcerpt(designPath: string): string {
  const source = readText(designPath)
  const headings = source
    .split('\n')
    .filter(line => /^#{1,3}\s+/.test(line))
    .slice(0, 12)
    .map(line => `- ${line.replace(/^#{1,3}\s+/, '')}`)

  if (headings.length > 0)
    return headings.join('\n')

  return source
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map(line => `- ${line}`)
    .join('\n')
}

function formatFileList(files: string[], emptyText = 'Not found in first-pass scan'): string {
  if (files.length === 0)
    return emptyText

  return files.map(file => `\`${file}\``).join(', ')
}

function formatControlRows(controls: ControlInventory): string {
  const rows: string[] = []
  for (const file of controls.rawButtons)
    rows.push(`| Raw \`<button>\` | \`DzButton\`, \`DzIconButton\`, or action semantics | \`${file}\` | Confirm submit/navigation behavior before migration |`)
  for (const file of controls.rawInputs)
    rows.push(`| Raw \`<input>\` | \`DzInput\`, \`DzInputGroup\`, or matching form component | \`${file}\` | Preserve labels, validation, model bindings, and autocomplete |`)
  for (const file of controls.rawTextareas)
    rows.push(`| Raw \`<textarea>\` | \`DzTextarea\` | \`${file}\` | Preserve resize, validation, and model bindings |`)
  for (const file of controls.rawSelects)
    rows.push(`| Raw \`<select>\` | \`DzSelect\` or existing select pattern | \`${file}\` | Confirm keyboard and option behavior before migration |`)
  for (const file of controls.rawTables)
    rows.push(`| Raw \`<table>\` | \`DzTable\` or \`DzDataGrid\` | \`${file}\` | Preserve row keys, sorting, pagination, and a11y roles |`)

  if (rows.length === 0)
    rows.push('| No raw control candidates found | Keep current dzup-ui usage | n/a | No migration risk found by static scan |')

  return rows.join('\n')
}

function formatTokenRows(styles: StyleUsage): string {
  const targetFile = styles.candidateOverrideFiles[0] ?? 'Add app-owned stylesheet, for example `src/styles/design-tokens.css`'
  return [
    `| DESIGN.md color roles | Existing dzup-ui semantic tokens such as \`--dz-background\`, \`--dz-foreground\`, \`--dz-primary\`, \`--dz-ring\` | ${targetFile.startsWith('Add ') ? targetFile : `\`${targetFile}\``} | Map reviewed app roles to overrides; do not edit dzup-ui token sources by default |`,
    `| DESIGN.md spacing/radius/elevation | Existing primitive or component tokens such as \`--dz-spacing-*\`, \`--dz-radius-*\`, \`--dz-shadow-*\`, \`--dz-button-radius\` | ${targetFile.startsWith('Add ') ? targetFile : `\`${targetFile}\``} | Use nearest existing token and keep one-off values app-owned |`,
    `| DESIGN.md component buckets | Component tokens such as \`--dz-button-*\`, \`--dz-input-*\`, \`--dz-sidebar-*\` | ${targetFile.startsWith('Add ') ? targetFile : `\`${targetFile}\``} | Apply only when the value belongs to one component family |`,
  ].join('\n')
}

function renderMarkdown(options: {
  appDir: string
  designPath: string
  tokensPath?: string
  mappingPath: string
  usage: PackageUsage
  styles: StyleUsage
  controls: ControlInventory
}): string {
  const designExcerpt = readDesignExcerpt(options.designPath)
  const packagePath = options.usage.packagePath ? rel(options.appDir, options.usage.packagePath) : 'not found'
  const packageManager = options.usage.packageManager ?? 'not declared'
  const appName = basename(options.appDir)

  return `# DESIGN.md to dzup-ui Application Plan

## Scope
- Target app: \`${options.appDir}\`
- Design contract: \`${options.designPath}\`
- Structured tokens: ${options.tokensPath ? `\`${options.tokensPath}\`` : 'not provided'}
- dzup-ui mapping rules: \`${options.mappingPath}\`
- App package file: \`${packagePath}\`
- Package manager: \`${packageManager}\`
- Routes/components touched: pending implementation pass

## First-Pass Findings
- Uses \`@dzup-ui/core\`: ${options.usage.usesCore ? 'yes' : 'no'}
- Uses \`@dzup-ui/tokens\`: ${options.usage.usesTokens ? 'yes' : 'no'}
- Imports \`@dzup-ui/core/styles\`: ${formatFileList(options.styles.coreStylesImports)}
- Imports \`@dzup-ui/tokens/css\`: ${formatFileList(options.styles.tokenCssImports)}
- Theme provider files: ${formatFileList(options.styles.themeProviderFiles)}
- \`data-theme\` files: ${formatFileList(options.styles.dataThemeFiles)}
- Candidate override files: ${formatFileList(options.styles.candidateOverrideFiles)}
- Existing dzup-ui component files: ${formatFileList(options.controls.dzupUiFiles)}

## DESIGN.md Signals
${designExcerpt || '- No headings or summary lines found'}

## Token Overrides
| DESIGN.md source | dzup-ui token | File | Decision |
| --- | --- | --- | --- |
${formatTokenRows(options.styles)}

## Control Migration
| Current pattern | dzup-ui target | File | Risk |
| --- | --- | --- | --- |
${formatControlRows(options.controls)}

## Implementation Checklist
- [ ] Confirm the app's local repository instructions before editing.
- [ ] Add or update app-owned \`--dz-*\` overrides in the selected stylesheet.
- [ ] Keep reusable \`ui/dzup-ui/packages/tokens/src/*\` unchanged unless a separate library-token task is approved.
- [ ] Migrate only raw controls whose behavior matches a dzup-ui component.
- [ ] Preserve routing, API calls, state management, dirty files, and generated design evidence.
- [ ] Write a patch summary to \`DESIGN_TO_DZUP_UI_PATCH_SUMMARY.md\` after implementation if the slice is broad.

## Validation
- [ ] typecheck: run the target app's focused typecheck command.
- [ ] lint: run the target app's focused lint command when configured.
- [ ] tests: run focused tests for touched routes/components.
- [ ] browser smoke: run for layout-sensitive changes when the app can start locally.

## Out Of Scope
- Reusable dzup-ui library token changes
- Public component API changes
- Generated evidence mutation
- App feature, routing, API, or data-flow refactors

## Prompt
Use \`DESIGN_MD_APPLICATION_PROMPT.md\` with:

\`\`\`text
Target app: ${options.appDir}
Design contract: ${options.designPath}
Optional structured tokens: ${options.tokensPath ?? '<none provided>'}
dzup-ui mapping rules: ${options.mappingPath}
\`\`\`

## Notes
- This file was generated by \`yarn design:application-plan --app <path> --design <path>\`.
- The scan is static and conservative. Treat each migration row as a candidate until behavior is verified in code and, where needed, the browser.
- Plan owner: ${appName}
`
}

export function generateDesignApplicationPlan(options: DesignApplicationPlanOptions): GeneratedDesignApplicationPlan {
  const appDir = resolve(options.appPath)
  const designPath = resolve(options.designPath)
  const mappingPath = resolve(options.mappingPath ?? join(import.meta.dirname, '..', '..', '..', 'MAPPING_TOKENS.md'))
  const outputPath = resolve(options.outputPath ?? join(appDir, DEFAULT_DESIGN_OUTPUT))
  const tokensPath = options.tokensPath ? resolve(options.tokensPath) : undefined

  if (!existsSync(appDir))
    throw new Error(`Target app does not exist: ${appDir}`)
  if (!statSync(appDir).isDirectory())
    throw new Error(`Target app is not a directory: ${appDir}`)
  if (!existsSync(designPath))
    throw new Error(`Design contract does not exist: ${designPath}`)
  if (!existsSync(mappingPath))
    throw new Error(`Mapping rules do not exist: ${mappingPath}`)
  if (tokensPath && !existsSync(tokensPath))
    throw new Error(`Structured tokens file does not exist: ${tokensPath}`)

  const sourceFiles = listFiles(appDir, {
    extensions: new Set(['.vue', '.ts', '.js', '.css', '.scss', '.json', '.md']),
  })
  const usage = detectPackageUsage(appDir)
  const styles = inspectStyleUsage(appDir, sourceFiles)
  const controls = inspectControls(appDir, sourceFiles)
  const markdown = renderMarkdown({
    appDir,
    designPath,
    tokensPath,
    mappingPath,
    usage,
    styles,
    controls,
  })

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, markdown)

  return {
    markdown,
    outputPath,
    usage,
    styles,
    controls,
  }
}

function readOptionValue(argv: string[], index: number, option: string): string {
  const value = argv[index + 1]
  if (!value || value.startsWith('-'))
    throw new Error(`Missing value for ${option}`)

  return value
}

export function parseDesignApplicationPlanArgs(argv: string[]): CliOptions {
  const options: CliOptions = { help: false }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--app') {
      options.appPath = readOptionValue(argv, index, arg)
      index += 1
      continue
    }
    if (arg === '--design') {
      options.designPath = readOptionValue(argv, index, arg)
      index += 1
      continue
    }
    if (arg === '--tokens') {
      options.tokensPath = readOptionValue(argv, index, arg)
      index += 1
      continue
    }
    if (arg === '--mapping') {
      options.mappingPath = readOptionValue(argv, index, arg)
      index += 1
      continue
    }
    if (arg === '--out') {
      options.outputPath = readOptionValue(argv, index, arg)
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function printUsage(): void {
  console.log(`Usage:
  yarn design:application-plan --app <app-path> --design <design-md> [--tokens <tokens-json>] [--mapping <mapping-md>] [--out <plan-md>]

Examples:
  yarn design:application-plan --app ../apps/my-app --design ../apps/my-app/DESIGN.md
  yarn design:application-plan --app ../apps/my-app --design ../apps/my-app/DESIGN.md --tokens ../apps/my-app/DESIGN.tokens.generated.json --out ../apps/my-app/docs/DESIGN_TO_DZUP_UI_PLAN.md
`)
}

function main(): void {
  try {
    const options = parseDesignApplicationPlanArgs(process.argv.slice(2))
    if (options.help) {
      printUsage()
      return
    }

    if (!options.appPath || !options.designPath)
      throw new Error('Both --app and --design are required.')

    const result = generateDesignApplicationPlan({
      appPath: options.appPath,
      designPath: options.designPath,
      tokensPath: options.tokensPath,
      mappingPath: options.mappingPath,
      outputPath: options.outputPath,
    })

    console.log(`Wrote ${result.outputPath}`)
    if (!result.usage.usesCore || !result.usage.usesTokens) {
      console.warn('Warning: target package.json does not declare both @dzup-ui/core and @dzup-ui/tokens.')
    }
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

const isDirectRun = process.argv[1]?.includes('design-application-plan')
if (isDirectRun) {
  main()
}
