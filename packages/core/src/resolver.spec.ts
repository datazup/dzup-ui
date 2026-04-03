import { describe, expect, it } from 'vitest'

import { DzResolver } from './resolver'

describe('dzResolver', () => {
  describe('core component resolution', () => {
    it('resolves Dz-prefixed components to @dzup-ui/core', () => {
      const resolver = DzResolver()
      const result = resolver.resolve('DzButton')

      expect(result).toEqual({
        name: 'DzButton',
        from: '@dzup-ui/core',
      })
    })

    it('resolves various core components correctly', () => {
      const resolver = DzResolver()
      const coreComponents = [
        'DzButton',
        'DzInput',
        'DzCard',
        'DzAlert',
        'DzBadge',
        'DzTable',
        'DzDialog',
        'DzTooltip',
        'DzGrid',
        'DzText',
      ]

      for (const name of coreComponents) {
        const result = resolver.resolve(name)
        expect(result).toEqual({
          name,
          from: '@dzup-ui/core',
        })
      }
    })

    it('returns undefined for non-Dz components', () => {
      const resolver = DzResolver()

      expect(resolver.resolve('VButton')).toBeUndefined()
      expect(resolver.resolve('ElInput')).toBeUndefined()
      expect(resolver.resolve('button')).toBeUndefined()
      expect(resolver.resolve('')).toBeUndefined()
    })
  })

  describe('pro component resolution', () => {
    it('does not resolve pro components by default', () => {
      const resolver = DzResolver()

      expect(resolver.resolve('DzFormBuilder')).toBeUndefined()
      expect(resolver.resolve('DzKanban')).toBeUndefined()
      expect(resolver.resolve('DzGantt')).toBeUndefined()
      expect(resolver.resolve('DzChart')).toBeUndefined()
      expect(resolver.resolve('DzWorkflowDesigner')).toBeUndefined()
    })

    it('resolves pro components when includePro is true', () => {
      const resolver = DzResolver({ includePro: true })

      expect(resolver.resolve('DzFormBuilder')).toEqual({
        name: 'DzFormBuilder',
        from: '@dzup-ui/pro',
      })
    })

    it('resolves pro sub-components when includePro is true', () => {
      const resolver = DzResolver({ includePro: true })

      const proComponents = [
        'DzFormBuilderSection',
        'DzFormBuilderField',
        'DzDashboardBuilder',
        'DzDashboardWidget',
        'DzKanbanColumn',
        'DzKanbanCard',
        'DzGanttTaskRow',
        'DzWorkflowNode',
        'DzWorkflowEdge',
        'DzCalendarDayView',
        'DzCalendarWeekView',
        'DzCalendarMonthView',
        'DzChatMessage',
        'DzCommentItem',
        'DzChartDataTable',
      ]

      for (const name of proComponents) {
        const result = resolver.resolve(name)
        expect(result).toEqual({
          name,
          from: '@dzup-ui/pro',
        })
      }
    })

    it('resolves all pro family prefixes correctly', () => {
      const resolver = DzResolver({ includePro: true })

      const proFamilyRoots = [
        'DzFormBuilder',
        'DzDashboardBuilder',
        'DzDataGridPro',
        'DzFilterBuilder',
        'DzPivotTable',
        'DzCodeEditor',
        'DzRichTextEditor',
        'DzCalendar',
        'DzScheduler',
        'DzKanban',
        'DzGantt',
        'DzWorkflow',
        'DzChat',
        'DzComment',
        'DzAppShell',
        'DzNotificationCenter',
        'DzAuditLog',
        'DzChart',
        'DzHeatMap',
        'DzTreeMap',
        'DzDiagramEditor',
      ]

      for (const name of proFamilyRoots) {
        const result = resolver.resolve(name)
        expect(result?.from).toBe('@dzup-ui/pro')
      }
    })

    it('still resolves core components when includePro is true', () => {
      const resolver = DzResolver({ includePro: true })

      const result = resolver.resolve('DzButton')
      expect(result).toEqual({
        name: 'DzButton',
        from: '@dzup-ui/core',
      })
    })
  })

  describe('resolver metadata', () => {
    it('has type set to component', () => {
      const resolver = DzResolver()
      expect(resolver.type).toBe('component')
    })
  })
})
