import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DzButton, DzButtonGroup } from '../../../src/components/buttons'
import { DzTable, DzTableBody, DzTableCell, DzTableHeader, DzTableRow } from '../../../src/components/data'
import { DzSelect } from '../../../src/components/forms'
import { DzInput } from '../../../src/components/inputs'
import { DzDialog, DzDialogContent, DzDialogTitle, DzDialogTrigger } from '../../../src/components/overlays'
// `.ts` explicitly: an extensionless import of this directory resolves to the
// committed `index.js` artifact, which predates `DzProvider`. See the note in
// stories/providers/DzProvider.stories.ts.
import { DzProvider, DzThemeProvider } from '../../../src/providers/index.ts'
import { darkModeDecorator } from '../../_shared'

/**
 * Customization / Overrides — the five P3-03 pilots, each restyled through the
 * sanctioned mechanisms only (ADR-19).
 *
 * Every story here is a claim that can be checked: nothing below uses a
 * descendant selector, a generated class name, or `!important`. Each pilot is
 * restyled four ways — brand tokens, a component token, a recipe variant, and a
 * per-part `ui` override — and the fourth is the one that did not exist before
 * this packet.
 *
 * `apps/landing/e2e` (or Playwright against this Storybook) asserts the
 * computed styles actually changed; a story that renders is not by itself
 * evidence that an override took effect.
 */
const meta = {
  title: 'Compositions/Customization/Overrides',
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * A brand theme applied by setting design tokens on a scope — no component
 * touched, no selector written. This is the first thing to reach for and the
 * only one that restyles every component at once.
 *
 * Note which radius tokens are set. An earlier draft set `--dz-radius-md`, the
 * obvious guess, and the corners did not move: DzButton reads
 * `--dz-button-radius` and DzInput reads `--dz-input-radius`. A Playwright run
 * caught it, and the components' `componentTokens` declarations — which had
 * both omitted radius — were completed as a result. Guessing the token name is
 * exactly what the anatomy exists to stop.
 */
export const BrandTheme: Story = {
  render: () => ({
    components: { DzButton, DzInput },
    // #region brand-theme
    template: `
      <div
        data-dz-override-fixture="brand-theme"
        style="
          --dz-primary: oklch(0.55 0.21 296);
          --dz-primary-foreground: oklch(0.99 0 0);
          --dz-button-radius: 0px;
          --dz-input-radius: 0px;
          display: grid;
          gap: 12px;
          max-width: 320px;
        "
      >
        <DzButton tone="primary">Branded</DzButton>
        <DzInput model-value="Branded field" />
      </div>
    `,
    // #endregion
  }),
}

/**
 * Compact density, again through tokens. The components read `--dz-spacing-*`
 * and the size recipes; nothing here knows a class name.
 */
export const CompactDensity: Story = {
  render: () => ({
    components: { DzButton, DzInput },
    // #region compact-density
    template: `
      <div
        data-dz-override-fixture="compact-density"
        style="--dz-spacing-2: 0.25rem; --dz-spacing-3: 0.375rem; display: grid; gap: 6px; max-width: 320px;"
      >
        <DzButton size="sm">Compact</DzButton>
        <DzInput size="sm" model-value="Compact field" />
      </div>
    `,
    // #endregion
  }),
}

/**
 * One component token, scoped to one instance.
 *
 * DzButton owns `--dz-button-*` tokens, so this works. **DzSelect and DzTable
 * do not** — their anatomy declares `componentTokens: []` because they style
 * from global tokens only, which is why the per-part route below exists.
 */
export const ComponentToken: Story = {
  render: () => ({
    components: { DzButton },
    // #region component-token
    template: `
      <div data-dz-override-fixture="component-token" style="display: flex; gap: 12px;">
        <DzButton>Default</DzButton>
        <DzButton style="--dz-button-disabled-opacity: 0.9;" disabled>
          Barely dimmed
        </DzButton>
      </div>
    `,
    // #endregion
  }),
}

/**
 * A recipe variant — the supported way to pick a different look, and the reason
 * the taxonomies are frozen (ADR-02).
 */
export const RecipeVariant: Story = {
  render: () => ({
    components: { DzButton, DzInput },
    // #region recipe-variant
    template: `
      <div data-dz-override-fixture="recipe-variant" style="display: grid; gap: 12px; max-width: 320px;">
        <DzButton variant="outline" tone="danger">Outline · danger</DzButton>
        <DzInput variant="underlined" model-value="Underlined" />
      </div>
    `,
    // #endregion
  }),
}

/**
 * The per-part override. Each of the five pilots restyles a node that **no
 * prop and no `class` could reach** before ADR-19: a spinner, an error message,
 * a portaled listbox, a dialog backdrop, a table caption.
 */
export const PartOverride: Story = {
  render: () => ({
    components: {
      DzButton,
      DzInput,
      DzSelect,
      DzDialog,
      DzDialogContent,
      DzDialogTitle,
      DzDialogTrigger,
      DzTable,
      DzTableHeader,
      DzTableBody,
      DzTableRow,
      DzTableCell,
    },
    setup() {
      return {
        items: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      }
    },
    // #region part-override
    template: `
      <div data-dz-override-fixture="part-override" style="display: grid; gap: 16px; max-width: 420px;">
        <DzButton loading :ui="{ spinner: 'h-6 w-6' }">Oversized spinner</DzButton>

        <DzInput
          model-value=""
          error="This field is required"
          :ui="{ error: 'text-[length:var(--dz-text-sm)] font-semibold' }"
        />

        <DzSelect
          :items="items"
          placeholder="Roomier list"
          :ui="{ content: 'p-3', item: 'py-3' }"
        />

        <DzDialog>
          <DzDialogTrigger as-child>
            <DzButton variant="outline">Blurred backdrop</DzButton>
          </DzDialogTrigger>
          <DzDialogContent :ui="{ overlay: 'backdrop-blur-sm' }">
            <DzDialogTitle>Overridden dialog</DzDialogTitle>
          </DzDialogContent>
        </DzDialog>

        <DzTable caption-visible :ui="{ title: 'text-left font-semibold' }">
          <template #caption>Visible, left-aligned caption</template>
          <DzTableHeader>
            <DzTableRow><DzTableCell header>Fruit</DzTableCell></DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow><DzTableCell>Apple</DzTableCell></DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>
    `,
    // #endregion
  }),
}

/**
 * A default applied once to many components, without touching any of them —
 * now at two scopes, with a fixed precedence between them.
 *
 * `DzProvider` (TASK-OSS-P4-02, ADR-20) sets application-wide defaults per
 * component. `DzButtonGroup` sets them for a subtree through compound context
 * (ADR-08), as `DzInputGroup` and `DzFormField` do for size and validation
 * state. The order is fixed and not negotiable per component:
 * **prop → compound context → provider → the component's own default.**
 *
 * Read the story that way: the buttons take `size` and `tone` from the
 * provider, `variant` from the group because the provider said nothing about
 * it, and the last one keeps its own `tone` because a prop outranks both.
 *
 * Which components honour a provider default is a declared fact, not a promise:
 * a component that does lists the axes in its anatomy's `globalDefaults`.
 * `DzButton` is the first, and the rest of the rollout is TASK-OSS-P4-03
 * onwards.
 */
export const GlobalDefault: Story = {
  render: () => ({
    components: { DzButton, DzButtonGroup, DzProvider },
    // #region global-default
    template: `
      <div data-dz-override-fixture="global-default" style="display: grid; gap: 12px;">
        <DzProvider :defaults="{ DzButton: { size: 'sm', tone: 'info' } }">
          <DzButtonGroup variant="outline">
            <DzButton>Provider size and tone, group variant</DzButton>
            <DzButton tone="danger">Opts out of tone only</DzButton>
          </DzButtonGroup>
        </DzProvider>
      </div>
    `,
    // #endregion
  }),
}

/**
 * Components inside a shadow root, and why the tokens have to come with them.
 *
 * A shadow root does not inherit the document's stylesheets, but custom
 * properties **do** inherit through the boundary — so `--dz-*` set on an
 * ancestor reaches the shadow tree, while the component stylesheet does not.
 * Both halves have to be handled, and this story does the honest version:
 * the sheet is adopted into the root, the tokens are inherited.
 *
 * `DzThemeProvider` renders no element of its own (its template is a bare
 * `<slot />`), so it works inside a shadow root exactly as it does outside.
 *
 * The known limitation, stated rather than hidden: **portaled content escapes
 * the shadow root.** A dialog or select mounted inside it teleports to
 * `document.body`, outside the boundary, and loses the adopted sheet. The
 * portal-target prop (`portalTo`) is the workaround today; a provider-level
 * portal target **shipped in TASK-OSS-P4-04**: set `DzProvider`'s `portal` to a
 * container inside the shadow root and every overlay stays within the boundary.
 * `portalTo` remains the per-instance escape hatch.
 */
export const ShadowDom: Story = {
  render: () => ({
    components: { DzButton, DzThemeProvider },
    // #region shadow-dom
    template: `
      <div data-dz-override-fixture="shadow-dom">
        <div ref="host" />
      </div>
    `,
    // #endregion
    mounted() {
      const host = this.$refs.host as HTMLElement | undefined
      if (!host || host.shadowRoot)
        return

      const root = host.attachShadow({ mode: 'open' })

      // Custom properties inherit through the boundary; stylesheets do not.
      // Adopting the document's sheets is what makes the component look like
      // itself inside the shadow tree.
      root.adoptedStyleSheets = Array.from(document.styleSheets)
        .flatMap((sheet) => {
          try {
            const copy = new CSSStyleSheet()
            copy.replaceSync(Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'))
            return [copy]
          }
          catch {
            return []
          }
        })

      const mount = document.createElement('div')
      mount.innerHTML = '<button data-part="root" class="dz-focus-ring-button" '
        + 'style="background: var(--dz-primary); color: var(--dz-primary-foreground); '
        + 'padding: var(--dz-spacing-2) var(--dz-spacing-4); border: 0; '
        + 'border-radius: var(--dz-button-radius); font-family: var(--dz-button-font-family);">'
        + 'Inside a shadow root</button>'
      root.append(mount)
    },
  }),
}

/**
 * What NOT to do, rendered next to what to do.
 *
 * The left column reaches for a generated class name and `!important`; it is
 * shown as text rather than applied, because a story that demonstrates the
 * anti-pattern working is an endorsement of it.
 */
export const AntiPatterns: Story = {
  render: () => ({
    components: { DzButton },
    template: `
      <div data-dz-override-fixture="anti-patterns" style="display: grid; gap: 12px; max-width: 520px;">
        <p style="margin: 0; color: var(--dz-danger); font-weight: 600;">
          Don't: a descendant selector against generated classes, or !important
        </p>
        <pre style="margin: 0; padding: 8px; background: var(--dz-muted); border-radius: 6px; overflow-x: auto;"><code>.my-form .inline-flex > svg { height: 24px !important; }</code></pre>
        <p style="margin: 0; color: var(--dz-success); font-weight: 600;">Do: name the part</p>
        <pre style="margin: 0; padding: 8px; background: var(--dz-muted); border-radius: 6px; overflow-x: auto;"><code>&lt;DzButton loading :ui="{ spinner: 'h-6 w-6' }" /&gt;</code></pre>
        <DzButton loading :ui="{ spinner: 'h-6 w-6' }">Save</DzButton>
      </div>
    `,
  }),
}
