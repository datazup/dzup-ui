/**
 * Anatomy keyboard-contract / handler alignment validator (RESIDUAL-12, ADR-19 §
 * keyboard, `D-RES11-2`).
 *
 * ## What was missing
 *
 * Every component with an anatomy publishes a keyboard table — `keyboard:
 * 'none'` or `KeyboardBinding[]` on `Dz{Name}.anatomy.ts` — and that table is
 * **published**: `generate:ownership` copies it into
 * `component-ownership.manifest.json`, `generate:component-meta` joins it, and
 * `generate:docs-pages` renders it as the keyboard section of the component's
 * documentation page. An accessibility buyer reads it first.
 *
 * Before this validator, three things read those tables and **not one of them
 * compared a declared key to the code**:
 *
 * - `packages/tooling/src/quality/keyboard-contract.spec.ts` checks the table for
 *   internal coherence and nothing else — key spelling, sentence-shaped actions,
 *   duplicate rows, a `when` that names a real part, a `wcag` id's shape.
 * - `expectKeyboardContract` (`@dzup-ui/testing`) checks coherence, plus
 *   reachability (something in the mounted tree is focusable) and, opt-in per
 *   key, consumption (`preventDefault` was called). It is exported and
 *   **called from zero component specs** on this tree.
 * - `capability-matrix.json`'s `keyboard-spec` cell resolves a regex over the
 *   unit spec. It records that SOME key is asserted, never WHICH key does
 *   WHAT.
 *
 * RESIDUAL-11 found the consequence by accident: `DzChip.anatomy.ts` published
 * `{ key: 'Enter', action: 'Activate the chip.', apg: 'button' }` and the same
 * row for `' '`, while `DzChip.vue`'s `handleKeyDown` handled only `Delete` and
 * `Backspace` and the root had no click handler at all. One instance, found
 * while asking a different question, with 84 other tables nobody had looked at.
 *
 * ## The hard part is delegation, not detection
 *
 * A naive "is there an `@keydown` in this `.vue`?" check reports **57 of the 85
 * components that declare bindings** as broken, because most keys in this
 * library are not handled by the file that declares them. `DzButton` renders a
 * native `<button>` and Enter/Space activation is the platform's. `DzTabs`
 * renders Reka's `TabsRoot` and the arrows belong to `RovingFocusGroup`. A
 * family anatomy is declared on the parent (`DzTabs`) while the keys are handled
 * by a compound part (`DzTabTrigger`). So the question this validator has to
 * answer is not "does this file handle the key" but **"who owns this key, and
 * can that be shown rather than assumed?"**
 *
 * Six routes, tried in this order. Each records a citation — a file and, where
 * one exists, a line — so a `backed` verdict can be read back and disputed:
 *
 * 1. **`own`** — the declaring component's own `.vue` has a keyboard handler and
 *    names the key.
 * 2. **`part`** — a `compound-part` whose `parentComponent` is this component
 *    (the ownership manifest's own relation, the same one `anatomy-parts.ts`
 *    walks for a part name) handles it. `DzTabs` declares; `DzTabTrigger`
 *    handles.
 * 3. **`renders`** — a `Dz*` component or unexported internal this component's
 *    template renders, transitively to {@link RENDER_DEPTH}, handles it.
 * 4. **`composable`** — a `use*` under `packages/core/src/composables/` reached
 *    from the closure handles it (`useEscapeKey` owns `Escape` for six
 *    overlays).
 * 5. **`primitive`** — a Reka primitive imported by the closure owns it. This is
 *    **derived from the installed dependency's own source**, not from memory:
 *    the walk indexes every `.js` under `node_modules/reka-ui/dist`, follows each
 *    imported primitive's relative import graph, and harvests the key literals
 *    and `kbd.*` constants those modules name. `TabsList` → `RovingFocusGroup`
 *    → `RovingFocus/utils.js`, whose `MAP_KEY_TO_FOCUS_INTENT` names
 *    `ArrowLeft`/`ArrowUp`/`ArrowRight`/`ArrowDown`/`PageUp`/`Home`/`PageDown`/
 *    `End`, is a citation a reader can open.
 * 6. **`platform`** — a native element in the closure whose *documented HTML
 *    behaviour* is this key: `<button>` and `<summary>` own Enter and Space,
 *    `<a href>` owns Enter, `<input type="range">` owns the arrows and
 *    Home/End/PageUp/PageDown, and **anything focusable owns `Tab`**, because
 *    `Tab` is the document's focus order and a component that handled it would
 *    be trapping focus, not implementing it. This table is written down in
 *    {@link PLATFORM_KEYS} with the element that owns each key, because it is
 *    the one route that cannot be derived from a file in this repository.
 *
 * ## `undetermined` is a verdict, and it is not `backed`
 *
 * A declaration is **`unbacked`** only when the closure resolved *completely* —
 * every Reka import mapped to a dist file, every rendered `Dz*` resolved to a
 * source file, every composable import resolved, no depth cap hit — and no owner
 * names the key. When any edge of the closure could not be resolved, the answer
 * might be behind that edge, so the row is **`undetermined`** and the unresolved
 * edges are printed. "Satisfied because a primitive probably handles it" is the
 * failure this validator exists to remove, not to relocate.
 *
 * ## The reverse drift is the same defect mirrored
 *
 * A key a component *handles* and does not *declare* is just as wrong: the
 * published table is then incomplete, and a consumer who reads it does not learn
 * that Escape closes the thing. `undeclared-handler` counts those, attributed to
 * the declaring anatomy — a compound part's handler is checked against its
 * `parentComponent`'s table, because that is where the family's contract lives.
 *
 * ## Rules and ceilings
 *
 * | rule | ceiling key | ratchets |
 * |---|---|---|
 * | `unbacked-declaration` | `maxUnbackedDeclarations` | DOWN |
 * | `undetermined-declaration` | `maxUndeterminedDeclarations` | DOWN |
 * | `undeclared-handler` | `maxUndeclaredHandlers` | DOWN |
 *
 * Each is seeded at the value measured on this tree and may only fall. Raising
 * one is how a keyboard contract quietly stops being one — and a keyboard
 * contract that lies is an accessibility claim that lies.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/anatomy-keyboard.ts
 *   tsx packages/tooling/src/validators/anatomy-keyboard.ts --json
 *
 * Exit code 1 when a rule is over its ceiling.
 */

import type { ManifestAnatomy, ManifestKeyboardBinding } from '../ownership/anatomy-source.ts'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseAnatomySource } from '../ownership/anatomy-source.ts'
import { stripComments } from '../quality/spec-component-refs.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../../../')
const CORE_SRC = resolve(ROOT, 'packages/core/src')
const COMPOSABLES = resolve(CORE_SRC, 'composables')
const MANIFEST = resolve(ROOT, 'packages/core/manifests/component-ownership.manifest.json')
const REKA_DIST = resolve(ROOT, 'node_modules/reka-ui/dist')
const CEILINGS = resolve(HERE, 'anatomy-keyboard-ceilings.json')
const REJECTED = resolve(HERE, 'anatomy-keyboard-rejected-citations.json')

// ---------------------------------------------------------------------------
// A comment is not evidence (RESIDUAL-14)
// ---------------------------------------------------------------------------

/**
 * Every scan in this file runs against the source with its **comments blanked and
 * its line count preserved**.
 *
 * This is `D-RES02-2`'s rule, arriving in a second artifact. RESIDUAL-05 replaced
 * the capability matrix's `filesMentioning` — a substring match over whole file
 * text — because a header sentence, a "tested elsewhere" note and an explanatory
 * aside were each granting a published evidence citation. RESIDUAL-14 measured the
 * same defect here, and it had cost **ten** backed keyboard rows:
 *
 * - `packages/core/src/i18n/useComponentMessages.ts` is a 130-line i18n composable
 *   with no markup, and its docblock carries an `@example` containing `<template>`
 *   and a `<button>`. {@link templateNodesIn} found its template with
 *   `indexOf('<template>')`, so that `<button>` **in a comment** was the platform
 *   owner of `DzAnchor`'s `Enter`, `DzBreadcrumb`'s `Tab` and `Enter`, and
 *   `DzSidebar`'s `Tab`, `Enter` and `Space` — six rows, in a file that renders
 *   nothing, and it shadowed the `renderFunctionNodesIn` edge RESIDUAL-13 added for
 *   `DzAnchor` precisely because the comment came first.
 * - `DzDatePicker.vue:149` is a docblock sentence, *"the APG grid pattern … does
 *   specify Home and End: the first and last day"*, and `keysNamedIn`'s
 *   unquoted-object-key arm read `End:` out of that prose.
 * - `DzListbox.vue:25` and `DzSelect.vue:366` are docblocks naming Reka's
 *   `typeahead`; the second one's *meaning* is that the type-ahead **never runs**
 *   (*"the keydown still stops here, so Reka's typeahead never sees a query
 *   character"*), which is the exact shape RESIDUAL-05 found in
 *   `forms.a11y.spec.ts`.
 *
 * Line-preserving matters as much as stripping: a citation is only worth what a
 * reader can open, so a docblock above a handler must not shift the lines below it.
 *
 * `.vue` is handled in two regions rather than with one scanner, because a
 * JavaScript comment scanner let loose on a template will eventually eat a `/*`
 * inside an HTML comment: HTML comments are blanked everywhere, and the JS scanner
 * runs only inside `<script>` blocks.
 */
export function stripCommentsForScan(source: string, isVue: boolean): string {
  const blank = (text: string): string => text.replaceAll(/[^\n]/g, ' ')
  if (!isVue)
    return stripComments(source, { preserveLines: true })

  let out = source.replaceAll(/<!--[\s\S]*?-->/g, blank)
  for (const match of [...out.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].reverse()) {
    const body = match[1]!
    const from = match.index + match[0].length - body.length - '</script>'.length
    out = out.slice(0, from) + stripComments(body, { preserveLines: true }) + out.slice(from + body.length)
  }
  return out
}

/**
 * Both directories that hold a `*.anatomy.ts`.
 *
 * `providers/` is not an afterthought: `DzProvider` and `DzThemeProvider` live
 * outside `components/{family}/`, and a walk that scanned only `components/`
 * missed their declarations — the same correction
 * `quality/keyboard-contract.spec.ts` records.
 */
const ANATOMY_ROOTS = [
  resolve(CORE_SRC, 'components'),
  resolve(CORE_SRC, 'providers'),
]

/** How far to follow `Dz*` render edges out of a component's own template. */
const RENDER_DEPTH = 6

/** How far to follow relative imports out of a Reka primitive entry module. */
const REKA_DEPTH = 6

// ---------------------------------------------------------------------------
// The platform table — the one route that cannot be derived from this repo
// ---------------------------------------------------------------------------

/**
 * Keys a native element owns by the HTML specification, and therefore keys no
 * component in this library implements or should.
 *
 * Written down rather than inferred, because the alternative is a validator that
 * silently assumes: `<button>` has no `keydown` listener anywhere in this
 * repository and still activates on Enter and Space, and a checker that could
 * not say so would report `DzButton`, `DzIconButton`, `DzFab`, `DzCopyButton`
 * and `DzToggleButton` as publishing keyboard contracts they do not implement.
 *
 * Each entry is a *selector-ish* source token the template scan looks for and
 * the keys that element activates on. `KeyboardEvent.key` spellings.
 */
/**
 * A node whose activation is the platform's: a real `<button>`, or a dynamic component
 * whose `is=` **can** resolve to one.
 *
 * Exported so `anatomy-keyboard.spec.ts` can pin both directions, and split out of
 * {@link PLATFORM_KEYS} for the same reason.
 *
 * **It reads the expression since RESIDUAL-14.** It used to admit any `is=` at all, on
 * the grounds that a dynamic component "can be" a button — and `DzTableCell.vue`'s
 * root is `is="header ? 'th' : 'td'"`, which can be a table cell and nothing else. That
 * node was the cited `<button>` behind `DzTable`'s three sortable-header rows, for a
 * component whose own `DzTable.types.ts:41` says *"Column sorting … → DzDataGrid"*.
 *
 * So the expression must either **name** an activating tag
 * (`is="collapsible ? 'button' : 'div'"`, which `DzPanel` really does) or be an opaque
 * identifier (`is="computedTag"`, `DzButton`'s own), where refusing would be a guess in
 * the other direction. An expression made only of string literals, none of which
 * activates, is neither.
 */
export const PLATFORM_ACTIVATION_TOKEN
  = /<button[\s/>]|<\s*component\s[^>]*\bis=(?:"(?![^"]*'[a-z]+')|"[^"]*'(?:button|a|summary|select)')/

const PLATFORM_KEYS: { readonly token: RegExp, readonly what: string, readonly keys: readonly string[] }[] = [
  // Activation. `<button>`, `<summary>` and a `<select>` activate on both. The
  // dynamic-component arm reads its expression -- see PLATFORM_ACTIVATION_TOKEN.
  { token: PLATFORM_ACTIVATION_TOKEN, what: '<button> (or a dynamic component that can be one)', keys: ['Enter', ' '] },
  { token: /<summary[\s/>]/, what: '<summary>', keys: ['Enter', ' '] },
  { token: /<select[\s/>]/, what: '<select>', keys: ['Enter', ' '] },
  // A link follows on Enter only — Space scrolls the page.
  { token: /<a\s[^>]*href=/, what: '<a href>', keys: ['Enter'] },
  // A checkbox/radio input toggles on Space.
  { token: /<input\s[^>]*type="(?:checkbox|radio)"/, what: '<input type="checkbox|radio">', keys: [' '] },
  // Text entry. The weakest entry in this table and marked as such: it cannot
  // tell a search field from listbox type-ahead, so a `<character>` row is
  // credited to any text field the component owns. Stated rather than hidden —
  // the alternative, refusing it, would report `DzMention` (which detects its
  // trigger character by watching the model, not by comparing a key) as
  // publishing a character contract it does not implement.
  { token: /<input\s(?![^>]*type="(?:checkbox|radio|range|number|submit|button|reset|color)")|<textarea[\s/>]/, what: 'a text <input> / <textarea> (weakest route — see PLATFORM_KEYS)', keys: ['<character>', '<digit>'] },
  // A native <dialog> closes on Escape without a listener.
  { token: /<dialog[\s/>]/, what: '<dialog>', keys: ['Escape'] },
]

/**
 * The platform route credits **activation and text entry only, never
 * navigation**.
 *
 * A native `<input type="range">` does own the arrows and Home/End, and a
 * `<select>` does own ArrowDown — but no component template in this repository
 * contains a `type="range"` (measured), and the one that contains a `<select>`
 * is `DzTimePicker`, whose declared ArrowUp/ArrowDown/Home/End rows are an APG
 * `combobox` contract about its popover list and have nothing to do with its
 * meridiem picker. Crediting them to that `<select>` is precisely the
 * "satisfied because something nearby probably does it" verdict this validator
 * refuses. A declared navigation key is a claim about roving focus or a listbox,
 * and that always takes code — the component's, a composable's, or a
 * primitive's.
 */
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'])

/**
 * Anything the platform puts in the tab order. A declared `Tab` row is satisfied
 * by the *presence* of one of these, never by a handler: `Tab` is the document's
 * focus order, and a component that called `preventDefault` on it would be
 * trapping focus rather than implementing the row.
 */
const FOCUSABLE_TOKEN = /<button[\s/>]|<a\s[^>]*href|<input[\s/>]|<select[\s/>]|<textarea[\s/>]|<summary[\s/>]|tabindex|:tabindex|\btabIndex\b/

// ---------------------------------------------------------------------------
// Key naming — the shapes source uses to talk about a key
// ---------------------------------------------------------------------------

/** Vue's `@keydown.<modifier>` aliases, and what each one means as a `key`. */
const VUE_KEY_ALIASES: Record<string, string> = {
  'enter': 'Enter',
  'space': ' ',
  'tab': 'Tab',
  'esc': 'Escape',
  'escape': 'Escape',
  // `withKeys(handleBackspace, ['backspace'])` is how Reka's `PinInputInput`
  // owns Backspace, and the first draft of this table left the alias out, which
  // reported `DzOtpInput` as declaring a key its primitive plainly handles.
  'backspace': 'Backspace',
  'up': 'ArrowUp',
  'down': 'ArrowDown',
  'left': 'ArrowLeft',
  'right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'home': 'Home',
  'end': 'End',
  'delete': 'Delete',
  'page-up': 'PageUp',
  'page-down': 'PageDown',
}

/** Reka's `useKbd()` constant names, and the key each one carries. */
const KBD_CONSTANTS: Record<string, string> = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  END: 'End',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  HOME: 'Home',
  PAGE_DOWN: 'PageDown',
  PAGE_UP: 'PageUp',
  SPACE: ' ',
  SPACE_CODE: ' ',
  TAB: 'Tab',
}

/**
 * Does this source do anything with a key event at all?
 *
 * **Case-insensitive and boundary-free on the bare word since RESIDUAL-14, and
 * neither was cosmetic.** `useDataGridHeader.ts` spells it `handleHeaderKeyDown` at
 * all six of its occurrences and never once lowercase — so `\bkeydown\b` failed
 * twice over, on the capitals and on the leading `\b`, which cannot hold inside an
 * identifier. `handles` was `false`, routes 1–4 skipped the file that really owns
 * `DzDataGrid`'s column sort, and route 5 handed all three sort rows to whatever
 * primitive happened to name the key: `Checkbox/CheckboxRoot.js` for `Enter` and
 * `Select/utils.js` for `Space`, on a grid.
 *
 * A missed owner does not produce "no owner"; it produces a **worse** owner, because
 * every route after the one that was skipped is looser than it. That is why erring
 * loose here is the safe direction: `handles` only *admits* a file to routes 1–4, and
 * the file still has to name the key before it can be cited.
 */
export const HANDLER_TOKEN = /@keydown|@keyup|v-on:key(?:down|up)|addEventListener\(\s*['"]key(?:down|up)['"]|key(?:down|up)\b|withKeys\(|useEventListener\([^)]*['"]key(?:down|up)['"]/i

/**
 * The named `KeyboardEvent.key` values a keyboard table can carry, as a regex
 * alternation. Used where a bare literal has to be recognised without a `.key`
 * on the other side of the comparison — a membership array, an object-literal
 * key map — because those are the shapes Reka's compiled output uses and a
 * name like `ArrowDown` is unambiguous on its own in a way `'down'` is not.
 */
const NAMED_KEY = /Arrow(?:Up|Down|Left|Right)|Enter|Escape|Home|End|Tab|Backspace|Delete|Page(?:Up|Down)|Space/

/**
 * Every key a source *names in a key-comparison shape*.
 *
 * Deliberately shape-based, and deliberately narrow on both ends. "The literal
 * appears anywhere" would mark almost everything backed — `'End'` is a
 * substring of plenty of prose. But "any `=== 'x'`" is just as wrong in the
 * other direction: `DzSpeedDial` compares a placement against `'bottom-left'`
 * and `'down'`, and the first draft of this function read those as keys and
 * reported four keys of reverse drift that do not exist. So a free-form literal
 * is only read as a key when the comparison names `.key` or `.code`; a bare
 * literal is only read as a key when it is one of the {@link NAMED_KEY} values.
 */
export function keysNamedIn(source: string): Map<string, number> {
  const found = new Map<string, number>()
  for (const [key, lines] of keyLinesIn(source))
    found.set(key, lines[0]!)
  return found
}

/**
 * Every line a source names each key on, not just the first.
 *
 * RESIDUAL-14 needed the plural. `keysNamedIn` keeps one line per key, which is the
 * right thing for a citation — but once a citation can be **rejected** (see
 * {@link RejectedCitation}), rejecting the first line must not take the whole file
 * with it. `DzOrderList.vue` names `' '` twice: at 455 it is the type-ahead's
 * `event.key !== ' '`, which *excludes* the space bar, and at 501 it is the
 * `case ' ':` that grabs the item. The first is not the row's mechanism and the
 * second is, and they are in the same file.
 */
export function keyLinesIn(source: string): Map<string, number[]> {
  const found = new Map<string, number[]>()
  const lines = source.split('\n')

  const note = (key: string, index: number): void => {
    const at = found.get(key) ?? []
    if (at.at(-1) !== index + 1)
      at.push(index + 1)
    found.set(key, at)
  }

  for (const [index, line] of lines.entries()) {
    // `event.key === 'Enter'`, `e.code !== ' '`, and the reversed form.
    for (const match of line.matchAll(/\.(?:key|code)\s*[!=]==?\s*(['"])(.*?)\1/g))
      note(match[2]!, index)
    for (const match of line.matchAll(/(['"])(.*?)\1\s*[!=]==?\s*[\w.[\]]*\.(?:key|code)\b/g))
      note(match[2]!, index)
    // `case 'ArrowDown':` — only for a name that is unambiguously a key.
    for (const match of line.matchAll(new RegExp(String.raw`\bcase\s+(['"])(${NAMED_KEY.source})\1\s*:`, 'g')))
      note(match[2] === 'Space' ? ' ' : match[2]!, index)
    if (/\bcase\s+(['"])\s\1\s*:/.test(line))
      note(' ', index)
    // Membership and key maps: `['ArrowUp', 'ArrowDown'].includes(`,
    // `new Set(['Home'])`, Reka's `MAP_KEY_TO_FOCUS_INTENT`, and the
    // one-name-per-line arrays its compiled `Slider/utils.js` emits — hence the
    // end-of-line alternative, without which `"ArrowRight"` as an array's last
    // element reads as absent.
    for (const match of line.matchAll(new RegExp(String.raw`(['"])(${NAMED_KEY.source})\1\s*(?:[,\]:)}]|$)`, 'g')))
      note(match[2] === 'Space' ? ' ' : match[2]!, index)
    // An UNQUOTED object-literal key: Reka's `MAP_KEY_TO_FOCUS_INTENT` spells
    // `Home: "first"`, and Home/End/PageUp/PageDown appear nowhere else in that
    // module — read only as quoted, RovingFocusGroup loses four of its keys.
    for (const match of line.matchAll(new RegExp(String.raw`(?:^|[{,;\s])(${NAMED_KEY.source})\s*:`, 'g')))
      note(match[1] === 'Space' ? ' ' : match[1]!, index)
    // A quoted single space inside an array or after a comma — `[' ', 'Enter']`.
    // The opening `[` or `,` is required: without it `parts.join(' ')` reads as
    // "this component handles the space bar", which is how the first draft
    // reported eight forms components as handling an undeclared Space.
    if (/\[\s*(['"])\s\1|,\s*(['"])\s\2\s*\]/.test(line))
      note(' ', index)
    // `kbd.ENTER`, `kbd.ARROW_DOWN`, `KEY_CODES.ESCAPE`
    for (const match of line.matchAll(/\.([A-Z][A-Z_]+)\b/g)) {
      const key = KBD_CONSTANTS[match[1]!]
      if (key !== undefined)
        note(key, index)
    }
    // Vue `@keydown.enter`, `@keydown.arrow-down.prevent`
    for (const match of line.matchAll(/@key(?:down|up)((?:\.[a-z-]+)+)/g)) {
      for (const alias of match[1]!.split('.').filter(Boolean)) {
        const key = VUE_KEY_ALIASES[alias]
        if (key !== undefined)
          note(key, index)
      }
    }
    // `withKeys(handler, ['enter'])` — the compiled form of `@keydown.enter`,
    // which is how Reka's `SwitchRoot` owns Enter. The modifier list and the
    // key list arrive on the same line, so every lowercase token on it is
    // offered to the alias table and only an alias is taken.
    if (line.includes('withKeys(')) {
      for (const match of line.matchAll(/['"]([a-z-]+)['"]/g)) {
        const key = VUE_KEY_ALIASES[match[1]!]
        if (key !== undefined)
          note(key, index)
      }
    }
    // Type-ahead: the placeholder classes a contract row uses.
    // Case-insensitive on purpose: Reka spells it `useTypeahead`, this
    // repository spells it `typeAhead` in places, and a closed list of
    // capitalisations is a list that misses the next one.
    if (/typeahead/i.test(line))
      note('<character>', index)
    // `event.key.length === 1` is how source spells "a printable character
    // arrived" — the literal `<character>` never appears in code.
    if (/\.key\.length\s*===?\s*1|\/\^\[0-9\]\$\/|\/\^\\d\$\//.test(line)) {
      note('<character>', index)
      if (/\[0-9\]|\\d/.test(line))
        note('<digit>', index)
    }
  }

  return found
}

// ---------------------------------------------------------------------------
// A modifier is part of the contract (RESIDUAL-14)
// ---------------------------------------------------------------------------

/** The `KeyboardEvent` property that carries each declared modifier. */
const MODIFIER_PROPERTY: Record<string, string> = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Meta: 'metaKey',
  Shift: 'shiftKey',
}

/**
 * The innermost brace block containing a line, **including its opening line**.
 *
 * Used by {@link readsModifiersAt}, and the two choices in it are the whole reason
 * it works. First, innermost: a file-wide search for `altKey` is satisfied by
 * `DzOrderList`'s type-ahead guard — which **rejects** Alt — while its
 * `case 'ArrowUp':` arm, the site actually cited, is a different function.
 * Second, the opening line is included, because `DzCommandPalette` declares `Meta`+`k` and
 * the modifiers are read in the `if ((event.metaKey || event.ctrlKey) && event.key
 * === 'k') {` header rather than in the body it opens.
 */
export function enclosingBlockAt(source: string, line: number): string {
  const lines = source.split('\n')
  if (line < 1 || line > lines.length)
    return source
  const upto = lines.slice(0, line).join('\n')
  /** Offsets of every `{` still open at the citing line, outermost first. */
  const open: number[] = []
  let quote: string | undefined
  for (let i = 0; i < upto.length; i++) {
    const char = upto[i]!
    if (quote !== undefined) {
      if (char === quote && upto[i - 1] !== '\\')
        quote = undefined
      continue
    }
    if (char === '"' || char === '\'' || char === '`')
      quote = char
    else if (char === '{')
      open.push(i)
    else if (char === '}')
      open.pop()
  }
  const innermost = open.at(-1)
  if (innermost === undefined)
    return source
  // Back up to the start of the line the `{` sits on, so its header is included.
  const from = upto.lastIndexOf('\n', innermost) + 1
  // Forward to the matching `}`.
  let depth = 0
  for (let i = innermost; i < source.length; i++) {
    const char = source[i]!
    if (char === '{') {
      depth++
    }
    else if (char === '}') {
      depth--
      if (depth === 0)
        return source.slice(from, i + 1)
    }
  }
  return source.slice(from)
}

/**
 * Does the cited site read every modifier the row declares?
 *
 * `ManifestKeyboardBinding.modifiers` has been parsed and validated since
 * `anatomy-source.ts:403` and this validator **keyed only on `binding.key`**, so
 * `Shift`+`PageUp` was satisfied by the handler for a bare `PageUp`. Four rows were
 * backed on that:
 *
 * - `DzCalendar` declares `Shift`+`PageUp` → *"Move to the previous year"* and
 *   `Shift`+`PageDown` → *"Move to the next year"*, and was credited to
 *   `case 'PageUp': next = cur.subtract({ months: 1 })`. `shiftKey` appears **nowhere**
 *   in `DzCalendar.vue` and neither does any year arithmetic. Two published rows for
 *   a behaviour that does not exist.
 * - `DzOrderList` declares `Alt`+`ArrowUp`/`ArrowDown` → *"Move the selected item one
 *   position earlier/later"*. The arms cited do move the item — but on a **grab**
 *   (`Space`, then the arrows), with or without Alt, and the only `altKey` in the file
 *   rejects the key.
 *
 * A modified row is a **different contract** from the same key unmodified. This does
 * not prove the handler does the row's action; it proves the cited site is at least
 * looking at the key the row is about.
 */
export function readsModifiersAt(source: string, line: number, modifiers: readonly string[]): boolean {
  if (modifiers.length === 0)
    return true
  const block = enclosingBlockAt(source, line)
  return modifiers.every((modifier) => {
    const property = MODIFIER_PROPERTY[modifier]
    // An unknown modifier cannot be shown to be read, and `anatomy-source.ts`
    // already refuses to parse one, so this is unreachable rather than lenient.
    return property !== undefined && block.includes(property)
  })
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

function walk(dir: string, predicate: (path: string) => boolean): string[] {
  if (!existsSync(dir))
    return []
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      return entry === 'dist' || entry === 'node_modules' ? [] : walk(path, predicate)
    return predicate(path) ? [path] : []
  })
}

const rel = (path: string): string => relative(ROOT, path).replaceAll('\\', '/')

/**
 * One element in a template, with the declared part it carries.
 *
 * The platform route needs this and the other five do not. A handler anywhere in
 * a family handles the key for the composed widget, and a Reka primitive that
 * implements a key implements it for whatever composes it — but "there is a
 * `<button>` somewhere inside" is a much weaker claim, and reading it as
 * satisfaction is how the first draft of this validator declared `DzChip`'s
 * `Enter` backed. `DzChip`'s root is a `<span>`; the only `<button>` in its
 * template carries the **remove** control, which does something else entirely.
 * So the platform route is scoped to the node the row is about: the node
 * carrying the row's `when` part when it names one, and the component's own root
 * otherwise, which is what an unscoped row means ("wherever the component has
 * focus", {@link KeyboardBinding.when}).
 */
interface TemplateNode {
  tag: string
  /** The whole opening tag, attributes included — what the platform table tests. */
  text: string
  /** Static `data-part` value, when the node carries one. */
  part?: string
  /** True for the first element of the template. */
  root: boolean
  line: number
}

interface SourceFile {
  path: string
  source: string
  /** Keys this file names in a comparison shape, first line each. */
  keys: Map<string, number>
  /** Every line each key is named on, so a rejected citation can be stepped over. */
  keyLines: Map<string, number[]>
  /** Whether it does anything with a key event at all. */
  handles: boolean
  /** Opening tags of the template, for the scoped platform route. */
  nodes: TemplateNode[]
}

/**
 * Every opening tag in a `.vue` template, with its static part attribute.
 *
 * Two RESIDUAL-14 corrections, both about whether a citation can be believed:
 *
 * 1. **Only a top-level SFC template block counts** — the anchor is
 *    `/^<template>/m`, at column zero. `indexOf('<template>')` matched the one in
 *    `useComponentMessages.ts`'s docblock `@example`, in a `.ts` file with no
 *    markup at all, and handed six rows a `<button>` that lives in prose.
 * 2. **The line is the file's line.** It used to be an offset into the body slice,
 *    printed as though it were a file line, so **39 of 61 platform citations
 *    pointed somewhere else**: `DzButton.vue:2` is an `import type`, the node is at
 *    190. A verdict whose citation cannot be opened cannot be disputed, which is
 *    the whole premise of `backed`.
 */
/**
 * The markup a node encloses — its own opening tag through its matching close.
 *
 * Needed for one question: does the node a row is *scoped to* bind a keyboard handler
 * anywhere inside it? A declared part is often a region rather than a control.
 * `DzDataGrid`'s sort rows are scoped to `header`, which is the `<thead>` at
 * `DzDataGridHeader.vue:81`, while the `@keydown` is on the `<th>` at `:112` inside
 * it. A test on the opening tag alone would call that node handler-free and send
 * three real rows back to whatever primitive happened to name the key.
 *
 * Nesting of the *same* tag is counted, a self-closing tag returns itself, and an
 * unbalanced document returns the rest of the file — the loose direction, since this
 * only decides whether the handler routes may be *consulted*.
 */
export function subtreeOf(source: string, node: TemplateNode): string {
  const lines = source.split('\n')
  if (node.line < 1 || node.line > lines.length)
    return node.text
  const lineStart = lines.slice(0, node.line - 1).join('\n').length + (node.line > 1 ? 1 : 0)
  const open = source.indexOf(node.text, lineStart)
  if (open === -1 || node.text.endsWith('/>'))
    return node.text
  const openTag = new RegExp(`<${node.tag}(?=[\\s/>])`, 'gi')
  const closeTag = new RegExp(`</${node.tag}\\s*>`, 'gi')
  let depth = 1
  let at = open + node.text.length
  while (depth > 0 && at < source.length) {
    openTag.lastIndex = at
    closeTag.lastIndex = at
    const next = openTag.exec(source)
    const close = closeTag.exec(source)
    if (close === null)
      return source.slice(open)
    if (next !== null && next.index < close.index) {
      depth++
      at = next.index + 1
      continue
    }
    depth--
    at = close.index + close[0].length
  }
  return source.slice(open, at)
}

export function templateNodesIn(source: string): TemplateNode[] {
  const anchor = /^<template>/m.exec(source)
  if (anchor === null)
    return []
  const open = anchor.index
  const body = source.slice(open + '<template>'.length)
  /** The file line the template tag sits on; body line 1 continues it. */
  const base = source.slice(0, open + '<template>'.length).split('\n').length
  const nodes: TemplateNode[] = []
  // The `(?=[\s/>])` lookahead is load-bearing, not decoration: without it the
  // tag-name class and the attribute class can exchange characters, which is
  // polynomial backtracking on a long opening tag (`regexp/no-super-linear-
  // backtracking`). With it, the attribute run can only begin at a space, a
  // slash or the closing bracket, so exactly one split is viable.
  for (const match of body.matchAll(/<([a-z][\w.-]*)(?=[\s/>])((?:[^<>'"]|"[^"]*"|'[^']*')*?)\/?>/gi)) {
    const text = match[0]
    const part = /data-part="([^"]+)"/.exec(text)?.[1]
    nodes.push({
      tag: match[1]!,
      text,
      part,
      root: nodes.length === 0,
      line: base + body.slice(0, match.index).split('\n').length - 1,
    })
  }
  return nodes
}

/**
 * Elements a **render function** builds, expressed as the markup they produce.
 *
 * Added in RESIDUAL-13. `DzAnchor` builds its links with
 * `h('a', { href, 'data-part': 'item', … })` in the script and its template is a
 * `<nav>` and nothing else, so the scoped platform route had no node to look at
 * and its single declared `Enter` row came back **`undetermined`** — the honest
 * verdict for an edge this walk could not follow, and still a row nothing
 * checked.
 *
 * The resolution is to follow the edge rather than to widen the verdict: a render
 * function's element is as real as a template's, so each `h('tag', { … })` is
 * turned into the opening tag it produces — `<a href="" data-part="item" …>` —
 * and the **same** {@link PLATFORM_KEYS} table decides. Nothing about what counts
 * as platform behaviour changes; only the set of nodes the table is offered.
 *
 * Two deliberate limits:
 *
 * - **Only a string-literal tag.** `h(SomeComponent, …)` is a component, not an
 *   element, and guessing what it renders is the assumption this validator
 *   refuses. A row behind one stays `undetermined`.
 * - **Attribute presence, not attribute value.** `href: url.href` becomes
 *   `href=""`, because the platform table asks whether an `<a>` has an `href` at
 *   all. A `data-part` is the exception and keeps its literal value, since that is
 *   what scopes a row to a node.
 */
export function renderFunctionNodesIn(source: string): TemplateNode[] {
  const nodes: TemplateNode[] = []
  for (const match of source.matchAll(/\b(?:h|createVNode)\(\s*(['"])([a-z][\w-]*)\1\s*,\s*\{/g)) {
    const tag = match[2]!
    const open = match.index + match[0].length - 1
    // Walk to the matching brace so a nested object (`style: { … }`) cannot end
    // the props early. Bounded, because an unbalanced brace in a template string
    // must not turn this into a scan of the rest of the file.
    let braces = 0
    let close = -1
    for (let i = open; i < source.length && i < open + 4000; i++) {
      const char = source[i]
      if (char === '{') {
        braces++
      }
      else if (char === '}') {
        braces--
        if (braces === 0) {
          close = i
          break
        }
      }
    }
    if (close === -1)
      continue
    const props = source.slice(open + 1, close)

    // Top-level keys only: a nested object's keys belong to that object, not to
    // this element — `style: { paddingInlineStart: … }` must not read as a
    // `paddingInlineStart` attribute.
    //
    // Split into the props object's OWN entries, by commas at depth zero and
    // outside a string. Line-based splitting was the first draft and it lost
    // every key but the first on a one-line object — which is the shape
    // `h('ul', { 'class': …, 'data-part': 'list', 'data-level': level })` has, so
    // it lost the `data-part` that scopes a row to that node.
    const entries: string[] = []
    let current = ''
    let depth = 0
    let quote: string | undefined
    for (let i = 0; i < props.length; i++) {
      const char = props[i]!
      if (quote !== undefined) {
        current += char
        if (char === quote && props[i - 1] !== '\\')
          quote = undefined
        continue
      }
      if (char === '"' || char === '\'' || char === '`') {
        quote = char
      }
      else if (char === '{' || char === '[' || char === '(') {
        depth++
      }
      else if (char === '}' || char === ']' || char === ')') {
        depth--
      }
      else if (char === ',' && depth === 0) {
        entries.push(current)
        current = ''
        continue
      }
      current += char
    }
    entries.push(current)

    const attributes: string[] = []
    for (const entry of entries) {
      const key = /^\s*(?:(['"])([\w-]+)\1|([a-z_$][\w$]*))\s*:([\s\S]*)$/i.exec(entry)
      const name = key?.[2] ?? key?.[3]
      if (name === undefined)
        continue
      const literal = /^\s*(['"])([^'"]*)\1\s*$/.exec(key![4]!)
      attributes.push(
        name === 'data-part' && literal !== null ? `data-part="${literal[2]!}"` : `${name}=""`,
      )
    }

    const text = `<${tag}${attributes.length === 0 ? '' : ` ${attributes.join(' ')}`}>`
    nodes.push({
      tag,
      text,
      part: /data-part="([^"]+)"/.exec(text)?.[1],
      // Never the root: the root is the first node of the template, and a
      // render-function element is something the template renders INTO.
      root: false,
      line: source.slice(0, match.index).split('\n').length,
    })
  }
  return nodes
}

// ---------------------------------------------------------------------------
// Reka: resolving a primitive to the keys its own source names
// ---------------------------------------------------------------------------

/**
 * Reka modules that are key *dictionaries*, not key *handlers*.
 *
 * `shared/useKbd.js` returns every `KeyboardEvent.key` name there is. Harvesting
 * it would make every primitive that imports it — which is most of them — the
 * owner of every key, which is exactly the "satisfied because a primitive
 * probably handles it" verdict this validator refuses to produce.
 */
const REKA_DICTIONARIES = /(?:^|[\\/])(?:useKbd|constant)\.js$|[\\/]constant[\\/]/

/**
 * Native elements a Reka primitive renders by default, and the keys that element
 * activates on.
 *
 * Reka's compiled output declares its element as an `as` prop with a default —
 * `CollapsibleTrigger` is `default: "button"`, which is why `DzAccordion` gets
 * Enter and Space on its trigger without a `keydown` anywhere in this
 * repository. Without this route the validator reported `DzAccordion`,
 * `DzSwitch` and `DzSegmented` as publishing activation they do not implement,
 * when the truth is that the platform implements it for them.
 */
const REKA_NATIVE_AS: { readonly pattern: RegExp, readonly what: string, readonly keys: readonly string[] }[] = [
  { pattern: /default:\s*"button"|as:\s*"button"|=== "button" \? "button"/, what: 'a Reka primitive whose `as` resolves to <button>', keys: ['Enter', ' '] },
  { pattern: /default:\s*"a"\s*[,}]/, what: 'a Reka primitive whose `as` resolves to <a>', keys: ['Enter'] },
  { pattern: /default:\s*"input"|type:\s*"text"/, what: 'a Reka primitive whose `as` resolves to a text <input>', keys: ['<character>', '<digit>'] },
]

/**
 * A line in the primitive's graph that puts a node in the tab order.
 *
 * `tabindex` alone is not enough: `VisuallyHidden` sets `tabindex: -1`, which
 * removes a node from the tab order rather than adding it, and citing it as the
 * reason a declared `Tab` row is satisfied would be exactly backwards. The line
 * has to name a tab-order value that is not `-1`.
 */
function rekaFocusableLine(line: string): boolean {
  return line.includes('tabindex') && !line.includes('-1') && /:\s*(?:"0"|'0'|0)\b/.test(line)
}

export interface RekaResolution {
  /** Keys the primitive's own import graph names, mapped to the citing file. */
  keys: Map<string, string>
  /** Native elements the primitive renders, with the file that declares them. */
  natives: { what: string, keys: readonly string[], citation: string }[]
  /** A file in the graph that puts a node in the tab order, if any. */
  focusable?: string
}

function indexRekaDist(): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const path of walk(REKA_DIST, p => p.endsWith('.js') && !p.endsWith('.cjs'))) {
    const name = basename(path, '.js')
    const list = index.get(name) ?? []
    list.push(path)
    index.set(name, list)
  }
  return index
}

const REKA_INDEX = existsSync(REKA_DIST) ? indexRekaDist() : new Map<string, string[]>()
const rekaCache = new Map<string, RekaResolution>()

/** Every key the named Reka primitive's own transitive source names. */
export function rekaKeysFor(primitive: string): RekaResolution | undefined {
  const cached = rekaCache.get(primitive)
  if (cached !== undefined)
    return cached
  const entries = REKA_INDEX.get(primitive)
  if (entries === undefined || entries.length === 0)
    return undefined

  const resolution: RekaResolution = { keys: new Map<string, string>(), natives: [] }
  const seenNative = new Set<string>()
  const seen = new Set<string>()
  let frontier = entries.slice()

  for (let depth = 0; depth <= REKA_DEPTH && frontier.length > 0; depth++) {
    const next: string[] = []
    for (const path of frontier) {
      if (seen.has(path))
        continue
      seen.add(path)
      let source: string
      try {
        source = stripCommentsForScan(readFileSync(path, 'utf8'), false)
      }
      catch {
        continue
      }
      if (!REKA_DICTIONARIES.test(path)) {
        for (const [key, line] of keysNamedIn(source)) {
          if (!resolution.keys.has(key))
            resolution.keys.set(key, `${rel(path)}:${line}`)
        }
        for (const native of REKA_NATIVE_AS) {
          if (native.pattern.test(source) && !seenNative.has(native.what)) {
            seenNative.add(native.what)
            resolution.natives.push({ what: native.what, keys: native.keys, citation: rel(path) })
          }
        }
        if (resolution.focusable === undefined) {
          const line = source.split('\n').findIndex(l => rekaFocusableLine(l))
          if (line !== -1)
            resolution.focusable = `${rel(path)}:${line + 1}`
        }
      }
      for (const match of source.matchAll(/from\s*["'](\.[^"']+)["']/g)) {
        const target = resolve(dirname(path), match[1]!)
        if (target.startsWith(REKA_DIST) && existsSync(target))
          next.push(target)
      }
    }
    frontier = next
  }

  rekaCache.set(primitive, resolution)
  return resolution
}

// ---------------------------------------------------------------------------
// The closure of a component: who could possibly own one of its keys
// ---------------------------------------------------------------------------

export type Route = 'own' | 'part' | 'renders' | 'composable' | 'primitive' | 'platform' | 'spec'

/**
 * Keys a component's own spec asserts at **runtime** through
 * `expectKeyboardContract` (RESIDUAL-13, closing RESIDUAL-12 §4 `F11`).
 *
 * The seventh route, and the narrowest. It exists for one shape that the other
 * six cannot reach and that is not a defect: a row whose receiving node is
 * **supplied by the consumer**. `DzCheckboxGroup` is a `<div>` and a `<slot />`;
 * the checkboxes are the application's. Statically the answer is behind an edge
 * this walk cannot follow, which is what `undetermined` means and why RESIDUAL-12
 * gave it a ceiling of its own — and the ceilings file says in terms how it falls:
 * a runtime assertion with `expectKeyboardContract` "would settle every slot case".
 *
 * Four conditions, and every one of them matters:
 *
 * 1. **Only for a row that is otherwise `undetermined` because of a `<slot />`.**
 *    Never for an `unbacked` row. `unbacked` means the closure resolved
 *    completely and nothing owns the key — no spec can change that, and a route
 *    that let one would be a way of silencing the gate instead of answering it.
 * 2. **The spec must call `expectKeyboardContract`**, so the declared table is
 *    checked for coherence and reachability against a real mounted tree.
 * 3. **The key must appear in that call's `handled` or `platform` list**, or the
 *    call must carry a `tabStops` option, which is the same kind of assertion for
 *    the one key a list cannot express. Those are the lists that assert
 *    something: `handled` that the component consumed the key, `platform` that
 *    the rendered tree — the consumer's children included — contains a node whose
 *    own documented behaviour is that key, and `tabStops` that the focus order
 *    over a named set of nodes has the shape the row claims. Merely mentioning a
 *    key somewhere in a spec is not an assertion and is not accepted.
 *
 *    `tabStops` was added by RESIDUAL-15 for the five `Tab` rows RESIDUAL-14 §6
 *    left, and it is a widening of this route rather than of any ceiling — the
 *    ceilings file's own words are that `undetermined` is *"counted separately so
 *    that widening the resolution shows up as THIS number falling rather than as
 *    `unbacked` rising"*. It is needed because `platform: ['Tab']` **cannot pass**:
 *    `PLATFORM_OWNERS` in `@dzup-ui/testing`'s `keyboard.ts` credits activation
 *    and text entry only, never navigation, so the call RESIDUAL-14 scheduled
 *    throws. `Tab` is not an element's documented behaviour, it is the document's
 *    focus order, and a `Tab` row here claims one of two **opposite** shapes —
 *    "each box is its own tab stop" or "the toolbar is one tab stop". A key list
 *    cannot tell those apart; `tabStops: { of, expect }` names which, counts the
 *    nodes in the order, and drives the key to check the component has not
 *    trapped it. Only `Tab` is credited, because only `Tab` is what it measures.
 * 4. **The assertion is enforced by a different gate.** `yarn test` fails if it
 *    stops holding, so this route cites a check that runs rather than a check that
 *    exists.
 *
 * What it does **not** prove is worth stating too: that the key produces the right
 * effect. Only the component's own behaviour spec knows what "toggle" means, and
 * `capability-matrix.json`'s `keyboard-spec` cell is the measurement for that.
 */
export function specAssertedKeys(source: string): Map<string, number> {
  const found = new Map<string, number>()
  if (!source.includes('expectKeyboardContract('))
    return found
  for (const match of source.matchAll(/\b(?:handled|platform)\s*:\s*\[([^\]]*)\]/g)) {
    const line = source.slice(0, match.index).split('\n').length
    for (const literal of match[1]!.matchAll(/(['"])(.*?)\1/g)) {
      const key = literal[2]!
      if (!found.has(key))
        found.set(key, line)
    }
  }
  // `tabStops: { of, expect }` — the `Tab` assertion, and the only key it can
  // ever assert. Anchored on the option's opening brace rather than on the word
  // alone, so the sentence "a tabStops assertion would be false here" grants
  // nothing: that is the third shape of the defect RESIDUAL-14 found twice, and
  // `source` reaches here already comment-stripped by `stripCommentsForScan`.
  for (const match of source.matchAll(/\btabStops\s*:\s*\{/g)) {
    const line = source.slice(0, match.index).split('\n').length
    if (!found.has('Tab'))
      found.set('Tab', line)
  }
  return found
}

export interface Owner {
  route: Route
  /** A file and, where source has one, a line. */
  citation: string
  /** For `platform`, which element; for `primitive`, which primitive. */
  what?: string
}

export interface Closure {
  /** Files whose keyboard handling counts, by route. */
  files: { route: Route, file: SourceFile }[]
  /** Reka primitives imported anywhere in the closure. */
  primitives: string[]
  /** Reka primitive names that could not be mapped to a dist module. */
  unresolvedPrimitives: string[]
  /** `Dz*`/composable references that could not be resolved to a file. */
  unresolvedReferences: string[]
  /** True when the render walk hit {@link RENDER_DEPTH} with work left. */
  depthCapped: boolean
}

export interface DeclarationVerdict {
  component: string
  anatomyFile: string
  key: string
  when?: string
  apg?: string
  action: string
  verdict: 'backed' | 'unbacked' | 'undetermined'
  owner?: Owner
  /** Why the closure is incomplete, when the verdict is `undetermined`. */
  unresolved?: string[]
}

export interface UndeclaredHandler {
  /** The file that handles the key. */
  file: string
  line: number
  key: string
  /** The component whose anatomy should have declared it. */
  declaredBy: string
  /** `keyboard: 'none'` makes this the loudest kind of drift. */
  declaresNone: boolean
}

export interface Ceilings {
  maxUnbackedDeclarations: number
  maxUndeterminedDeclarations: number
  maxUndeclaredHandlers: number
}

/**
 * One row, and the citation(s) an audit judged do not support it.
 *
 * The residue of RESIDUAL-14's census: 22 of its 46 wrong citations are wrong for a
 * reason no structural rule reaches — a real handler, correctly bound, doing
 * something other than what the row's sentence says. A checker can be made to prove
 * that a citation is *code rather than prose*, that it *reads the modifier the row
 * declares*, and that an element *can be* the element claimed. It cannot be made to
 * prove that the behaviour at a correctly-bound handler is the behaviour a sentence
 * describes; RESIDUAL-05 drew the same line ("an import proves the component is
 * loaded, not that the spec asserts anything about it").
 *
 * So the judgement is recorded as data, with its evidence, and enforced. The rule
 * for this file mirrors a ceiling: an entry may be **added** by any audit, and
 * **removed only** when the row is re-cited to a site that is not the rejected one
 * (or the row is withdrawn). Deleting an entry to recover a `backed` count is the
 * same act as raising a ceiling.
 */
export interface RejectedCitation {
  component: string
  key: string
  /** Matched exactly, absent included — an entry for an unscoped row omits it. */
  when?: string
  modifiers?: string[]
  /** `path:line`, or `path:*` for every line of a file. */
  citations: string[]
  /** Why the census judged it wrong — the part a reader has to be able to check. */
  why: string
}

export interface AnatomyKeyboardReport {
  verdicts: DeclarationVerdict[]
  undeclaredHandlers: UndeclaredHandler[]
  ceilings: Ceilings
  violations: { rule: string, message: string }[]
  totals: {
    declarations: number
    explicitNone: number
    withBindings: number
    rows: number
    backed: number
    unbacked: number
    undetermined: number
    byRoute: Record<Route, number>
  }
}

// ---------------------------------------------------------------------------

interface ManifestEntry {
  symbol: string
  kind?: string
  parentComponent?: string
}

/** `import { A, B } from 'reka-ui'` — including the multi-line brace form. */
function rekaImportsIn(source: string): string[] {
  const names: string[] = []
  // `[^}]*` rather than `[\s\S]*?`: a lazy any-character class walked BACKWARDS
  // over a preceding `import { X } from 'lucide-vue-next'` and swallowed it into
  // the reka-ui specifier, which is how `ChevronDown` was reported as a Reka
  // primitive that does not exist.
  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]reka-ui(?:\/[^'"]*)?['"]/g)) {
    for (const raw of match[1]!.split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]!.trim()
      if (name !== '')
        names.push(name)
    }
  }
  return names
}

/** Relative `.vue` / `.ts` imports a source pulls in, as absolute paths. */
function relativeImportsIn(path: string, source: string): string[] {
  const out: string[] = []
  for (const match of source.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
    const target = resolve(dirname(path), match[1]!)
    if (existsSync(target) && statSync(target).isFile())
      out.push(target)
    else if (existsSync(`${target}/index.ts`))
      out.push(`${target}/index.ts`)
  }
  return out
}

export function checkAnatomyKeyboard(): AnatomyKeyboardReport {
  const ceilings = JSON.parse(readFileSync(CEILINGS, 'utf8')) as Ceilings
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { entries: ManifestEntry[] }
  const ledger = JSON.parse(readFileSync(REJECTED, 'utf8')) as { rejected: RejectedCitation[] }

  /**
   * Citations RESIDUAL-14's census judged wrong for a **specific row**.
   *
   * Keyed on the row, not on the file, because the same site is right for one row
   * and wrong for another — `DzSearchInput.vue:168` really is the `Enter` that
   * submits, and is not the `Enter` that clears. A rejected citation is skipped and
   * the walk continues, so the row lands on a better owner or on no owner; the
   * ledger can therefore only ever make the numbers worse, which is the property
   * that makes it safe to check in.
   */
  const rejectedFor = (component: string, binding: ManifestKeyboardBinding): ReadonlySet<string> => {
    const out = new Set<string>()
    for (const entry of ledger.rejected) {
      if (entry.component !== component || entry.key !== binding.key)
        continue
      // Exact, absent included: `DzSearchInput.vue:168` really is the `Enter` that
      // submits and is not the `Enter` that clears, and the two rows differ only in
      // `when`. An entry that matched both would reject a citation that is right.
      if ((entry.when ?? '') !== (binding.when ?? ''))
        continue
      if ((entry.modifiers ?? []).join('+') !== (binding.modifiers ?? []).join('+'))
        continue
      for (const citation of entry.citations)
        out.add(citation)
    }
    return out
  }

  /** `compound-part` symbol → the component whose anatomy governs it. */
  const parentOf = new Map<string, string>()
  for (const entry of manifest.entries) {
    if (entry.kind === 'compound-part' && entry.parentComponent !== undefined)
      parentOf.set(entry.symbol, entry.parentComponent)
  }

  // Every .vue in core, by symbol, so a render edge can be resolved by name.
  const vueBySymbol = new Map<string, string>()
  for (const path of walk(CORE_SRC, p => p.endsWith('.vue')))
    vueBySymbol.set(basename(path, '.vue'), path)

  const sourceCache = new Map<string, SourceFile>()
  const read = (path: string): SourceFile | undefined => {
    const cached = sourceCache.get(path)
    if (cached !== undefined)
      return cached
    if (!existsSync(path))
      return undefined
    // The comment-blanked, line-preserved text IS `source` from here on, so every
    // scan below — keys, handler token, template nodes, render-function nodes, Reka
    // imports, relative imports, the `<Dz…>` render edges, the slot token — is
    // reading code rather than prose, without each one having to remember to.
    // RESIDUAL-14: `stripCommentsForScan`'s docblock lists the ten rows this cost.
    const source = stripCommentsForScan(readFileSync(path, 'utf8'), path.endsWith('.vue'))
    const keyLines = keyLinesIn(source)
    const file: SourceFile = {
      path,
      source,
      keyLines,
      keys: new Map([...keyLines].map(([key, at]) => [key, at[0]!])),
      handles: HANDLER_TOKEN.test(source),
      // Template nodes first, so `nodes[0]` is still the component's root, then
      // the elements a render function builds (RESIDUAL-13). `templateNodesIn`
      // returns nothing for a file with no `<template>`, so a sibling `.ts` that
      // builds nodes with `h()` contributes its elements and nothing else.
      nodes: [...templateNodesIn(source), ...renderFunctionNodesIn(source)],
    }
    sourceCache.set(path, file)
    return file
  }

  // -------------------------------------------------------------------------
  // Declarations
  // -------------------------------------------------------------------------

  interface Declaration {
    name: string
    anatomyFile: string
    vue?: string
    anatomy: ManifestAnatomy
    /** The spec that asserts this component's contract at runtime, if any. */
    spec?: string
    /** Keys that spec asserts through `expectKeyboardContract`, with the line. */
    specKeys: Map<string, number>
  }

  const declarations: Declaration[] = []
  for (const root of ANATOMY_ROOTS) {
    for (const path of walk(root, p => p.endsWith('.anatomy.ts'))) {
      const read = parseAnatomySource(readFileSync(path, 'utf8'), path)
      if (read.anatomy === undefined)
        continue
      const name = basename(path, '.anatomy.ts')
      const vue = path.replace(/\.anatomy\.ts$/, '.vue')
      // The spec that could carry a runtime assertion: the component's own first,
      // then the family anatomy spec, which is where `@dzup-ui/testing`'s
      // `keyboard.ts` says these calls belong ("called from the family anatomy
      // specs where the components are already mounted").
      const family = basename(dirname(path))
      const specCandidates = [
        path.replace(/\.anatomy\.ts$/, '.spec.ts'),
        path.replace(/\.anatomy\.ts$/, '.contract.spec.ts'),
        resolve(dirname(path), `${family}.anatomy.spec.ts`),
      ]
      const specKeys = new Map<string, number>()
      let spec: string | undefined
      for (const candidate of specCandidates) {
        if (!existsSync(candidate))
          continue
        const asserted = specAssertedKeys(stripCommentsForScan(readFileSync(candidate, 'utf8'), false))
        if (asserted.size === 0)
          continue
        spec = candidate
        for (const [key, line] of asserted) {
          if (!specKeys.has(key))
            specKeys.set(key, line)
        }
        break
      }
      declarations.push({
        name,
        anatomyFile: rel(path),
        vue: existsSync(vue) ? vue : undefined,
        anatomy: read.anatomy,
        spec,
        specKeys,
      })
    }
  }
  declarations.sort((a, b) => a.name.localeCompare(b.name, 'en'))

  // -------------------------------------------------------------------------
  // The closure
  // -------------------------------------------------------------------------

  function closureOf(declaration: Declaration): Closure {
    const files: { route: Route, file: SourceFile }[] = []
    const primitives = new Set<string>()
    const unresolvedPrimitives = new Set<string>()
    const unresolvedReferences = new Set<string>()
    const visited = new Set<string>()
    let depthCapped = false

    const add = (route: Route, path: string): SourceFile | undefined => {
      if (visited.has(path))
        return undefined
      visited.add(path)
      const file = read(path)
      if (file === undefined) {
        unresolvedReferences.add(rel(path))
        return undefined
      }
      files.push({ route, file })
      for (const name of rekaImportsIn(file.source)) {
        // Reka exports types and utilities alongside primitives; only the ones
        // that map to a dist module are primitives, and the ones that do not
        // map at all are recorded so the verdict can be `undetermined` rather
        // than a guess.
        if (rekaKeysFor(name) !== undefined)
          primitives.add(name)
        else if (/^[A-Z]/.test(name))
          unresolvedPrimitives.add(name)
      }
      return file
    }

    /** Composables reached from a file, one level into their own imports. */
    const addComposables = (file: SourceFile, depth = 0): void => {
      for (const target of relativeImportsIn(file.path, file.source)) {
        if (!target.startsWith(COMPOSABLES) || target.endsWith('.spec.ts'))
          continue
        const added = add('composable', target)
        if (added !== undefined && depth < 2)
          addComposables(added, depth + 1)
      }
    }

    // 1. own
    if (declaration.vue !== undefined) {
      const own = add('own', declaration.vue)
      if (own !== undefined)
        addComposables(own)
    }
    // A component may keep its key handling in a sibling `.ts` (an
    // `optionsStateFocus.ts`-shaped module) — those arrive as relative imports
    // of the `.vue` and are read under `own`.
    const ownFile = declaration.vue === undefined ? undefined : read(declaration.vue)
    if (ownFile !== undefined) {
      for (const target of relativeImportsIn(ownFile.path, ownFile.source)) {
        if (target.endsWith('.ts') && !target.startsWith(COMPOSABLES)
          && !/\.(?:types|variants|tokens|anatomy|spec)\.ts$/.test(target)
          && target.startsWith(CORE_SRC)) {
          add('own', target)
        }
      }
    }

    // 2. compound parts whose parentComponent is this component
    for (const [child, parent] of parentOf) {
      if (parent !== declaration.name)
        continue
      const path = vueBySymbol.get(child)
      if (path === undefined) {
        unresolvedReferences.add(`${child} (compound-part, no .vue found)`)
        continue
      }
      const part = add('part', path)
      if (part !== undefined)
        addComposables(part)
    }

    // 3. Dz* components rendered by anything already in the closure
    let frontier = files.map(f => f.file)
    for (let depth = 0; depth < RENDER_DEPTH; depth++) {
      const next: SourceFile[] = []
      for (const file of frontier) {
        for (const match of file.source.matchAll(/<(Dz[A-Za-z0-9]+)[\s/>]/g)) {
          const path = vueBySymbol.get(match[1]!)
          if (path === undefined) {
            // Not every `<Dz…>` in a template is a component of this library —
            // a doc comment or a story name can look like one — so only a name
            // that is exported anywhere and has no file is unresolved.
            continue
          }
          const added = add('renders', path)
          if (added !== undefined) {
            addComposables(added)
            next.push(added)
          }
        }
        // Relative `.vue` imports catch the unexported internals
        // (`DzOptionsState.vue`) the manifest does not carry.
        for (const target of relativeImportsIn(file.path, file.source)) {
          if (!target.endsWith('.vue'))
            continue
          const added = add('renders', target)
          if (added !== undefined) {
            addComposables(added)
            next.push(added)
          }
        }
      }
      if (depth === RENDER_DEPTH - 1 && next.length > 0)
        depthCapped = true
      frontier = next
    }

    return {
      files,
      primitives: [...primitives].sort(),
      unresolvedPrimitives: [...unresolvedPrimitives].sort(),
      unresolvedReferences: [...unresolvedReferences].sort(),
      depthCapped,
    }
  }

  // -------------------------------------------------------------------------
  // Resolving one declared key
  // -------------------------------------------------------------------------

  /**
   * Either the owner of a key, or the reason ownership cannot be decided.
   *
   * The second case is not a technicality. Three shapes in this library put the
   * node that receives a key somewhere a template scan cannot follow, and each
   * one would otherwise be reported as a false accusation:
   *
   * - **A consumer-supplied focus target.** `DzCheckboxGroup` is a `<div>` and a
   *   `<slot />`; the checkboxes are the application's. Space is toggled by
   *   whatever the consumer put there.
   * - **A render function.** `DzAnchor` builds its links with `h()` in the
   *   script, so its template is a `<nav>` and nothing else.
   * - **A part emitted outside the closure.** A row scoped to a part that no
   *   file this walk reached emits — the node exists (`validate:anatomy-parts`
   *   keeps `maxUnemittedDeclarations` at zero) but not where this can see it.
   */
  type Resolution = { owner: Owner } | { undetermined: string }

  /** `<slot />` in the template — the focus target may be the consumer's. */
  const SLOT_TOKEN = /<slot\b/
  /** Nodes built in the script, which a template scan cannot see. */
  const RENDER_FUNCTION_TOKEN = /\bh\(\s*['"]|createVNode\(\s*['"]|renderList\(/

  function ownerOf(key: string, closure: Closure, scope: string | undefined, parts: readonly string[], declaration: Declaration, modifiers: readonly string[], rejectedHere: ReadonlySet<string>): Resolution | undefined {
    /**
     * A citation this row may not be given — see {@link RejectedCitation}.
     *
     * Two widenings, each because a narrower entry only moved the citation:
     *
     * - `<file>:*` rejects every line of a file. `optionsStateFocus.ts` names
     *   `'ArrowUp'` twice inside the same retry handler, so naming one line moved the
     *   citation to the other.
     * - `<prefix>**` rejects every citation under a prefix. `DzDataGrid`'s six grid
     *   rows do not just have the wrong Reka primitive, they have **no** Reka
     *   primitive: the component imports none, and the ones in its closure are
     *   collateral from a row-selection checkbox and a filter select. Rejecting one
     *   module handed the row the next one — `RovingFocus` became `Select`. What is
     *   true, and what the entry says, is that no primitive owns the row.
     */
    const admits = (citation: string): boolean => {
      if (rejectedHere.has(citation))
        return false
      const at = citation.lastIndexOf(':')
      if (at !== -1 && rejectedHere.has(`${citation.slice(0, at)}:*`))
        return false
      for (const rejected of rejectedHere) {
        if (rejected.endsWith('**') && citation.startsWith(rejected.slice(0, -2)))
          return false
      }
      return true
    }

    const targetPart = scope !== undefined && parts.includes(scope) ? scope : undefined

    /**
     * May a handler route answer for a row scoped to a declared part?
     *
     * Only if the node carrying that part binds a keyboard handler of its own. `when`
     * used to be honoured by the **platform** route alone, so routes 1–4 — which are
     * asked first and scan whole files — satisfied a scoped row with any handler
     * anywhere in the component:
     *
     * - `DzSearchInput`'s `Enter` scoped to the `clear` control was answered by the
     *   `Enter` that **submits the search**, while the `Space` row of the same part was
     *   correctly answered by the clear `<button>`.
     * - `DzTransfer`'s `Enter` for the transfer buttons was answered by an **option's**
     *   own binding in a pane.
     *
     * The test is {@link subtreeOf} the part's node, not the handler's body: it ties a
     * handler to a node without guessing, and it is a *region* test because a declared
     * part often is one. Where the part's node binds nothing, the row belongs to the
     * scoped platform route, which is where those two land. A part this walk never
     * sees leaves the decision alone — that case is already `undetermined` further
     * down and must not become `unbacked` here.
     */
    const partBindsAHandler = targetPart === undefined || (() => {
      let sawPart = false
      for (const { file } of closure.files) {
        for (const node of file.nodes) {
          if (node.part !== targetPart)
            continue
          sawPart = true
          if (HANDLER_TOKEN.test(subtreeOf(file.source, node)))
            return true
        }
      }
      return !sawPart
    })()

    // Routes 1–4, in the order the closure recorded them.
    for (const route of partBindsAHandler ? (['own', 'part', 'renders', 'composable'] as const) : []) {
      for (const { route: fileRoute, file } of closure.files) {
        if (fileRoute !== route || !file.handles)
          continue
        for (const line of file.keyLines.get(key) ?? []) {
          const citation = `${rel(file.path)}:${line}`
          // A declared modifier is part of the contract: the cited site has to be
          // looking at the key the row is about (RESIDUAL-14, `readsModifiersAt`).
          if (!admits(citation) || !readsModifiersAt(file.source, line, modifiers))
            continue
          return { owner: { route, citation } }
        }
      }
    }

    // Route 5 — a Reka primitive's own source.
    for (const primitive of closure.primitives) {
      const resolved = rekaKeysFor(primitive)
      const citation = resolved?.keys.get(key)
      if (citation === undefined || !admits(citation))
        continue
      const line = Number(citation.slice(citation.lastIndexOf(':') + 1))
      const dist = resolve(ROOT, citation.slice(0, citation.lastIndexOf(':')))
      if (!Number.isFinite(line) || !existsSync(dist))
        continue
      if (!readsModifiersAt(stripCommentsForScan(readFileSync(dist, 'utf8'), false), line, modifiers))
        continue
      return { owner: { route: 'primitive', what: primitive, citation } }
    }

    // The platform route cannot satisfy a MODIFIED row at all, with one exception
    // that is not a component's doing either: `Shift`+`Tab` is the document's own
    // reverse focus order. No native element has a documented behaviour for
    // `Shift`+`Enter` or `Shift`+`PageUp`, so crediting `DzTable`'s
    // `Shift`+`Enter` multi-sort row to a `<button>` was the platform table saying
    // "something near here activates", which is not the row.
    if (modifiers.length > 0 && !(modifiers.length === 1 && modifiers[0] === 'Shift' && key === 'Tab'))
      return undefined

    // Route 6 — the platform table, which credits activation and text entry
    // only (see NAVIGATION_KEYS) and is SCOPED to the node the row is about.
    if (NAVIGATION_KEYS.has(key))
      return undefined

    /**
     * The native element a node resolves to: itself, a `Dz*`, or a primitive.
     *
     * Wrapped by {@link nativeAt}, which drops a citation the ledger rejects so the
     * walk keeps looking at the remaining nodes rather than stopping on one.
     */
    const nativeAtRaw = (node: TemplateNode, from: string): Owner | undefined => {
      for (const entry of PLATFORM_KEYS) {
        if (entry.keys.includes(key) && entry.token.test(node.text))
          return { route: 'platform', what: entry.what, citation: `${from}:${node.line}` }
      }
      // A Reka primitive says in its own dist source what element it renders.
      for (const native of rekaKeysFor(node.tag)?.natives ?? []) {
        if (native.keys.includes(key))
          return { route: 'platform', what: `${node.tag}${native.what.replace('a Reka primitive', '')}`, citation: native.citation }
      }
      // A `Dz*` node is another component of this library: its own root is the
      // element that receives the key. One level only — deeper than that and
      // the citation stops meaning anything.
      const path = vueBySymbol.get(node.tag)
      if (path === undefined)
        return undefined
      const inner = read(path)?.nodes[0]
      if (inner === undefined)
        return undefined
      for (const entry of PLATFORM_KEYS) {
        if (entry.keys.includes(key) && entry.token.test(inner.text))
          return { route: 'platform', what: `${node.tag}'s root is ${entry.what}`, citation: `${rel(path)}:${inner.line}` }
      }
      for (const native of rekaKeysFor(inner.tag)?.natives ?? []) {
        if (native.keys.includes(key))
          return { route: 'platform', what: `${node.tag}'s root ${inner.tag}${native.what.replace('a Reka primitive', '')}`, citation: native.citation }
      }
      return undefined
    }

    /** {@link nativeAtRaw}, minus any citation the ledger rejects. */
    const nativeAt = (node: TemplateNode, from: string): Owner | undefined => {
      const owner = nativeAtRaw(node, from)
      return owner !== undefined && admits(owner.citation) ? owner : undefined
    }

    /**
     * `Tab` is the document's focus order. Nothing in this library implements it
     * and nothing should — a component that called `preventDefault()` on Tab
     * would be trapping focus, not implementing the row — so the row is
     * satisfied by there being something to focus. Asked LAST, after every
     * handler route, so that `DzDialogContent`'s Tab is attributed to Reka's
     * `FocusScope`, which really does manage it, rather than to the first
     * focusable node in the tree.
     *
     * Over template NODES, not over whole files: `tabIndex` appears in plenty of
     * `.ts` that renders nothing, and citing `useComponentMessages.ts` as the
     * focusable node behind a `Tab` row is a citation nobody can read back.
     */
    if (key === 'Tab') {
      for (const { file } of closure.files) {
        for (const node of file.nodes) {
          if (FOCUSABLE_TOKEN.test(node.text) && admits(`${rel(file.path)}:${node.line}`)) {
            return {
              owner: {
                route: 'platform',
                what: `<${node.tag}> is focusable — Tab is the document focus order, not a handler`,
                citation: `${rel(file.path)}:${node.line}`,
              },
            }
          }
          // The node may be a Reka primitive or another `Dz*` whose own root is
          // the focusable element: `DzPagination` renders `PaginationFirst`,
          // which is a `<button>` and therefore in the tab order.
          const natives = rekaKeysFor(node.tag)?.natives ?? []
          if (natives.length > 0 && admits(natives[0]!.citation))
            return { owner: { route: 'platform', what: `${node.tag} renders a focusable element`, citation: natives[0]!.citation } }
          const dz = vueBySymbol.get(node.tag)
          const inner = dz === undefined ? undefined : read(dz)?.nodes[0]
          if (inner !== undefined && FOCUSABLE_TOKEN.test(inner.text) && admits(`${rel(dz!)}:${inner.line}`))
            return { owner: { route: 'platform', what: `${node.tag}'s root <${inner.tag}> is focusable`, citation: `${rel(dz!)}:${inner.line}` } }
        }
      }
      for (const primitive of closure.primitives) {
        const focusable = rekaKeysFor(primitive)?.focusable
        if (focusable !== undefined && admits(focusable))
          return { owner: { route: 'platform', what: `${primitive} puts a node in the tab order`, citation: focusable } }
      }
    }

    /** The files whose own markup this component is answerable for. */
    const ownAndParts = closure.files.filter(f => f.route === 'own' || f.route === 'part')

    if (targetPart !== undefined) {
      // A scoped row names the node it is about; nothing else may satisfy it.
      let sawPart = false
      for (const { file } of closure.files) {
        for (const node of file.nodes) {
          if (node.part !== targetPart)
            continue
          sawPart = true
          const owner = nativeAt(node, rel(file.path))
          if (owner !== undefined)
            return { owner: { ...owner, what: `${owner.what} — the node carrying the declared part "${targetPart}"` } }
        }
      }
      if (!sawPart) {
        return {
          undetermined: `the row is scoped to the declared part "${targetPart}" and no file this walk `
            + 'reached emits it, so the node that receives the key is outside the closure',
        }
      }
      return undefined
    }

    // An unscoped row applies "wherever the component has focus". If the root
    // itself takes focus it IS that node and it has to do the key — which is
    // how `DzChip` and `DzTag` are caught: a `<span tabindex="0">` is a focus
    // target that activates on nothing. Only when the root does NOT take focus
    // is the focus target somewhere inside, and then the component's own
    // template and its compound parts are where to look — never a component it
    // merely composes, whose keys are its own business.
    const ownEntry = closure.files.find(f => f.route === 'own')
    const ownRoot = ownEntry?.file.nodes[0]
    if (ownRoot !== undefined && ownEntry !== undefined) {
      const owner = nativeAt(ownRoot, rel(ownEntry.file.path))
      if (owner !== undefined)
        return { owner: { ...owner, what: `${owner.what} — the component's own root` } }
      if (FOCUSABLE_TOKEN.test(ownRoot.text))
        return undefined
    }
    for (const { file } of ownAndParts) {
      for (const node of file.nodes) {
        const owner = nativeAt(node, rel(file.path))
        if (owner !== undefined)
          return { owner: { ...owner, what: `${owner.what} — inside ${basename(file.path)}, whose root takes no focus` } }
      }
    }

    // Route 7 — a RUNTIME assertion, and only for the one shape the other six
    // cannot reach: a `<slot />` whose contents are the consumer's. Asked here,
    // after every static route and before the `undetermined` verdicts, so it can
    // only ever turn `undetermined` into `backed` and never `unbacked` into
    // anything. See `specAssertedKeys` for the four conditions.
    const specLine = declaration.specKeys.get(key)
    if (specLine !== undefined
      && declaration.spec !== undefined
      && admits(`${rel(declaration.spec)}:${specLine}`)
      && ownAndParts.some(f => SLOT_TOKEN.test(f.file.source))) {
      return {
        owner: {
          route: 'spec',
          what: 'the node that receives this key is supplied by the consumer, and the spec asserts '
            + 'the contract against a rendered tree that has one',
          citation: `${rel(declaration.spec)}:${specLine}`,
        },
      }
    }

    // Nothing in this component's own markup owns the key, and the markup is
    // not all of it: a `<slot />` means the focus target may be the consumer's,
    // and an `h()` call means the node is built in the script where a template
    // scan cannot see it. Neither is satisfaction and neither is a defect.
    if (ownEntry !== undefined && RENDER_FUNCTION_TOKEN.test(ownEntry.file.source)) {
      return {
        undetermined: `${basename(ownEntry.file.path)} builds nodes in a render function `
          + '(`h()` / `renderList()`), which a template scan cannot follow',
      }
    }
    if (ownAndParts.some(f => SLOT_TOKEN.test(f.file.source))) {
      return {
        undetermined: 'the component renders a `<slot />` and owns no native element for this key, '
          + 'so the node that receives it is supplied by the consumer',
      }
    }

    return undefined
  }

  const verdicts: DeclarationVerdict[] = []
  const byRoute: Record<Route, number> = { own: 0, part: 0, renders: 0, composable: 0, primitive: 0, platform: 0, spec: 0 }

  /** Keys the declaring anatomy (or a parent's) declares, per component. */
  const declaredKeys = new Map<string, Set<string>>()
  const declaresNone = new Set<string>()

  for (const declaration of declarations) {
    const contract = declaration.anatomy.keyboard
    if (contract === 'none')
      declaresNone.add(declaration.name)
    const keys = new Set<string>(
      contract === undefined || contract === 'none' ? [] : contract.map(b => b.key),
    )
    declaredKeys.set(declaration.name, keys)
  }

  for (const declaration of declarations) {
    const contract = declaration.anatomy.keyboard
    if (contract === undefined || contract === 'none')
      continue
    const closure = closureOf(declaration)
    const unresolved = [
      ...closure.unresolvedPrimitives.map(name => `Reka \`${name}\` did not map to a dist module`),
      ...closure.unresolvedReferences.map(name => `could not read ${name}`),
      ...(closure.depthCapped ? [`the render walk hit the depth cap of ${RENDER_DEPTH}`] : []),
      ...(declaration.vue === undefined ? ['there is no .vue beside the anatomy'] : []),
    ]

    const parts = declaration.anatomy.parts === 'none' ? [] : declaration.anatomy.parts
    for (const binding of contract as ManifestKeyboardBinding[]) {
      const row = {
        component: declaration.name,
        anatomyFile: declaration.anatomyFile,
        key: binding.key,
        when: binding.when,
        apg: binding.apg,
        action: binding.action,
      }
      const resolution = ownerOf(
        binding.key,
        closure,
        binding.when,
        parts,
        declaration,
        binding.modifiers ?? [],
        rejectedFor(declaration.name, binding),
      )
      if (resolution !== undefined && 'owner' in resolution) {
        byRoute[resolution.owner.route]++
        verdicts.push({ ...row, verdict: 'backed', owner: resolution.owner })
        continue
      }
      // Row-level reasons first: they name the specific edge that stops this
      // key from being decidable, which is more use than the closure-wide list.
      const why = [
        ...(resolution === undefined ? [] : [resolution.undetermined]),
        ...unresolved,
      ]
      verdicts.push({
        ...row,
        verdict: why.length > 0 ? 'undetermined' : 'unbacked',
        unresolved: why.length > 0 ? why : undefined,
      })
    }
  }

  // -------------------------------------------------------------------------
  // Reverse drift — a key handled and not declared
  // -------------------------------------------------------------------------

  const undeclaredHandlers: UndeclaredHandler[] = []
  const componentVues = walk(resolve(CORE_SRC, 'components'), p => p.endsWith('.vue'))
    .concat(walk(resolve(CORE_SRC, 'providers'), p => p.endsWith('.vue')))

  for (const path of componentVues) {
    const symbol = basename(path, '.vue')
    // Which anatomy governs this file? Its own, or its parentComponent's.
    const governing = declaredKeys.has(symbol)
      ? symbol
      : parentOf.get(symbol)
    if (governing === undefined || !declaredKeys.has(governing))
      continue
    const file = read(path)
    if (file === undefined || !file.handles)
      continue
    const declared = declaredKeys.get(governing)!
    for (const [key, line] of file.keys) {
      // `<character>`/`<digit>` are contract placeholders, not keys a template
      // compares against; a `.key.length === 1` guard is not drift.
      if (key === '<character>' || key === '<digit>' || declared.has(key))
        continue
      undeclaredHandlers.push({
        file: rel(path),
        line,
        key,
        declaredBy: governing,
        declaresNone: declaresNone.has(governing),
      })
    }
  }
  undeclaredHandlers.sort((a, b) => a.file.localeCompare(b.file, 'en') || a.key.localeCompare(b.key, 'en'))

  // -------------------------------------------------------------------------

  const unbacked = verdicts.filter(v => v.verdict === 'unbacked')
  const undetermined = verdicts.filter(v => v.verdict === 'undetermined')
  const backed = verdicts.filter(v => v.verdict === 'backed')

  const violations: { rule: string, message: string }[] = []
  if (unbacked.length > ceilings.maxUnbackedDeclarations) {
    violations.push({
      rule: 'unbacked-declaration',
      message: `${unbacked.length} declared keyboard binding(s) are backed by no handler, no `
        + `primitive and no platform behaviour, over the ceiling of `
        + `${ceilings.maxUnbackedDeclarations}. The ceiling ratchets DOWN: implement the key, or `
        + 'delete the row. A published keyboard table that promises a key nothing handles is an '
        + 'accessibility claim that is false.',
    })
  }
  if (undetermined.length > ceilings.maxUndeterminedDeclarations) {
    violations.push({
      rule: 'undetermined-declaration',
      message: `${undetermined.length} declared binding(s) could not be resolved either way, over `
        + `the ceiling of ${ceilings.maxUndeterminedDeclarations}. Undetermined means the closure `
        + 'has an edge this validator could not follow — extend the resolution or simplify the '
        + 'component; it does NOT mean satisfied.',
    })
  }
  if (undeclaredHandlers.length > ceilings.maxUndeclaredHandlers) {
    violations.push({
      rule: 'undeclared-handler',
      message: `${undeclaredHandlers.length} key(s) are handled by a component whose governing `
        + `anatomy does not declare them, over the ceiling of ${ceilings.maxUndeclaredHandlers}. `
        + 'The reverse drift is the same defect mirrored: the published table is incomplete, so a '
        + 'consumer reading it does not learn what the component actually does.',
    })
  }

  const withBindings = declarations.filter(d => Array.isArray(d.anatomy.keyboard))
  return {
    verdicts,
    undeclaredHandlers,
    ceilings,
    violations,
    totals: {
      declarations: declarations.length,
      explicitNone: declarations.filter(d => d.anatomy.keyboard === 'none').length,
      withBindings: withBindings.length,
      rows: verdicts.length,
      backed: backed.length,
      unbacked: unbacked.length,
      undetermined: undetermined.length,
      byRoute,
    },
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = checkAnatomyKeyboard()
  const { totals, ceilings } = report

  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(report, (_key, value) =>
      value instanceof Map ? Object.fromEntries(value) : value, 2)}
`)
    process.exit(report.violations.length === 0 ? 0 : 1)
  }

  if (report.violations.length === 0) {
    console.warn(
      `✓ anatomy-keyboard: ${totals.rows} declared bindings across ${totals.withBindings} `
      + `components (${totals.declarations} anatomy declarations, ${totals.explicitNone} declare `
      + `keyboard: 'none'); ${totals.backed} backed, ${totals.unbacked}/`
      + `${ceilings.maxUnbackedDeclarations} unbacked, ${totals.undetermined}/`
      + `${ceilings.maxUndeterminedDeclarations} undetermined`,
    )
    console.warn(
      `  owners: own ${totals.byRoute.own} · compound part ${totals.byRoute.part} · renders `
      + `${totals.byRoute.renders} · composable ${totals.byRoute.composable} · Reka primitive `
      + `${totals.byRoute.primitive} · platform ${totals.byRoute.platform} · runtime spec `
      + `${totals.byRoute.spec}`,
    )
    console.warn(
      `  reverse drift: ${report.undeclaredHandlers.length}/${ceilings.maxUndeclaredHandlers} `
      + 'key(s) handled but not declared',
    )
    for (const verdict of report.verdicts.filter(v => v.verdict === 'unbacked')) {
      console.warn(
        `   · UNBACKED ${verdict.component} \`${verdict.key}\``
        + `${verdict.when === undefined ? '' : ` (when ${verdict.when})`} — "${verdict.action}"`,
      )
    }
    for (const verdict of report.verdicts.filter(v => v.verdict === 'undetermined')) {
      console.warn(
        `   · UNDETERMINED ${verdict.component} \`${verdict.key}\` — `
        + `${(verdict.unresolved ?? []).join('; ')}`,
      )
    }
    for (const drift of report.undeclaredHandlers) {
      console.warn(
        `   · UNDECLARED HANDLER ${drift.file}:${drift.line} handles \`${drift.key}\`, which `
        + `${drift.declaredBy}'s anatomy does not declare`
        + `${drift.declaresNone ? ' — and it declares keyboard: \'none\'' : ''}`,
      )
    }
    process.exit(0)
  }

  for (const verdict of report.verdicts.filter(v => v.verdict === 'unbacked')) {
    console.error(
      `✗ ${verdict.component} declares \`${verdict.key}\``
      + `${verdict.when === undefined ? '' : ` (when ${verdict.when})`}`
      + `${verdict.apg === undefined ? '' : ` as APG \`${verdict.apg}\``} — "${verdict.action}" — `
      + `and nothing handles it: not ${verdict.component}'s own source, not a compound part, not a `
      + `component it renders, not a composable, not a Reka primitive it imports, and no native `
      + `element it renders. ${verdict.anatomyFile}`,
    )
  }
  for (const verdict of report.verdicts.filter(v => v.verdict === 'undetermined')) {
    console.error(
      `✗ ${verdict.component} declares \`${verdict.key}\` and ownership is UNDETERMINED: `
      + `${(verdict.unresolved ?? []).join('; ')}. Undetermined is not satisfied.`,
    )
  }
  for (const drift of report.undeclaredHandlers) {
    console.error(
      `✗ ${drift.file}:${drift.line} handles \`${drift.key}\` and ${drift.declaredBy}'s anatomy `
      + `does not declare it${drift.declaresNone ? ' — it declares keyboard: \'none\'' : ''}. The `
      + 'published keyboard table is what a consumer reads; a key it omits is a key they do not '
      + 'know exists.',
    )
  }
  for (const violation of report.violations)
    console.error(`\n✗ ${violation.rule}: ${violation.message}`)
  process.exit(1)
}
/* c8 ignore stop */
