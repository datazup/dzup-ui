/**
 * Vue SFC parsing utilities.
 *
 * Lightweight helpers for extracting and replacing `<script>` blocks in
 * Vue Single File Components.  We use simple regex instead of pulling in
 * `@vue/compiler-sfc` to keep the dependency footprint small.
 */

/** Result of extracting the script section from a Vue SFC. */
export interface ScriptExtraction {
  /** The raw script content (between the opening and closing tags). */
  script: string
  /** Byte offset of the script content start in the original source. */
  contentStart: number
  /** Byte offset of the script content end in the original source. */
  contentEnd: number
  /** Whether this is a `<script setup>` block. */
  isSetup: boolean
}

/**
 * Extract the `<script setup>` (preferred) or `<script>` block from a Vue
 * SFC string.  Returns `null` if no script block is found.
 */
export function extractScriptFromVue(source: string): ScriptExtraction | null {
  // Prefer <script setup ...> over plain <script ...>
  const setupMatch = /<script\s[^>]*setup[^>]*>/i.exec(source)
  const plainMatch = /<script(?:\s[^>]*)?>/.exec(source)
  const openMatch = setupMatch ?? plainMatch

  if (!openMatch)
    return null

  const contentStart = openMatch.index + openMatch[0].length
  const closeTag = '</script>'
  const closeIndex = source.indexOf(closeTag, contentStart)
  if (closeIndex === -1)
    return null

  return {
    script: source.slice(contentStart, closeIndex),
    contentStart,
    contentEnd: closeIndex,
    isSetup: setupMatch !== null,
  }
}

/**
 * Replace the script content in a Vue SFC string.
 */
export function replaceScriptInVue(
  source: string,
  newScript: string,
  positions: Pick<ScriptExtraction, 'contentStart' | 'contentEnd'>,
): string {
  return source.slice(0, positions.contentStart) + newScript + source.slice(positions.contentEnd)
}

/**
 * Determine if a file path points to a Vue SFC.
 */
export function isVueFile(filePath: string): boolean {
  return filePath.endsWith('.vue')
}
