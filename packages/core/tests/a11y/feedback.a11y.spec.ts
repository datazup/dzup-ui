/**
 * Accessibility tests for the feedback family.
 *
 * Tests DzAlert, DzProgress, and DzSpinner for WCAG 2.1 AA compliance
 * using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DzAlert from '../../src/components/feedback/DzAlert.vue'
import DzProgress from '../../src/components/feedback/DzProgress.vue'
import DzSpinner from '../../src/components/feedback/DzSpinner.vue'

describe('feedback family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzAlert
  // ---------------------------------------------------------------------------

  describe('dzAlert', () => {
    it('has no a11y violations with default tone', async () => {
      const { container } = render(DzAlert, {
        slots: { default: 'This is an informational message.' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses role="alert" for danger tone', () => {
      const { container } = render(DzAlert, {
        props: { tone: 'danger' },
        slots: { default: 'Something went wrong.' },
      })
      const alertEl = container.querySelector('[role="alert"]')
      expect(alertEl).toBeTruthy()
    })

    it('uses role="alert" for warning tone', () => {
      const { container } = render(DzAlert, {
        props: { tone: 'warning' },
        slots: { default: 'Proceed with caution.' },
      })
      const alertEl = container.querySelector('[role="alert"]')
      expect(alertEl).toBeTruthy()
    })

    it('uses aria-live="polite" for non-urgent tones', () => {
      const { container } = render(DzAlert, {
        props: { tone: 'info' },
        slots: { default: 'FYI message.' },
      })
      const el = container.querySelector('[aria-live="polite"]')
      expect(el).toBeTruthy()
    })

    it('uses aria-live="polite" for success tone', () => {
      const { container } = render(DzAlert, {
        props: { tone: 'success' },
        slots: { default: 'Operation successful.' },
      })
      const el = container.querySelector('[aria-live="polite"]')
      expect(el).toBeTruthy()
    })

    it('close button has accessible label', () => {
      const { container } = render(DzAlert, {
        props: { closable: true },
        slots: { default: 'Closable alert.' },
      })
      const closeBtn = container.querySelector('button[aria-label="Close"]')
      expect(closeBtn).toBeTruthy()
    })

    it('has no a11y violations when closable', async () => {
      const { container } = render(DzAlert, {
        props: { closable: true, tone: 'danger' },
        slots: { default: 'Error with close.' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with title', async () => {
      const { container } = render(DzAlert, {
        props: { tone: 'success', title: 'Saved' },
        slots: { default: 'Your changes have been saved.' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzProgress
  // ---------------------------------------------------------------------------

  describe('dzProgress', () => {
    it('has no a11y violations with bar variant', async () => {
      const { container } = render(DzProgress, {
        props: { value: 75, max: 100 },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="progressbar" with correct ARIA value attributes', () => {
      const { container } = render(DzProgress, {
        props: { value: 42, max: 100 },
      })
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toBeTruthy()
      expect(progressbar).toHaveAttribute('aria-valuenow', '42')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    })

    it('has default aria-label "Progress"', () => {
      const { container } = render(DzProgress, {
        props: { value: 50 },
      })
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toHaveAttribute('aria-label', 'Progress')
    })

    it('supports custom aria-label', () => {
      const { container } = render(DzProgress, {
        props: { value: 50, ariaLabel: 'Upload progress' },
      })
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).toHaveAttribute('aria-label', 'Upload progress')
    })

    it('omits aria-valuenow when indeterminate', () => {
      const { container } = render(DzProgress, {
        props: { indeterminate: true },
      })
      const progressbar = container.querySelector('[role="progressbar"]')
      expect(progressbar).not.toHaveAttribute('aria-valuenow')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    })

    it('has no a11y violations with circular variant', async () => {
      const { container } = render(DzProgress, {
        props: { value: 60, variant: 'circular' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when indeterminate', async () => {
      const { container } = render(DzProgress, {
        props: { indeterminate: true },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzSpinner
  // ---------------------------------------------------------------------------

  describe('dzSpinner', () => {
    it('has no a11y violations', async () => {
      const { container } = render(DzSpinner)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="status"', () => {
      const { container } = render(DzSpinner)
      const statusEl = container.querySelector('[role="status"]')
      expect(statusEl).toBeTruthy()
    })

    it('has default aria-label "Loading"', () => {
      const { container } = render(DzSpinner)
      const statusEl = container.querySelector('[role="status"]')
      expect(statusEl).toHaveAttribute('aria-label', 'Loading')
    })

    it('supports custom label', () => {
      const { container } = render(DzSpinner, {
        props: { label: 'Saving data...' },
      })
      const statusEl = container.querySelector('[role="status"]')
      expect(statusEl).toHaveAttribute('aria-label', 'Saving data...')
    })

    it('has visually hidden text for screen readers', () => {
      const { container } = render(DzSpinner, {
        props: { label: 'Processing' },
      })
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly).toBeTruthy()
      expect(srOnly).toHaveTextContent('Processing')
    })

    it('hides decorative SVG from assistive technology', () => {
      const { container } = render(DzSpinner)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
