import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  DzButton,
  DzSplitButton,
  DzSplitButtonAction,
  DzSplitButtonMenu,
  DzToggleButton,
} from '../../../src/components/buttons'
import { pseudoLocalise } from '../../../src/i18n/pseudo.ts'

/**
 * Text stress — what the text-bearing components of the visual-lane pilot family
 * (`buttons`) do with text English never produces (TASK-R5-O4).
 *
 * Four fixtures, each a named story the per-component visual lane snapshots in
 * light and dark (`e2e/visual/visual-baselines.json` → `scope.fixtures`):
 *
 * - **CJK** — Japanese, Simplified Chinese and Korean labels: no spaces to break
 *   at, full-width glyphs, and a fallback font the pilot's baselines never drew.
 * - **Combining marks** — Vietnamese stacked diacritics, Devanagari conjuncts,
 *   Thai above/below marks and a Zalgo-style mark pile: glyphs taller than the
 *   line box, and graphemes a naive truncation splits.
 * - **4,096-character run** — one unbroken word. Whether the control wraps,
 *   clips or blows out its container is the question; the fixed-width frame is
 *   what makes the answer visible.
 * - **Pseudo expansion (+40 %)** — the pseudo-locale transform with its padding
 *   raised from +30 % to +40 %, the upper end German and Finnish reach.
 *
 * Every fixture renders inside the same 16rem frame the long-label decorator
 * uses, so a label that overflows does so against a known edge. No theme
 * decorator: the visual lane sets the theme global, and a decorator that forced
 * dark would make the light baseline a second dark one.
 */
const meta = {
  title: 'Compositions/Localisation/Text stress',
  tags: ['status:experimental'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** One frame: every text-bearing control in the pilot family, same label. */
function frame(label: string) {
  return () => ({
    components: { DzButton, DzSplitButton, DzSplitButtonAction, DzSplitButtonMenu, DzToggleButton },
    setup: () => ({ label }),
    template: `
      <div data-dz-text-stress class="grid gap-3 w-[16rem] max-w-[16rem]">
        <DzButton>{{ label }}</DzButton>
        <DzButton variant="outline" size="sm">{{ label }}</DzButton>
        <DzToggleButton :model-value="true">{{ label }}</DzToggleButton>
        <DzSplitButton aria-label="Actions">
          <DzSplitButtonAction>{{ label }}</DzSplitButtonAction>
          <DzSplitButtonMenu aria-label="More actions" />
        </DzSplitButton>
      </div>
    `,
  })
}

/** Japanese, Simplified Chinese and Korean. */
export const Cjk: Story = {
  render: frame('変更を保存して続行 · 确认并提交订单 · 변경 사항을 저장'),
}

/** Vietnamese, Devanagari, Thai, and a pile of combining marks on Latin. */
export const CombiningMarks: Story = {
  render: frame('Tiếp tục · क्षत्रिय · บันทึกการเปลี่ยนแปลง · Z͑ͤͤä̧́l͛ǧo̶͓'),
}

/** The 4,096-character run: one word, no break opportunity. */
const RUN_UNIT = 'Donaudampfschifffahrtsgesellschaftskapitän'
export const LongRun4096: Story = {
  name: 'Long run (4,096 chars)',
  render: frame(RUN_UNIT.repeat(Math.ceil(4096 / RUN_UNIT.length)).slice(0, 4096)),
}

/**
 * The pseudo-locale transform, padded to +40 % of the English length rather
 * than the toolbar's +30 %. The frame is kept, so a clipped label still shows
 * whether its tail — `!!!]` — survived.
 */
function pseudoExpanded(english: string, expansion: number): string {
  const framed = pseudoLocalise(english)
  const body = framed.slice(0, -' !!!]'.length)
  const target = Math.ceil(english.length * (1 + expansion)) + '[!!!  !!!]'.length
  let padded = body
  while (padded.length + ' !!!]'.length < target)
    padded += '·'
  return `${padded} !!!]`
}

export const PseudoExpansion40: Story = {
  name: 'Pseudo expansion (+40 %)',
  render: frame(pseudoExpanded('Save changes and continue', 0.4)),
}
