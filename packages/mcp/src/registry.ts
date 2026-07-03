/**
 * RegistryClient — the single data layer behind every MCP tool.
 *
 * dzup-ui already generates a complete, shadcn-compatible catalog as STATIC
 * artifacts under the landing site's `public/` dir (see
 * `apps/landing/scripts/build-registry.ts` and `build-llms.mjs`):
 *
 *   /r/registry.json            — blocks index (shadcn `registry.json`)
 *   /r/<id>.json                — one block item, its SFC inlined in files[]
 *   /r/templates/registry.json  — templates index
 *   /r/templates/<id>.json      — one template item
 *   /r/tokens.json              — the --dz-* design tokens as light/dark cssVars
 *   /llms.txt, /llms-full.txt   — AI-readable blocks docs
 *   /storybook/llms.txt         — component API index (import path + taxonomy + props)
 *   /storybook/llms-full.txt    — full per-component props/emits/slots + usage
 *
 * This client is a thin, cached reader over those files so the MCP server has
 * exactly ONE source of truth — the same bytes the website ships — rather than a
 * second, drifting copy of the catalog. It never mutates anything.
 *
 * Resolution modes (chosen from the base string):
 *   • `https://…`  — fetch over HTTP (production: the deployed site origin).
 *   • a local path — dev convenience: resolve `/storybook/*` under
 *     `apps/storybook/public` and everything else under `apps/landing/public`,
 *     relative to the repo root (falls back to `<base>/<path>` for a flat mirror).
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Default public origin serving the generated registry (registry.json `homepage`). */
export const DEFAULT_REGISTRY_URL = 'https://dzup-ui.dev'

/** A single item as it appears in a shadcn `registry.json` index. */
export interface RegistryIndexItem {
  name: string
  type: string
  title?: string
  description?: string
  categories?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  meta?: { components?: string[], tier?: string, [k: string]: unknown }
  files?: Array<{ path: string, type?: string, target?: string }>
}

/** A shadcn `registry.json` index (blocks or templates). */
export interface RegistryIndex {
  name: string
  homepage?: string
  items: RegistryIndexItem[]
}

/** A single resolved registry item (`/r/<id>.json`), SFC source inlined. */
export interface RegistryItem extends RegistryIndexItem {
  files?: Array<{ path: string, type?: string, target?: string, content?: string }>
}

/** The tokens theme item (`/r/tokens.json`). */
export interface TokensItem {
  name: string
  type: string
  title?: string
  description?: string
  cssVars?: { light?: Record<string, string>, dark?: Record<string, string> }
}

/** One component parsed out of the storybook `llms.txt` index. */
export interface ComponentSummary {
  name: string
  family: string
  description: string
  /** Raw follow-on lines from the index (props list, taxonomy) as a flat string. */
  details: string
}

/** Reader signature — `(sitePath) => contents`. Injectable for tests. */
export type Reader = (sitePath: string) => Promise<string>

/** True for an absolute http(s) base — HTTP mode; anything else is a local path. */
function isHttp(base: string): boolean {
  return /^https?:\/\//i.test(base)
}

/**
 * Build the default reader for a base. HTTP bases fetch; local bases map site
 * paths onto the two `public/` dirs of the monorepo (see file header).
 */
export function createReader(base: string): Reader {
  if (isHttp(base)) {
    const origin = base.replace(/\/+$/, '')
    return async (sitePath) => {
      const url = `${origin}${sitePath}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)
      return res.text()
    }
  }
  // Local dev mode: <repoRoot>/apps/{landing,storybook}/public mirror the site.
  const root = base.replace(/[/\\]+$/, '')
  return async (sitePath) => {
    const rel = sitePath.replace(/^\//, '')
    const candidates = rel.startsWith('storybook/')
      ? [
          join(root, 'apps/storybook/public', rel.slice('storybook/'.length)),
          join(root, sitePath),
        ]
      : [join(root, 'apps/landing/public', rel), join(root, sitePath)]
    let lastErr: unknown
    for (const p of candidates) {
      try {
        return await readFile(p, 'utf8')
      }
      catch (err) {
        lastErr = err
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(`Cannot read ${sitePath}`)
  }
}

export interface RegistryClientOptions {
  /** Origin URL or local path. Defaults to $DZUP_UI_REGISTRY_URL or the public site. */
  base?: string
  /** Override the reader entirely (tests). Takes precedence over `base`. */
  reader?: Reader
}

/**
 * Cached, read-only accessor for the dzup-ui catalog artifacts. One instance is
 * shared by every tool; each distinct site path is fetched at most once per
 * process (the artifacts are immutable per deploy).
 */
export class RegistryClient {
  readonly base: string
  private readonly read: Reader
  private readonly cache = new Map<string, Promise<string>>()

  constructor(opts: RegistryClientOptions = {}) {
    this.base = opts.base ?? process.env.DZUP_UI_REGISTRY_URL ?? DEFAULT_REGISTRY_URL
    this.read = opts.reader ?? createReader(this.base)
  }

  /** The public origin used to build install-command URLs (http mode) or the site default. */
  get origin(): string {
    return isHttp(this.base) ? this.base.replace(/\/+$/, '') : DEFAULT_REGISTRY_URL
  }

  private text(sitePath: string): Promise<string> {
    let hit = this.cache.get(sitePath)
    if (!hit) {
      hit = this.read(sitePath)
      this.cache.set(sitePath, hit)
    }
    return hit
  }

  private async json<T>(sitePath: string): Promise<T> {
    return JSON.parse(await this.text(sitePath)) as T
  }

  // ── Blocks ────────────────────────────────────────────────────────────────

  blocksIndex(): Promise<RegistryIndex> {
    return this.json<RegistryIndex>('/r/registry.json')
  }

  block(name: string): Promise<RegistryItem> {
    return this.json<RegistryItem>(`/r/${encodeURIComponent(name)}.json`)
  }

  /** Absolute URL a consumer's `shadcn add` fetches for a block. */
  blockUrl(name: string): string {
    return `${this.origin}/r/${name}.json`
  }

  // ── Templates ───────────────────────────────────────────────────────────────

  templatesIndex(): Promise<RegistryIndex> {
    return this.json<RegistryIndex>('/r/templates/registry.json')
  }

  template(name: string): Promise<RegistryItem> {
    return this.json<RegistryItem>(`/r/templates/${encodeURIComponent(name)}.json`)
  }

  templateUrl(name: string): string {
    return `${this.origin}/r/templates/${name}.json`
  }

  // ── Tokens ────────────────────────────────────────────────────────────────

  tokens(): Promise<TokensItem> {
    return this.json<TokensItem>('/r/tokens.json')
  }

  tokensUrl(): string {
    return `${this.origin}/r/tokens.json`
  }

  // ── Components (parsed from the storybook llms docs) ──────────────────────────

  /** The component API index markdown (`/storybook/llms.txt`). */
  componentsIndexText(): Promise<string> {
    return this.text('/storybook/llms.txt')
  }

  /** The full per-component API markdown (`/storybook/llms-full.txt`). */
  componentsFullText(): Promise<string> {
    return this.text('/storybook/llms-full.txt')
  }

  async components(): Promise<ComponentSummary[]> {
    return parseComponentIndex(await this.componentsIndexText())
  }

  /** The full markdown section for one component, or null if not found. */
  async component(name: string): Promise<string | null> {
    return extractComponentSection(await this.componentsFullText(), name)
  }
}

/**
 * Parse the storybook `llms.txt` index into a flat component list.
 *
 * The index groups components under `## <Family>` headers; each component is a
 * `- **DzName** — description` bullet followed by indented `  - …` detail lines
 * (props list, taxonomy). The leading `## Conventions` section is not a family
 * and is skipped.
 */
export function parseComponentIndex(md: string): ComponentSummary[] {
  const out: ComponentSummary[] = []
  const lines = md.split(/\r?\n/)
  let family = ''
  let current: ComponentSummary | null = null
  const flush = () => {
    if (current) {
      current.details = current.details.trim()
      out.push(current)
      current = null
    }
  }
  for (const line of lines) {
    const fam = /^##\s+(.+?)\s*$/.exec(line)
    if (fam) {
      flush()
      family = fam[1]!
      continue
    }
    if (family === 'Conventions' || !family) continue
    // `- **DzName** — description`  (em dash or hyphen separator, both tolerated)
    const head = /^-\s+\*\*(Dz[A-Za-z0-9]+)\*\*\s*[—–-]?\s*(.*)$/.exec(line)
    if (head) {
      flush()
      current = { name: head[1]!, family, description: head[2]!.trim(), details: '' }
      continue
    }
    // Indented continuation line belongs to the component currently being read.
    if (current && /^\s+-\s+/.test(line)) {
      current.details += `${line.trim().replace(/^-\s+/, '')}\n`
    }
  }
  flush()
  return out
}

/**
 * Slice the full markdown section for a single component out of
 * `llms-full.txt`. Sections are delimited by `### DzName` headers and run until
 * the next `### ` or `## ` header. Case-insensitive, `Dz`-prefix tolerant.
 */
export function extractComponentSection(md: string, name: string): string | null {
  const wanted = normalizeComponentName(name)
  const lines = md.split(/\r?\n/)
  let start = -1
  for (let i = 0; i < lines.length; i++) {
    const m = /^###\s+(Dz[A-Za-z0-9]+)\s*$/.exec(lines[i]!)
    if (m && normalizeComponentName(m[1]!) === wanted) {
      start = i
      break
    }
  }
  if (start === -1) return null
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^###?\s+/.test(lines[i]!)) {
      end = i
      break
    }
  }
  return lines.slice(start, end).join('\n').trim()
}

/** Canonicalize a component name to `dzbutton` form (Dz-prefixed, lowercased). */
export function normalizeComponentName(name: string): string {
  const trimmed = name.trim()
  const prefixed = /^dz/i.test(trimmed) ? trimmed : `Dz${trimmed}`
  return prefixed.toLowerCase()
}
