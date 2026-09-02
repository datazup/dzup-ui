/**
 * Executable AT test scripts for the Tier C/D components (TASK-N1-O4).
 *
 * The AT matrix scaffold (`e2e/at-matrix/`, TASK-OSS-P5-04) says WHAT a tester
 * owes — one task per APG-implied obligation, one row per AT/browser pair. It
 * deliberately does not say HOW: its task text is pattern-level ("Move through
 * the collection with the pattern's own keys or gestures") because it is
 * generated from the pattern, not from the component.
 *
 * A pattern-level obligation is not something a person can execute. This file
 * is the missing half: for every Tier C/D component, the story to open, the
 * keys to press, and the announcement the AT must produce — written so that
 * somebody who has never seen this repository can run it.
 *
 * **Where the expectations come from.** Each step's `expect` is derived from
 * the component's contract spec plus its APG pattern, and NOT from what the
 * component currently does. That is the point: where a known defect exists,
 * the expectation stays APG-correct and the tester records a real failure.
 * `knownDefects` lists the ones already on the register so a first wave is not
 * mistaken for new discoveries — it is rendered at the END of each script,
 * after the steps, and the script tells the tester to read it only after
 * recording.
 *
 * **Nothing here can record a result.** This file produces instructions. The
 * results table lives in `e2e/at-matrix/{Component}.md`, below the
 * append-only marker, and only a human writes there.
 */

/** One executable step. Satisfies exactly one scaffold task. */
export interface AtScriptStep {
  /** The `e2e/at-matrix` task id this step satisfies. Checked by the generator. */
  readonly task: string
  /** Storybook story id, when the step is driven somewhere other than the entry story. */
  readonly story?: string
  /** What the tester does, in order. */
  readonly press: readonly string[]
  /** What the AT must announce or do, derived from the contract spec + APG. */
  readonly expect: readonly string[]
  /** The APG section the expectation is read from. */
  readonly apg: string
  /**
   * Set when the pattern implies a task the component has no surface for.
   * The step renders as a recording instruction instead of do/expect: a task
   * that cannot be reached is not a `fail`.
   */
  readonly notApplicable?: string
}

/** A defect already on the register that a step is expected to trip over. */
export interface AtKnownDefect {
  readonly id: string
  readonly summary: string
  /** Task ids whose expectation this defect is expected to break. */
  readonly affects: readonly string[]
}

/** One component's script. */
export interface AtScriptEntry {
  readonly component: string
  /** The story the script opens with. */
  readonly story: string
  /** Anything the tester must set up or know before step 1. */
  readonly setup: readonly string[]
  readonly steps: readonly AtScriptStep[]
  readonly knownDefects: readonly AtKnownDefect[]
}

export const AT_SCRIPTS: readonly AtScriptEntry[] = [
  // -------------------------------------------------------------------------
  // DzCalendar — Tier C · APG grid
  // -------------------------------------------------------------------------
  {
    component: 'DzCalendar',
    story: 'core-data-dzcalendar--accessibility',
    setup: [
      'The calendar opens on June 2026 with 15 June 2026 already selected.',
      'A line under the grid reads `Selected: 2026-06-15`. Use it to confirm what the model holds; do not use it as the announcement.',
      'Do not touch the pointer for any step except where a step says so.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab from the browser address bar until focus enters the calendar.'],
        expect: [
          'The container is announced as a grid whose name is "Keyboard navigable calendar".',
          'The grid is one tab stop: Tab reaches it once, and one more Tab leaves it entirely.',
          'The cell that takes focus announces its date, the weekday column it sits under, and that it is selected.',
        ],
        apg: 'Grid — Keyboard Interaction: "the grid contains one tab stop"; and Data Grid, cell announcement with row/column context.',
      },
      {
        task: 'navigate',
        press: [
          'ArrowRight (expect 16 June 2026).',
          'ArrowDown (expect 23 June 2026).',
          'Home (expect the first day of that week, 21 June 2026).',
          'PageDown (expect the same day one month on, 21 July 2026).',
        ],
        expect: [
          'Every move announces the new date. No move is silent.',
          'Moving into a different column announces the new weekday header at least once.',
          'PageDown announces the new month, not only the new day number.',
          'The grid never announces a cell the caret is not on, and never skips a cell.',
        ],
        apg: 'Grid — Keyboard Interaction: Right/Left/Down/Up, Home/End, PageUp/PageDown.',
      },
      {
        task: 'select',
        press: ['With 21 July 2026 focused, press ArrowUp four times to return to 23 June 2026, then Enter.'],
        expect: [
          'The focused day is announced as selected the moment Enter commits.',
          'Re-reading the previously selected day (15 June 2026) announces it as NOT selected — exactly one day is selected.',
          'The `Selected:` line reads `2026-06-23`.',
        ],
        apg: 'Grid — Keyboard Interaction (Enter activates the focused cell) and ARIA `aria-selected` on the selected gridcell.',
      },
      {
        task: 'live',
        press: [
          'Shift+Tab out of the grid onto the month header controls.',
          'Activate `Next month`.',
        ],
        expect: [
          'The new month is announced without focus leaving the `Next month` control.',
          'It is announced exactly once — not once by the caption and again by the grid.',
          'The grid is not re-announced from the top, and the caret is not moved into it.',
        ],
        apg: 'Date Picker Dialog — the month/year caption is a live region because the grid changes under a control that sits outside it.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzCascader — Tier C · APG combobox
  // -------------------------------------------------------------------------
  {
    component: 'DzCascader',
    story: 'core-forms-dzcascader--accessibility',
    setup: [
      'The cascade holds two roots: China (Zhejiang → Hangzhou/Ningbo/Wenzhou; Jiangsu → Nanjing/Suzhou) and USA (California → Los Angeles/San Francisco; New York → New York City).',
      'A line under the control reads `Path:` and shows the committed value.',
      'Steps 4 and 8 switch to a different story; the step says which.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the cascader trigger.'],
        expect: [
          'It is announced as a combobox named "Keyboard region cascade".',
          'It is announced as collapsed.',
          'Its current value, or the placeholder "Select region" when empty, is announced.',
          'Exactly ONE control is announced here. No second control is announced inside it.',
        ],
        apg: 'Combobox (select-only) — role `combobox`, `aria-expanded="false"`, `aria-haspopup`; and the HTML rule that a button may not contain interactive content.',
      },
      {
        task: 'open',
        press: ['ArrowDown (Alt+ArrowDown is also allowed).'],
        expect: [
          'The trigger is announced as expanded.',
          'The popup is announced with its role (listbox).',
          'The first option of the first column, "China", becomes the active option and is announced.',
        ],
        apg: 'Combobox — Keyboard Interaction: Down Arrow opens the popup and moves focus (or the active option) into it.',
      },
      {
        task: 'navigate',
        press: [
          'ArrowDown then ArrowUp inside the first column.',
          'ArrowRight to descend from "China" into its second column.',
          'ArrowDown to "Jiangsu", then ArrowRight into its third column.',
          'ArrowLeft twice to climb back to the first column.',
        ],
        expect: [
          'Every option is announced with its label AND its position in the set — "China, 1 of 2".',
          'An option that owns a further column is announced as expandable or as having a submenu, before it is descended into.',
          'Descending announces the new column and its first option; climbing back announces the parent.',
          'No option is skipped and none is announced twice.',
        ],
        apg: 'Combobox with a hierarchical listbox popup — Keyboard Interaction Down/Up/Right/Left; `aria-setsize` / `aria-posinset` on each option.',
      },
      {
        task: 'typeahead',
        story: 'core-forms-dzcascader--filterable',
        press: [
          'Tab to the control and open it.',
          'Type `san` into the search field.',
        ],
        expect: [
          'The search field is announced as a text field named "Search paths".',
          'The result list is announced with the name "Matching paths".',
          'The number of matches is announced politely after typing stops — announced once, not once per keystroke.',
          'The first match becomes the active option and is announced.',
          'Typing `zzz` announces "No matching paths".',
        ],
        apg: 'Combobox with list autocomplete — printable characters filter, and the count of results is announced in a live region.',
      },
      {
        task: 'select',
        press: [
          'Back on the entry story, open the cascade and walk USA → California → San Francisco.',
          'Enter.',
        ],
        expect: [
          'The committed leaf is announced as selected.',
          'The popup is announced as collapsed.',
          'Re-reading the trigger announces the committed path, not the placeholder.',
          'The `Path:` line reads `us → ca → sf`.',
        ],
        apg: 'Combobox — Keyboard Interaction: Enter accepts the active option and closes the popup.',
      },
      {
        task: 'dismiss',
        press: [
          'Open the cascade again.',
          'Escape.',
        ],
        expect: [
          'The trigger is announced as collapsed.',
          'Focus is back on the trigger and the AT announces it by name — the tester can tell where they are without looking.',
          'The value from the previous step is unchanged.',
        ],
        apg: 'Combobox — Keyboard Interaction: Escape closes the popup and returns focus to the combobox.',
      },
      {
        task: 'error',
        story: 'core-forms-dzcascader--invalid-state',
        press: [
          'Tab onto the control, then Tab away from it.',
          'Shift+Tab back onto it.',
        ],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control, not as loose page text the tester has to hunt for.',
          'Re-focusing the control announces the error text again.',
        ],
        apg: 'WCAG 3.3.1 Error Identification, and ARIA `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
      {
        task: 'live',
        story: 'core-forms-dzcascader--filterable',
        press: [
          'Open the control and type `qqq` into the search field.',
          'Do not move focus.',
        ],
        expect: [
          '"No matching paths" is announced politely.',
          'It is announced exactly once.',
          'Focus stays in the search field — the announcement does not move the caret.',
        ],
        apg: 'ARIA live regions: a status change is announced without moving focus, once.',
      },
    ],
    knownDefects: [
      {
        id: 'D4',
        summary: 'The "Clear selection" affordance is rendered as `role="button"` INSIDE the `role="combobox"` button. Expect the reach step to announce two controls, or the clear control to be unreachable, depending on the pair.',
        affects: ['reach'],
      },
      {
        id: 'D8',
        summary: '`useDualModel` ignores external writes to `v-model:value` after the first user edit. A step that resets the value from outside the component may not take.',
        affects: ['select'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzColorPicker — Tier C · APG custom (baseline reach + activate)
  // -------------------------------------------------------------------------
  {
    component: 'DzColorPicker',
    story: 'core-forms-dzcolorpicker--accessibility',
    setup: [
      'Six brand presets are offered. APG has no colour-picker pattern; the sliders inside the panel follow the Slider pattern individually, and the panel as a whole follows the Dialog pattern.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the colour trigger.'],
        expect: [
          'It is announced as a button named "Brand color".',
          'Its current value is announced — a colour swatch with no announced value is a control whose state a screen-reader user cannot read.',
        ],
        apg: 'The ARIA rule that every widget announces name, role and value; and Button — Keyboard Interaction.',
      },
      {
        task: 'activate',
        press: [
          'Enter to open the panel. Then Escape, re-focus, and Space to open it again.',
          'Tab through every control in the panel.',
          'Escape.',
        ],
        expect: [
          'Enter and Space each open the panel, and each opens it exactly once.',
          'The panel is announced as a dialog or as a named group; it is not silent.',
          'The saturation surface is announced with the name "Color area" and with a readable value.',
          'The hex field is announced as a text field named "Hex color value".',
          'Each preset swatch announces which colour it is — not "button" alone.',
          'Escape closes the panel and focus returns to the trigger, which is re-announced with its new value.',
        ],
        apg: 'Button — Keyboard Interaction (Enter and Space); Dialog — focus placement and return; Slider — name/value on each slider.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzCombobox — Tier C · APG combobox
  // -------------------------------------------------------------------------
  {
    component: 'DzCombobox',
    story: 'core-forms-dzcombobox--accessibility',
    setup: [
      'The list holds ten US cities: New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, San Jose.',
      'This is an EDITABLE combobox: focus stays in the text field and the active option is published through `aria-activedescendant`.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the field.'],
        expect: [
          'It is announced as a combobox named "City search".',
          'It is announced as collapsed and as editable.',
          'Exactly one control is announced. No second control is announced inside it.',
        ],
        apg: 'Combobox (list autocomplete) — role `combobox` on the text input, `aria-expanded="false"`.',
      },
      {
        task: 'open',
        press: ['ArrowDown.'],
        expect: [
          'The combobox is announced as expanded.',
          'The popup is announced as a listbox.',
          'The first option becomes active and is announced, WITHOUT the AT reporting a focus move — focus stays in the text field.',
        ],
        apg: 'Combobox — Keyboard Interaction: Down Arrow opens and moves the active option; `aria-activedescendant` focus management.',
      },
      {
        task: 'navigate',
        press: ['ArrowDown three times, ArrowUp once, then End, then Home.'],
        expect: [
          'Each option is announced with its label and its position — "Los Angeles, 2 of 10".',
          'End announces the last option and Home the first.',
          'Nothing is skipped, and the text field never loses focus.',
        ],
        apg: 'Combobox — Keyboard Interaction Down/Up/Home/End over the listbox.',
      },
      {
        task: 'typeahead',
        press: ['Type `san`.'],
        expect: [
          'The list narrows to San Antonio, San Diego and San Jose.',
          'The number of results is announced politely, once, after typing stops.',
          'The first match becomes active and is announced as "1 of 3".',
        ],
        apg: 'Combobox with list autocomplete — the filtered result count is announced in a live region.',
      },
      {
        task: 'select',
        press: ['Enter on the active option.'],
        expect: [
          'The option is announced as selected.',
          'The combobox is announced as collapsed.',
          'Re-reading the field announces the committed label.',
        ],
        apg: 'Combobox — Keyboard Interaction: Enter accepts the active option.',
      },
      {
        task: 'dismiss',
        press: ['Open the list again, then Escape.'],
        expect: [
          'The combobox is announced as collapsed.',
          'Focus is on the combobox and it is re-announced with its value.',
          'The committed value from the previous step is unchanged.',
        ],
        apg: 'Combobox — Keyboard Interaction: Escape closes the popup without changing the value.',
      },
      {
        task: 'error',
        story: 'core-forms-dzcombobox--invalid-state',
        press: ['Tab onto the control, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control.',
          'Re-focusing announces the error again.',
        ],
        apg: 'WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
      {
        task: 'live',
        story: 'core-forms-dzcombobox--loading-state',
        press: [
          'Tab onto the control and open it. Do not move focus again.',
          'Then open `core-forms-dzcombobox--default`, open the list and type `zzzz`.',
        ],
        expect: [
          'On the loading story, "Loading options…" is announced politely, exactly once, with focus unmoved.',
          'On the default story with no match, "No results found" is announced politely, exactly once.',
          'Neither announcement moves the caret or re-reads the whole control.',
        ],
        apg: 'ARIA live regions; and Combobox — a busy or empty popup is a status, not a focus event.',
      },
    ],
    knownDefects: [
      {
        id: 'D9',
        summary: 'The clear button ignores `disabled`. On `core-forms-dzcombobox--disabled` a live "Clear selection" control is still present; touch-exploration pairs (VoiceOver iOS, TalkBack) can reach and press it.',
        affects: ['reach'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzCommandPalette — Tier C · APG combobox
  // -------------------------------------------------------------------------
  {
    component: 'DzCommandPalette',
    story: 'core-overlays-dzcommandpalette--accessibility',
    setup: [
      'The page shows one button, "Open command palette". The palette itself is a modal dialog that is ABSENT from the document until it is opened.',
      'Ten commands in four groups: File (New File, Open File, Save), Edit (Search, Find and Replace), View (Toggle Dark Mode, Zoom In, Zoom Out), Application (Open Settings, Keyboard Shortcuts).',
      'The global shortcut is switched off in this story on purpose — open it from the button.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab to "Open command palette" and activate it.'],
        expect: [
          'A modal dialog is announced, named "Application command palette".',
          'Focus lands in the search field, and that field is announced as a combobox.',
          'The page behind the dialog is not reachable — Shift+Tab from the first control does not land on the page.',
        ],
        apg: 'Dialog (Modal) — focus placement and containment; Combobox — role on the search field.',
      },
      {
        task: 'open',
        press: ['Observe the state of the search field as the dialog appears.'],
        expect: [
          'The search field is announced as expanded, with its listbox popup already present.',
          'The first command, "New File", is the active option and is announced.',
          'The expanded state is announced once — not once by the dialog and again by the combobox.',
        ],
        apg: 'Combobox — `aria-expanded="true"` with the popup present; Dialog — the dialog announcement precedes the widget announcement.',
      },
      {
        task: 'navigate',
        press: ['ArrowDown four times, then ArrowUp once.'],
        expect: [
          'Each command is announced with its label and its position in the set.',
          'Crossing from one group into the next announces the new group name ("File", then "Edit").',
          'A command that carries a keyboard shortcut announces the shortcut as part of its description, not as a separate control.',
          'Nothing is skipped.',
        ],
        apg: 'Combobox with a grouped listbox — `role="group"` with an accessible name is announced on entry; `aria-setsize`/`aria-posinset`.',
      },
      {
        task: 'typeahead',
        press: ['Type `zoom`.'],
        expect: [
          'The list narrows to Zoom In and Zoom Out.',
          'The result count is announced politely, once.',
          '"Zoom In" becomes active and is announced as "1 of 2".',
        ],
        apg: 'Combobox with list autocomplete.',
      },
      {
        task: 'select',
        press: ['Enter on the active command.'],
        expect: [
          'The command runs exactly once.',
          'The dialog closes and the closure is announced.',
          'Focus returns to "Open command palette" and the AT announces it.',
        ],
        apg: 'Combobox — Enter accepts; Dialog — focus returns to the element that opened it.',
      },
      {
        task: 'dismiss',
        press: ['Re-open the palette, then Escape. Re-open it once more and dismiss it with the close affordance if one exists.'],
        expect: [
          'The dialog closes on Escape.',
          'Focus returns to "Open command palette" and the AT announces where it landed.',
          'No command ran.',
        ],
        apg: 'Dialog (Modal) — Escape closes; focus returns to the invoking element.',
      },
      {
        task: 'error',
        notApplicable: 'The scaffold derives an `error` task from the `combobox` pattern. DzCommandPalette has no validation surface at all — no invalid state, no error message, no required semantics — so there is nothing to drive. Write `error task not applicable: no validation surface` in the run row `notes`. Do NOT record `fail`; a task with no surface is not a failed task.',
        press: [],
        expect: [],
        apg: 'Not applicable — see the note.',
      },
      {
        task: 'live',
        press: ['With focus in the search field, type `qqqq`. Do not move focus.'],
        expect: [
          'The empty-result copy is announced politely.',
          'It is announced exactly once.',
          'Focus stays in the search field.',
        ],
        apg: 'ARIA live regions.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzDataGrid — Tier C · APG grid
  // -------------------------------------------------------------------------
  {
    component: 'DzDataGrid',
    story: 'core-data-dzdatagrid--accessibility',
    setup: [
      'Four employees, five columns: Name, Role, Department, Salary, Status. Name/Role/Department/Salary are sortable; multiple-row selection is on.',
      'Use your AT table-reading commands where the step says so (NVDA and JAWS: Ctrl+Alt+Arrows; VoiceOver: VO+Arrows once inside the table).',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus enters the grid.'],
        expect: [
          'It is announced as a grid named "Accessible employee data grid".',
          'Its size is announced — the number of rows and columns.',
          'The grid is one tab stop.',
          'The cell that takes focus announces its column header and its value.',
        ],
        apg: 'Grid — "the grid contains one tab stop"; and the ARIA requirement that a grid announces its dimensions.',
      },
      {
        task: 'navigate',
        press: [
          'ArrowRight across a row, then ArrowDown into the next row.',
          'Ctrl+Home, then Ctrl+End.',
          'Move onto the "Name" column header and press Enter, then Enter again.',
        ],
        expect: [
          'Each cell announces its column header and its value; the header is not repeated on every cell within the same column beyond what the AT normally does.',
          'Ctrl+Home announces the first cell and Ctrl+End the last.',
          'A sortable column header is announced as a column header AND as sortable, with its current sort state.',
          'Activating it announces the new sort state ("ascending", then "descending") and does not silently re-render.',
          'No cell is skipped.',
        ],
        apg: 'Grid — Keyboard Interaction Right/Left/Down/Up, Ctrl+Home/Ctrl+End; and `aria-sort` on the sorted column header.',
      },
      {
        task: 'select',
        press: [
          'Move to a row and press Space (or activate that row selection control).',
          'Select a second row.',
          'Move to the header selection control, announced as "Select all rows".',
        ],
        expect: [
          'Each selected row is announced as selected as it is selected.',
          'With some but not all rows selected, "Select all rows" is announced as partially checked / mixed — not as unchecked.',
          'Selecting all and then clearing announces both transitions.',
        ],
        apg: 'Grid — row selection; ARIA `aria-selected` on the row and the tri-state checkbox contract for a select-all control.',
      },
      {
        task: 'live',
        story: 'core-data-dzdatagrid--loading',
        press: [
          'Park focus on the browser address bar, then load the loading story.',
          'Then load `core-data-dzdatagrid--empty` the same way.',
        ],
        expect: [
          'The busy state is announced once, without moving focus.',
          'The empty state text is announced politely, once.',
          'Neither state leaves a stale grid readable underneath the new state.',
        ],
        apg: 'ARIA `aria-busy` and live regions; a grid that is loading must not present the previous page as current.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzDataView — Tier C · APG custom (baseline) + dataset trait
  // -------------------------------------------------------------------------
  {
    component: 'DzDataView',
    story: 'core-data-dzdataview--accessibility',
    setup: [
      'Eight products under a visible heading, "Product catalog". A layout toggle group switches between list and grid renderings of the same collection.',
      'APG models neither the layout switch nor the list/grid pair, so the expectations below come from the component contract plus the ARIA Toolbar and Live Region contracts.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus enters the data view.'],
        expect: [
          'The region takes its accessible name from the visible heading "Product catalog".',
          'The collection is announced as a list with eight items.',
          'The layout toggle group is announced with the name "View layout"; the sort control, where present, is announced with the name "Sort by".',
        ],
        apg: 'Toolbar — a group of controls announces its own name; and the ARIA list contract (`role="list"` with `listitem` children).',
      },
      {
        task: 'activate',
        press: [
          'Tab into the layout toggle group.',
          'ArrowRight to move to the other option.',
          'Enter.',
        ],
        expect: [
          'The toggle group is one tab stop; Arrow keys move within it (roving tabindex).',
          'Each option is announced with its name and its pressed state.',
          'Activating announces the newly pressed option AND that the previous one is no longer pressed.',
          'The layout change happens once. List semantics survive it — after the switch the collection is still announced as a list of eight items, not as a bare set of divs.',
        ],
        apg: 'Toolbar — Keyboard Interaction (one tab stop, Arrow keys within); `aria-pressed` on a toggle button.',
      },
      {
        task: 'live',
        story: 'core-data-dzdataview--loading',
        press: [
          'Park focus outside the component, then load the loading story.',
          'Then load `core-data-dzdataview--empty` the same way.',
          'Finally, on `core-data-dzdataview--paginated`, move to the next page with focus on the pager control.',
        ],
        expect: [
          '"Loading items" is announced politely, once, without moving focus.',
          'The empty-state text is announced politely, once.',
          'Paging announces the rendered window ("Showing 5 to 8 of 8 items") politely, once, with focus left on the pager.',
          'The skeleton placeholders are not announced as content.',
        ],
        apg: 'ARIA live regions; and the rule that decorative placeholders are hidden from the accessibility tree.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzDatePicker — Tier C · APG combobox
  // -------------------------------------------------------------------------
  {
    component: 'DzDatePicker',
    story: 'core-forms-dzdatepicker--accessibility',
    setup: [
      'An empty date field with the placeholder "Keyboard navigable" and the accessible name "Appointment date".',
      'This is the combobox-plus-dialog shape: a text field that opens a calendar.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the field.'],
        expect: [
          'It is announced as a combobox named "Appointment date".',
          'It is announced as collapsed.',
          'Its current value, or the placeholder when empty, is announced.',
        ],
        apg: 'Date Picker Combobox — role `combobox` with `aria-haspopup="dialog"`; `aria-expanded="false"`.',
      },
      {
        task: 'open',
        press: ['Enter. Close it with Escape, then re-open with Alt+ArrowDown.'],
        expect: [
          'The field is announced as expanded.',
          'The calendar is announced with its own role (dialog or grid) and its name.',
          'The AT arrives in the calendar — a focused day, or an active descendant, is announced without a further keystroke.',
          'Both Enter and Alt+ArrowDown open it.',
        ],
        apg: 'Date Picker Combobox — Keyboard Interaction: Enter / Alt+Down open the dialog and move focus into it.',
      },
      {
        task: 'navigate',
        press: ['ArrowRight, ArrowDown, Home, PageDown, PageUp.'],
        expect: [
          'Every move announces the new date, including its weekday.',
          'PageUp/PageDown announce the new month.',
          'Days that lie outside the allowed range are announced as unavailable rather than being silently skipped.',
        ],
        apg: 'Date Picker Dialog — Keyboard Interaction over the day grid; `aria-disabled` on out-of-range days.',
      },
      {
        task: 'typeahead',
        press: [
          'Escape to close the calendar so focus is back in the text field.',
          'Type `2026-06-21` (or the locale format the field advertises).',
        ],
        expect: [
          'The typed characters are echoed as the tester types.',
          'The value the field holds afterwards matches what was typed.',
          'If the calendar re-opens, its focused day follows the typed value.',
        ],
        apg: 'Combobox — Keyboard Interaction: printable characters are accepted by the text field.',
      },
      {
        task: 'select',
        press: ['Open the calendar and press Enter on a day.'],
        expect: [
          'The day is announced as selected.',
          'The calendar closes and the field is announced as collapsed.',
          'Re-reading the field announces the committed date.',
        ],
        apg: 'Date Picker Dialog — Enter commits the focused date and dismisses the dialog.',
      },
      {
        task: 'dismiss',
        press: ['Open the calendar, then Escape.'],
        expect: [
          'The field is announced as collapsed.',
          'Focus is back on the field and the AT announces it by name.',
          'The value is unchanged.',
        ],
        apg: 'Dialog — Escape closes and returns focus to the invoking control.',
      },
      {
        task: 'error',
        story: 'core-forms-dzdatepicker--invalid-state',
        press: ['Tab onto the control, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control.',
          'Re-focusing announces the error again.',
        ],
        apg: 'WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzDateRangePicker — Tier C · APG combobox
  // -------------------------------------------------------------------------
  {
    component: 'DzDateRangePicker',
    story: 'core-forms-dzdaterangepicker--accessibility',
    setup: [
      'A range field named "Booking date range". A range has TWO values, and the extra obligation over DzDatePicker is that the AT must say which of the two the tester is choosing at any moment.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the field.'],
        expect: [
          'It is announced as a combobox named "Booking date range", collapsed.',
          'Its current value is announced as a range — both ends, or the placeholder when empty.',
        ],
        apg: 'Date Picker Combobox; and the ARIA rule that a composite value is announced in full.',
      },
      {
        task: 'open',
        press: ['Enter.'],
        expect: [
          'The field is announced as expanded and the calendar is announced.',
          'The AT states which end of the range is being chosen first.',
        ],
        apg: 'Date Picker Dialog — the dialog announces its purpose on entry.',
      },
      {
        task: 'navigate',
        press: ['ArrowRight, ArrowDown, PageDown.'],
        expect: [
          'Each move announces the new date.',
          'After a start date is chosen, days before it are announced as unavailable.',
          'Days inside the provisional range are announced as in-range, not merely highlighted.',
        ],
        apg: 'Date Picker Dialog — Keyboard Interaction; `aria-disabled` and range state exposed programmatically, not by colour.',
      },
      {
        task: 'typeahead',
        press: ['Escape back to the field and type a range in the format the field advertises.'],
        expect: [
          'The typed characters are echoed.',
          'The value the field holds afterwards matches what was typed.',
        ],
        apg: 'Combobox — printable characters are accepted by the text field.',
      },
      {
        task: 'select',
        press: ['Open the calendar, Enter on a start date, move forward three days, Enter again.'],
        expect: [
          'After the first Enter the AT states that a start date is selected and that an end date is expected.',
          'After the second Enter the whole range is announced.',
          'The calendar closes and the field is announced as collapsed with both dates.',
        ],
        apg: 'Date Picker Dialog — each commit announces the resulting value; ARIA live region for the intermediate state.',
      },
      {
        task: 'dismiss',
        press: ['Open the calendar, choose only a start date, then Escape.'],
        expect: [
          'The calendar closes and focus returns to the field, which is re-announced.',
          'The AT makes clear whether the half-finished range was kept or discarded.',
        ],
        apg: 'Dialog — Escape closes and returns focus; and the ARIA rule that a cancelled edit announces its outcome.',
      },
      {
        task: 'error',
        story: 'core-forms-dzdaterangepicker--invalid-state',
        press: ['Tab onto the control, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control and is re-announced on re-focus.',
        ],
        apg: 'WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzFileUpload — Tier D · APG button + drags trait
  // -------------------------------------------------------------------------
  {
    component: 'DzFileUpload',
    story: 'core-forms-dzfileupload--accessibility',
    setup: [
      'This is the only Tier D component in the catalog: it reads files the user chooses, over both a picker and a drop target.',
      'Have three files ready before you start: a small PNG, a file over 2 MB, and a .txt file. The size and type steps need them.',
      'A native file picker is an OS dialog. Record what the AT does when it opens and when it closes; that is part of the run.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the drop zone.'],
        expect: [
          'It is announced as a button named "Document upload".',
          'The instruction text is announced as its description, not as separate page text.',
          'The underlying file input is NOT announced as a second, unlabelled control.',
        ],
        apg: 'Button — role and name; and the ARIA rule that a visually hidden native input must not surface as an unnamed control.',
      },
      {
        task: 'activate',
        press: [
          'Enter. Cancel the picker.',
          'Space. Choose the small PNG.',
        ],
        expect: [
          'Both Enter and Space open the file picker, and each opens it exactly once.',
          'After the file is chosen, the file name and the new file count are announced politely.',
          'Focus returns to the drop zone (or to the new file entry) and the AT says where it landed.',
          'The announced file name is the visible label. It is not a raw path and not an unbounded string.',
        ],
        apg: 'Button — Keyboard Interaction: both Enter and Space activate; ARIA live region for the resulting change.',
      },
      {
        task: 'non-drag',
        story: 'core-forms-dzfileupload--multiple-files',
        press: [
          'Add two files using the keyboard only.',
          'Tab through the list of added files.',
          'Activate the remove control on the first file.',
        ],
        expect: [
          'Every operation the drop target offers is reachable without a pointer drag: adding a file, and removing one.',
          'Each remove control is announced with the file it removes — not "Remove" alone repeated four times.',
          'Removing announces which file was removed and the new count.',
          'No step requires a drag, a path-based gesture, or a held pointer.',
        ],
        apg: 'WCAG 2.5.7 Dragging Movements — every drag operation has a single-pointer, non-drag alternative; and Button — Keyboard Interaction.',
      },
      {
        task: 'error',
        story: 'core-forms-dzfileupload--max-file-size',
        press: [
          'Choose the file that is over the limit.',
          'Then, on `core-forms-dzfileupload--accept-filter`, choose the .txt file.',
          'Finally, on `core-forms-dzfileupload--invalid-state`, Tab onto the control and away, then back.',
        ],
        expect: [
          'Each rejection is announced when it happens, without the tester having to go looking for it.',
          'The rejection text is programmatically associated with the drop zone — re-focusing the control announces it again.',
          'The control is announced as invalid while the error stands.',
          'The rejected file is not silently added.',
        ],
        apg: 'WCAG 3.3.1 Error Identification; `aria-invalid` + `aria-errormessage`; ARIA live region for the rejection itself.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzMegaMenu — Tier C · APG menubar
  // -------------------------------------------------------------------------
  {
    component: 'DzMegaMenu',
    story: 'core-navigation-dzmegamenu--accessibility',
    setup: [
      'A horizontal menubar. Opening on hover is switched off in this story on purpose, so every step is keyboard-driven.',
      'The first entry, "Products", owns a panel with three columns: Analytics (Dashboards, Reports, Funnels), Data (Pipelines, Warehouse, Connectors) and AI (Models, Agents).',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus enters the menubar.'],
        expect: [
          'It is announced as a menu bar named "Keyboard navigation".',
          'It is one tab stop — Tab reaches it once and one more Tab leaves it.',
          'The entry that takes focus is announced as a menu item with its position in the set.',
        ],
        apg: 'Menubar — Keyboard Interaction: "the menubar contains one tab stop"; `aria-orientation="horizontal"`.',
      },
      {
        task: 'navigate',
        press: ['ArrowRight, ArrowRight, ArrowLeft, Home, End.'],
        expect: [
          'Each entry is announced with its label and its position in the set.',
          'An entry that owns a panel is announced as having a submenu and as collapsed.',
          'An entry that is a plain link is NOT announced as having a submenu.',
          'Home announces the first entry and End the last. Nothing is skipped.',
        ],
        apg: 'Menubar — Keyboard Interaction Right/Left/Home/End; `aria-haspopup` and `aria-expanded` only on entries that own a submenu.',
      },
      {
        task: 'open',
        press: ['Move to "Products" and press ArrowDown.'],
        expect: [
          '"Products" is announced as expanded.',
          'The AT moves into the panel and announces its first link without a further keystroke.',
          'The column headings inside the panel are announced as group names as the tester crosses into each column.',
        ],
        apg: 'Menubar — Down Arrow on a menubar item opens its submenu and moves focus to the first item.',
      },
      {
        task: 'activate',
        press: ['ArrowDown twice inside the panel, then Enter on a link.'],
        expect: [
          'Each link is announced with its label and its description.',
          'Enter follows the link exactly once.',
          'Opening a second menubar entry closes the first, and only the newly opened panel is announced — the closing of the first is not announced as a second focus move.',
        ],
        apg: 'Menubar — Enter activates the focused item; only one submenu is open at a time.',
      },
      {
        task: 'dismiss',
        press: ['Open the "Products" panel again, then Escape.'],
        expect: [
          'The panel closes and "Products" is announced as collapsed.',
          'Focus returns to "Products" and the AT announces it — the tester can tell where they are without looking.',
        ],
        apg: 'Menubar — Escape closes the submenu and returns focus to the menubar item that opened it.',
      },
      {
        task: 'live',
        press: [
          'Open "Products".',
          'Without closing it, press ArrowRight to move to the next menubar entry that owns a panel, and ArrowDown to open it.',
        ],
        expect: [
          'The newly opened panel is announced exactly once.',
          'The first panel closing is not announced as a separate event that the tester has to interpret.',
          'At no point are two panels announced as open.',
        ],
        apg: 'Menubar — one submenu open at a time; ARIA live regions must not double-report a state the focus move already carries.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzMention — Tier C · APG combobox (editable, in-textarea)
  // -------------------------------------------------------------------------
  {
    component: 'DzMention',
    story: 'core-forms-dzmention--accessibility',
    setup: [
      'A comment textarea. Typing `@` opens a suggestion list of five people: Alice Johnson, Bob Smith, Carol Williams, David Brown, Eve Davis.',
      'This is the hardest focus contract in the set: focus never leaves the textarea, and the active suggestion is published through `aria-activedescendant`.',
      'A line below shows the raw value. Use it to confirm what was inserted.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the textarea.'],
        expect: [
          'It is announced as a combobox named "Keyboard comment".',
          'It is announced as collapsed and as a multi-line editable field.',
          'The placeholder is announced as its description or its value hint, not as its name.',
        ],
        apg: 'Combobox (editable) — `role="combobox"` on the editable element, `aria-expanded="false"`, `aria-autocomplete`.',
      },
      {
        task: 'open',
        press: ['Type `@`.'],
        expect: [
          'The combobox is announced as expanded.',
          'The popup is announced as a listbox.',
          'The first suggestion becomes the active option and is announced — WITHOUT the AT reporting that focus moved. Focus is still in the textarea.',
        ],
        apg: 'Combobox — `aria-activedescendant` focus management; `aria-controls` wired to the popup only while it is open.',
      },
      {
        task: 'navigate',
        press: ['ArrowDown twice, then ArrowUp once.'],
        expect: [
          'Each suggestion is announced with its label and its position — "Bob Smith, 2 of 5".',
          'The active option is also announced as selected.',
          'The caret does not move inside the textarea while the list is being navigated.',
        ],
        apg: 'Combobox — Down/Up move the active option; `aria-selected` on the active option.',
      },
      {
        task: 'typeahead',
        press: ['Escape to dismiss, then type `@Ca`.'],
        expect: [
          'The list narrows to "Carol Williams".',
          'The number of matches is announced politely, once.',
          'The single match becomes active and is announced.',
        ],
        apg: 'Combobox with list autocomplete.',
      },
      {
        task: 'select',
        press: ['Enter.'],
        expect: [
          'The mention is inserted and the inserted text is announced.',
          'The list is announced as collapsed.',
          'The value line reads the inserted mention.',
        ],
        apg: 'Combobox — Enter accepts the active option and closes the popup.',
      },
      {
        task: 'dismiss',
        press: ['Type `@` again to re-open the list, then Escape.'],
        expect: [
          'The combobox is announced as collapsed.',
          'Nothing was inserted.',
          'Focus is still in the textarea and the caret is where it was.',
        ],
        apg: 'Combobox — Escape closes the popup without changing the value.',
      },
      {
        task: 'error',
        story: 'core-forms-dzmention--invalid-state',
        press: ['Tab onto the control, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control and is re-announced on re-focus.',
        ],
        apg: 'WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
      {
        task: 'live',
        story: 'core-forms-dzmention--async-search',
        press: [
          'Type the trigger character and wait without moving focus.',
          'Then type a query that matches nothing.',
        ],
        expect: [
          'The pending state is announced politely, once, with focus unmoved.',
          'While it is pending, no listbox is announced as available.',
          'The no-match copy is announced politely, once.',
        ],
        apg: 'ARIA live regions and `aria-busy`; a busy popup is a status, not a focus event.',
      },
    ],
    knownDefects: [
      {
        id: 'D3',
        summary: 'The `loading` prop is dead — shadowed by an internal ref of the same name. The pending state is only reachable through an async resolver, which is why the `live` step uses the async story.',
        affects: ['live'],
      },
      {
        id: 'D8',
        summary: '`useDualModel` ignores external writes to `v-model:value` after the first user edit. Resetting the composer from outside will not take.',
        affects: ['select'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzMultiSelect — Tier C · APG combobox (multi-selectable)
  // -------------------------------------------------------------------------
  {
    component: 'DzMultiSelect',
    story: 'core-forms-dzmultiselect--accessibility',
    setup: [
      'Six frameworks: React, Vue, Angular, Svelte, Solid, Preact. More than one may be selected.',
      'Committed values are shown as removable tags on the control.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the control.'],
        expect: [
          'It is announced as a combobox named "Framework selection", collapsed.',
          'The current selection is announced — the count, or the tags, or both. An empty selection is announced as empty, not as silence.',
        ],
        apg: 'Combobox — role and expanded state; and the ARIA rule that a multi-value control announces its full value.',
      },
      {
        task: 'open',
        press: ['ArrowDown.'],
        expect: [
          'The combobox is announced as expanded.',
          'The popup is announced as a listbox that allows more than one selection.',
          'The first option becomes active and is announced.',
        ],
        apg: 'Combobox — Down Arrow opens; `aria-multiselectable="true"` on the listbox.',
      },
      {
        task: 'navigate',
        press: ['ArrowDown three times, ArrowUp once, End, Home.'],
        expect: [
          'Each option is announced with its label, its position ("Vue, 2 of 6") AND its selected state.',
          'An option already selected is announced as selected before it is toggled.',
          'Nothing is skipped.',
        ],
        apg: 'Combobox with a multi-select listbox — `aria-selected` is present on EVERY option, not only the selected ones.',
      },
      {
        task: 'typeahead',
        press: ['Type `sv`.'],
        expect: [
          '"Svelte" becomes the active option and is announced.',
          'The number of matches is announced politely, once.',
        ],
        apg: 'Combobox with list autocomplete.',
      },
      {
        task: 'select',
        press: ['Enter on "Svelte", ArrowDown to another option, Enter again.'],
        expect: [
          'Each selection is announced as selected as it happens.',
          'The popup does NOT close after the first selection — a multi-select combobox stays open.',
          'The control announces both values afterwards.',
          'Each tag is announced with its own label and its own remove control, and the remove control names what it removes.',
        ],
        apg: 'Combobox with a multi-select listbox — Enter toggles the active option and the popup remains open.',
      },
      {
        task: 'dismiss',
        press: ['Escape.'],
        expect: [
          'The combobox is announced as collapsed.',
          'Focus is on the combobox and it is re-announced with both values.',
          'The selections are unchanged.',
        ],
        apg: 'Combobox — Escape closes the popup without changing the value.',
      },
      {
        task: 'error',
        story: 'core-forms-dzmultiselect--invalid-state',
        press: ['Tab onto the control, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control and is re-announced on re-focus.',
        ],
        apg: 'WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
      {
        task: 'live',
        story: 'core-forms-dzmultiselect--max-selections',
        press: ['Select options until the maximum is reached, then try to select one more. Do not move focus.'],
        expect: [
          'Reaching the maximum is announced politely, exactly once.',
          'Options beyond the maximum are announced as unavailable BEFORE the tester tries to select one.',
          'The refusal does not move focus and does not close the popup silently.',
        ],
        apg: 'ARIA live regions; and `aria-disabled` on options that cannot currently be chosen.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzOrderList — Tier C · APG listbox + drags trait
  // -------------------------------------------------------------------------
  {
    component: 'DzOrderList',
    story: 'core-data-dzorderlist--accessibility',
    setup: [
      'Five rows under the visible heading "Release checklist": Draft the proposal, Review with the team, Incorporate feedback, Send for approval, Publish.',
      'The drag handle is switched off in this story on purpose. Everything below is keyboard-driven.',
      'This component carries the WCAG 2.5.7 obligation: every reorder a pointer drag can do must be doable without one.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus enters the list.'],
        expect: [
          'The list takes its accessible name from the visible heading "Release checklist".',
          'The list is one tab stop.',
          'The row that takes focus is announced with its label and its position — "Draft the proposal, 1 of 5".',
        ],
        apg: 'Listbox — Keyboard Interaction: "the listbox contains one tab stop"; `aria-posinset`/`aria-setsize`.',
      },
      {
        task: 'navigate',
        press: ['ArrowDown twice, ArrowUp once, End, Home.'],
        expect: [
          'Each row is announced with its label and its position in the set.',
          'End announces "Publish, 5 of 5" and Home announces the first row.',
          'Nothing is skipped.',
        ],
        apg: 'Listbox — Keyboard Interaction Down/Up/Home/End.',
      },
      {
        task: 'typeahead',
        press: ['With the list focused, press `p`.'],
        expect: [
          'Focus moves to "Publish" and it is announced.',
          'Pressing `p` again wraps to the next row starting with the same letter, or stays if there is only one.',
        ],
        apg: 'Listbox — Keyboard Interaction: "type a character, focus moves to the next item with a name that starts with the typed character".',
      },
      {
        task: 'select',
        story: 'core-data-dzorderlist--multi-select',
        press: ['ArrowDown to the second row, press Space, ArrowDown, press Space again.'],
        expect: [
          'The list is announced as allowing more than one selection.',
          'Each row announces its selected state as it is toggled.',
          'Every row announces a selected state, including the unselected ones.',
        ],
        apg: 'Listbox (multi-select) — `aria-multiselectable`; `aria-selected` on every option.',
      },
      {
        task: 'non-drag',
        press: [
          'Back on the entry story: ArrowDown twice to reach "Incorporate feedback".',
          'Space to grab it.',
          'ArrowUp to move it one place.',
          'Space to drop it.',
          'Then grab another row and press Escape instead of Space.',
          'Finally, on `core-data-dzorderlist--with-controls`, Tab to the reorder buttons and use them.',
        ],
        expect: [
          'Space announces that the row is grabbed AND its current position — "Grabbed item at position 3 of 5".',
          'Each ArrowUp/ArrowDown while grabbed announces the new position — "Item moved to position 2 of 5."',
          'Space announces the drop, and the committed order is what the announcements said it would be.',
          'Escape cancels the grab, announces the cancellation, and the order is unchanged.',
          'The control buttons are announced within a group named "Reorder controls", each with its own name: "Move up", "Move down", "Move to top", "Move to bottom".',
          'A control that cannot act on the current row (Move up on row 1) is announced as unavailable, not silently inert.',
        ],
        apg: 'WCAG 2.5.7 Dragging Movements; and the ARIA grabbed/drop announcement contract for a keyboard reorder.',
      },
      {
        task: 'live',
        story: 'core-data-dzorderlist--with-controls',
        press: ['Park focus on "Move up" and activate it twice.'],
        expect: [
          'Each reorder is announced politely, exactly once.',
          'The announcement says what moved and where it landed.',
          'Focus stays on the control; the list is not re-read from the top.',
        ],
        apg: 'ARIA live regions — a reorder is a status change, announced once, without a focus move.',
      },
    ],
    knownDefects: [
      {
        id: 'E6',
        summary: 'At the committed commit the list bound `:ariaLabel` instead of `:aria-label`, so an `aria-label` given as a prop only reached the accessibility tree through modern ARIA reflection and was ABSENT from server-rendered markup. This story names the list with `aria-labelledby`, which was always bound correctly, so the reach step should pass; a story that names it with `aria-label` is where this surfaces. Check the commit you are running against before filing.',
        affects: ['reach'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzPersonaSelector — Tier C · APG listbox (composed on DzCombobox)
  // -------------------------------------------------------------------------
  {
    component: 'DzPersonaSelector',
    story: 'core-forms-dzpersonaselector--accessibility',
    setup: [
      'Four people: Ada Lovelace (Engineering Lead), Linus Torvalds (Kernel Maintainer), Grace Hopper (Compiler Pioneer), Alan Turing (Research).',
      'Two of them have an avatar image and two do not. An avatar is decoration: it must not be announced as a separate image with a filename.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the search field.'],
        expect: [
          'It is announced as a combobox named "Assign a reviewer", collapsed.',
          'The placeholder is announced as a hint, not as the name.',
          'Exactly one control is announced. No second control is announced inside it.',
        ],
        apg: 'Combobox — role, name and expanded state.',
      },
      {
        task: 'navigate',
        press: ['ArrowDown to open, then ArrowDown twice more, then ArrowUp.'],
        expect: [
          'Each person is announced with their name, their role and their position — "Ada Lovelace, Engineering Lead, 1 of 4".',
          'The avatar image is not announced as a separate object, and never as a URL or a filename.',
          'Nothing is skipped.',
        ],
        apg: 'Listbox — Keyboard Interaction and `aria-posinset`/`aria-setsize`; and the ARIA rule that decorative images are hidden.',
      },
      {
        task: 'typeahead',
        press: ['Type `gra`.'],
        expect: [
          'The roster narrows to "Grace Hopper".',
          'The number of matches is announced politely, once.',
          'The single match becomes active and is announced.',
        ],
        apg: 'Combobox with list autocomplete.',
      },
      {
        task: 'select',
        press: ['Enter.'],
        expect: [
          '"Grace Hopper" is announced as selected.',
          'The list is announced as collapsed.',
          'Re-reading the control announces her name as the current value.',
        ],
        apg: 'Combobox — Enter accepts the active option.',
      },
      {
        task: 'live',
        story: 'core-forms-dzpersonaselector--empty',
        press: ['Tab to the field and open it. Do not move focus.'],
        expect: [
          'The empty-roster copy is announced politely, exactly once.',
          'The popup is not announced as an empty listbox with no explanation.',
          'Focus stays in the field.',
        ],
        apg: 'ARIA live regions; an empty popup states why it is empty.',
      },
    ],
    knownDefects: [
      {
        id: 'D9',
        summary: 'The clear button ignores `disabled`. On `core-forms-dzpersonaselector--disabled` a live "Clear selection" control is still present. It is out of the tab order, so keyboard-only pairs will not find it — but VoiceOver iOS and TalkBack reach controls by gesture, not by Tab, and are expected to reach and press it.',
        affects: ['reach'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzSidebar — Tier C · quality matrix declares `treeview`; the component
  // ships a navigation landmark. See the script QA note.
  // -------------------------------------------------------------------------
  {
    component: 'DzSidebar',
    story: 'core-navigation-dzsidebar--accessibility',
    setup: [
      'READ THIS FIRST. The quality matrix declares this component APG `treeview`. The component ships `role="navigation"` with links, which is what APG actually recommends for site navigation — APG says explicitly not to use the menu or tree patterns for a set of page links.',
      'The steps below are therefore written against the navigation-landmark contract the component declares, NOT against the Tree View pattern. The mismatch is an open owner decision (is the declared pattern wrong, or the component?); it is recorded in the TASK-N1-O4 handoff. Do not file it again.',
      'Four entries under a "Workspace" section: Dashboard (current), Sessions, Billing (disabled), Settings.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus enters the sidebar, and separately find it with your AT landmark command (NVDA/JAWS: `d`; VoiceOver: rotor → Landmarks).'],
        expect: [
          'It is announced as a navigation landmark named "Workspace navigation".',
          'It is findable by that name from the landmark list — a tester should not have to Tab through the page to reach it.',
          'The section heading "Workspace" is announced as a group name.',
        ],
        apg: 'Landmark Regions — `navigation` with an accessible name; APG explicitly recommends this over the menu/tree patterns for site navigation.',
      },
      {
        task: 'navigate',
        press: ['Tab through every entry, then Shift+Tab back.'],
        expect: [
          'The order is Dashboard, Sessions, Settings.',
          'The disabled "Billing" entry is SKIPPED by Tab.',
          'Exactly one entry is announced as the current page.',
          'Each entry is announced with its visible label.',
        ],
        apg: 'Landmark Regions and the link contract; `aria-current="page"` on exactly one entry; `aria-disabled` + removal from the tab order.',
      },
      {
        task: 'select',
        press: ['Tab to "Sessions" and press Enter.'],
        expect: [
          'The entry activates exactly once.',
          '"Sessions" is now announced as the current page and "Dashboard" is not.',
          'Still exactly one entry claims the current page.',
        ],
        apg: 'The `aria-current` contract: exactly one element in a set carries it.',
      },
      {
        task: 'typeahead',
        press: ['In browse mode, use your AT next-link command (NVDA/JAWS: `k`; VoiceOver: rotor → Links).'],
        expect: [
          'Every sidebar entry appears in the links list with its visible label.',
          'The disabled "Billing" entry is announced as unavailable, or is absent — it is not offered as a working link.',
          'No entry appears in the list twice.',
        ],
        apg: 'The listbox typeahead obligation the scaffold derives from `treeview`, met here through the AT own element-navigation commands, which is the equivalent affordance for a landmark of links.',
      },
      {
        task: 'live',
        story: 'core-navigation-dzsidebar--collapsed',
        press: [
          'Tab through the collapsed rail.',
          'On `core-navigation-dzsidebar--real-world-app-shell`, activate the collapse control and Tab through the rail again.',
        ],
        expect: [
          'The collapsed rail keeps every accessible name — the visible label may be gone, the announced name may not be.',
          'The collapse control announces its own expanded/collapsed state and the change is announced once.',
          'The current-page entry is still announced as current after collapsing.',
          'Focus is not stranded on a control the collapse removed.',
        ],
        apg: 'The `aria-expanded` contract on a disclosure control; and the ARIA rule that a name may not depend on visible text alone.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzTable — Tier C · APG table + drags trait
  // -------------------------------------------------------------------------
  {
    component: 'DzTable',
    story: 'core-data-dztable--accessibility',
    setup: [
      'Three columns (Product, Price, Stock) and two rows. A static table is not a widget: the tester drives it with the AT own table-reading commands, not with Tab.',
      'NVDA and JAWS: Ctrl+Alt+Arrows. VoiceOver: VO+Arrows once inside the table. TalkBack and VoiceOver iOS: use the reading-control set to Table or Row where available, otherwise swipe.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Use the AT next-table command (NVDA/JAWS: `t`; VoiceOver: rotor → Tables).'],
        expect: [
          'It is announced as a table named "Accessible table with proper header scope".',
          'Its dimensions are announced — three columns, three rows including the header row.',
          'On `core-data-dztable--with-caption`, the caption is announced on entry.',
        ],
        apg: 'Table — a `table` with an accessible name; the AT announces dimensions on entry.',
      },
      {
        task: 'navigate',
        press: ['Move right across the header row, then down into the data rows, then right again.'],
        expect: [
          'Each header cell is announced as a column header.',
          'Each data cell announces its column header together with its value — "Price, 9 dollars 99".',
          'Moving down a column does not lose the header association.',
          'On `core-data-dztable--with-spans`, a spanned cell is announced once, with the span stated, not repeated per covered column.',
        ],
        apg: 'Table — `th` with `scope`, and the header/data-cell association the AT reads.',
      },
      {
        task: 'non-drag',
        story: 'core-data-dztable--column-resizing',
        press: [
          'Tab to a column resize control.',
          'Press ArrowLeft and ArrowRight.',
          'Then try to resize the column with a single pointer WITHOUT dragging — a tap, or a tap-then-tap.',
        ],
        expect: [
          'The resize control is announced with the name "Resize column" and with the column it resizes.',
          'Arrow keys change the width, and each change is announced with the new value.',
          'There is a single-pointer path that does not require a held drag.',
        ],
        apg: 'WCAG 2.5.7 Dragging Movements — a keyboard path is not sufficient on its own; the SC asks for a single-pointer alternative.',
      },
      {
        task: 'live',
        story: 'core-data-dztable--loading',
        press: [
          'Park focus outside the table, then load the loading story.',
          'Then load `core-data-dztable--virtual-scroll` and scroll it while focus is elsewhere.',
        ],
        expect: [
          'The busy state is announced once, without moving focus.',
          'While loading, the previous page of values is NOT still readable as current — skeletons are hidden from the accessibility tree.',
          'Scrolling a virtualised table does not announce a page change and does not steal focus.',
        ],
        apg: 'ARIA `aria-busy`; and the rule that content removed from view is removed from the accessibility tree.',
      },
    ],
    knownDefects: [
      {
        id: 'G5',
        summary: 'Column resize is keyboard-operable but has NO single-pointer, non-drag alternative. WCAG 2.5.7 is not met for this operation and it is a recorded open owner decision, not a new finding. The non-drag step is expected to fail its third expectation on the touch pairs.',
        affects: ['non-drag'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzTimePicker — Tier C · APG combobox
  // -------------------------------------------------------------------------
  {
    component: 'DzTimePicker',
    story: 'core-forms-dztimepicker--accessibility',
    setup: [
      'An empty time field named "Appointment time", using the select-list panel layout.',
      'The panel controls are named "Select hours", "Select minutes", "Select AM/PM", "OK" and "Cancel".',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the trigger.'],
        expect: [
          'It is announced as a combobox named "Appointment time", collapsed.',
          'Its current value, or the placeholder when empty, is announced.',
        ],
        apg: 'Combobox — role, name, `aria-haspopup="dialog"`, `aria-expanded="false"`.',
      },
      {
        task: 'open',
        press: ['Enter.'],
        expect: [
          'The trigger is announced as expanded.',
          'The panel is announced as a dialog.',
          'Focus moves into the panel and the first control is announced without a further keystroke.',
        ],
        apg: 'Combobox with a dialog popup — Enter opens and moves focus into the dialog.',
      },
      {
        task: 'navigate',
        press: ['Tab through every control in the panel, then Shift+Tab back.'],
        expect: [
          'Every control is announced with a name: "Select hours", "Select minutes", "Select AM/PM", "OK", "Cancel".',
          'Each list announces its current value and its position in the set as the tester moves within it.',
          'No control in the panel is announced as unnamed.',
        ],
        apg: 'Dialog — every control has an accessible name; Listbox — position and set size within each column.',
      },
      {
        task: 'typeahead',
        press: ['Move into the hours list and type `14` (or `2` in twelve-hour mode).'],
        expect: [
          'The matching hour becomes active and is announced.',
          'Typing a value that does not exist does not move the active option and does not announce a wrong one.',
        ],
        apg: 'Listbox — Keyboard Interaction: printable characters move focus to a matching option.',
      },
      {
        task: 'select',
        press: ['Choose 14 hours and 30 minutes, then activate "OK".'],
        expect: [
          'Each column choice is announced as selected.',
          '"OK" commits the value and the commit is announced.',
          'The panel closes and the trigger announces 14:30 as its value.',
        ],
        apg: 'Dialog — an explicit commit control; the resulting value is announced.',
      },
      {
        task: 'dismiss',
        press: ['Open the panel again, then Escape. Then open it once more and use "Cancel".'],
        expect: [
          'Escape closes the panel and focus returns to the trigger, which is re-announced.',
          '"Cancel" closes it the same way and leaves the value unchanged.',
          'In both cases the tester can tell where focus landed without looking.',
        ],
        apg: 'Dialog — Escape closes and focus returns to the invoking control.',
      },
      {
        task: 'error',
        story: 'core-forms-dztimepicker--invalid-state',
        press: ['Tab onto the control, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as invalid.',
          'The error text is announced as part of the control and is re-announced on re-focus.',
        ],
        apg: 'WCAG 3.3.1; `aria-invalid` + `aria-describedby`/`aria-errormessage`.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzTour — Tier C · APG dialog
  // -------------------------------------------------------------------------
  {
    component: 'DzTour',
    story: 'core-overlays-dztour--accessibility',
    setup: [
      'A toolbar of three buttons is the tour target set. A button, "Start accessible tour", opens the tour.',
      'Three steps: "Create a project", "Invite teammates", "Tune your settings".',
      'Note which element you were on before you start the tour. The dismiss step depends on it.',
    ],
    steps: [
      {
        task: 'open',
        press: ['Tab to "Start accessible tour" and activate it.'],
        expect: [
          'A modal dialog is announced.',
          'Its name is the step title, "Create a project", and its description is the step body, "Start here to spin up a new workspace for your team."',
          'Focus moves into the popover without a further keystroke.',
          'The page behind the dialog is not reachable.',
        ],
        apg: 'Dialog (Modal) — `aria-modal="true"`, name from the title, description from the body, focus moved into the dialog.',
      },
      {
        task: 'reach',
        press: ['Tab through every control in the popover, and one Tab past the last one. Then Shift+Tab past the first.'],
        expect: [
          'Each control is announced with its name and its role.',
          'Tab from the last control wraps to the first and never lands on the page behind.',
          'Shift+Tab from the first wraps to the last.',
          'Nothing outside the popover is reachable while it is open.',
        ],
        apg: 'Dialog (Modal) — Tab and Shift+Tab cycle within the dialog.',
      },
      {
        task: 'dismiss',
        press: [
          'Escape.',
          'Re-open the tour and dismiss it with the Skip control instead.',
        ],
        expect: [
          'The dialog closes both ways.',
          'Focus returns to "Start accessible tour" — the element that opened the tour — and the AT announces it.',
          'The tester can tell where they landed without looking. Focus on the document body is a FAIL for this step, not a pass.',
        ],
        apg: 'Dialog (Modal) — "focus returns to the element that invoked the dialog"; WCAG 2.4.3 Focus Order.',
      },
      {
        task: 'live',
        press: ['Re-open the tour and advance to step 2, then step 3.'],
        expect: [
          '"Step 2 of 3" is announced politely, exactly once.',
          'The new step title and body are announced.',
          'The step change does not produce a second, competing focus announcement.',
        ],
        apg: 'ARIA live regions — a step change is a status, announced once.',
      },
    ],
    knownDefects: [
      {
        id: 'D7',
        summary: '`useFocusTrap.deactivate()` removes its keydown listener and nothing else — it never restores focus. Dismissing the tour by Escape, Skip or Finish is expected to leave focus on the document body instead of on "Start accessible tour". The dismiss step is expected to FAIL on every pair. This is a known open defect, not a new finding.',
        affects: ['dismiss'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzTransfer — Tier C · APG listbox (a pair of them)
  // -------------------------------------------------------------------------
  {
    component: 'DzTransfer',
    story: 'core-forms-dztransfer--accessibility',
    setup: [
      'Two lists side by side. The source holds eight languages: JavaScript, TypeScript, Python, Rust, Go, Java, C# (disabled), Ruby. The target starts empty.',
      'Two move buttons sit between them, named "Move selected to target" and "Move selected to source".',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab through the whole component once.'],
        expect: [
          'The component is announced with the name "Language selection transfer".',
          'The source list is announced as a listbox named "Source items" and the target as a listbox named "Target items".',
          'Each list announces how many items it holds.',
          'The two move buttons are announced with their own names.',
          'An empty target list is announced as empty, not as silence.',
        ],
        apg: 'Listbox — each listbox carries its own accessible name; and the ARIA rule that an empty collection states that it is empty.',
      },
      {
        task: 'navigate',
        press: ['Tab into the source list, then ArrowDown five times, ArrowUp once, End, Home.'],
        expect: [
          'Each item is announced with its label and its position — "JavaScript, 1 of 8".',
          'The disabled "C#" entry is announced as unavailable.',
          'The disabled entry is reachable for reading but refuses selection.',
          'Nothing is skipped.',
        ],
        apg: 'Listbox — Keyboard Interaction Down/Up/Home/End; `aria-disabled` on an option that cannot be chosen.',
      },
      {
        task: 'typeahead',
        story: 'core-forms-dztransfer--searchable',
        press: ['Tab to the source search field and type `ru`.'],
        expect: [
          'The search field is announced as a text field named "Search source items".',
          'The source list narrows to Rust and Ruby.',
          'The number of results is announced politely, once.',
        ],
        apg: 'Listbox with a filter — the filtered count is announced in a live region.',
      },
      {
        task: 'select',
        press: [
          'Back on the entry story: in the source list, select Rust and Go with Space.',
          'Tab to "Move selected to target" and activate it.',
        ],
        expect: [
          'Each selection is announced as selected.',
          'After the move, the AT announces what moved and how many.',
          'Both lists announce their new sizes.',
          'Focus is not lost — it stays on the button, or lands somewhere the AT names.',
        ],
        apg: 'Listbox (multi-select) — `aria-selected` on every option; and ARIA live regions for the resulting change.',
      },
      {
        task: 'live',
        press: ['With focus still on the move button, move two more items across.'],
        expect: [
          'Each transfer is announced politely, exactly once.',
          'The announcement states the new counts.',
          'A move button that can no longer act (nothing selected, or the source is empty) is announced as unavailable.',
          'Neither list is re-read from the top.',
        ],
        apg: 'ARIA live regions; `aria-disabled` on a control with nothing to act on.',
      },
    ],
    knownDefects: [],
  },

  // -------------------------------------------------------------------------
  // DzTree — Tier C · APG treeview
  // -------------------------------------------------------------------------
  {
    component: 'DzTree',
    story: 'core-data-dztree--accessibility',
    setup: [
      'A file tree. `src` is expanded and holds `components` (collapsed), `composables` (collapsed), `main.ts` and `App.vue`. A sibling branch `tests` is collapsed. Selection is on.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus enters the tree.'],
        expect: [
          'It is announced as a tree named "Keyboard navigable file tree".',
          'The tree is one tab stop.',
          'The node that takes focus announces its label, its level, its position in its set, the set size, and whether it is expanded or collapsed.',
        ],
        apg: 'Tree View — Keyboard Interaction: "the tree contains one tab stop"; `aria-level`, `aria-posinset`, `aria-setsize`, `aria-expanded`.',
      },
      {
        task: 'navigate',
        press: [
          'ArrowDown to `components`.',
          'ArrowRight (expands it), ArrowRight again (moves to its first child).',
          'ArrowLeft (returns to the parent), ArrowLeft again (collapses it).',
          'End, then Home.',
        ],
        expect: [
          'ArrowRight on a collapsed node expands it and announces "expanded"; it does not move focus.',
          'ArrowRight on an already-expanded node moves to its first child and announces the new level.',
          'ArrowLeft on an expanded node collapses it; on a collapsed node it moves to the parent and announces it.',
          'End announces the last visible node and Home the first.',
          'Every move announces the level and the position; nothing is skipped and no hidden child is announced.',
        ],
        apg: 'Tree View — Keyboard Interaction Right/Left/Down/Up/Home/End, exactly as specified.',
      },
      {
        task: 'select',
        press: ['Move to `DzButton.vue` and press Enter, then Space.'],
        expect: [
          'The node is announced as selected.',
          'A previously selected node is announced as no longer selected.',
          'Both Enter and Space select — neither is silent.',
        ],
        apg: 'Tree View — Enter/Space perform the default action; `aria-selected` on the selected node.',
      },
      {
        task: 'typeahead',
        press: ['With the tree focused, press `c`, then `c` again.'],
        expect: [
          'Focus moves to the next visible node whose label starts with `c` and it is announced.',
          'Pressing it again moves to the next such node and wraps at the end.',
          'Only visible nodes are considered — a collapsed branch child is not reached by typeahead.',
        ],
        apg: 'Tree View — Keyboard Interaction: "type a character, focus moves to the next node with a name that starts with the typed character".',
      },
      {
        task: 'live',
        story: 'core-data-dztree--loading',
        press: [
          'Park focus outside the tree, then load the loading story.',
          'Then load `core-data-dztree--empty` the same way.',
          'Finally, on `core-data-dztree--disabled`, Tab towards the tree.',
        ],
        expect: [
          'The busy state is announced once, without moving focus.',
          'The empty state text is announced politely, once.',
          'A tree marked disabled is announced as disabled AND is not operable — it is not a tab stop, rows do not take focus, and branches cannot be expanded.',
        ],
        apg: 'ARIA `aria-busy` and live regions; and the rule that a disabled composite is disabled throughout, not only on its container.',
      },
    ],
    knownDefects: [
      {
        id: 'D1',
        summary: 'Tree-level `disabled` is presentational only: the root is marked disabled but the prop never reaches the rows, so every row keeps its roving tabindex, its click handler, its expand chevron and its selection. The third expectation of the `live` step is expected to FAIL. This is a known open defect.',
        affects: ['live'],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // DzTreeSelect — Tier C · APG combobox with a tree popup
  // -------------------------------------------------------------------------
  {
    component: 'DzTreeSelect',
    story: 'core-forms-dztreeselect--accessibility',
    setup: [
      'A category tree in a select: Fruit (Apple, Banana, Citrus → Orange, Lemon), Vegetable (Carrot, Potato), Dairy.',
      'The declared contract is a combobox that KEEPS focus on the trigger and publishes the active node through `aria-activedescendant`. Watch for a focus move; it is the thing this script is looking for.',
    ],
    steps: [
      {
        task: 'reach',
        press: ['Tab until focus lands on the trigger.'],
        expect: [
          'It is announced as a combobox named "Keyboard category", collapsed.',
          'It is announced as having a tree popup.',
          'Exactly one control is announced. No second control is announced inside it.',
        ],
        apg: 'Combobox — role, name, `aria-haspopup="tree"`, `aria-expanded="false"`; and the HTML rule that a button may not contain interactive content.',
      },
      {
        task: 'open',
        press: ['ArrowDown.'],
        expect: [
          'The trigger is announced as expanded.',
          'The popup is announced as a tree.',
          'The first node, "Fruit", becomes the active node and is announced with its level and position.',
          'Focus does NOT move: the AT must not report a focus change to a tree row. The trigger keeps focus and publishes the active node through `aria-activedescendant`.',
        ],
        apg: 'Combobox — `aria-activedescendant` focus management: the element with `aria-activedescendant` must retain DOM focus.',
      },
      {
        task: 'navigate',
        press: [
          'ArrowRight to expand "Fruit".',
          'ArrowDown to step into "Apple", ArrowDown again to "Banana".',
          'ArrowLeft to return to the parent.',
        ],
        expect: [
          'Each active node is announced with its label, its level and its position in its set.',
          'ArrowRight on a collapsed branch expands it and announces "expanded".',
          'ArrowLeft collapses or climbs, and announces the node it lands on.',
          'Nothing is skipped and no hidden child is announced.',
        ],
        apg: 'Tree View — Keyboard Interaction, driven from a combobox trigger.',
      },
      {
        task: 'typeahead',
        story: 'core-forms-dztreeselect--filterable',
        press: [
          'Open the popup and type `car` into the filter field.',
          'Then clear it and type `qqq`.',
        ],
        expect: [
          'The filter field is announced as a text field named "Filter options".',
          'The tree narrows to "Carrot" and the number of results is announced politely, once.',
          '"No results found" is announced when nothing matches.',
        ],
        apg: 'Combobox with list autocomplete over a tree popup.',
      },
      {
        task: 'select',
        press: ['On the entry story: open, expand "Fruit", move to "Apple", press Enter.'],
        expect: [
          '"Apple" is announced as selected.',
          'The popup is announced as collapsed.',
          'Re-reading the trigger announces "Apple" as its value.',
        ],
        apg: 'Combobox — Enter accepts the active node and closes the popup.',
      },
      {
        task: 'dismiss',
        press: ['Open the popup again, then Escape.'],
        expect: [
          'The trigger is announced as collapsed.',
          'Focus is on the trigger and it is re-announced with its value.',
          'The selection is unchanged.',
        ],
        apg: 'Combobox — Escape closes the popup and returns focus to the combobox.',
      },
      {
        task: 'error',
        story: 'core-forms-dztreeselect--in-form-field',
        press: ['Tab onto the control, leave it empty, Tab away, then Shift+Tab back.'],
        expect: [
          'The control is announced as required.',
          'Leaving a required field empty is announced as an error, and the error text is announced as part of the control.',
          'Re-focusing announces it again.',
        ],
        apg: 'WCAG 3.3.1 Error Identification; `aria-required`, `aria-invalid` and `aria-describedby`/`aria-errormessage`.',
      },
      {
        task: 'live',
        story: 'core-forms-dztreeselect--filterable',
        press: ['Open the popup, type `qqq` in the filter field, and do not move focus.'],
        expect: [
          '"No results found" is announced politely, exactly once.',
          'Focus stays in the filter field.',
        ],
        apg: 'ARIA live regions.',
      },
    ],
    knownDefects: [
      {
        id: 'D10',
        summary: 'The component runs two focus mechanisms at once: it advertises `aria-activedescendant` from the trigger while the popover moves real DOM focus onto the tree row. The fourth expectation of the `open` step is expected to FAIL — the AT will report a focus move to a tree row. This is a known open defect.',
        affects: ['open'],
      },
      {
        id: 'D4',
        summary: 'On `core-forms-dztreeselect--multiple-chips`, each chip remove control is `role="button"` rendered INSIDE the `role="combobox"` button. The reach step on that story is expected to announce nested controls.',
        affects: ['reach'],
      },
      {
        id: 'D8',
        summary: '`useDualModel` ignores external writes to `v-model:value` after the first user edit. Resetting the selection from outside the component will not take.',
        affects: ['select'],
      },
    ],
  },
]
