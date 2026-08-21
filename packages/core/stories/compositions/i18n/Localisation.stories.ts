import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { DzButton } from '../../../src/components/buttons'
import { DzSelect } from '../../../src/components/forms'
import { DzInput, DzSearchInput } from '../../../src/components/inputs'
import { DzPagination } from '../../../src/components/navigation'
import { pseudoMessages } from '../../../src/i18n/pseudo.ts'
// `.ts` explicitly: an extensionless import of this directory resolves to the
// committed `index.js` artifact, which predates `DzProvider`.
import { DzProvider } from '../../../src/providers/index.ts'
import { darkModeDecorator, longLabelDecorator } from '../../_shared'

/**
 * Localisation — what the library ships, what an application overrides, and how
 * to see a translation break before a translator is paid (TASK-OSS-P4-03).
 *
 * Every user-visible string `@dzup-ui/core` renders now comes from one catalog
 * and is looked up through `DzProvider`'s `messages`. Before that, **54 static
 * `aria-label` values across 27 components could not be changed by any
 * application at all** — an Arabic application shipped `aria-label="Clear
 * input"` — and 39 prop defaults could only be changed one instance at a time.
 *
 * The interesting stories here are the last two. Anyone can demo a translated
 * button; what is worth having in a component library is a way to find the
 * string that *did not* translate, and the label that fits in English and
 * nowhere else.
 *
 * **Try the Pseudo-locale toolbar** (the globe, top right). It applies to every
 * story in this Storybook, not just these — which is the point: coverage that
 * grows with the catalog instead of with the number of stories someone
 * remembered to decorate.
 */
const meta = {
  title: 'Compositions/Localisation/Messages',
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * The shipped English defaults. Nothing is configured; every string below is a
 * catalog lookup that resolved to what the component used to hard-code.
 */
export const Default: Story = {
  render: () => ({
    components: { DzProvider, DzInput, DzSearchInput, DzPagination },
    template: `
      <DzProvider>
        <div class="grid gap-3 max-w-sm">
          <DzInput model-value="Clearable" clearable />
          <DzSearchInput model-value="Search me" />
          <DzPagination :total="120" :page-size="10" :page="3" />
        </div>
      </DzProvider>
    `,
  }),
}

/**
 * One application, one catalog. The provider's `messages` deep-merge over the
 * shipped defaults per key, so a host translating three strings keeps the other
 * eighty-odd rather than losing them.
 *
 * Note what is being translated: `DzInput.clear` and `DzPagination.nextPage`
 * are **accessible names**, not visible text. They were the half of the problem
 * no prop could reach.
 */
export const Translated: Story = {
  render: () => ({
    components: { DzProvider, DzInput, DzSelect, DzPagination },
    setup: () => ({
      messages: {
        DzInput: { clear: 'Effacer le champ' },
        DzPagination: {
          ariaLabel: 'Pagination',
          nextPage: 'Page suivante',
          previousPage: 'Page précédente',
          firstPage: 'Première page',
          lastPage: 'Dernière page',
        },
        DzSelect: { noResults: 'Aucun résultat', searchPlaceholder: 'Rechercher…' },
      },
      options: [{ label: 'Un', value: '1' }, { label: 'Deux', value: '2' }],
    }),
    template: `
      <DzProvider locale="fr-FR" :messages="messages">
        <div class="grid gap-3 max-w-sm">
          <DzInput model-value="Effaçable" clearable />
          <DzSelect :options="options" searchable placeholder="Choisir…" />
          <DzPagination :total="120" :page-size="10" :page="3" />
        </div>
      </DzProvider>
    `,
  }),
}

/**
 * Pseudo-locale: English that looks and measures foreign.
 *
 * Every string is accented, padded **+30%** — the shortest realistic German —
 * and framed in `[!!! … !!!]`. Three failures become visible without a
 * translator:
 *
 * - **Plain unaccented English** is a string the catalog does not reach, i.e.
 *   one somebody hard-coded.
 * - **A missing `!!!]`** is a clipped label. The frame is what lets you see
 *   truncation without knowing what the full text should have been.
 * - **A broken layout** is what a real translation will do to it.
 *
 * The catalog is generated from `enMessages`, so a message added tomorrow is
 * covered by this fixture today.
 */
export const PseudoLocale: Story = {
  render: () => ({
    components: { DzProvider, DzInput, DzSearchInput, DzPagination, DzButton },
    setup: () => ({ messages: pseudoMessages() }),
    template: `
      <DzProvider :messages="messages">
        <div class="grid gap-3 max-w-sm">
          <DzInput model-value="Pseudo" clearable />
          <DzSearchInput model-value="Pseudo" />
          <DzPagination :total="120" :page-size="10" :page="3" />
          <DzButton tone="primary">Save</DzButton>
        </div>
      </DzProvider>
    `,
  }),
}

/**
 * The other half of the same failure: strings the **consumer** passes.
 *
 * Pseudo-locale lengthens what the library owns. This constrains the container
 * instead, so a component has to show what it does when the label it was given
 * does not fit — wrap, truncate, or overflow into its neighbour. A button that
 * fits "Save" and not "Änderungen speichern" fails here and nowhere else.
 */
export const LongLabels: Story = {
  decorators: [longLabelDecorator],
  render: () => ({
    components: { DzProvider, DzButton, DzInput },
    template: `
      <DzProvider>
        <div class="grid gap-3">
          <DzButton tone="primary">Änderungen speichern und fortfahren</DzButton>
          <DzButton variant="outline">Vertraulichkeitsvereinbarung herunterladen</DzButton>
          <DzInput model-value="Rechnungsempfängeranschrift" clearable />
        </div>
      </DzProvider>
    `,
  }),
}

/**
 * Both at once, which is the combination that actually ships: a translated
 * catalog *and* consumer copy in the same language.
 */
export const PseudoLocaleGallery: Story = {
  name: 'Pseudo-locale + long labels',
  decorators: [longLabelDecorator],
  render: () => ({
    components: { DzProvider, DzButton, DzInput, DzSearchInput },
    setup: () => ({ messages: pseudoMessages() }),
    template: `
      <DzProvider :messages="messages">
        <div class="grid gap-3">
          <DzButton tone="primary">Änderungen speichern und fortfahren</DzButton>
          <DzInput model-value="Rechnungsempfängeranschrift" clearable />
          <DzSearchInput model-value="Rechnungsempfänger" />
        </div>
      </DzProvider>
    `,
  }),
}
