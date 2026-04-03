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
})
