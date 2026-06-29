# Data table card

Outlined card with a search + segmented filter toolbar, a hoverable data table with avatars and status badges, and paginated results.

- **Category:** Application
- **Components:** DzCard, DzSearchInput, DzSegmented, DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell, DzAvatar, DzBadge, DzPagination, DzText
- **Preview:** /blocks#table-card

```vue
<script setup lang="ts">
/**
 * Data table card — search toolbar, segmented filter, data table, pagination.
 *
 * A DzCard wrapping a full search + filter toolbar (DzSearchInput + DzSegmented),
 * a DzTable of five sample rows with avatar, name, status badge and numeric
 * columns, and a DzPagination footer. All data is local static arrays — the
 * search/filter/pagination state is wired via ref() so the UI is interactive
 * in the preview.
 *
 * Self-contained: no props, no router.
 */
import {
  DzAvatar,
  DzBadge,
  DzCard,
  DzPagination,
  DzSearchInput,
  DzSegmented,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
} from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'
import { computed, ref } from 'vue'

type StatusKey = 'active' | 'inactive' | 'pending'

interface Member {
  id: number
  name: string
  email: string
  role: string
  status: StatusKey
  joined: string
}

const STATUS_TONE: Record<StatusKey, CanonicalTone> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
}

const ALL_MEMBERS: Member[] = [
  { id: 1, name: 'Ava Restić', email: 'ava@acme.io', role: 'Product Lead', status: 'active', joined: 'Jan 2024' },
  { id: 2, name: 'Marcus Chen', email: 'marcus@acme.io', role: 'Engineer', status: 'active', joined: 'Mar 2024' },
  { id: 3, name: 'Priya Nair', email: 'priya@acme.io', role: 'Designer', status: 'pending', joined: 'May 2024' },
  { id: 4, name: 'Luca Ferraro', email: 'luca@acme.io', role: 'Sales', status: 'inactive', joined: 'Feb 2023' },
  { id: 5, name: 'Sofia Andersen', email: 'sofia@acme.io', role: 'Support', status: 'active', joined: 'Apr 2024' },
  { id: 6, name: 'Daniel Park', email: 'daniel@acme.io', role: 'Engineer', status: 'active', joined: 'Jun 2024' },
  { id: 7, name: 'Elena Vasquez', email: 'elena@acme.io', role: 'Marketing', status: 'pending', joined: 'Jul 2024' },
]

const filterItems = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
]

const query = ref('')
const filter = ref('all')
const page = ref(1)
const pageSize = 5

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return ALL_MEMBERS.filter((m) => {
    if (filter.value !== 'all' && m.status !== filter.value) return false
    if (q && !`${m.name} ${m.email} ${m.role}`.toLowerCase().includes(q)) return false
    return true
  })
})

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function onSearch() {
  page.value = 1
}

function onFilter(value: string) {
  filter.value = value
  page.value = 1
}
</script>

<template>
  <section class="tc-wrap" aria-labelledby="tc-title">
    <DzCard variant="outlined" padding="none">
      <!-- Toolbar -->
      <div class="tc-toolbar">
        <DzText id="tc-title" weight="semibold" as="h4" class="tc-card-title">Team members</DzText>
        <div class="tc-controls">
          <DzSearchInput
            v-model="query"
            placeholder="Search members…"
            size="sm"
            clearable
            aria-label="Search members"
            @search="onSearch"
            @clear="onSearch"
          />
          <DzSegmented
            :model-value="filter"
            :items="filterItems"
            size="sm"
            aria-label="Filter by status"
            @change="onFilter"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="tc-scroll">
        <DzTable hoverable size="sm" aria-label="Team members table">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>Member</DzTableCell>
              <DzTableCell header>Role</DzTableCell>
              <DzTableCell header>Status</DzTableCell>
              <DzTableCell header align="right">Joined</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow v-for="row in pageRows" :key="row.id">
              <DzTableCell>
                <div class="member-cell">
                  <DzAvatar :fallback="row.name.slice(0, 1)" :alt="row.name" size="sm" />
                  <div class="member-meta">
                    <DzText size="sm" weight="medium" as="div">{{ row.name }}</DzText>
                    <DzText size="xs" tone="muted" as="div">{{ row.email }}</DzText>
                  </div>
                </div>
              </DzTableCell>
              <DzTableCell>
                <DzText size="sm" as="span">{{ row.role }}</DzText>
              </DzTableCell>
              <DzTableCell>
                <DzBadge variant="subtle" :tone="STATUS_TONE[row.status]" size="sm">
                  {{ row.status }}
                </DzBadge>
              </DzTableCell>
              <DzTableCell align="right">
                <DzText size="sm" tone="muted" as="span">{{ row.joined }}</DzText>
              </DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>

      <!-- Pagination footer -->
      <div class="tc-footer">
        <DzText size="sm" tone="muted">
          {{ filtered.length }} {{ filtered.length === 1 ? 'member' : 'members' }}
        </DzText>
        <DzPagination
          v-model="page"
          :total="filtered.length"
          :page-size="pageSize"
          size="sm"
          aria-label="Team members pages"
        />
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.tc-wrap {
  background: var(--dz-background, #fff);
}

.tc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem) var(--dz-space-4, 1rem) var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
}

.tc-card-title {
  margin: 0;
  white-space: nowrap;
}

.tc-controls {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
}

.tc-scroll {
  overflow-x: auto;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.member-meta {
  line-height: 1.2;
  min-width: 0;
}

.tc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-3, 0.75rem) var(--dz-space-4, 1rem);
  border-top: 1px solid var(--dz-border, #e5e7eb);
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .tc-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .tc-controls {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
```
