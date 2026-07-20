<script setup lang="ts">
import type { ColumnDef } from '@dzup-ui/core'
import type { CustomerPlan, CustomerRow, CustomerStatus } from './data.ts'
/**
 * Data Table (CRUD list) — full-page dashboard template (docs/templates.md §6.5).
 *
 * A working customer ledger inside a DzAppShell: a filter bar (DzSearchInput +
 * two DzMultiSelect facets), a sortable, paginated, multi-select DzDataGrid with
 * DzBadge status/plan chips and a per-row DzDropdownMenu, a bulk-action bar that
 * appears with a selection, and a "New customer" DzDialog whose form appends a
 * real row. Filter / sort / paginate / bulk-select all run client-side.
 *
 * Built only from free `@dzup-ui/core` components and styled entirely with
 * `var(--dz-*)` tokens (no `lp-*` landing styles). Correct in light + dark;
 * the grid scrolls horizontally rather than overflowing at 390px.
 *
 * Substitution note: the spec's built-with omits form inputs, but a "New record
 * dialog with a form" needs them — DzInput / DzSelect / DzFormField are real
 * core components used only inside the dialog (§5 "closest real component").
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzDataGrid,
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
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzIconButton,
  DzInput,
  DzMultiSelect,
  DzSearchInput,
  DzSelect,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzText,
} from '@dzup-ui/core'
import { Boxes, Download, MoreHorizontal, Plus, Trash2, X } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import {

  CUSTOMERS,

  PLAN_OPTIONS,
  PLAN_SELECT,
  PLAN_TONE,
  PRIMARY_NAV,
  SECONDARY_NAV,
  STATUS_OPTIONS,
  STATUS_SELECT,
  STATUS_TONE,
} from './data.ts'

// The ledger is owned reactively so New / Delete actually mutate the table.
const records = ref<CustomerRow[]>([...CUSTOMERS])

// ── Filter bar state ──────────────────────────────────────────────────────
const query = ref('')
// Facet models are plain string[] — DzMultiSelect emits string[]; the CustomerPlan
// / CustomerStatus unions narrow only at the comparison site below.
const planFacet = ref<string[]>([])
const statusFacet = ref<string[]>([])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return records.value.filter((c) => {
    if (planFacet.value.length && !planFacet.value.includes(c.plan))
      return false
    if (statusFacet.value.length && !statusFacet.value.includes(c.status))
      return false
    if (q && !`${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q))
      return false
    return true
  })
})

const hasFilters = computed(
  () => !!query.value || planFacet.value.length > 0 || statusFacet.value.length > 0,
)

function clearFilters() {
  query.value = ''
  planFacet.value = []
  statusFacet.value = []
}

// Remount the grid whenever the filter set changes so it resets to page one
// (and drops any stale sort), matching the admin-crm "reset on filter" UX.
const gridKey = computed(
  () => `${query.value}|${planFacet.value.join(',')}|${statusFacet.value.join(',')}`,
)

// ── Selection + bulk actions ──────────────────────────────────────────────
const selected = ref<CustomerRow[]>([])

// A changed filter could hide selected rows, so clear the selection with it —
// bulk actions only ever apply to what the user can currently see.
watch(gridKey, () => {
  selected.value = []
})

function clearSelection() {
  selected.value = []
}

function deleteSelected() {
  const ids = new Set(selected.value.map(r => r.id))
  records.value = records.value.filter(r => !ids.has(r.id))
  selected.value = []
}

function deleteRow(id: string) {
  records.value = records.value.filter(r => r.id !== id)
  selected.value = selected.value.filter(r => r.id !== id)
}

// ── Grid columns ──────────────────────────────────────────────────────────
const columns: ColumnDef<CustomerRow>[] = [
  { field: 'name', header: 'Customer', sortable: true },
  { field: 'company', header: 'Company', sortable: true },
  { field: 'plan', header: 'Plan', sortable: true },
  { field: 'status', header: 'Status', sortable: true },
  { field: 'mrr', header: 'MRR', sortable: true, align: 'right' },
  { field: 'created', header: 'Created', sortable: true },
  { field: 'id', header: '', align: 'right', width: 56 },
]

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string): string {
  const parts = iso.split('-')
  const m = Number(parts[1])
  return `${MONTHS[m - 1] ?? ''} ${Number(parts[2])}, ${parts[0]}`
}

// ── New customer dialog ───────────────────────────────────────────────────
const createOpen = ref(false)
// Draft fields are strings (bound to DzInput / DzSelect, which model strings);
// the plan/status are cast back to their unions when the row is built.
const draft = reactive({
  name: '',
  email: '',
  company: '',
  plan: 'Starter' as string,
  status: 'Trial' as string,
  mrr: '',
})

const canCreate = computed(() => draft.name.trim() !== '' && draft.email.trim().includes('@'))

function resetDraft() {
  draft.name = ''
  draft.email = ''
  draft.company = ''
  draft.plan = 'Starter'
  draft.status = 'Trial'
  draft.mrr = ''
}

function createCustomer() {
  if (!canCreate.value)
    return
  const today = new Date().toISOString().slice(0, 10)
  records.value = [
    {
      id: `cus_${Math.random().toString(16).slice(2, 6)}`,
      name: draft.name.trim(),
      email: draft.email.trim(),
      company: draft.company.trim() || '—',
      plan: draft.plan as CustomerPlan,
      status: draft.status as CustomerStatus,
      mrr: Number(draft.mrr) || 0,
      created: today,
    },
    ...records.value,
  ]
  resetDraft()
  createOpen.value = false
}
</script>

<template>
  <DzAppShell aria-label="Billing console" class="dt-shell">
    <template #sidebar>
      <DzSidebar aria-label="Primary">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Lumen Billing</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Manage">
          <DzSidebarItem v-for="item in PRIMARY_NAV" :key="item.label" :active="item.active" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
            <template v-if="item.badge" #badge>
              <DzBadge variant="subtle" tone="neutral" size="sm">
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
              <DzText size="xs" tone="muted" as="span">Billing admin</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="dt-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Customers
        </DzHeading>
        <DzBadge variant="subtle" tone="neutral" size="sm">
          {{ records.length }}
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzDialog v-model:open="createOpen">
        <DzDialogTrigger as-child>
          <DzButton size="sm" variant="solid" tone="primary">
            <template #prefix>
              <Plus :size="15" aria-hidden="true" />
            </template>
            New customer
          </DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="md">
          <DzDialogTitle>New customer</DzDialogTitle>
          <DzDialogDescription>
            Add a customer to the ledger. They'll appear at the top of the table.
          </DzDialogDescription>

          <form class="create-form" @submit.prevent="createCustomer">
            <div class="form-row">
              <DzFormField class="field">
                <DzFormLabel>Name</DzFormLabel>
                <DzInput v-model="draft.name" type="text" placeholder="Jane Doe" autocomplete="off" />
              </DzFormField>
              <DzFormField class="field">
                <DzFormLabel>Email</DzFormLabel>
                <DzInput v-model="draft.email" type="email" placeholder="jane@acme.com" autocomplete="off" />
              </DzFormField>
            </div>

            <DzFormField>
              <DzFormLabel>Company</DzFormLabel>
              <DzInput v-model="draft.company" type="text" placeholder="Acme Inc." autocomplete="off" />
            </DzFormField>

            <div class="form-row">
              <DzFormField class="field">
                <DzFormLabel>Plan</DzFormLabel>
                <DzSelect v-model="draft.plan" :items="PLAN_SELECT" aria-label="Plan" />
              </DzFormField>
              <DzFormField class="field">
                <DzFormLabel>Status</DzFormLabel>
                <DzSelect v-model="draft.status" :items="STATUS_SELECT" aria-label="Status" />
              </DzFormField>
              <DzFormField class="field">
                <DzFormLabel>MRR (USD)</DzFormLabel>
                <DzInput v-model="draft.mrr" type="number" inputmode="numeric" placeholder="0" min="0" />
              </DzFormField>
            </div>
          </form>

          <div class="create-foot">
            <DzDialogClose as-child>
              <DzButton variant="ghost" tone="neutral">
                Cancel
              </DzButton>
            </DzDialogClose>
            <DzButton variant="solid" tone="primary" :disabled="!canCreate" @click="createCustomer">
              Create customer
            </DzButton>
          </div>
        </DzDialogContent>
      </DzDialog>
    </template>

    <div class="dt-body">
      <!-- ── Filter bar ─────────────────────────────────────────── -->
      <div class="filter-bar" role="search">
        <DzSearchInput
          v-model="query"
          placeholder="Search name, email or company…"
          size="sm"
          class="filter-search"
          aria-label="Search customers"
        />
        <DzMultiSelect
          v-model="planFacet"
          :items="PLAN_OPTIONS"
          placeholder="Plan"
          size="sm"
          class="filter-facet"
          aria-label="Filter by plan"
        />
        <DzMultiSelect
          v-model="statusFacet"
          :items="STATUS_OPTIONS"
          placeholder="Status"
          size="sm"
          class="filter-facet"
          aria-label="Filter by status"
        />
        <DzButton
          v-if="hasFilters"
          variant="ghost"
          tone="neutral"
          size="sm"
          class="filter-clear"
          @click="clearFilters"
        >
          <template #prefix>
            <X :size="14" aria-hidden="true" />
          </template>
          Clear
        </DzButton>
      </div>

      <!-- ── Bulk-action bar (appears with a selection) ─────────── -->
      <div v-if="selected.length" class="bulk-bar" role="region" aria-label="Bulk actions">
        <DzText size="sm" weight="medium" class="bulk-count">
          {{ selected.length }} selected
        </DzText>
        <div class="bulk-actions">
          <DzButton variant="outline" tone="neutral" size="sm">
            <template #prefix>
              <Download :size="14" aria-hidden="true" />
            </template>
            Export
          </DzButton>
          <DzButton variant="outline" tone="danger" size="sm" @click="deleteSelected">
            <template #prefix>
              <Trash2 :size="14" aria-hidden="true" />
            </template>
            Delete
          </DzButton>
          <DzButton variant="ghost" tone="neutral" size="sm" @click="clearSelection">
            Clear
          </DzButton>
        </div>
      </div>

      <!-- ── Data grid ──────────────────────────────────────────── -->
      <div class="dt-grid">
        <DzDataGrid
          :key="gridKey"
          :data="filtered"
          :columns="columns"
          size="sm"
          row-key="id"
          sortable
          selectable="multiple"
          :selected-rows="selected"
          :pagination="{ pageSize: 8, pageSizeOptions: [8, 16, 24] }"
          aria-label="Customers"
          @update:selected-rows="selected = $event as CustomerRow[]"
        >
          <template #cell="{ row, column, value }">
            <template v-if="column.field === 'name'">
              <div class="cust-cell">
                <DzAvatar :fallback="(row as CustomerRow).name.slice(0, 1)" size="sm" />
                <div class="cust-meta">
                  <DzText size="sm" weight="medium" as="div">
                    {{ (row as CustomerRow).name }}
                  </DzText>
                  <DzText size="xs" tone="muted" as="div">
                    {{ (row as CustomerRow).email }}
                  </DzText>
                </div>
              </div>
            </template>
            <template v-else-if="column.field === 'plan'">
              <DzBadge variant="subtle" :tone="PLAN_TONE[(row as CustomerRow).plan]" size="sm">
                {{ (row as CustomerRow).plan }}
              </DzBadge>
            </template>
            <template v-else-if="column.field === 'status'">
              <DzBadge variant="subtle" :tone="STATUS_TONE[(row as CustomerRow).status]" size="sm">
                {{ (row as CustomerRow).status }}
              </DzBadge>
            </template>
            <template v-else-if="column.field === 'mrr'">
              <span class="mrr-cell">
                {{ (row as CustomerRow).mrr ? dollars.format((row as CustomerRow).mrr) : '—' }}
              </span>
            </template>
            <template v-else-if="column.field === 'created'">
              <DzText size="sm" tone="muted">
                {{ formatDate((row as CustomerRow).created) }}
              </DzText>
            </template>
            <template v-else-if="column.field === 'id'">
              <DzDropdownMenu>
                <DzDropdownMenuTrigger as-child>
                  <DzIconButton
                    :icon="MoreHorizontal"
                    aria-label="Customer actions"
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                  />
                </DzDropdownMenuTrigger>
                <DzDropdownMenuContent align="end">
                  <DzDropdownMenuItem>View customer</DzDropdownMenuItem>
                  <DzDropdownMenuItem>Edit details</DzDropdownMenuItem>
                  <DzDropdownMenuItem>Send invoice</DzDropdownMenuItem>
                  <DzDropdownMenuSeparator />
                  <DzDropdownMenuItem @click="deleteRow((row as CustomerRow).id)">
                    Delete
                  </DzDropdownMenuItem>
                </DzDropdownMenuContent>
              </DzDropdownMenu>
            </template>
            <template v-else>
              {{ value }}
            </template>
          </template>

          <template #empty>
            <div class="dt-empty">
              <DzText weight="medium" as="div">
                No customers match your filters
              </DzText>
              <DzText size="sm" tone="muted" as="div">
                Try a different search or clear the filters.
              </DzText>
              <DzButton variant="outline" tone="neutral" size="sm" class="empty-cta" @click="clearFilters">
                Clear filters
              </DzButton>
            </div>
          </template>
        </DzDataGrid>
      </div>

      <DzText size="sm" tone="muted" class="dt-foot">
        Showing {{ filtered.length }} of {{ records.length }}
        {{ records.length === 1 ? 'customer' : 'customers' }}.
      </DzText>
    </div>
  </DzAppShell>
</template>

<style scoped>
.dt-shell {
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

.dt-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dt-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Filter bar ───────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-search {
  flex: 1 1 240px;
  min-width: 180px;
  max-width: 360px;
}

.filter-facet {
  width: 160px;
}

.filter-clear {
  margin-left: auto;
}

/* ── Bulk-action bar ──────────────────────────────────────────── */
.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: var(--dz-radius-md);
  border: 1px solid var(--dz-primary);
  background: var(--dz-primary-muted);
}

.bulk-count {
  color: var(--dz-primary-muted-foreground);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Grid ─────────────────────────────────────────────────────── */
.dt-grid {
  overflow-x: auto;
}

.cust-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cust-meta {
  line-height: 1.2;
  min-width: 0;
}

.mrr-cell {
  font-variant-numeric: tabular-nums;
  font-weight: var(--dz-font-medium);
}

.dt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: clamp(28px, 6vw, 56px) 16px;
  text-align: center;
}

.empty-cta {
  margin-top: 6px;
}

.dt-foot {
  padding-top: 2px;
}

/* ── New-customer form ────────────────────────────────────────── */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  min-width: 0;
}

.create-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

@media (max-width: 560px) {
  .filter-facet {
    flex: 1 1 140px;
    width: auto;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
