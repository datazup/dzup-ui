/**
 * Accessibility tests for the overlays family.
 *
 * Tests DzDialog, DzSheet, DzPopover, DzTooltip, DzDropdownMenu, and
 * DzContextMenu for WCAG 2.1 AA compliance using vitest-axe.
 *
 * Note: Portaled overlay content (Dialog, Sheet, Tooltip, Dropdown, etc.)
 * renders outside the main container via Reka UI portals. When checking
 * baseElement (full document), we disable the `region` axe rule because
 * portaled content outside landmarks is expected behavior in a testing
 * environment.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { nextTick } from 'vue'
import DzContextMenu from '../../src/components/overlays/DzContextMenu.vue'
import DzContextMenuContent from '../../src/components/overlays/DzContextMenuContent.vue'
import DzContextMenuItem from '../../src/components/overlays/DzContextMenuItem.vue'
import DzContextMenuTrigger from '../../src/components/overlays/DzContextMenuTrigger.vue'
import DzDialog from '../../src/components/overlays/DzDialog.vue'
import DzDialogClose from '../../src/components/overlays/DzDialogClose.vue'
import DzDialogContent from '../../src/components/overlays/DzDialogContent.vue'
import DzDialogDescription from '../../src/components/overlays/DzDialogDescription.vue'
import DzDialogTitle from '../../src/components/overlays/DzDialogTitle.vue'
import DzDialogTrigger from '../../src/components/overlays/DzDialogTrigger.vue'
import DzDropdownMenu from '../../src/components/overlays/DzDropdownMenu.vue'
import DzDropdownMenuContent from '../../src/components/overlays/DzDropdownMenuContent.vue'
import DzDropdownMenuItem from '../../src/components/overlays/DzDropdownMenuItem.vue'
import DzDropdownMenuTrigger from '../../src/components/overlays/DzDropdownMenuTrigger.vue'
import DzPopover from '../../src/components/overlays/DzPopover.vue'
import DzPopoverContent from '../../src/components/overlays/DzPopoverContent.vue'
import DzPopoverTrigger from '../../src/components/overlays/DzPopoverTrigger.vue'
import DzSheet from '../../src/components/overlays/DzSheet.vue'
import DzSheetClose from '../../src/components/overlays/DzSheetClose.vue'
import DzSheetContent from '../../src/components/overlays/DzSheetContent.vue'
import DzSheetDescription from '../../src/components/overlays/DzSheetDescription.vue'
import DzSheetTitle from '../../src/components/overlays/DzSheetTitle.vue'
import DzSheetTrigger from '../../src/components/overlays/DzSheetTrigger.vue'
import DzTooltip from '../../src/components/overlays/DzTooltip.vue'
import DzTooltipContent from '../../src/components/overlays/DzTooltipContent.vue'
import DzTooltipTrigger from '../../src/components/overlays/DzTooltipTrigger.vue'

/**
 * Axe rules to disable when scanning portaled overlay content via baseElement.
 * - region: portaled content renders outside landmarks in jsdom
 * - aria-dialog-name: Reka UI auto-links DialogTitle via aria-labelledby,
 *   but the linkage may not resolve synchronously in jsdom
 */
const portalAxeRules = {
  region: { enabled: false },
}

describe('overlays family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzDialog
  // ---------------------------------------------------------------------------

  describe('dzDialog', () => {
    it('has no a11y violations with trigger (closed state)', async () => {
      const { container } = render({
        template: `
          <DzDialog>
            <DzDialogTrigger>
              <button>Open dialog</button>
            </DzDialogTrigger>
            <DzDialogContent>
              <DzDialogTitle>Test Dialog</DzDialogTitle>
              <DzDialogDescription>A test description</DzDialogDescription>
              <DzDialogClose />
            </DzDialogContent>
          </DzDialog>
        `,
        components: {
          DzDialog,
          DzDialogTrigger,
          DzDialogContent,
          DzDialogTitle,
          DzDialogDescription,
          DzDialogClose,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations in open state', async () => {
      const { baseElement } = render({
        template: `
          <DzDialog v-model:open="isOpen">
            <DzDialogTrigger>
              <button>Open dialog</button>
            </DzDialogTrigger>
            <DzDialogContent aria-label="Test dialog">
              <DzDialogTitle>Title</DzDialogTitle>
              <DzDialogDescription>Description</DzDialogDescription>
              <DzDialogClose />
            </DzDialogContent>
          </DzDialog>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDialog,
          DzDialogTrigger,
          DzDialogContent,
          DzDialogTitle,
          DzDialogDescription,
          DzDialogClose,
        },
      })
      await nextTick()
      const results = await axe(baseElement, { rules: portalAxeRules })
      expect(results).toHaveNoViolations()
    })

    it('renders dialog content with role="dialog"', async () => {
      render({
        template: `
          <DzDialog v-model:open="isOpen">
            <DzDialogTrigger>
              <button>Open</button>
            </DzDialogTrigger>
            <DzDialogContent>
              <DzDialogTitle>Title</DzDialogTitle>
              <DzDialogDescription>Description text</DzDialogDescription>
            </DzDialogContent>
          </DzDialog>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDialog,
          DzDialogTrigger,
          DzDialogContent,
          DzDialogTitle,
          DzDialogDescription,
        },
      })
      await nextTick()
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeTruthy()
    })

    it('has no a11y violations with modal dialog', async () => {
      const { baseElement } = render({
        template: `
          <DzDialog v-model:open="isOpen" :modal="true">
            <DzDialogTrigger>
              <button>Open</button>
            </DzDialogTrigger>
            <DzDialogContent aria-label="Modal dialog">
              <DzDialogTitle>Modal Dialog</DzDialogTitle>
              <DzDialogDescription>Modal description</DzDialogDescription>
            </DzDialogContent>
          </DzDialog>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDialog,
          DzDialogTrigger,
          DzDialogContent,
          DzDialogTitle,
          DzDialogDescription,
        },
      })
      await nextTick()
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeTruthy()
      const results = await axe(baseElement, { rules: portalAxeRules })
      expect(results).toHaveNoViolations()
    })

    it('close button has accessible label', async () => {
      render({
        template: `
          <DzDialog v-model:open="isOpen">
            <DzDialogTrigger>
              <button>Open</button>
            </DzDialogTrigger>
            <DzDialogContent>
              <DzDialogTitle>Title</DzDialogTitle>
              <DzDialogDescription>Description</DzDialogDescription>
              <DzDialogClose />
            </DzDialogContent>
          </DzDialog>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDialog,
          DzDialogTrigger,
          DzDialogContent,
          DzDialogTitle,
          DzDialogDescription,
          DzDialogClose,
        },
      })
      await nextTick()
      const closeBtn = document.querySelector('[aria-label="Close"]')
      expect(closeBtn).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // DzSheet
  // ---------------------------------------------------------------------------

  describe('dzSheet', () => {
    it('has no a11y violations with trigger (closed state)', async () => {
      const { container } = render({
        template: `
          <DzSheet>
            <DzSheetTrigger>
              <button>Open sheet</button>
            </DzSheetTrigger>
            <DzSheetContent>
              <DzSheetTitle>Sheet Title</DzSheetTitle>
              <DzSheetDescription>Description</DzSheetDescription>
            </DzSheetContent>
          </DzSheet>
        `,
        components: {
          DzSheet,
          DzSheetTrigger,
          DzSheetContent,
          DzSheetTitle,
          DzSheetDescription,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations in open state', async () => {
      const { baseElement } = render({
        template: `
          <DzSheet v-model:open="isOpen">
            <DzSheetTrigger>
              <button>Open sheet</button>
            </DzSheetTrigger>
            <DzSheetContent side="right" aria-label="Settings panel">
              <DzSheetTitle>Settings</DzSheetTitle>
              <DzSheetDescription>Configure preferences.</DzSheetDescription>
              <DzSheetClose />
            </DzSheetContent>
          </DzSheet>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzSheet,
          DzSheetTrigger,
          DzSheetContent,
          DzSheetTitle,
          DzSheetDescription,
          DzSheetClose,
        },
      })
      await nextTick()
      const results = await axe(baseElement, { rules: portalAxeRules })
      expect(results).toHaveNoViolations()
    })

    it('renders as dialog when open', async () => {
      render({
        template: `
          <DzSheet v-model:open="isOpen" :modal="true">
            <DzSheetTrigger>
              <button>Open</button>
            </DzSheetTrigger>
            <DzSheetContent>
              <DzSheetTitle>Sheet</DzSheetTitle>
              <DzSheetDescription>Description</DzSheetDescription>
            </DzSheetContent>
          </DzSheet>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzSheet,
          DzSheetTrigger,
          DzSheetContent,
          DzSheetTitle,
          DzSheetDescription,
        },
      })
      await nextTick()
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeTruthy()
    })

    it('close button has screen reader text', async () => {
      render({
        template: `
          <DzSheet v-model:open="isOpen">
            <DzSheetTrigger>
              <button>Open</button>
            </DzSheetTrigger>
            <DzSheetContent>
              <DzSheetTitle>Title</DzSheetTitle>
              <DzSheetDescription>Description</DzSheetDescription>
              <DzSheetClose />
            </DzSheetContent>
          </DzSheet>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzSheet,
          DzSheetTrigger,
          DzSheetContent,
          DzSheetTitle,
          DzSheetDescription,
          DzSheetClose,
        },
      })
      await nextTick()
      const srOnly = document.querySelector('.sr-only')
      expect(srOnly).toBeTruthy()
      expect(srOnly).toHaveTextContent('Close')
    })
  })

  // ---------------------------------------------------------------------------
  // DzPopover
  // ---------------------------------------------------------------------------

  describe('dzPopover', () => {
    it('has no a11y violations with trigger (closed state)', async () => {
      const { container } = render({
        template: `
          <DzPopover>
            <DzPopoverTrigger>
              <button>Toggle popover</button>
            </DzPopoverTrigger>
            <DzPopoverContent>
              Popover body content
            </DzPopoverContent>
          </DzPopover>
        `,
        components: { DzPopover, DzPopoverTrigger, DzPopoverContent },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when open', async () => {
      const { baseElement } = render({
        template: `
          <DzPopover v-model:open="isOpen">
            <DzPopoverTrigger>
              <button>Toggle</button>
            </DzPopoverTrigger>
            <DzPopoverContent>
              Popover content
            </DzPopoverContent>
          </DzPopover>
        `,
        data() {
          return { isOpen: true }
        },
        components: { DzPopover, DzPopoverTrigger, DzPopoverContent },
      })
      await nextTick()
      const results = await axe(baseElement, { rules: portalAxeRules })
      expect(results).toHaveNoViolations()
    })

    it('trigger has aria-expanded attribute', () => {
      const { container } = render({
        template: `
          <DzPopover>
            <DzPopoverTrigger>
              <button>Toggle</button>
            </DzPopoverTrigger>
            <DzPopoverContent>Content</DzPopoverContent>
          </DzPopover>
        `,
        components: { DzPopover, DzPopoverTrigger, DzPopoverContent },
      })
      const trigger = container.querySelector('button')
      expect(trigger).toHaveAttribute('aria-expanded')
    })
  })

  // ---------------------------------------------------------------------------
  // DzTooltip
  // ---------------------------------------------------------------------------

  describe('dzTooltip', () => {
    it('has no a11y violations with trigger (closed state)', async () => {
      const { container } = render({
        template: `
          <DzTooltip>
            <DzTooltipTrigger>
              <button>Hover me</button>
            </DzTooltipTrigger>
            <DzTooltipContent>Tooltip text</DzTooltipContent>
          </DzTooltip>
        `,
        components: { DzTooltip, DzTooltipTrigger, DzTooltipContent },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when open', async () => {
      const { baseElement } = render({
        template: `
          <DzTooltip v-model:open="isOpen" :delay-duration="0">
            <DzTooltipTrigger>
              <button>Hover me</button>
            </DzTooltipTrigger>
            <DzTooltipContent>Helpful tooltip</DzTooltipContent>
          </DzTooltip>
        `,
        data() {
          return { isOpen: true }
        },
        components: { DzTooltip, DzTooltipTrigger, DzTooltipContent },
      })
      await nextTick()
      const results = await axe(baseElement, { rules: portalAxeRules })
      expect(results).toHaveNoViolations()
    })

    it('tooltip content has role="tooltip" when visible', async () => {
      render({
        template: `
          <DzTooltip v-model:open="isOpen" :delay-duration="0">
            <DzTooltipTrigger>
              <button>Hover me</button>
            </DzTooltipTrigger>
            <DzTooltipContent>Tooltip text</DzTooltipContent>
          </DzTooltip>
        `,
        data() {
          return { isOpen: true }
        },
        components: { DzTooltip, DzTooltipTrigger, DzTooltipContent },
      })
      await nextTick()
      const tooltip = document.querySelector('[role="tooltip"]')
      expect(tooltip).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // DzDropdownMenu
  // ---------------------------------------------------------------------------

  describe('dzDropdownMenu', () => {
    it('has no a11y violations with trigger (closed state)', async () => {
      const { container } = render({
        template: `
          <DzDropdownMenu>
            <DzDropdownMenuTrigger>
              <button>Options</button>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent>
              <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
              <DzDropdownMenuItem>Delete</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        `,
        components: {
          DzDropdownMenu,
          DzDropdownMenuTrigger,
          DzDropdownMenuContent,
          DzDropdownMenuItem,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when open', async () => {
      const { baseElement } = render({
        template: `
          <DzDropdownMenu v-model:open="isOpen">
            <DzDropdownMenuTrigger>
              <button>Options</button>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent>
              <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
              <DzDropdownMenuItem>Delete</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDropdownMenu,
          DzDropdownMenuTrigger,
          DzDropdownMenuContent,
          DzDropdownMenuItem,
        },
      })
      await nextTick()
      const results = await axe(baseElement, { rules: portalAxeRules })
      expect(results).toHaveNoViolations()
    })

    it('trigger has aria-haspopup attribute', () => {
      const { container } = render({
        template: `
          <DzDropdownMenu>
            <DzDropdownMenuTrigger>
              <button>Options</button>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent>
              <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        `,
        components: {
          DzDropdownMenu,
          DzDropdownMenuTrigger,
          DzDropdownMenuContent,
          DzDropdownMenuItem,
        },
      })
      const trigger = container.querySelector('button')
      expect(trigger).toHaveAttribute('aria-haspopup')
    })

    it('menu items have role="menuitem" when open', async () => {
      render({
        template: `
          <DzDropdownMenu v-model:open="isOpen">
            <DzDropdownMenuTrigger>
              <button>Options</button>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent>
              <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
              <DzDropdownMenuItem>Delete</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDropdownMenu,
          DzDropdownMenuTrigger,
          DzDropdownMenuContent,
          DzDropdownMenuItem,
        },
      })
      await nextTick()
      const items = document.querySelectorAll('[role="menuitem"]')
      expect(items.length).toBe(2)
    })

    it('disabled menu item has data-disabled attribute', async () => {
      render({
        template: `
          <DzDropdownMenu v-model:open="isOpen">
            <DzDropdownMenuTrigger>
              <button>Options</button>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent>
              <DzDropdownMenuItem :disabled="true">Disabled action</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        `,
        data() {
          return { isOpen: true }
        },
        components: {
          DzDropdownMenu,
          DzDropdownMenuTrigger,
          DzDropdownMenuContent,
          DzDropdownMenuItem,
        },
      })
      await nextTick()
      const item = document.querySelector('[role="menuitem"]')
      expect(item).toBeTruthy()
      expect(item).toHaveAttribute('data-disabled')
    })
  })

  // ---------------------------------------------------------------------------
  // DzContextMenu
  // ---------------------------------------------------------------------------

  describe('dzContextMenu', () => {
    it('has no a11y violations with trigger area', async () => {
      const { container } = render({
        template: `
          <DzContextMenu>
            <DzContextMenuTrigger>
              <div>Right click me</div>
            </DzContextMenuTrigger>
            <DzContextMenuContent>
              <DzContextMenuItem>Edit</DzContextMenuItem>
              <DzContextMenuItem>Delete</DzContextMenuItem>
            </DzContextMenuContent>
          </DzContextMenu>
        `,
        components: {
          DzContextMenu,
          DzContextMenuTrigger,
          DzContextMenuContent,
          DzContextMenuItem,
        },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('trigger area has data-state attribute', () => {
      const { container } = render({
        template: `
          <DzContextMenu>
            <DzContextMenuTrigger>
              <div>Right click area</div>
            </DzContextMenuTrigger>
            <DzContextMenuContent>
              <DzContextMenuItem>Action</DzContextMenuItem>
            </DzContextMenuContent>
          </DzContextMenu>
        `,
        components: {
          DzContextMenu,
          DzContextMenuTrigger,
          DzContextMenuContent,
          DzContextMenuItem,
        },
      })
      const trigger = container.querySelector('[data-state]')
      expect(trigger).toBeTruthy()
    })
  })
})
