<script setup lang="ts">
import type { ColumnDef } from '@dzup-ui/core'
import type { ContactRow } from './data.ts'
/**
 * Admin / CRM — full-page dashboard template (docs/templates.md §6.1).
 *
 * A DzAppShell with a DzSidebar, a header toolbar (DzTabs lifecycle filter +
 * DzSearchInput + add action), a DzDataGrid of contacts with a per-row
 * DzDropdownMenu, and external DzPagination. Built only from free
 * `@dzup-ui/core` components and styled entirely with `var(--dz-*)` tokens
 * (no `lp-*` landing styles). Correct in light + dark; reflows down to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzDataGrid,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzHeading,
  DzIconButton,
  DzPagination,
  DzSearchInput,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import { Boxes, MoreHorizontal, UserPlus } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  CONTACT_TABS,

  CONTACTS,
  PRIMARY_NAV,
  SECONDARY_NAV,
  STATUS_TONE,
} from './data.ts'

const query = ref('')
const tab = ref('all')
const page = ref(1)
const pageSize = 6

const columns: ColumnDef<ContactRow>[] = [
  { field: 'name', header: 'Contact' },
  { field: 'company', header: 'Company' },
  { field: 'status', header: 'Status' },
  { field: 'value', header: 'Deal value', align: 'right' },
  { field: 'id', header: '', align: 'right', width: 56 },
]

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// Compose the tab + search filters, then reset to page one whenever they change.
const filtered = computed(() => {
  const active = CONTACT_TABS.find(t => t.value === tab.value)
  const q = query.value.trim().toLowerCase()
  return CONTACTS.filter((c) => {
    if (active?.match && c.status !== active.match)
      return false
    if (q && !`${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q))
      return false
    return true
  })
})

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function selectTab(value: string) {
  tab.value = value
  page.value = 1
}
</script>

<template>
  <DzAppShell aria-label="CRM workspace" class="crm-shell">
    <template #sidebar>
      <DzSidebar aria-label="Primary">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind CRM</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Sales">
          <DzSidebarItem v-for="item in PRIMARY_NAV" :key="item.label" :active="item.active" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
            <template v-if="item.badge" #badge>
              <DzBadge variant="solid" tone="primary" size="sm">
                {{ item.badge }}
              </DzBadge>
            </template>
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarSection title="Workspace">
          <DzSidebarItem v-for="item in SECONDARY_NAV" :key="item.label" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarFooter>
          <span class="user">
            <DzAvatar fallback="AR" size="sm" />
            <span class="user-meta">
              <DzText size="sm" weight="medium" as="span">Ava Restić</DzText>
              <DzText size="xs" tone="muted" as="span">Sales lead</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="crm-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Contacts
        </DzHeading>
        <DzBadge variant="subtle" tone="neutral" size="sm">
          {{ CONTACTS.length }}
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzSearchInput
        v-model="query"
        placeholder="Search contacts…"
        size="sm"
        class="crm-search"
        aria-label="Search contacts"
      />
      <DzButton size="sm" variant="solid" tone="primary">
        <template #prefix>
          <UserPlus :size="15" aria-hidden="true" />
        </template>
        Add contact
      </DzButton>
    </template>

    <div class="crm-body">
      <DzTabs :model-value="tab" variant="line" size="sm" aria-label="Filter contacts by lifecycle">
        <DzTabList>
          <DzTabTrigger
            v-for="t in CONTACT_TABS"
            :key="t.value"
            :value="t.value"
            @click="selectTab(t.value)"
          >
            {{ t.label }}
          </DzTabTrigger>
        </DzTabList>
      </DzTabs>

      <div class="crm-grid">
        <DzDataGrid :data="pageRows" :columns="columns" size="sm" row-key="id">
          <template #cell="{ row, column, value }">
            <template v-if="column.field === 'name'">
              <div class="contact-cell">
                <DzAvatar :fallback="(row as ContactRow).name.slice(0, 1)" size="sm" />
                <div class="contact-meta">
                  <DzText size="sm" weight="medium" as="div">
                    {{ (row as ContactRow).name }}
                  </DzText>
                  <DzText size="xs" tone="muted" as="div">
                    {{ (row as ContactRow).email }}
                  </DzText>
                </div>
              </div>
            </template>
            <template v-else-if="column.field === 'status'">
              <DzBadge variant="subtle" :tone="STATUS_TONE[(row as ContactRow).status]" size="sm">
                {{ (row as ContactRow).status }}
              </DzBadge>
            </template>
            <template v-else-if="column.field === 'value'">
              <span class="value-cell">
                {{ (row as ContactRow).value ? dollars.format((row as ContactRow).value) : '—' }}
              </span>
            </template>
            <template v-else-if="column.field === 'id'">
              <DzDropdownMenu>
                <DzDropdownMenuTrigger as-child>
                  <DzIconButton
                    :icon="MoreHorizontal"
                    aria-label="Contact actions"
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                  />
                </DzDropdownMenuTrigger>
                <DzDropdownMenuContent align="end">
                  <DzDropdownMenuItem>View profile</DzDropdownMenuItem>
                  <DzDropdownMenuItem>Log activity</DzDropdownMenuItem>
                  <DzDropdownMenuItem>Add to deal</DzDropdownMenuItem>
                  <DzDropdownMenuSeparator />
                  <DzDropdownMenuItem>Archive</DzDropdownMenuItem>
                </DzDropdownMenuContent>
              </DzDropdownMenu>
            </template>
            <template v-else>
              {{ value }}
            </template>
          </template>
        </DzDataGrid>
      </div>

      <div class="crm-foot">
        <DzText size="sm" tone="muted">
          {{ filtered.length }} {{ filtered.length === 1 ? 'contact' : 'contacts' }}
        </DzText>
        <DzPagination
          v-model="page"
          :total="filtered.length"
          :page-size="pageSize"
          size="sm"
          aria-label="Contacts pages"
        />
      </div>
    </div>
  </DzAppShell>
</template>

<style scoped>
.crm-shell {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.crm-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.crm-search {
  width: 220px;
}

.crm-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crm-grid {
  overflow-x: auto;
}

.contact-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-meta {
  line-height: 1.2;
  min-width: 0;
}

.value-cell {
  font-variant-numeric: tabular-nums;
  font-weight: var(--dz-font-medium);
}

.crm-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .crm-search {
    width: 150px;
  }
}
</style>
