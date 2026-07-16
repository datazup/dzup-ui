# Command menu

A ⌘K command palette (DzCommandPalette) — a search-field launcher with a DzKbd hint opens a fuzzy-searchable, grouped list of commands with per-item icons and shortcuts; the global ⌘K / Ctrl+K shortcut opens it too.

- **Category:** Overlays
- **Components:** DzCommandPalette, DzKbd, DzHeading, DzText
- **Preview:** /blocks/command-menu

```vue
<script setup lang="ts">
/**
 * Command menu — a ⌘K command palette launcher (DzCommandPalette).
 *
 * A search-field-styled trigger button (with a DzKbd ⌘K hint) opens the
 * DzCommandPalette overlay: a fuzzy-searchable, grouped list of commands with
 * per-item icons and shortcut hints. Selecting a command closes the palette and
 * surfaces the choice below. The palette also binds the global ⌘K / Ctrl+K
 * shortcut, so it opens from the keyboard too.
 *
 * Self-contained — composed only from free @dzup-ui/core components and `--dz-*`
 * tokens. Heading level is 4 so it nests under the BlockPreview H3.
 */
import { DzCommandPalette, DzHeading, DzKbd, DzText } from '@dzup-ui/core'
import type { CommandGroup, CommandItem } from '@dzup-ui/core'
import {
  ArrowRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users,
} from 'lucide-vue-next'
import { ref } from 'vue'

const open = ref(false)
const lastCommand = ref<CommandItem | null>(null)

const groups: CommandGroup[] = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'actions', label: 'Actions' },
  { id: 'account', label: 'Account' },
]

const items: CommandItem[] = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, group: 'navigation', shortcut: 'G D' },
  { id: 'team', label: 'Go to Team', icon: Users, group: 'navigation', shortcut: 'G T' },
  { id: 'docs', label: 'Open Documentation', icon: FileText, group: 'navigation', shortcut: 'G ?' },
  { id: 'new-project', label: 'Create new project', icon: Plus, group: 'actions', shortcut: 'C P' },
  { id: 'invite', label: 'Invite teammate', icon: UserPlus, group: 'actions', shortcut: 'I' },
  { id: 'support', label: 'Contact support', icon: LifeBuoy, group: 'actions' },
  { id: 'billing', label: 'Billing & plans', icon: CreditCard, group: 'account' },
  { id: 'theme', label: 'Toggle dark mode', icon: Moon, group: 'account', shortcut: 'T' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'account', shortcut: ',' },
  { id: 'signout', label: 'Sign out', icon: LogOut, group: 'account' },
]

function onSelect(item: CommandItem): void {
  lastCommand.value = item
}
</script>

<template>
  <section class="cm-wrap" aria-labelledby="cm-title">
    <header class="cm-head">
      <DzHeading id="cm-title" :level="4" size="md" weight="semibold" class="cm-title">
        Command menu
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="cm-sub">
        Press <DzKbd :keys="['mod', 'k']" size="sm" /> anywhere, or click the search bar below.
      </DzText>
    </header>

    <!-- Launcher styled as a search field ---------------------------------- -->
    <button type="button" class="cm-launcher" aria-haspopup="dialog" @click="open = true">
      <Search :size="16" class="cm-launcher-icon" aria-hidden="true" />
      <span class="cm-launcher-text">Search or jump to…</span>
      <DzKbd :keys="['mod', 'k']" size="sm" class="cm-launcher-kbd" />
    </button>

    <!-- Last selected command feedback ------------------------------------- -->
    <div class="cm-result" role="status" aria-live="polite">
      <template v-if="lastCommand">
        <ArrowRight :size="14" class="cm-result-icon" aria-hidden="true" />
        <DzText size="sm" as="span">
          Ran <strong>{{ lastCommand.label }}</strong>
        </DzText>
      </template>
      <DzText v-else size="sm" tone="muted" as="span">
        No command run yet — open the palette to try one.
      </DzText>
    </div>

    <DzCommandPalette
      v-model:open="open"
      placeholder="Type a command or search…"
      :items="items"
      :groups="groups"
      aria-label="Command palette"
      @select="onSelect"
    />
  </section>
</template>

<style scoped>
.cm-wrap {
  max-width: 34rem;
  margin: 0 auto;
}

.cm-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.cm-title {
  margin: 0;
}

.cm-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
  display: flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
  flex-wrap: wrap;
}

/* Launcher ---------------------------------------------------------------- */
.cm-launcher {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  width: 100%;
  padding: var(--dz-space-3, 0.75rem) var(--dz-space-4, 1rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
  color: var(--dz-text-muted, #6b7280);
  cursor: text;
  text-align: left;
  transition: border-color var(--dz-transition-fast, 150ms) ease,
              box-shadow var(--dz-transition-fast, 150ms) ease;
}

.cm-launcher:hover {
  border-color: var(--dz-border-strong, #d1d5db);
}

.cm-launcher:focus-visible {
  outline: none;
  border-color: var(--dz-primary, #6366f1);
  box-shadow: 0 0 0 3px var(--dz-ring, rgba(99, 102, 241, 0.35));
}

.cm-launcher-icon {
  color: var(--dz-text-muted, #6b7280);
  flex-shrink: 0;
}

.cm-launcher-text {
  flex: 1;
  font-size: var(--dz-text-sm, 0.875rem);
}

.cm-launcher-kbd {
  flex-shrink: 0;
}

/* Result ------------------------------------------------------------------ */
.cm-result {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-3, 0.75rem);
  min-height: 1.5rem;
}

.cm-result-icon {
  color: var(--dz-primary, #6366f1);
  flex-shrink: 0;
}
</style>
```
