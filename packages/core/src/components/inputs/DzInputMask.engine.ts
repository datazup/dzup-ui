/**
 * DzInputMask — pure mask engine.
 *
 * Framework-agnostic helpers that apply a format mask to raw user input,
 * compute caret placement, and handle literal-aware backspace/delete. Kept
 * free of Vue so it can be unit-tested in isolation (TASK-NF-25, step 2).
 *
 * Mask token alphabet:
 *   - `9` — a single digit       (0-9)
 *   - `a` — a single letter      (A-Z, a-z)
 *   - `*` — a single alphanumeric (0-9, A-Z, a-z)
 * Every other character is a literal that is rendered verbatim and skipped
 * automatically while typing (e.g. `(`, `)`, `-`, `/`, space).
 *
 * @module @dzup-ui/core/components/inputs/DzInputMask.engine
 */

/** Regex matchers for each mask token. */
const TOKEN_PATTERNS: Record<string, RegExp> = {
  9: /\d/,
  a: /[a-z]/i,
  '*': /[a-z0-9]/i,
}

/** Result of applying a mask to a raw input string. */
export interface MaskResult {
  /** The displayed value: literals + entered chars + slotChar for unfilled token positions. Empty when no value chars were entered. */
  masked: string
  /** The entered value with all literals and slot characters stripped. */
  unmasked: string
  /** Whether every token position has been filled. */
  completed: boolean
  /** Suggested caret index within `masked`. */
  caret: number
}

/** Whether `ch` is a mask token (`9`, `a`, or `*`) rather than a literal. */
export function isMaskToken(ch: string | undefined): boolean {
  return ch !== undefined && Object.prototype.hasOwnProperty.call(TOKEN_PATTERNS, ch)
}

/** Whether `ch` satisfies the given mask `token`. Literals never match. */
export function charMatchesToken(ch: string | undefined, token: string | undefined): boolean {
  if (ch === undefined || token === undefined)
    return false
  const pattern = TOKEN_PATTERNS[token]
  return pattern ? pattern.test(ch) : false
}

/** Count the number of token (non-literal) positions in `mask`. */
export function countTokens(mask: string): number {
  let count = 0
  for (const ch of mask) {
    if (isMaskToken(ch))
      count++
  }
  return count
}

/**
 * Walk `masked` and return the caret index positioned just after the
 * `valueCount`-th filled token, skipping any trailing literals so the next
 * keystroke lands on the following token. When `valueCount` is 0 (or cannot be
 * reached) the caret is placed at the first slot position.
 */
function caretAfterNthValue(
  masked: string,
  mask: string,
  slotChar: string,
  valueCount: number,
): number {
  if (valueCount > 0) {
    let seen = 0
    for (let i = 0; i < mask.length; i++) {
      if (isMaskToken(mask[i]) && masked[i] !== slotChar) {
        seen++
        if (seen === valueCount) {
          let j = i + 1
          while (j < masked.length && !isMaskToken(mask[j]))
            j++
          return j
        }
      }
    }
  }
  const slotIdx = masked.indexOf(slotChar)
  return slotIdx === -1 ? masked.length : slotIdx
}

/**
 * Apply `mask` to `input`, distributing the input's characters across the
 * mask's token positions and inserting literals automatically.
 *
 * Non-matching characters (e.g. a letter typed into a `9` slot, or literals
 * pasted from a pre-formatted value) are skipped. When no value characters are
 * consumed the result is fully empty so the host can show its placeholder.
 *
 * @param input    Raw text from the field (may already contain literals/slots).
 * @param mask     The mask pattern.
 * @param slotChar Character shown for unfilled token positions (default `_`).
 * @param caretInput Optional caret index within `input`; used to map the caret
 *                   into the masked output. Defaults to the end of `input`.
 */
export function applyMask(
  input: string,
  mask: string,
  slotChar = '_',
  caretInput?: number,
): MaskResult {
  const chars = [...input]
  const caretRaw = caretInput ?? chars.length

  let inputIdx = 0
  let masked = ''
  let unmasked = ''
  let filled = 0
  let valueBeforeCaret = 0

  for (let i = 0; i < mask.length; i++) {
    const m = mask[i]
    if (m === undefined)
      continue

    if (!isMaskToken(m)) {
      masked += m
      // Consume a matching literal from the input (paste of a formatted value).
      if (inputIdx < chars.length && chars[inputIdx] === m)
        inputIdx++
      continue
    }

    let placed = false
    while (inputIdx < chars.length) {
      const srcIdx = inputIdx
      const c = chars[inputIdx++]
      if (c !== undefined && charMatchesToken(c, m)) {
        masked += c
        unmasked += c
        filled++
        if (srcIdx < caretRaw)
          valueBeforeCaret++
        placed = true
        break
      }
      // Skip non-matching characters entirely.
    }

    if (!placed)
      masked += slotChar
  }

  // An empty value collapses to a fully empty result so the placeholder shows.
  if (unmasked.length === 0)
    return { masked: '', unmasked: '', completed: false, caret: 0 }

  const tokenCount = countTokens(mask)
  const completed = tokenCount > 0 && filled === tokenCount
  const caret = caretAfterNthValue(masked, mask, slotChar, valueBeforeCaret)

  return { masked, unmasked, completed, caret }
}

/** Collect the masked-string indices of every filled token position. */
function filledTokenPositions(masked: string, mask: string, slotChar: string): number[] {
  const positions: number[] = []
  for (let i = 0; i < mask.length && i < masked.length; i++) {
    if (isMaskToken(mask[i]) && masked[i] !== slotChar)
      positions.push(i)
  }
  return positions
}

/**
 * Delete the value character immediately before `caret`, skipping literal
 * positions (literal-aware Backspace). Returns `null` when there is nothing to
 * delete so the host can fall back to default behaviour.
 */
export function backspaceValue(
  masked: string,
  mask: string,
  slotChar: string,
  caret: number,
): MaskResult | null {
  const positions = filledTokenPositions(masked, mask, slotChar)
  let target = -1
  for (const p of positions) {
    if (p < caret)
      target = p
  }
  if (target === -1)
    return null

  const value = positions.filter(p => p !== target).map(p => masked[p]).join('')
  const res = applyMask(value, mask, slotChar)
  return { ...res, caret: res.masked === '' ? 0 : target }
}

/**
 * Delete the value character at or after `caret`, skipping literal positions
 * (literal-aware Delete). Returns `null` when there is nothing to delete.
 */
export function forwardDeleteValue(
  masked: string,
  mask: string,
  slotChar: string,
  caret: number,
): MaskResult | null {
  const positions = filledTokenPositions(masked, mask, slotChar)
  const target = positions.find(p => p >= caret) ?? -1
  if (target === -1)
    return null

  const value = positions.filter(p => p !== target).map(p => masked[p]).join('')
  const res = applyMask(value, mask, slotChar)
  return { ...res, caret: res.masked === '' ? 0 : target }
}
