import { addComponent, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface DzupUiModuleOptions {
  /**
   * Include @dzip-ui/pro components in auto-imports.
   * Requires @dzip-ui/pro to be installed.
   * @default false
   */
  includePro?: boolean

  /**
   * Prefix to use for component names.
   * @default '' (uses original Dz prefix)
   */
  prefix?: string
}

/**
 * Component names exported from @dzip-ui/core.
 * These are auto-registered when the module is installed.
 */
const CORE_COMPONENTS = [
  // buttons
  'DzButton',
  'DzIconButton',
  'DzButtonGroup',
  'DzSplitButton',
  'DzSplitButtonAction',
  'DzSplitButtonMenu',
  'DzToggleButton',
  'DzFAB',
  // cards
  'DzCard',
  'DzCardHeader',
  'DzCardBody',
  'DzCardFooter',
  'DzStatCard',
  'DzImageCard',
  // data
  'DzAccordion',
  'DzAccordionItem',
  'DzAccordionTrigger',
  'DzAccordionContent',
  'DzDataGrid',
  'DzDataGridHeader',
  'DzDataGridBody',
  'DzDataGridPagination',
  'DzList',
  'DzListItem',
  'DzTable',
  'DzTimeline',
  'DzTimelineItem',
  'DzTree',
  'DzTreeItem',
  'DzChartDataTable',
  // feedback
  'DzAlert',
  'DzBadge',
  'DzNotification',
  'DzProgress',
  'DzSkeleton',
  'DzSpinner',
  'DzToast',
  'DzToastContainer',
  // forms
  'DzCheckbox',
  'DzCheckboxGroup',
  'DzColorPicker',
  'DzDatePicker',
  'DzDateRangePicker',
  'DzFileUpload',
  'DzFormField',
  'DzFormDescription',
  'DzFormLabel',
  'DzMultiSelect',
  'DzRadio',
  'DzRadioGroup',
  'DzRating',
  'DzSelect',
  'DzSelectOption',
  'DzSelectTrigger',
  'DzSelectContent',
  'DzSlider',
  'DzSwitch',
  'DzTagInput',
  // inputs
  'DzInput',
  'DzNumberInput',
  'DzOtpInput',
  'DzSearchBox',
  'DzTextarea',
  'DzTimePicker',
  // layout
  'DzContainer',
  'DzGrid',
  'DzFlex',
  'DzStack',
  'DzDivider',
  'DzSpacer',
  'DzResizable',
  'DzResizableHandle',
  'DzResizablePanel',
  'DzScrollArea',
  'DzSplitter',
  'DzAspectRatio',
  'DzCollapsible',
  // media
  'DzAvatar',
  'DzAvatarGroup',
  'DzCarousel',
  'DzCarouselSlide',
  'DzCarouselPrevious',
  'DzCarouselNext',
  'DzCarouselDots',
  'DzImage',
  'DzLightbox',
  'DzVideoPlayer',
  // navigation
  'DzBreadcrumb',
  'DzBreadcrumbItem',
  'DzBreadcrumbSeparator',
  'DzCommandPalette',
  'DzContextMenu',
  'DzContextMenuTrigger',
  'DzContextMenuContent',
  'DzContextMenuItem',
  'DzContextMenuSeparator',
  'DzDropdownMenu',
  'DzDropdownMenuTrigger',
  'DzDropdownMenuContent',
  'DzDropdownMenuItem',
  'DzDropdownMenuSeparator',
  'DzMenu',
  'DzMenuItem',
  'DzMenubar',
  'DzPagination',
  'DzSidebar',
  'DzStepper',
  'DzStepperStep',
  'DzTabs',
  'DzTabsList',
  'DzTabsTrigger',
  'DzTabsContent',
  // overlays
  'DzDialog',
  'DzDialogTrigger',
  'DzDialogContent',
  'DzDialogOverlay',
  'DzDialogTitle',
  'DzDialogDescription',
  'DzDialogClose',
  'DzDrawer',
  'DzPopover',
  'DzPopoverTrigger',
  'DzPopoverContent',
  'DzSheet',
  'DzTooltip',
  'DzTooltipTrigger',
  'DzTooltipContent',
  // typography
  'DzBlockquote',
  'DzCode',
  'DzHeading',
  'DzText',
  // providers
  'DzThemeProvider',
] as const

/**
 * Component names exported from @dzip-ui/pro.
 */
const PRO_COMPONENTS = [
  // builders
  'DzFormBuilder',
  'DzFormBuilderField',
  'DzFormBuilderSection',
  'DzDashboardBuilder',
  'DzDashboardWidget',
  // data-pro
  'DzDataGridPro',
  'DzFilterBuilder',
  'DzFilterBuilderRule',
  'DzFilterBuilderGroup',
  'DzPivotTable',
  'DzQuickFilter',
  'DzVirtualTable',
  // editors
  'DzCodeEditor',
  'DzJsonEditor',
  'DzMarkdownEditor',
  'DzRichTextEditor',
  // planning
  'DzCalendar',
  'DzCalendarDayView',
  'DzCalendarWeekView',
  'DzCalendarMonthView',
  'DzScheduler',
  'DzKanban',
  'DzKanbanColumn',
  'DzKanbanCard',
  'DzGantt',
  'DzGanttRow',
  'DzGanttBar',
  // workflow
  'DzWorkflowDesigner',
  'DzWorkflowNode',
  'DzWorkflowEdge',
  // communication
  'DzChat',
  'DzChatMessage',
  'DzComment',
  'DzCommentItem',
  'DzReactionPicker',
  // business
  'DzAppShell',
  'DzNotificationCenter',
  'DzAuditLog',
  // visualization
  'DzChart',
  'DzHeatMap',
  'DzTreeMap',
  'DzDiagramEditor',
] as const

export default defineNuxtModule<DzupUiModuleOptions>({
  meta: {
    name: '@dzip-ui/nuxt',
    configKey: 'dzupUi',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    includePro: false,
    prefix: '',
  },
  setup(options, nuxt) {
    const _resolver = createResolver(import.meta.url)

    // Add @dzip-ui/tokens CSS
    nuxt.options.css.push('@dzip-ui/tokens/dist/tokens.css')

    // Add @dzip-ui/core styles
    nuxt.options.css.push('@dzip-ui/core/styles')

    // Transpile packages
    nuxt.options.build.transpile.push('@dzip-ui/core', '@dzip-ui/tokens')
    if (options.includePro) {
      nuxt.options.build.transpile.push('@dzip-ui/pro')
    }

    // Register core components
    for (const name of CORE_COMPONENTS) {
      addComponent({
        name: options.prefix ? `${options.prefix}${name.slice(2)}` : name,
        export: name,
        filePath: '@dzip-ui/core',
      })
    }

    // Register pro components if enabled
    if (options.includePro) {
      for (const name of PRO_COMPONENTS) {
        addComponent({
          name: options.prefix ? `${options.prefix}${name.slice(2)}` : name,
          export: name,
          filePath: '@dzip-ui/pro',
        })
      }
    }

    // Add theme script to head for FOUC prevention (ADR-15)
    nuxt.options.app.head.script = nuxt.options.app.head.script || []
    nuxt.options.app.head.script.push({
      innerHTML: `(function(){try{var t=localStorage.getItem('dz-theme');if(t)document.documentElement.setAttribute('data-theme',t);else if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
      type: 'text/javascript',
    })
  },
})
