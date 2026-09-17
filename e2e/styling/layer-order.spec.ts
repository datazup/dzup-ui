import { expect, test } from '@playwright/test'

// @ts-expect-error -- the packer is a Node script shared with the CLI entry point
import { readPackedStylesheets } from './pack-styles.mjs'

/**
 * The CSS layer / import-order fixture (TASK-R5-O1, ADR-19 §2; 08-11 doc 08
 * package-matrix row).
 *
 * ADR-19's Consequences say a consumer *"gains `dz-overrides` immediately as a
 * documented place to write, with no library change required"*, and its §2 says
 * "a consumer override needs no `!important`"*. Until TASK-R5-O1 the library
 * declared three layers, not six, so both sentences were true only by accident:
 * an **unregistered** layer is appended after every registered one, so a
 * consumer writing `@layer dz-overrides { … }` won because nothing had claimed
 * the name — and would have silently begun losing the day the library
 * registered any layer after `dz-components`.
 *
 * Every assertion below runs against the CSS inside the **packed tarballs**,
 * not `packages/core/src/styles/base.css`. What a consumer receives is the
 * built, minified, `files`-filtered artifact, and the steps between source and
 * artifact are where a layer statement can be dropped, hoisted or reordered.
 *
 * Nothing in this file uses `!important`. That is asserted, not asserted-about.
 */

const { tokensCss, coreCss, paths } = readPackedStylesheets() as {
  tokensCss: string
  coreCss: string
  paths: { tokensCss: string, coreCss: string, tarballs: Record<string, string> }
}

/**
 * The ordering statement, read the way `packages/tooling/src/docs/read-evidence.ts`
 * reads it: a bare `@layer a, b, c;` at the start of a line. Anchoring matters —
 * the first run of this fixture matched the words "@layer dz-tokens" inside
 * `tokens.css`'s own header COMMENT and reported the tokens sheet as carrying no
 * statement at all.
 */
const LAYER_STATEMENT = /^@layer[ \t]+([^\s;{][^;{\n]*);/m

/** The six slots ADR-19 §2 decides, in the order it decides them. */
const ADR19_LAYERS = ['dz-reset', 'dz-tokens', 'dz-base', 'dz-components', 'dz-utilities', 'dz-overrides']

/**
 * A real library rule to fight: `.dz-tab-close-btn { opacity: 0 }` ships inside
 * `@layer dz-components`. `opacity` is used deliberately — it computes to a bare
 * number, so a failure reads as `0 !== 0.5` rather than as a colour-space
 * argument, and the value is not inherited from anything else in the sheet.
 */
const LIBRARY_SELECTOR = '.dz-tab-close-btn'

const CONSUMER_UNLAYERED = `${LIBRARY_SELECTOR} { opacity: 0.5 }`
const CONSUMER_IN_OVERRIDES = `@layer dz-overrides { ${LIBRARY_SELECTOR} { opacity: 0.25 } }`

/** Build a document from a list of stylesheets, in the order given. */
function documentOf(sheets: string[]): string {
  return `<!DOCTYPE html><html><head>${
    sheets.map(css => `<style>${css}</style>`).join('')
  }</head><body><button class="dz-tab-close-btn" data-part="close">x</button></body></html>`
}

async function opacityOf(page: import('@playwright/test').Page, sheets: string[]): Promise<string> {
  await page.setContent(documentOf(sheets))
  return page.locator(LIBRARY_SELECTOR).evaluate(el => getComputedStyle(el).opacity)
}

test.describe('cascade layers, read from the packed tarball', () => {
  test('the fixture itself uses no !important', () => {
    for (const css of [CONSUMER_UNLAYERED, CONSUMER_IN_OVERRIDES])
      expect(css).not.toContain('!important')
  })

  test('the published core stylesheet registers all six ADR-19 layers, in order', () => {
    const statement = LAYER_STATEMENT.exec(coreCss)
    expect(statement, `no bare @layer statement in ${paths.coreCss}`).not.toBeNull()
    expect(statement![1]!.split(',').map(name => name.trim())).toEqual(ADR19_LAYERS)
  })

  test('the published tokens stylesheet repeats the same statement', () => {
    // Both sheets must carry it, or the order would depend on which one a
    // bundler emitted first: CSS registers a layer at its FIRST appearance.
    const statement = LAYER_STATEMENT.exec(tokensCss)
    expect(statement, `no bare @layer statement in ${paths.tokensCss}`).not.toBeNull()
    expect(statement![1]!.split(',').map(name => name.trim())).toEqual(ADR19_LAYERS)
  })

  test('the library rule under test really is layered', () => {
    expect(coreCss).toContain('@layer dz-components{')
    expect(coreCss).toContain('.dz-tab-close-btn{')
  })

  test('the library alone renders the layered value', async ({ page }) => {
    expect(await opacityOf(page, [tokensCss, coreCss])).toBe('0')
  })

  test('unlayered consumer CSS beats every library layer, library first', async ({ page }) => {
    expect(await opacityOf(page, [tokensCss, coreCss, CONSUMER_UNLAYERED])).toBe('0.5')
  })

  test('reversing the import order does NOT flip the unlayered result', async ({ page }) => {
    // This is the guarantee consumers actually act on: unlayered CSS beats
    // layered CSS regardless of source order, so a bundler that reorders sheets
    // cannot change which rule wins.
    expect(await opacityOf(page, [CONSUMER_UNLAYERED, tokensCss, coreCss])).toBe('0.5')
  })

  test('a consumer rule in @layer dz-overrides beats dz-components, no !important', async ({ page }) => {
    expect(await opacityOf(page, [tokensCss, coreCss, CONSUMER_IN_OVERRIDES])).toBe('0.25')
  })

  test('dz-overrides still wins when both consumer sheets are present', async ({ page }) => {
    // Unlayered beats every layer, including dz-overrides — so the unlayered
    // 0.5 is expected to win over the layered 0.25. Asserted so that the two
    // documented override routes have a defined precedence between them rather
    // than an accidental one.
    expect(await opacityOf(page, [tokensCss, coreCss, CONSUMER_IN_OVERRIDES, CONSUMER_UNLAYERED])).toBe('0.5')
  })

  /**
   * The measured limit of the layered route, recorded rather than papered over.
   *
   * A layer is registered at its FIRST appearance anywhere in the document. If
   * a consumer sheet that opens `@layer dz-overrides { … }` is evaluated BEFORE
   * the library's stylesheets, `dz-overrides` is registered first and the
   * library's own statement then appends `dz-reset … dz-components` AFTER it —
   * so `dz-components` wins and the consumer's override silently does nothing.
   *
   * Repeating the six-slot statement in both published sheets does NOT fix this
   * (it was written expecting it would, and all three engines said otherwise).
   * Nothing the library ships can fix it: the library cannot make a declaration
   * appear before a sheet that loads first.
   *
   * What follows for consumers, and what the docs must say: import the dzup
   * stylesheets before your own — the normal arrangement — or use the unlayered
   * route, which the two tests above prove is order-independent. The behaviour
   * is asserted here so a future change to the layer statement cannot alter it
   * without a test saying so.
   */
  test('a consumer sheet that registers dz-overrides BEFORE the library loses', async ({ page }) => {
    expect(await opacityOf(page, [CONSUMER_IN_OVERRIDES, tokensCss, coreCss])).toBe('0')
    // …and the unlayered route still wins from the same position.
    expect(await opacityOf(page, [CONSUMER_IN_OVERRIDES, CONSUMER_UNLAYERED, tokensCss, coreCss])).toBe('0.5')
  })
})
