<script setup lang="ts">
import type {
  CommandGroup,
  CommandItem,
  PopoverAlign,
  PopoverContentSize,
  PopoverSide,
  SheetContentSize,
  SheetSide,
  TooltipAlign,
  TooltipSide,
} from '@dzup-ui/core'
import {
  DzButton,
  DzCommandPalette,
  DzConfirmDialog,
  DzContextMenu,
  DzContextMenuContent,
  DzContextMenuItem,
  DzContextMenuSeparator,
  DzContextMenuTrigger,
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogTitle,
  DzDialogTrigger,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzPopover,
  DzPopoverContent,
  DzPopoverTrigger,
  DzSheet,
  DzSheetClose,
  DzSheetContent,
  DzSheetDescription,
  DzSheetTitle,
  DzSheetTrigger,
  DzTooltip,
  DzTooltipContent,
  DzTooltipTrigger,
} from '@dzup-ui/core'
import {
  ChevronDown,
  Copy,
  FileText,
  Folder,
  Info,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  User,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'

// ── Dialog ──────────────────────────────────────────────
const dialogOpen = ref(false)
const scrollDialogOpen = ref(false)

// ── Popover ─────────────────────────────────────────────
const popoverOpen = ref(false)
const popoverSide = ref<PopoverSide>('bottom')
const popoverAlign = ref<PopoverAlign>('center')
const popoverSize = ref<PopoverContentSize>('md')
const popoverArrow = ref(true)

const popoverSides: PopoverSide[] = ['top', 'right', 'bottom', 'left']
const popoverAligns: PopoverAlign[] = ['start', 'center', 'end']
const popoverSizes: PopoverContentSize[] = ['sm', 'md', 'lg']

// ── Tooltip ─────────────────────────────────────────────
const tooltipOpen = ref(false)
const tooltipDelay = ref(200)
const tooltipDisabled = ref(false)

const tooltipSides: TooltipSide[] = ['top', 'right', 'bottom', 'left']
const tooltipAligns: TooltipAlign[] = ['start', 'center', 'end']

// ── Sheet ───────────────────────────────────────────────
const sheetState = ref<Record<SheetSide, boolean>>({
  top: false,
  right: false,
  bottom: false,
  left: false,
})
const sheetSides: SheetSide[] = ['top', 'right', 'bottom', 'left']

const sheetSizes: SheetContentSize[] = ['sm', 'md', 'lg']
const sheetSizeOpen = ref<Record<SheetContentSize, boolean>>({
  sm: false,
  md: false,
  lg: false,
})

// ── Dropdown Menu ───────────────────────────────────────
const dropdownOpen = ref(false)
const lastDropdownAction = ref<string | null>(null)
function handleDropdownAction(label: string): void {
  lastDropdownAction.value = label
}

// ── Context Menu ────────────────────────────────────────
const contextOpen = ref(false)
const lastContextAction = ref<string | null>(null)
function handleContextAction(label: string): void {
  lastContextAction.value = label
}

// ── Command Palette ─────────────────────────────────────
const commandOpen = ref(false)
const lastCommand = ref<string | null>(null)

const commandGroups: CommandGroup[] = [
  { id: 'files', label: 'Files' },
  { id: 'edit', label: 'Edit' },
  { id: 'account', label: 'Account' },
]

const commandItems: CommandItem[] = [
  { id: 'new-file', label: 'New file', icon: Plus, shortcut: 'Ctrl+N', group: 'files' },
  { id: 'open-folder', label: 'Open folder', icon: Folder, shortcut: 'Ctrl+O', group: 'files' },
  { id: 'save', label: 'Save', icon: Save, shortcut: 'Ctrl+S', group: 'files' },
  { id: 'copy', label: 'Copy', icon: Copy, shortcut: 'Ctrl+C', group: 'edit' },
  { id: 'rename', label: 'Rename', icon: Pencil, shortcut: 'F2', group: 'edit' },
  { id: 'delete', label: 'Delete', icon: Trash2, shortcut: 'Del', group: 'edit', disabled: true },
  { id: 'profile', label: 'Profile', icon: User, group: 'account' },
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'Ctrl+,', group: 'account' },
  { id: 'logout', label: 'Sign out', icon: LogOut, group: 'account' },
]

function handleCommandSelect(item: CommandItem): void {
  lastCommand.value = item.label
}

// ── Confirm Dialog ──────────────────────────────────────
const confirmOpen = ref(false)
const dangerConfirmOpen = ref(false)
const dangerLoading = ref(false)
const lastConfirmResult = ref<string | null>(null)

function handleConfirm(): void {
  lastConfirmResult.value = 'Confirmed (default)'
  confirmOpen.value = false
}

function handleCancel(): void {
  lastConfirmResult.value = 'Cancelled'
}

async function handleDangerConfirm(): Promise<void> {
  dangerLoading.value = true
  await new Promise((resolve) => {
    setTimeout(resolve, 1200)
  })
  dangerLoading.value = false
  dangerConfirmOpen.value = false
  lastConfirmResult.value = 'Item deleted'
}

// ── Nested / stacked ────────────────────────────────────
const nestedSheetOpen = ref(false)
const nestedConfirmOpen = ref(false)
const nestedLoading = ref(false)

async function handleNestedConfirm(): Promise<void> {
  nestedLoading.value = true
  await new Promise((resolve) => {
    setTimeout(resolve, 900)
  })
  nestedLoading.value = false
  nestedConfirmOpen.value = false
  nestedSheetOpen.value = false
}

// Long content for scrollable dialog
const longParagraphs = computed(() => Array.from({ length: 14 }, (_, i) => i + 1))
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Overlays
    </h1>
    <p class="page-description">
      Dialog, Popover, Tooltip, Sheet, Dropdown, Context Menu, Command Palette, and Confirm Dialog.
    </p>

    <!-- Dialog -->
    <section class="demo-section">
      <h2 class="section-title">
        Dialog
      </h2>
      <div class="demo-row">
        <DzDialog v-model:open="dialogOpen">
          <DzDialogTrigger as-child>
            <DzButton tone="primary">
              Open Dialog
            </DzButton>
          </DzDialogTrigger>
          <DzDialogContent>
            <DzDialogTitle>Dialog title</DzDialogTitle>
            <DzDialogDescription>
              Dialogs are used for important interactions that require user attention.
            </DzDialogDescription>
            <div class="dialog-actions">
              <DzDialogClose as-child>
                <DzButton variant="ghost" tone="neutral">
                  Cancel
                </DzButton>
              </DzDialogClose>
              <DzDialogClose as-child>
                <DzButton tone="primary">
                  Confirm
                </DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
        <span class="state-label">open: {{ dialogOpen }}</span>
      </div>
    </section>

    <!-- Dialog Sizes -->
    <section class="demo-section">
      <h2 class="section-title">
        Dialog sizes
      </h2>
      <div class="demo-row">
        <DzDialog v-for="size in (['sm', 'md', 'lg', 'xl', 'full'] as const)" :key="size">
          <DzDialogTrigger as-child>
            <DzButton variant="outline" tone="neutral" size="sm">
              {{ size }}
            </DzButton>
          </DzDialogTrigger>
          <DzDialogContent :size="size">
            <DzDialogTitle>{{ size.toUpperCase() }} Dialog</DzDialogTitle>
            <DzDialogDescription>
              This is a {{ size }} sized dialog content panel.
            </DzDialogDescription>
            <div class="dialog-actions">
              <DzDialogClose as-child>
                <DzButton tone="primary">
                  Close
                </DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
      </div>
    </section>

    <!-- Scrollable Dialog -->
    <section class="demo-section">
      <h2 class="section-title">
        Scrollable Dialog
      </h2>
      <p class="subsection-note">
        Long content with sticky title and footer — the body scrolls inside the panel.
      </p>
      <div class="demo-row">
        <DzDialog v-model:open="scrollDialogOpen">
          <DzDialogTrigger as-child>
            <DzButton variant="outline" tone="neutral">
              Open long dialog
            </DzButton>
          </DzDialogTrigger>
          <DzDialogContent size="lg" scrollable>
            <template #header>
              <DzDialogTitle>Terms of service</DzDialogTitle>
              <DzDialogDescription>
                Scroll through the body — the header and footer stay pinned.
              </DzDialogDescription>
            </template>
            <p v-for="n in longParagraphs" :key="n">
              Paragraph {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
            </p>
            <template #footer>
              <DzDialogClose as-child>
                <DzButton variant="ghost" tone="neutral">
                  Decline
                </DzButton>
              </DzDialogClose>
              <DzDialogClose as-child>
                <DzButton tone="primary">
                  Accept
                </DzButton>
              </DzDialogClose>
            </template>
          </DzDialogContent>
        </DzDialog>
        <span class="state-label">open: {{ scrollDialogOpen }}</span>
      </div>
    </section>

    <!-- Popover -->
    <section class="demo-section">
      <h2 class="section-title">
        Popover — side × align
      </h2>
      <p class="subsection-note">
        Configure side, align, size, and arrow visibility.
      </p>

      <div class="control-row">
        <label class="control">
          <span class="control-label">side</span>
          <select v-model="popoverSide" class="control-input">
            <option v-for="s in popoverSides" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </label>
        <label class="control">
          <span class="control-label">align</span>
          <select v-model="popoverAlign" class="control-input">
            <option v-for="a in popoverAligns" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </label>
        <label class="control">
          <span class="control-label">size</span>
          <select v-model="popoverSize" class="control-input">
            <option v-for="s in popoverSizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </label>
        <label class="control checkbox">
          <input v-model="popoverArrow" type="checkbox">
          <span class="control-label">arrow</span>
        </label>
      </div>

      <div class="popover-stage">
        <DzPopover v-model:open="popoverOpen">
          <DzPopoverTrigger as-child>
            <DzButton variant="outline" tone="neutral">
              Open popover
            </DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent
            :side="popoverSide"
            :align="popoverAlign"
            :size="popoverSize"
            :arrow="popoverArrow"
          >
            <div class="popover-body">
              <p class="popover-title">
                Popover content
              </p>
              <p class="popover-text">
                side: <code>{{ popoverSide }}</code> · align: <code>{{ popoverAlign }}</code> · size: <code>{{ popoverSize }}</code>
              </p>
            </div>
          </DzPopoverContent>
        </DzPopover>
        <span class="state-label">open: {{ popoverOpen }}</span>
      </div>

      <h3 class="subsection-title">
        Quick variations
      </h3>
      <div class="demo-row">
        <DzPopover v-for="s in popoverSizes" :key="s">
          <DzPopoverTrigger as-child>
            <DzButton variant="ghost" tone="neutral" size="sm">
              size={{ s }}
            </DzButton>
          </DzPopoverTrigger>
          <DzPopoverContent :size="s">
            <div class="popover-body">
              <p class="popover-text">
                size <code>{{ s }}</code> content panel.
              </p>
            </div>
          </DzPopoverContent>
        </DzPopover>
      </div>
    </section>

    <!-- Tooltip -->
    <section class="demo-section">
      <h2 class="section-title">
        Tooltip
      </h2>
      <p class="subsection-note">
        Sides × align matrix, delay control, disabled trigger, rich content.
      </p>

      <div class="control-row">
        <label class="control">
          <span class="control-label">delay (ms)</span>
          <input
            v-model.number="tooltipDelay"
            type="number"
            min="0"
            step="100"
            class="control-input"
          >
        </label>
        <label class="control checkbox">
          <input v-model="tooltipDisabled" type="checkbox">
          <span class="control-label">disabled trigger</span>
        </label>
      </div>

      <h3 class="subsection-title">
        side × align
      </h3>
      <div class="matrix">
        <div v-for="side in tooltipSides" :key="side" class="matrix-row">
          <span class="matrix-label">{{ side }}</span>
          <DzTooltip v-for="align in tooltipAligns" :key="align" :delay-duration="tooltipDelay">
            <DzTooltipTrigger as-child>
              <DzButton variant="outline" tone="neutral" size="sm">
                {{ align }}
              </DzButton>
            </DzTooltipTrigger>
            <DzTooltipContent :side="side" :align="align">
              {{ side }} / {{ align }}
            </DzTooltipContent>
          </DzTooltip>
        </div>
      </div>

      <h3 class="subsection-title">
        Disabled + rich content
      </h3>
      <div class="demo-row">
        <DzTooltip v-model:open="tooltipOpen" :delay-duration="tooltipDelay">
          <DzTooltipTrigger as-child>
            <DzButton :disabled="tooltipDisabled" tone="primary">
              Hover me
            </DzButton>
          </DzTooltipTrigger>
          <DzTooltipContent>
            <div class="tooltip-rich">
              <Info :size="14" />
              <span>Rich tooltip with an icon</span>
            </div>
          </DzTooltipContent>
        </DzTooltip>
        <span class="state-label">open: {{ tooltipOpen }}</span>
      </div>
    </section>

    <!-- Sheet (Drawer) -->
    <section class="demo-section">
      <h2 class="section-title">
        Sheet (Drawer) — all sides
      </h2>
      <div class="demo-row">
        <template v-for="side in sheetSides" :key="side">
          <DzSheet v-model:open="sheetState[side]">
            <DzSheetTrigger as-child>
              <DzButton variant="outline" tone="neutral">
                From {{ side }}
              </DzButton>
            </DzSheetTrigger>
            <DzSheetContent :side="side">
              <DzSheetTitle>Sheet from {{ side }}</DzSheetTitle>
              <DzSheetDescription>
                Slides in from the {{ side }} edge of the viewport.
              </DzSheetDescription>
              <div class="sheet-body">
                <p>Body content for the {{ side }} sheet.</p>
                <p>Place navigation, forms, or detailed content here.</p>
              </div>
              <DzSheetClose as-child>
                <DzButton tone="primary">
                  Close
                </DzButton>
              </DzSheetClose>
            </DzSheetContent>
          </DzSheet>
        </template>
      </div>
      <div class="state-stack">
        <span v-for="side in sheetSides" :key="side" class="state-label">
          {{ side }}: {{ sheetState[side] }}
        </span>
      </div>

      <h3 class="subsection-title">
        Sheet sizes (right side)
      </h3>
      <div class="demo-row">
        <DzSheet v-for="size in sheetSizes" :key="size" v-model:open="sheetSizeOpen[size]">
          <DzSheetTrigger as-child>
            <DzButton variant="ghost" tone="neutral" size="sm">
              size={{ size }}
            </DzButton>
          </DzSheetTrigger>
          <DzSheetContent :size="size">
            <DzSheetTitle>Size: {{ size }}</DzSheetTitle>
            <DzSheetDescription>
              Width scales with the size prop (sm/md/lg).
            </DzSheetDescription>
          </DzSheetContent>
        </DzSheet>
      </div>
    </section>

    <!-- Dropdown Menu -->
    <section class="demo-section">
      <h2 class="section-title">
        Dropdown Menu
      </h2>
      <div class="demo-row">
        <DzDropdownMenu v-model:open="dropdownOpen">
          <DzDropdownMenuTrigger as-child>
            <DzButton variant="outline" tone="neutral">
              Actions
              <template #suffix>
                <ChevronDown :size="14" />
              </template>
            </DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem @select="handleDropdownAction('New file')">
              <template #prefix>
                <Plus :size="14" />
              </template>
              New file
              <template #suffix>
                Ctrl+N
              </template>
            </DzDropdownMenuItem>
            <DzDropdownMenuItem @select="handleDropdownAction('Rename')">
              <template #prefix>
                <Pencil :size="14" />
              </template>
              Rename
              <template #suffix>
                F2
              </template>
            </DzDropdownMenuItem>
            <DzDropdownMenuItem @select="handleDropdownAction('Duplicate')">
              <template #prefix>
                <Copy :size="14" />
              </template>
              Duplicate
            </DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem disabled>
              <template #prefix>
                <FileText :size="14" />
              </template>
              Export (disabled)
            </DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem @select="handleDropdownAction('Delete')">
              <template #prefix>
                <Trash2 :size="14" />
              </template>
              Delete
              <template #suffix>
                Del
              </template>
            </DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
        <span class="state-label">open: {{ dropdownOpen }}</span>
        <span class="state-label">last: {{ lastDropdownAction ?? '—' }}</span>
      </div>
    </section>

    <!-- Context Menu -->
    <section class="demo-section">
      <h2 class="section-title">
        Context Menu
      </h2>
      <p class="subsection-note">
        Right-click the area below to open the menu.
      </p>
      <DzContextMenu v-model:open="contextOpen">
        <DzContextMenuTrigger as-child>
          <div class="context-target">
            <span>Right-click anywhere in this area</span>
          </div>
        </DzContextMenuTrigger>
        <DzContextMenuContent>
          <DzContextMenuItem @select="handleContextAction('Copy')">
            <template #prefix>
              <Copy :size="14" />
            </template>
            Copy
            <template #suffix>
              Ctrl+C
            </template>
          </DzContextMenuItem>
          <DzContextMenuItem @select="handleContextAction('Rename')">
            <template #prefix>
              <Pencil :size="14" />
            </template>
            Rename
            <template #suffix>
              F2
            </template>
          </DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem disabled>
            <template #prefix>
              <FileText :size="14" />
            </template>
            Export (disabled)
          </DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem @select="handleContextAction('Delete')">
            <template #prefix>
              <Trash2 :size="14" />
            </template>
            Delete
            <template #suffix>
              Del
            </template>
          </DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
      <div class="state-stack">
        <span class="state-label">open: {{ contextOpen }}</span>
        <span class="state-label">last: {{ lastContextAction ?? '—' }}</span>
      </div>
    </section>

    <!-- Command Palette -->
    <section class="demo-section">
      <h2 class="section-title">
        Command Palette
      </h2>
      <p class="subsection-note">
        Groups, items with icons, shortcuts, disabled items, and a custom empty slot. Press
        <kbd class="kbd">Ctrl</kbd>+<kbd class="kbd">K</kbd> (or <kbd class="kbd">⌘</kbd>+<kbd class="kbd">K</kbd>) to toggle.
      </p>
      <div class="demo-row">
        <DzButton variant="outline" tone="neutral" @click="commandOpen = true">
          <template #prefix>
            <Search :size="14" />
          </template>
          Open command palette
        </DzButton>
        <span class="state-label">open: {{ commandOpen }}</span>
        <span class="state-label">last: {{ lastCommand ?? '—' }}</span>
      </div>
      <DzCommandPalette
        v-model:open="commandOpen"
        :items="commandItems"
        :groups="commandGroups"
        placeholder="Search commands…"
        @select="handleCommandSelect"
      >
        <template #empty>
          <div class="command-empty">
            <Search :size="20" />
            <p>No matching commands.</p>
            <p class="command-empty-hint">
              Try “new”, “save”, or “settings”.
            </p>
          </div>
        </template>
      </DzCommandPalette>
    </section>

    <!-- Confirm Dialog -->
    <section class="demo-section">
      <h2 class="section-title">
        Confirm Dialog
      </h2>
      <p class="subsection-note">
        Default and destructive (danger) variants. The danger flow uses an async resolver and shows a loading spinner.
      </p>
      <div class="demo-row">
        <DzButton variant="outline" tone="neutral" @click="confirmOpen = true">
          Open default confirm
        </DzButton>
        <DzButton variant="solid" tone="danger" @click="dangerConfirmOpen = true">
          <template #prefix>
            <Trash2 :size="14" />
          </template>
          Delete item…
        </DzButton>
        <span class="state-label">last: {{ lastConfirmResult ?? '—' }}</span>
      </div>

      <DzConfirmDialog
        v-model:open="confirmOpen"
        title="Save changes?"
        message="Your edits will be applied to the current document."
        confirm-label="Save"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />

      <DzConfirmDialog
        v-model:open="dangerConfirmOpen"
        variant="danger"
        title="Delete item?"
        message="This action cannot be undone. The item will be permanently removed."
        confirm-label="Delete"
        :loading="dangerLoading"
        @confirm="handleDangerConfirm"
        @cancel="lastConfirmResult = 'Delete cancelled'"
      />
    </section>

    <!-- Nested / stacked -->
    <section class="demo-section">
      <h2 class="section-title">
        Nested / stacked overlays
      </h2>
      <p class="subsection-note">
        Open a Sheet, then trigger a Confirm Dialog inside it. Verifies focus-trap and z-index don't break on stacking.
      </p>
      <div class="demo-row">
        <DzSheet v-model:open="nestedSheetOpen">
          <DzSheetTrigger as-child>
            <DzButton tone="primary">
              Open sheet with nested confirm
            </DzButton>
          </DzSheetTrigger>
          <DzSheetContent>
            <DzSheetTitle>Settings</DzSheetTitle>
            <DzSheetDescription>
              Adjust your preferences. Destructive actions ask for confirmation.
            </DzSheetDescription>
            <div class="sheet-body">
              <p>Workspace name: <code>dzup-ui</code></p>
              <p>Members: 12</p>
              <DzButton tone="danger" variant="outline" @click="nestedConfirmOpen = true">
                <template #prefix>
                  <Trash2 :size="14" />
                </template>
                Delete workspace…
              </DzButton>
            </div>
            <DzSheetClose as-child>
              <DzButton variant="ghost" tone="neutral">
                Close
              </DzButton>
            </DzSheetClose>
          </DzSheetContent>
        </DzSheet>
        <span class="state-label">sheet: {{ nestedSheetOpen }}</span>
        <span class="state-label">confirm: {{ nestedConfirmOpen }}</span>
      </div>

      <DzConfirmDialog
        v-model:open="nestedConfirmOpen"
        variant="danger"
        title="Delete workspace?"
        message="All projects in this workspace will be removed."
        confirm-label="Delete workspace"
        :loading="nestedLoading"
        @confirm="handleNestedConfirm"
      />
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 32px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 20px 0 12px;
}

.subsection-note {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.state-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* Control row (selects, checkboxes) ----------------------------------- */
.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
  margin-bottom: 20px;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.control.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding-bottom: 4px;
}

.control-label {
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
}

.control-input {
  padding: 6px 10px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-background, #ffffff);
  color: var(--dz-foreground, #1a202c);
  font-size: 13px;
  min-width: 100px;
}

/* Popover -------------------------------------------------------------- */
.popover-stage {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 24px;
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  margin-bottom: 8px;
}

.popover-body {
  padding: 12px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.popover-title {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: var(--dz-foreground, #1a202c);
}

.popover-text {
  margin: 0;
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
}

.popover-text code {
  font-size: 12px;
  padding: 1px 4px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

/* Tooltip -------------------------------------------------------------- */
.matrix {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.matrix-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.matrix-label {
  width: 64px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tooltip-rich {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Sheet body ---------------------------------------------------------- */
.sheet-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  font-size: 14px;
  color: var(--dz-foreground, #1a202c);
}

.sheet-body code {
  font-size: 12px;
  padding: 1px 4px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
}

/* Context menu target ------------------------------------------------- */
.context-target {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
  font-size: 13px;
  user-select: none;
  cursor: context-menu;
}

/* Command palette ----------------------------------------------------- */
.command-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  color: var(--dz-muted-foreground, #64748b);
}

.command-empty p {
  margin: 0;
  font-size: 14px;
}

.command-empty-hint {
  font-size: 12px;
}

.kbd {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-bottom-width: 2px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  font-family: monospace;
  font-size: 11px;
  color: var(--dz-foreground, #1a202c);
}
</style>
