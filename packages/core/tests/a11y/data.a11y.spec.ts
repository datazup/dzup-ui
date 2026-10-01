/**
 * Accessibility tests for the data family.
 *
 * Tests DzAccordion, DzTable, DzList, DzChip, DzTag, DzTimeline, and DzTree
 * for WCAG 2.1 AA compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzAccordion from '../../src/components/data/DzAccordion.vue'
import DzAccordionContent from '../../src/components/data/DzAccordionContent.vue'
import DzAccordionItem from '../../src/components/data/DzAccordionItem.vue'
import DzAccordionTrigger from '../../src/components/data/DzAccordionTrigger.vue'
import DzChip from '../../src/components/data/DzChip.vue'
import DzList from '../../src/components/data/DzList.vue'
import DzListItem from '../../src/components/data/DzListItem.vue'
import DzTable from '../../src/components/data/DzTable.vue'
import DzTableBody from '../../src/components/data/DzTableBody.vue'
import DzTableCell from '../../src/components/data/DzTableCell.vue'
import DzTableHeader from '../../src/components/data/DzTableHeader.vue'
import DzTableRow from '../../src/components/data/DzTableRow.vue'
import DzTag from '../../src/components/data/DzTag.vue'
import DzTimeline from '../../src/components/data/DzTimeline.vue'
import DzTimelineItem from '../../src/components/data/DzTimelineItem.vue'
import DzTree from '../../src/components/data/DzTree.vue'
import { expectNoProhibitedAria } from './prohibited-aria.ts'
import './register-matchers.ts'

describe('data family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzAccordion
  // ---------------------------------------------------------------------------

  describe('dzAccordion', () => {
    it('has no a11y violations with single type', async () => {
      const { container } = render({
        template: `
          <DzAccordion type="single" collapsible>
            <DzAccordionItem value="item-1">
              <DzAccordionTrigger>Section 1</DzAccordionTrigger>
              <DzAccordionContent>Content 1</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="item-2">
              <DzAccordionTrigger>Section 2</DzAccordionTrigger>
              <DzAccordionContent>Content 2</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        `,
        components: {
          DzAccordion,
          DzAccordionItem,
          DzAccordionTrigger,
          DzAccordionContent,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with multiple type', async () => {
      const { container } = render({
        template: `
          <DzAccordion type="multiple">
            <DzAccordionItem value="a">
              <DzAccordionTrigger>Item A</DzAccordionTrigger>
              <DzAccordionContent>Content A</DzAccordionContent>
            </DzAccordionItem>
            <DzAccordionItem value="b">
              <DzAccordionTrigger>Item B</DzAccordionTrigger>
              <DzAccordionContent>Content B</DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        `,
        components: {
          DzAccordion,
          DzAccordionItem,
          DzAccordionTrigger,
          DzAccordionContent,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzTable
  // ---------------------------------------------------------------------------

  describe('dzTable', () => {
    it('has no a11y violations with basic table structure', async () => {
      const { container } = render({
        template: `
          <DzTable aria-label="User data">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Name</DzTableCell>
                <DzTableCell header>Email</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow>
                <DzTableCell>Alice</DzTableCell>
                <DzTableCell>alice@example.com</DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        `,
        components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzList
  // ---------------------------------------------------------------------------

  describe('dzList', () => {
    it('has no a11y violations with list items', async () => {
      const { container } = render({
        template: `
          <DzList aria-label="Items">
            <DzListItem>Item 1</DzListItem>
            <DzListItem>Item 2</DzListItem>
            <DzListItem>Item 3</DzListItem>
          </DzList>
        `,
        components: { DzList, DzListItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzChip
  // ---------------------------------------------------------------------------

  describe('dzChip', () => {
    it('has no a11y violations with default chip', async () => {
      const { container } = render(DzChip, {
        slots: { default: 'Active' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with closable chip', async () => {
      const { container } = render(DzChip, {
        props: { closable: true },
        slots: { default: 'Removable' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzChip, {
        props: { disabled: true },
        slots: { default: 'Disabled chip' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    /**
     * RESIDUAL-11 `D-RES10-3`. The chip root declared `role="status"` — an ARIA
     * live region — on every chip, in every state, so a filter bar of chips was a
     * page full of live regions and each add, relabel or remove announced itself
     * over whatever the user was reading.
     *
     * axe cannot hold this: `role="status"` on a `<span>` is perfectly valid ARIA
     * and all three renders above were clean with it in place. The claim is that
     * this element is not a live region, and only a structural assertion states
     * it.
     */
    it('is not a live region, in any state', () => {
      for (const props of [{}, { closable: true }, { disabled: true }]) {
        const { container } = render(DzChip, { props, slots: { default: 'Active' } })
        expect(container.querySelectorAll('[aria-live]')).toHaveLength(0)
        expect(container.querySelectorAll('[role="status"], [role="alert"], [role="log"]')).toHaveLength(0)
      }
    })

    /**
     * RESIDUAL-12 `D-RES11-1`, and the assertion is the point of it.
     *
     * A `<span>` with no role is `generic`; ARIA 1.2 prohibits `aria-label` and
     * `aria-labelledby` on `generic`; and axe reports that as
     * `aria-prohibited-attr` in its **`incomplete`** bucket, which
     * `toHaveNoViolations()` does not read. So the three chip assertions above and
     * the seven tag assertions below were all green while a named chip and a named
     * tag both carried a prohibited name. RESIDUAL-11 measured it and said no gate
     * could see it.
     *
     * `expectNoProhibitedAria` reads that bucket. These cases are the ones that
     * used to fail it.
     */
    for (const [label, props] of [
      ['ariaLabel', { ariaLabel: 'Design' }],
      ['ariaLabel + closable', { ariaLabel: 'Design', closable: true }],
      ['ariaLabelledby', { ariaLabelledby: 'chip-label' }],
    ] as const) {
      it(`carries no prohibited ARIA name with ${label}`, async () => {
        const { container } = render(DzChip, { props, slots: { default: 'Design' } })
        const results = await axe(container)
        expect(results).toHaveNoViolations()
        expectNoProhibitedAria(results)
      })
    }

    it('takes a naming-capable role only when it is named', () => {
      const roleOf = (props: Record<string, unknown>): string | null =>
        render(DzChip, { props, slots: { default: 'Design' } })
          .container
          .querySelector('[data-part="root"]')!
          .getAttribute('role')

      // Unnamed: no role at all. This is `D-RES10-3`'s position and it is unchanged.
      expect(roleOf({})).toBeNull()
      expect(roleOf({ closable: true })).toBeNull()
      expect(roleOf({ ariaDescribedby: 'x' })).toBeNull()
      // Named: a role that may hold a name, and not a live region.
      expect(roleOf({ ariaLabel: 'Design' })).toBe('group')
      expect(roleOf({ ariaLabelledby: 'x' })).toBe('group')
    })
  })

  // ---------------------------------------------------------------------------
  // DzTag
  // ---------------------------------------------------------------------------

  describe('dzTag', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const

    for (const tone of tones) {
      it(`has no a11y violations with tone="${tone}"`, async () => {
        const { container } = render(DzTag, {
          props: { tone },
          slots: { default: `${tone} tag` },
        })
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    }

    it('has no a11y violations with closable tag', async () => {
      const { container } = render(DzTag, {
        props: { closable: true },
        slots: { default: 'Closable' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    /**
     * RESIDUAL-12 `D-RES11-1`. `DzTag` is where this defect started — it has had a
     * prohibited `aria-label` on its root since it was written, under all eight
     * assertions above, because the rule lands in axe's `incomplete` bucket.
     * `DzChip` only became symmetric with it in RESIDUAL-11. The two are fixed and
     * asserted together, in the same shape, for the same reason.
     */
    for (const [label, props] of [
      ['ariaLabel', { ariaLabel: 'Frontend' }],
      ['ariaLabel + closable', { ariaLabel: 'Frontend', closable: true }],
      ['ariaLabelledby', { ariaLabelledby: 'tag-label' }],
    ] as const) {
      it(`carries no prohibited ARIA name with ${label}`, async () => {
        const { container } = render(DzTag, { props, slots: { default: 'Frontend' } })
        const results = await axe(container)
        expect(results).toHaveNoViolations()
        expectNoProhibitedAria(results)
      })
    }

    it('agrees with DzChip about when the root takes a naming-capable role', () => {
      const roleOf = (component: unknown, props: Record<string, unknown>): string | null =>
        render(component as never, { props, slots: { default: 'X' } })
          .container
          .querySelector('[data-part="root"]')!
          .getAttribute('role')

      for (const props of [{}, { closable: true }, { ariaLabel: 'X' }, { ariaLabelledby: 'y' }])
        expect(roleOf(DzTag, props)).toBe(roleOf(DzChip, props))
    })
  })

  // ---------------------------------------------------------------------------
  // DzTimeline
  // ---------------------------------------------------------------------------

  describe('dzTimeline', () => {
    it('has no a11y violations with timeline items', async () => {
      const { container } = render({
        template: `
          <DzTimeline aria-label="Event history">
            <DzTimelineItem>Event 1 occurred</DzTimelineItem>
            <DzTimelineItem>Event 2 occurred</DzTimelineItem>
          </DzTimeline>
        `,
        components: { DzTimeline, DzTimelineItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzTree
  //
  // This file's header has named DzTree since it was written and the file never
  // imported it, so the capability matrix was citing a sentence: RESIDUAL-05 moved
  // the cell to `unrun` and these renders are what earns it back (RESIDUAL-06,
  // `D-RES05-2`). A nested tree with an expanded branch is used deliberately — the
  // APG `tree` role puts `aria-expanded`, `aria-level` and the roving `tabindex` on
  // the *item*, so a single flat node would exercise none of the rules that can fail.
  // ---------------------------------------------------------------------------

  describe('dzTree', () => {
    const treeItems = [
      {
        key: 'engineering',
        label: 'Engineering',
        children: [
          { key: 'frontend', label: 'Frontend' },
          { key: 'backend', label: 'Backend', children: [{ key: 'api', label: 'API' }] },
        ],
      },
      { key: 'design', label: 'Design' },
    ]

    it('has no a11y violations with an expanded nested tree', async () => {
      const { container } = render(DzTree, {
        props: {
          items: treeItems,
          ariaLabel: 'Departments',
          expandedKeys: ['engineering', 'backend'],
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when selectable and checkable', async () => {
      const { container } = render(DzTree, {
        props: {
          items: treeItems,
          ariaLabel: 'Departments',
          expandedKeys: ['engineering'],
          selectedKeys: ['frontend'],
          selectable: true,
          checkable: true,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
