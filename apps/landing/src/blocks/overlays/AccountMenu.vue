<script setup lang="ts">
/**
 * Account menu — a header bar with a rich user dropdown (DzDropdownMenu).
 *
 * A mock product top bar: brand on the left; a notifications icon button and an
 * avatar/name trigger on the right. The trigger opens a DzDropdownMenu with an
 * account header, grouped items (icon prefix + DzKbd shortcut suffix),
 * separators, and a destructive "Sign out". The chosen item is echoed below.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzAvatar,
  DzBadge,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzIconButton,
  DzKbd,
  DzText,
} from '@dzup-ui/core'
import {
  Bell,
  ChevronDown,
  CreditCard,
  Keyboard,
  LifeBuoy,
  LogOut,
  Settings,
  User,
  Users,
} from 'lucide-vue-next'
import { ref } from 'vue'

const lastAction = ref('')

function choose(label: string): void {
  lastAction.value = label
}
</script>

<template>
  <section class="am-wrap" aria-label="Account menu preview">
    <header class="am-bar">
      <span class="am-brand">
        <span class="am-brand-mark" aria-hidden="true">N</span>
        <DzText as="span" size="sm" weight="bold">Northwind</DzText>
      </span>

      <div class="am-actions">
        <DzIconButton
          :icon="Bell"
          aria-label="Notifications"
          variant="ghost"
          tone="neutral"
          size="sm"
        />

        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <button type="button" class="am-trigger" aria-label="Open account menu">
              <DzAvatar fallback="JD" alt="Jamie Doe" size="sm" />
              <span class="am-trigger-name">Jamie Doe</span>
              <ChevronDown :size="15" class="am-trigger-caret" aria-hidden="true" />
            </button>
          </DzDropdownMenuTrigger>

          <DzDropdownMenuContent align="end" :side-offset="8">
            <div class="am-menu-head">
              <DzAvatar fallback="JD" alt="Jamie Doe" size="md" />
              <span class="am-menu-meta">
                <span class="am-menu-name">
                  <DzText as="span" size="sm" weight="semibold">Jamie Doe</DzText>
                  <DzBadge variant="subtle" tone="primary" size="sm">Pro</DzBadge>
                </span>
                <DzText as="span" size="xs" tone="muted">jamie@northwind.io</DzText>
              </span>
            </div>

            <DzDropdownMenuSeparator />

            <DzDropdownMenuItem @select="choose('Profile')">
              <template #prefix>
                <User :size="16" aria-hidden="true" />
              </template>
              Profile
              <template #suffix>
                <DzKbd :keys="['mod', 'p']" size="sm" />
              </template>
            </DzDropdownMenuItem>
            <DzDropdownMenuItem @select="choose('Billing')">
              <template #prefix>
                <CreditCard :size="16" aria-hidden="true" />
              </template>
              Billing
            </DzDropdownMenuItem>
            <DzDropdownMenuItem @select="choose('Settings')">
              <template #prefix>
                <Settings :size="16" aria-hidden="true" />
              </template>
              Settings
              <template #suffix>
                <DzKbd :keys="[',']" size="sm" :platform-aware="false" />
              </template>
            </DzDropdownMenuItem>

            <DzDropdownMenuSeparator />

            <DzDropdownMenuItem @select="choose('Team')">
              <template #prefix>
                <Users :size="16" aria-hidden="true" />
              </template>
              Invite team
            </DzDropdownMenuItem>
            <DzDropdownMenuItem @select="choose('Shortcuts')">
              <template #prefix>
                <Keyboard :size="16" aria-hidden="true" />
              </template>
              Keyboard shortcuts
              <template #suffix>
                <DzKbd :keys="['mod', '/']" size="sm" />
              </template>
            </DzDropdownMenuItem>
            <DzDropdownMenuItem @select="choose('Support')">
              <template #prefix>
                <LifeBuoy :size="16" aria-hidden="true" />
              </template>
              Support
            </DzDropdownMenuItem>

            <DzDropdownMenuSeparator />

            <DzDropdownMenuItem @select="choose('Sign out')">
              <template #prefix>
                <LogOut :size="16" aria-hidden="true" />
              </template>
              <span class="am-danger">Sign out</span>
            </DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    </header>

    <div class="am-result" role="status" aria-live="polite">
      <DzText v-if="lastAction" size="sm" as="span">
        Selected <strong>{{ lastAction }}</strong>
      </DzText>
      <DzText v-else size="sm" tone="muted" as="span">
        Open the avatar menu and pick an item.
      </DzText>
    </div>
  </section>
</template>

<style scoped>
.am-wrap {
  max-width: 38rem;
  margin: 0 auto;
}

.am-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-4, 1rem);
  padding: var(--dz-space-2, 0.5rem) var(--dz-space-4, 1rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
}

.am-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.am-brand-mark {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-primary, #6366f1);
  color: var(--dz-primary-foreground, #fff);
  font-weight: 700;
  font-size: 0.85rem;
}

.am-actions {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

/* Avatar trigger ---------------------------------------------------------- */
.am-trigger {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-2, 0.5rem);
  border-radius: var(--dz-radius-full, 999px);
  cursor: pointer;
  transition: background var(--dz-transition-fast, 150ms) ease;
}

.am-trigger:hover {
  background: var(--dz-surface-raised, #f3f4f6);
}

.am-trigger:focus-visible {
  outline: 2px solid var(--dz-ring, #6366f1);
  outline-offset: 2px;
}

.am-trigger-name {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-text, #111827);
}

.am-trigger-caret {
  color: var(--dz-text-muted, #6b7280);
}

/* Menu header ------------------------------------------------------------- */
.am-menu-head {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-2, 0.5rem) var(--dz-space-2, 0.5rem) var(--dz-space-1, 0.25rem);
  min-width: 14rem;
}

.am-menu-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.am-menu-name {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.am-danger {
  color: var(--dz-danger, #dc2626);
  font-weight: 500;
}

/* Result ------------------------------------------------------------------ */
.am-result {
  margin-top: var(--dz-space-3, 0.75rem);
  min-height: 1.25rem;
}

@media (max-width: 560px) {
  .am-trigger-name {
    display: none;
  }
}
</style>
