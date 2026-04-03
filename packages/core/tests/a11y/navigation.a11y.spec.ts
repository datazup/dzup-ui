/**
 * Accessibility tests for the navigation family.
 *
 * Tests DzTabs, DzMenu, DzBreadcrumb, DzPagination, and DzStepper
 * for WCAG 2.1 AA compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzBreadcrumb from '../../src/components/navigation/DzBreadcrumb.vue'
import DzBreadcrumbItem from '../../src/components/navigation/DzBreadcrumbItem.vue'
import DzBreadcrumbSeparator from '../../src/components/navigation/DzBreadcrumbSeparator.vue'
import DzMenu from '../../src/components/navigation/DzMenu.vue'
import DzMenuItem from '../../src/components/navigation/DzMenuItem.vue'
import DzPagination from '../../src/components/navigation/DzPagination.vue'
import DzStepper from '../../src/components/navigation/DzStepper.vue'
import DzStepperItem from '../../src/components/navigation/DzStepperItem.vue'
import DzTabContent from '../../src/components/navigation/DzTabContent.vue'
import DzTabList from '../../src/components/navigation/DzTabList.vue'
import DzTabs from '../../src/components/navigation/DzTabs.vue'
import DzTabTrigger from '../../src/components/navigation/DzTabTrigger.vue'

describe('navigation family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzTabs
  // ---------------------------------------------------------------------------

  describe('dzTabs', () => {
    it('has no a11y violations with tab list and panels', async () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Demo tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
              <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
              <DzTabTrigger value="tab3">Tab 3</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content for tab 1</DzTabContent>
            <DzTabContent value="tab2">Content for tab 2</DzTabContent>
            <DzTabContent value="tab3">Content for tab 3</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('tab list has role="tablist"', () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Test tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).toBeTruthy()
    })

    it('tab triggers have role="tab"', () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Test tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
              <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content 1</DzTabContent>
            <DzTabContent value="tab2">Content 2</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const tabs = container.querySelectorAll('[role="tab"]')
      expect(tabs.length).toBe(2)
    })

    it('active tab has aria-selected="true"', () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Test tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
              <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content 1</DzTabContent>
            <DzTabContent value="tab2">Content 2</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const activeTab = container.querySelector('[data-state="active"][role="tab"]')
      expect(activeTab).toBeTruthy()
      expect(activeTab).toHaveAttribute('aria-selected', 'true')
    })

    it('tab panels have role="tabpanel"', () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Test tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content 1</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const panel = container.querySelector('[role="tabpanel"]')
      expect(panel).toBeTruthy()
    })

    it('disabled tab trigger has data-disabled', () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Test tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
              <DzTabTrigger value="tab2" :disabled="true">Disabled</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content</DzTabContent>
            <DzTabContent value="tab2">Disabled content</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const disabled = container.querySelector('[data-disabled]')
      expect(disabled).toBeTruthy()
    })

    it('has no a11y violations with vertical orientation', async () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" orientation="vertical" aria-label="Vertical tabs">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
              <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content 1</DzTabContent>
            <DzTabContent value="tab2">Content 2</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('closable tab has close button with accessible label', () => {
      const { container } = render({
        template: `
          <DzTabs model-value="tab1" aria-label="Closable tabs">
            <DzTabList>
              <DzTabTrigger value="tab1" :closable="true">Tab 1</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">Content</DzTabContent>
          </DzTabs>
        `,
        components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
      })
      const closeBtn = container.querySelector('[aria-label="Close tab"]')
      expect(closeBtn).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // DzMenu
  // ---------------------------------------------------------------------------

  describe('dzMenu', () => {
    it('has no a11y violations with aria-label', async () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Main navigation">
            <DzMenuItem>Home</DzMenuItem>
            <DzMenuItem>Settings</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders a nav element with role="navigation"', () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Site navigation">
            <DzMenuItem>Home</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const nav = container.querySelector('nav[role="navigation"]')
      expect(nav).toBeTruthy()
    })

    it('has accessible label on the nav element', () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Sidebar menu">
            <DzMenuItem>Dashboard</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('aria-label', 'Sidebar menu')
    })

    it('active item has aria-current="page"', () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Navigation">
            <DzMenuItem :active="true">Home</DzMenuItem>
            <DzMenuItem>Settings</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const activeItem = container.querySelector('[aria-current="page"]')
      expect(activeItem).toBeTruthy()
    })

    it('disabled item has disabled attribute', () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Navigation">
            <DzMenuItem :disabled="true">Disabled</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const disabledItem = container.querySelector('[disabled]')
      expect(disabledItem).toBeTruthy()
    })

    it('has no a11y violations with link items', async () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Navigation">
            <DzMenuItem href="/">Home</DzMenuItem>
            <DzMenuItem href="/settings">Settings</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when collapsed', async () => {
      const { container } = render({
        template: `
          <DzMenu aria-label="Navigation" :collapsed="true">
            <DzMenuItem aria-label="Home">Home</DzMenuItem>
            <DzMenuItem aria-label="Settings">Settings</DzMenuItem>
          </DzMenu>
        `,
        components: { DzMenu, DzMenuItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzBreadcrumb
  // ---------------------------------------------------------------------------

  describe('dzBreadcrumb', () => {
    it('has no a11y violations', async () => {
      const { container } = render({
        template: `
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem :current="true">Widget</DzBreadcrumbItem>
          </DzBreadcrumb>
        `,
        components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders a nav landmark with aria-label', () => {
      const { container } = render({
        template: `
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
          </DzBreadcrumb>
        `,
        components: { DzBreadcrumb, DzBreadcrumbItem },
      })
      const nav = container.querySelector('nav')
      expect(nav).toBeTruthy()
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('renders an ordered list for semantic structure', () => {
      const { container } = render({
        template: `
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem :current="true">Page</DzBreadcrumbItem>
          </DzBreadcrumb>
        `,
        components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
      })
      const ol = container.querySelector('ol')
      expect(ol).toBeTruthy()
    })

    it('current page has aria-current="page"', () => {
      const { container } = render({
        template: `
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem :current="true">Current</DzBreadcrumbItem>
          </DzBreadcrumb>
        `,
        components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
      })
      const currentItem = container.querySelector('[aria-current="page"]')
      expect(currentItem).toBeTruthy()
    })

    it('separator is hidden from assistive technology', () => {
      const { container } = render({
        template: `
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem :current="true">Page</DzBreadcrumbItem>
          </DzBreadcrumb>
        `,
        components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
      })
      const separator = container.querySelector('[aria-hidden="true"]')
      expect(separator).toBeTruthy()
    })

    it('supports custom aria-label on nav', () => {
      const { container } = render({
        template: `
          <DzBreadcrumb aria-label="Page navigation">
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
          </DzBreadcrumb>
        `,
        components: { DzBreadcrumb, DzBreadcrumbItem },
      })
      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('aria-label', 'Page navigation')
    })
  })

  // ---------------------------------------------------------------------------
  // DzPagination
  // ---------------------------------------------------------------------------

  describe('dzPagination', () => {
    it('has no a11y violations', async () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10 },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders a nav element with aria-label', () => {
      const { container } = render(DzPagination, {
        props: { total: 50 },
      })
      const nav = container.querySelector('nav')
      expect(nav).toBeTruthy()
      expect(nav).toHaveAttribute('aria-label', 'Pagination')
    })

    it('supports custom aria-label', () => {
      const { container } = render(DzPagination, {
        props: { total: 50, ariaLabel: 'Results pagination' },
      })
      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('aria-label', 'Results pagination')
    })

    it('previous button has accessible label', () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10 },
      })
      const prevBtn = container.querySelector('[aria-label="Go to previous page"]')
      expect(prevBtn).toBeTruthy()
    })

    it('next button has accessible label', () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10 },
      })
      const nextBtn = container.querySelector('[aria-label="Go to next page"]')
      expect(nextBtn).toBeTruthy()
    })

    it('current page has aria-current="page"', () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10, modelValue: 1 },
      })
      const currentPage = container.querySelector('[aria-current="page"]')
      expect(currentPage).toBeTruthy()
    })

    it('has no a11y violations with showEdges', async () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10, showEdges: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('first/last buttons have accessible labels when showEdges', () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10, showEdges: true },
      })
      const firstBtn = container.querySelector('[aria-label="Go to first page"]')
      const lastBtn = container.querySelector('[aria-label="Go to last page"]')
      expect(firstBtn).toBeTruthy()
      expect(lastBtn).toBeTruthy()
    })

    it('has no a11y violations when disabled', async () => {
      const { container } = render(DzPagination, {
        props: { total: 100, pageSize: 10, disabled: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzStepper
  // ---------------------------------------------------------------------------

  describe('dzStepper', () => {
    it('has no a11y violations', async () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="0">
            <DzStepperItem title="Account" description="Create your account" />
            <DzStepperItem title="Profile" description="Set up your profile" />
            <DzStepperItem title="Review" description="Review your details" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders with role="group"', () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="0">
            <DzStepperItem title="Step 1" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      const group = container.querySelector('[role="group"]')
      expect(group).toBeTruthy()
    })

    it('has default aria-label "Progress steps"', () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="0">
            <DzStepperItem title="Step 1" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      const group = container.querySelector('[role="group"]')
      expect(group).toHaveAttribute('aria-label', 'Progress steps')
    })

    it('supports custom aria-label', () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="0" aria-label="Setup wizard">
            <DzStepperItem title="Step 1" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      const group = container.querySelector('[role="group"]')
      expect(group).toHaveAttribute('aria-label', 'Setup wizard')
    })

    it('active step has aria-current="step"', async () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="1">
            <DzStepperItem title="Done" />
            <DzStepperItem title="Active" />
            <DzStepperItem title="Upcoming" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      // Wait for onMounted to register steps
      await new Promise(resolve => setTimeout(resolve, 0))
      const activeStep = container.querySelector('[aria-current="step"]')
      expect(activeStep).toBeTruthy()
    })

    it('completed step indicator has aria-hidden on check SVG', async () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="1">
            <DzStepperItem title="Completed" />
            <DzStepperItem title="Active" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      // Wait for onMounted to register steps
      await new Promise(resolve => setTimeout(resolve, 0))
      const completedSvg = container.querySelector('[data-state="completed"] svg')
      expect(completedSvg).toBeTruthy()
      expect(completedSvg).toHaveAttribute('aria-hidden', 'true')
    })

    it('has no a11y violations with vertical orientation', async () => {
      const { container } = render({
        template: `
          <DzStepper :model-value="0" orientation="vertical">
            <DzStepperItem title="Step 1" description="First step" />
            <DzStepperItem title="Step 2" description="Second step" />
          </DzStepper>
        `,
        components: { DzStepper, DzStepperItem },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
