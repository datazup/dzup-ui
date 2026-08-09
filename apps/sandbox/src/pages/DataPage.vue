<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import type {
  ColumnDef,
  DzDataGridFilter,
  ListVariant,
  SortModel,
  TableDensity,
  TreeNode,
} from '@dzup-ui/core'
import {
  DzDataGrid,
  DzList,
  DzListItem,
  DzPagination,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzTree,
} from '@dzup-ui/core'
import { computed, defineComponent, h, markRaw, onMounted, ref, watch } from 'vue'

// ── Inline SVG icon components (used via TreeNode.icon) ─────────────────────
function makeIcon(name: string, paths: string[]): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    setup: () => () =>
      h(
        'svg',
        {
          'xmlns': 'http://www.w3.org/2000/svg',
          'viewBox': '0 0 24 24',
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        paths.map(d => h('path', { d })),
      ),
  })
}

const FolderIcon = markRaw(makeIcon('FolderIcon', [
  'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
]))
const FileIcon = markRaw(makeIcon('FileIcon', [
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  'M14 2v6h6',
]))
const FileCodeIcon = markRaw(makeIcon('FileCodeIcon', [
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  'M14 2v6h6',
  'M9 13l-2 2 2 2',
  'M15 13l2 2-2 2',
]))
const FileJsonIcon = markRaw(makeIcon('FileJsonIcon', [
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  'M14 2v6h6',
  'M10 13a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1',
  'M14 13a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1 1 1 0 0 0-1 1v1a1 1 0 0 1-1 1',
]))
const FileTextIcon = markRaw(makeIcon('FileTextIcon', [
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  'M14 2v6h6',
  'M16 13H8',
  'M16 17H8',
  'M10 9H8',
]))

function pickIcon(label: string, hasChildren: boolean): ReturnType<typeof defineComponent> {
  if (hasChildren)
    return FolderIcon
  if (label.endsWith('.vue'))
    return FileCodeIcon
  if (label.endsWith('.ts') || label.endsWith('.js'))
    return FileCodeIcon
  if (label.endsWith('.json'))
    return FileJsonIcon
  if (label.endsWith('.md'))
    return FileTextIcon
  return FileIcon
}

// ── DzList ──────────────────────────────────────────────────────────────────
const listVariants: ListVariant[] = ['plain', 'bordered', 'divided']
const listSizes: CanonicalSize[] = ['sm', 'md', 'lg']
const listVariant = ref<ListVariant>('bordered')
const listSize = ref<CanonicalSize>('md')
const listInteractive = ref(true)
const listLoading = ref(false)

const inboxItems = [
  { key: 'inbox', label: 'Inbox', count: 24, icon: 'I' },
  { key: 'starred', label: 'Starred', count: 4, icon: 'S' },
  { key: 'sent', label: 'Sent', count: null, icon: 'O' },
  { key: 'drafts', label: 'Drafts', count: 2, icon: 'D' },
  { key: 'archive', label: 'Archive', count: null, icon: 'A' },
] as const

const activeListKey = ref<string>('inbox')
function selectList(key: string): void {
  activeListKey.value = key
}

// ── DzTable ─────────────────────────────────────────────────────────────────
const tableDensities: TableDensity[] = ['compact', 'default', 'comfortable']
const tableDensity = ref<TableDensity>('default')
const tableStriped = ref(true)
const tableHoverable = ref(true)
const tableLoading = ref(false)

const recentInvoices = [
  { id: 'INV-1042', client: 'Acme Corp', amount: '$3,200.00', status: 'Paid' },
  { id: 'INV-1041', client: 'Globex', amount: '$1,860.50', status: 'Pending' },
  { id: 'INV-1040', client: 'Initech', amount: '$5,420.00', status: 'Paid' },
  { id: 'INV-1039', client: 'Umbrella', amount: '$980.00', status: 'Overdue' },
  { id: 'INV-1038', client: 'Hooli', amount: '$2,140.75', status: 'Paid' },
]

// ── DzPagination (standalone) ───────────────────────────────────────────────
const standalonePage = ref(1)
const standalonePageSize = ref(10)
const standaloneTotal = 87
const standaloneShowEdges = ref(true)
const standaloneSibling = ref(1)

// ── DzTree ──────────────────────────────────────────────────────────────────
interface FileNodeData {
  size?: string
  modified?: string
}

function fileNode(key: string, label: string, size?: string): TreeNode<FileNodeData> {
  return { key, label, data: size ? { size } : undefined, icon: pickIcon(label, false) }
}

function folderNode(key: string, label: string, children: TreeNode<FileNodeData>[]): TreeNode<FileNodeData> {
  return { key, label, children, icon: pickIcon(label, true) }
}

const fileTree: TreeNode<FileNodeData>[] = [
  folderNode('src', 'src', [
    folderNode('src/components', 'components', [
      fileNode('src/components/Button.vue', 'Button.vue', '4.2 KB'),
      fileNode('src/components/Card.vue', 'Card.vue', '3.1 KB'),
      fileNode('src/components/Input.vue', 'Input.vue', '5.7 KB'),
    ]),
    folderNode('src/composables', 'composables', [
      fileNode('src/composables/useTheme.ts', 'useTheme.ts', '1.3 KB'),
      fileNode('src/composables/useToast.ts', 'useToast.ts', '2.0 KB'),
    ]),
    fileNode('src/main.ts', 'main.ts', '0.4 KB'),
    fileNode('src/router.ts', 'router.ts', '1.8 KB'),
  ]),
  folderNode('tests', 'tests', [
    folderNode('tests/unit', 'unit', []),
    folderNode('tests/e2e', 'e2e', []),
  ]),
  fileNode('package.json', 'package.json', '1.1 KB'),
  fileNode('README.md', 'README.md', '6.4 KB'),
]

const expandedKeys = ref<string[]>(['src', 'src/components'])
const selectedKeys = ref<string[]>([])
const treeSelectable = ref(true)
const treeCheckable = ref(false)
const treeLoading = ref(false)

// ── DzDataGrid ──────────────────────────────────────────────────────────────
interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  status: 'Active' | 'Invited' | 'Suspended'
  score: number
}

const users: UserRow[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@dzup.io', role: 'Admin', status: 'Active', score: 96 },
  { id: 2, name: 'Linus Torvalds', email: 'linus@dzup.io', role: 'Admin', status: 'Active', score: 91 },
  { id: 3, name: 'Grace Hopper', email: 'grace@dzup.io', role: 'Editor', status: 'Invited', score: 88 },
  { id: 4, name: 'Alan Turing', email: 'alan@dzup.io', role: 'Editor', status: 'Active', score: 84 },
  { id: 5, name: 'Margaret Hamilton', email: 'margaret@dzup.io', role: 'Editor', status: 'Active', score: 82 },
  { id: 6, name: 'Tim Berners-Lee', email: 'tim@dzup.io', role: 'Viewer', status: 'Suspended', score: 71 },
  { id: 7, name: 'Donald Knuth', email: 'donald@dzup.io', role: 'Viewer', status: 'Active', score: 78 },
  { id: 8, name: 'Barbara Liskov', email: 'barbara@dzup.io', role: 'Editor', status: 'Active', score: 90 },
  { id: 9, name: 'Edsger Dijkstra', email: 'edsger@dzup.io', role: 'Viewer', status: 'Invited', score: 67 },
  { id: 10, name: 'John von Neumann', email: 'john@dzup.io', role: 'Admin', status: 'Active', score: 95 },
  { id: 11, name: 'Claude Shannon', email: 'claude@dzup.io', role: 'Viewer', status: 'Active', score: 73 },
  { id: 12, name: 'Niklaus Wirth', email: 'niklaus@dzup.io', role: 'Editor', status: 'Suspended', score: 64 },
]

const userColumns: ColumnDef<UserRow>[] = [
  { field: 'id', header: '#', width: 56, sortable: true, align: 'right' },
  { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' },
  { field: 'email', header: 'Email', sortable: true, filterable: true, filterType: 'text' },
  {
    field: 'role',
    header: 'Role',
    width: 110,
    sortable: true,
    align: 'center',
    filterable: true,
    filterType: 'select',
    filterOptions: ['Admin', 'Editor', 'Viewer'],
  },
  {
    field: 'status',
    header: 'Status',
    width: 130,
    sortable: true,
    align: 'center',
    filterable: true,
    filterType: 'select',
    filterOptions: ['Active', 'Invited', 'Suspended'],
  },
  {
    field: 'score',
    header: 'Score',
    width: 140,
    sortable: true,
    align: 'right',
    filterable: true,
    filterType: 'number',
  },
]

const gridSortModel = ref<SortModel[]>([{ field: 'score', direction: 'desc' }])
const gridSelectable = ref<'multiple' | 'single' | false>('multiple')
const gridSelected = ref<UserRow[]>([])
const gridFilterable = ref(true)
const gridFilters = ref<DzDataGridFilter[]>([])
const gridLoading = ref(false)

const selectionSummary = computed(() => {
  if (gridSelected.value.length === 0)
    return 'No rows selected'
  if (gridSelected.value.length === 1)
    return `Selected: ${gridSelected.value[0]!.name}`
  return `${gridSelected.value.length} rows selected`
})

const filterSummary = computed(() =>
  gridFilters.value.length === 0
    ? 'No active filters'
    : `${gridFilters.value.length} active filter${gridFilters.value.length === 1 ? '' : 's'}`,
)

function clearGridFilters(): void {
  gridFilters.value = []
}

function handleRowClick(row: UserRow): void {
  // eslint-disable-next-line no-console
  console.log('row click', row)
}

function statusTone(status: UserRow['status']): 'success' | 'warning' | 'danger' {
  if (status === 'Active')
    return 'success'
  if (status === 'Invited')
    return 'warning'
  return 'danger'
}

// ── Server-driven DzDataGrid (mock async fetch + manual mode) ──────────────
//
// Uses the new `manual` + `total` props on DzDataGrid: the grid skips its
// own client-side sort/filter/paginate and renders whatever rows we hand it,
// while pagination math is driven by the server-reported total. Every grid
// emit triggers a fake fetch that returns the next page slice.

const serverData = ref<UserRow[]>([])
const serverTotal = ref(0)
const serverLoading = ref(false)
const serverSortModel = ref<SortModel[]>([{ field: 'score', direction: 'desc' }])
const serverFilters = ref<DzDataGridFilter[]>([])
const serverPage = ref(1)
const serverPageSize = ref(5)
const eventLog = ref<string[]>([])
let pendingFetch = 0

function logEvent(msg: string): void {
  const ts = new Date().toISOString().slice(11, 19)
  eventLog.value = [`${ts} -- ${msg}`, ...eventLog.value].slice(0, 8)
}

async function fakeFetchUsers(params: {
  sort: SortModel[]
  filters: DzDataGridFilter[]
  page: number
  pageSize: number
}): Promise<{ rows: UserRow[], total: number }> {
  await new Promise(resolve => setTimeout(resolve, 450))
  let rows = [...users]

  for (const f of params.filters) {
    const value = String(f.value).toLowerCase()
    rows = rows.filter((row) => {
      const cell = String(row[f.column as keyof UserRow]).toLowerCase()
      switch (f.operator) {
        case 'contains': return cell.includes(value)
        case 'equals': return cell === value
        case 'gt': return Number(row[f.column as keyof UserRow]) > Number(f.value)
        case 'lt': return Number(row[f.column as keyof UserRow]) < Number(f.value)
        case 'gte': return Number(row[f.column as keyof UserRow]) >= Number(f.value)
        case 'lte': return Number(row[f.column as keyof UserRow]) <= Number(f.value)
        default: return true
      }
    })
  }
  for (const s of params.sort) {
    rows.sort((a, b) => {
      const av = a[s.field as keyof UserRow]
      const bv = b[s.field as keyof UserRow]
      if (av === bv)
        return 0
      const cmp = av! > bv! ? 1 : -1
      return s.direction === 'asc' ? cmp : -cmp
    })
  }
  const total = rows.length
  const start = (params.page - 1) * params.pageSize
  return { rows: rows.slice(start, start + params.pageSize), total }
}

async function refetch(): Promise<void> {
  const fetchId = ++pendingFetch
  serverLoading.value = true
  const { rows, total } = await fakeFetchUsers({
    sort: serverSortModel.value,
    filters: serverFilters.value,
    page: serverPage.value,
    pageSize: serverPageSize.value,
  })
  if (fetchId !== pendingFetch)
    return
  serverData.value = rows
  serverTotal.value = total
  serverLoading.value = false
}

onMounted(() => {
  void refetch()
})

watch(
  [serverSortModel, serverFilters, serverPage, serverPageSize],
  () => {
    void refetch()
  },
  { deep: true },
)

function onServerSort(model: SortModel[]): void {
  serverSortModel.value = model
  logEvent(`sort → ${model.map(m => `${m.field}:${m.direction}`).join(', ') || '(cleared)'}`)
}

function onServerFilter(filters: DzDataGridFilter[]): void {
  serverFilters.value = filters
  serverPage.value = 1
  logEvent(`filter → ${filters.length} active`)
}

function onServerPageChange(page: number): void {
  serverPage.value = page
  logEvent(`pageChange → ${page}`)
}

function onServerPageSizeChange(size: number): void {
  serverPageSize.value = size
  serverPage.value = 1
  logEvent(`pageSizeChange → ${size}`)
}

// ── Large dataset (sticky-header demo) ──────────────────────────────────────
interface MetricRow extends Record<string, unknown> {
  id: number
  account: string
  region: 'NA' | 'EU' | 'APAC' | 'LATAM'
  plan: 'Free' | 'Pro' | 'Team' | 'Enterprise'
  mrr: number
  signupDate: string
}

const regions: MetricRow['region'][] = ['NA', 'EU', 'APAC', 'LATAM']
const plans: MetricRow['plan'][] = ['Free', 'Pro', 'Team', 'Enterprise']

const bigDataset: MetricRow[] = Array.from({ length: 1000 }).map((_, i) => ({
  id: i + 1,
  account: `account-${String(i + 1).padStart(4, '0')}`,
  region: regions[i % regions.length]!,
  plan: plans[(i * 7) % plans.length]!,
  mrr: 50 + ((i * 37) % 4500),
  signupDate: new Date(2024, (i * 11) % 12, ((i * 17) % 27) + 1).toISOString().slice(0, 10),
}))

const bigColumns: ColumnDef<MetricRow>[] = [
  { field: 'id', header: '#', width: 64, sortable: true, align: 'right' },
  { field: 'account', header: 'Account', sortable: true, filterable: true, filterType: 'text' },
  {
    field: 'region',
    header: 'Region',
    width: 120,
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: ['NA', 'EU', 'APAC', 'LATAM'],
    align: 'center',
  },
  {
    field: 'plan',
    header: 'Plan',
    width: 130,
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: ['Free', 'Pro', 'Team', 'Enterprise'],
    align: 'center',
  },
  { field: 'mrr', header: 'MRR ($)', width: 110, sortable: true, filterable: true, filterType: 'number', align: 'right' },
  { field: 'signupDate', header: 'Signed up', width: 140, sortable: true, align: 'right' },
]

const bigSortModel = ref<SortModel[]>([{ field: 'mrr', direction: 'desc' }])

// ── Paged feed (DzPagination + DzList composition) ──────────────────────────
interface FeedArticle {
  id: number
  title: string
  author: string
  category: 'Engineering' | 'Design' | 'Product' | 'Ops'
  readMin: number
}

const feedCategories: FeedArticle['category'][] = ['Engineering', 'Design', 'Product', 'Ops']
const feedAuthors = ['Ada', 'Linus', 'Grace', 'Alan', 'Margaret', 'Donald', 'Barbara', 'Tim']

const feedArticles: FeedArticle[] = Array.from({ length: 32 }).map((_, i) => ({
  id: i + 1,
  title: `${[
    'Designing tokenized themes',
    'A pragmatic guide to compound components',
    'Why we picked Reka UI',
    'Type-safe v-model with defineModel',
    'Shipping accessible defaults',
    'The case for contract-first design',
    'Avoiding FOUC at scale',
    'Auditing design tokens',
  ][i % 8]} -- vol. ${Math.floor(i / 8) + 1}`,
  author: feedAuthors[i % feedAuthors.length]!,
  category: feedCategories[i % feedCategories.length]!,
  readMin: 3 + (i % 7),
}))

const feedPage = ref(1)
const feedPageSize = 5
const feedPagedItems = computed<FeedArticle[]>(() => {
  const start = (feedPage.value - 1) * feedPageSize
  return feedArticles.slice(start, start + feedPageSize)
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Data
    </h1>
    <p class="page-description">
      Components for surfacing structured data -- lists, tables, paginated grids and trees.
    </p>

    <!-- DzList -->
    <section class="demo-section">
      <h2 class="section-title">
        DzList
      </h2>
      <p class="section-description">
        Compound list with <code>plain</code>, <code>bordered</code> and <code>divided</code> variants. Items can carry
        prefix/suffix slots and an active state.
      </p>

      <div class="control-row">
        <label class="control-label">variant</label>
        <select v-model="listVariant" class="control-select">
          <option v-for="v in listVariants" :key="v" :value="v">
            {{ v }}
          </option>
        </select>

        <label class="control-label">size</label>
        <select v-model="listSize" class="control-select">
          <option v-for="s in listSizes" :key="s" :value="s">
            {{ s }}
          </option>
        </select>

        <label class="control-label">
          <input v-model="listInteractive" type="checkbox"> interactive
        </label>

        <label class="control-label">
          <input v-model="listLoading" type="checkbox"> loading
        </label>
      </div>

      <div class="frame">
        <DzList
          :variant="listVariant"
          :size="listSize"
          :interactive="listInteractive"
          :loading="listLoading"
          aria-label="Mailbox folders"
          :class="listLoading ? 'is-busy' : undefined"
        >
          <DzListItem
            v-for="item in inboxItems"
            :key="item.key"
            :active="activeListKey === item.key"
            @click="selectList(item.key)"
          >
            <template #prefix>
              <span class="list-icon">{{ item.icon }}</span>
            </template>
            {{ item.label }}
            <template v-if="item.count !== null" #suffix>
              <span class="list-badge">{{ item.count }}</span>
            </template>
          </DzListItem>
        </DzList>
      </div>

      <p class="muted-text">
        Active key: <code>{{ activeListKey }}</code> -- DzList currently maps <code>loading</code> to
        <code>aria-busy</code> + <code>data-state</code>; this demo paints a low-opacity overlay on top.
      </p>
    </section>

    <!-- DzTable -->
    <section class="demo-section">
      <h2 class="section-title">
        DzTable
      </h2>
      <p class="section-description">
        Semantic compound table -- use it when you control rendering. For sorting, paging and selection reach for
        <code>DzDataGrid</code> instead.
      </p>

      <div class="control-row">
        <label class="control-label">density</label>
        <select v-model="tableDensity" class="control-select">
          <option v-for="d in tableDensities" :key="d" :value="d">
            {{ d }}
          </option>
        </select>

        <label class="control-label">
          <input v-model="tableStriped" type="checkbox"> striped
        </label>

        <label class="control-label">
          <input v-model="tableHoverable" type="checkbox"> hoverable
        </label>

        <label class="control-label">
          <input v-model="tableLoading" type="checkbox"> loading
        </label>
      </div>

      <div class="frame">
        <DzTable
          :density="tableDensity"
          :striped="tableStriped"
          :hoverable="tableHoverable"
          :loading="tableLoading"
          aria-label="Recent invoices"
          :class="tableLoading ? 'is-busy' : undefined"
        >
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>
                Invoice
              </DzTableCell>
              <DzTableCell header>
                Client
              </DzTableCell>
              <DzTableCell header align="right">
                Amount
              </DzTableCell>
              <DzTableCell header align="center">
                Status
              </DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow v-for="row in recentInvoices" :key="row.id">
              <DzTableCell>{{ row.id }}</DzTableCell>
              <DzTableCell>{{ row.client }}</DzTableCell>
              <DzTableCell align="right">
                {{ row.amount }}
              </DzTableCell>
              <DzTableCell align="center">
                <span class="status-pill" :data-status="row.status.toLowerCase()">{{ row.status }}</span>
              </DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>
    </section>

    <!-- DzPagination -->
    <section class="demo-section">
      <h2 class="section-title">
        DzPagination
      </h2>
      <p class="section-description">
        Standalone page navigator backed by Reka UI primitives. Use it directly on lists, or let <code>DzDataGrid</code>
        embed its own variant.
      </p>

      <div class="control-row">
        <label class="control-label">page-size</label>
        <select v-model.number="standalonePageSize" class="control-select">
          <option :value="5">
            5
          </option>
          <option :value="10">
            10
          </option>
          <option :value="20">
            20
          </option>
        </select>

        <label class="control-label">sibling-count</label>
        <select v-model.number="standaloneSibling" class="control-select">
          <option :value="0">
            0
          </option>
          <option :value="1">
            1
          </option>
          <option :value="2">
            2
          </option>
        </select>

        <label class="control-label">
          <input v-model="standaloneShowEdges" type="checkbox"> show-edges
        </label>
      </div>

      <div class="frame frame-center">
        <DzPagination
          v-model="standalonePage"
          :total="standaloneTotal"
          :page-size="standalonePageSize"
          :sibling-count="standaloneSibling"
          :show-edges="standaloneShowEdges"
        />
      </div>

      <p class="muted-text">
        Showing page <strong>{{ standalonePage }}</strong> of
        <strong>{{ Math.max(1, Math.ceil(standaloneTotal / standalonePageSize)) }}</strong>
        ({{ standaloneTotal }} items)
      </p>
    </section>

    <!-- Paged feed: DzPagination + DzList composition -->
    <section class="demo-section">
      <h2 class="section-title">
        Paged feed (DzList + DzPagination)
      </h2>
      <p class="section-description">
        Real-world composition: paginate a content feed with a <code>DzList</code> body and a footer
        <code>DzPagination</code>. Total = {{ feedArticles.length }}, page-size = {{ feedPageSize }}.
      </p>

      <DzList variant="divided" size="md" aria-label="Paged article feed">
        <DzListItem v-for="article in feedPagedItems" :key="article.id">
          <template #prefix>
            <span class="feed-tag" :data-category="article.category.toLowerCase()">{{ article.category }}</span>
          </template>
          <span class="feed-title">{{ article.title }}</span>
          <template #suffix>
            <span class="feed-meta">{{ article.author }} -- {{ article.readMin }} min</span>
          </template>
        </DzListItem>
      </DzList>

      <div class="feed-pagination">
        <DzPagination
          v-model="feedPage"
          :total="feedArticles.length"
          :page-size="feedPageSize"
          show-edges
        />
      </div>
    </section>

    <!-- DzTree -->
    <section class="demo-section">
      <h2 class="section-title">
        DzTree
      </h2>
      <p class="section-description">
        Hierarchical data with expand/collapse, optional selection and checkboxes. Each
        <code>TreeNode.icon</code> is a Component, rendered by DzTreeItem before the
        <code>#item</code> slot -- so the slot only has to provide label, badges and inline actions.
      </p>

      <div class="control-row">
        <label class="control-label">
          <input v-model="treeSelectable" type="checkbox"> selectable
        </label>
        <label class="control-label">
          <input v-model="treeCheckable" type="checkbox"> checkable
        </label>
        <label class="control-label">
          <input v-model="treeLoading" type="checkbox"> loading
        </label>
      </div>

      <div class="frame">
        <DzTree
          v-model:expanded-keys="expandedKeys"
          v-model:selected-keys="selectedKeys"
          :items="fileTree"
          :selectable="treeSelectable"
          :checkable="treeCheckable"
          :loading="treeLoading"
          aria-label="Project files"
          :class="treeLoading ? 'is-busy' : undefined"
        >
          <template #item="{ node }">
            <span class="tree-row">
              <span class="tree-label">{{ node.label }}</span>
              <span
                v-if="(node as TreeNode<FileNodeData>).data?.size"
                class="tree-size"
              >{{ (node as TreeNode<FileNodeData>).data?.size }}</span>
              <span
                v-if="!node.children || node.children.length === 0"
                class="tree-action"
                title="Open"
                aria-hidden="true"
              >↗</span>
            </span>
          </template>
        </DzTree>
      </div>

      <p class="muted-text">
        Expanded: <code>{{ expandedKeys.length }}</code> -- Selected: <code>{{ selectedKeys.length }}</code>
      </p>
    </section>

    <!-- DzDataGrid (client-side) -->
    <section class="demo-section">
      <h2 class="section-title">
        DzDataGrid -- client-side
      </h2>
      <p class="section-description">
        Full-featured grid: column-driven sort, filter (text / number / select), multi-select, pagination, and a
        <code>#cell</code> slot for custom renderers. Click the funnel icon on a header to filter.
      </p>

      <div class="control-row">
        <label class="control-label">selection</label>
        <select
          :value="String(gridSelectable)"
          class="control-select"
          @change="gridSelectable = (($event.target as HTMLSelectElement).value === 'false'
            ? false
            : ($event.target as HTMLSelectElement).value as 'single' | 'multiple')"
        >
          <option value="false">
            none
          </option>
          <option value="single">
            single
          </option>
          <option value="multiple">
            multiple
          </option>
        </select>

        <label class="control-label">
          <input v-model="gridFilterable" type="checkbox"> filterable
        </label>

        <label class="control-label">
          <input v-model="gridLoading" type="checkbox"> loading
        </label>

        <button
          type="button"
          class="control-button"
          :disabled="gridFilters.length === 0"
          @click="clearGridFilters"
        >
          Clear filters
        </button>

        <span class="muted-text">{{ filterSummary }} -- {{ selectionSummary }}</span>
      </div>

      <DzDataGrid
        v-model:sort-model="gridSortModel"
        v-model:selected-rows="gridSelected"
        v-model:filters="gridFilters"
        :data="users"
        :columns="userColumns"
        :selectable="gridSelectable"
        :pagination="{ pageSize: 5, pageSizeOptions: [5, 10, 25] }"
        :filterable="gridFilterable"
        :loading="gridLoading"
        sortable
        row-key="id"
        @row-click="handleRowClick"
      >
        <template #cell="{ row, column, value }">
          <template v-if="column.field === 'status'">
            <span class="status-pill" :data-tone="statusTone((row as UserRow).status)">
              {{ value }}
            </span>
          </template>

          <template v-else-if="column.field === 'score'">
            <span class="score-cell">
              <span class="score-bar" aria-hidden="true">
                <span
                  class="score-fill"
                  :style="{ width: `${value}%` }"
                  :data-tone="(value as number) >= 85 ? 'high' : (value as number) >= 70 ? 'mid' : 'low'"
                />
              </span>
              <span class="score-value">{{ value }}</span>
              <span
                class="score-trend"
                :data-direction="(row as UserRow).score >= 80 ? 'up' : 'down'"
                aria-hidden="true"
              >
                {{ (row as UserRow).score >= 80 ? '▲' : '▼' }}
              </span>
            </span>
          </template>

          <template v-else-if="column.field === 'role'">
            <span class="role-pill" :data-role="String(value).toLowerCase()">{{ value }}</span>
          </template>

          <template v-else>
            {{ value }}
          </template>
        </template>

        <template #empty>
          No users match the current filters.
        </template>
      </DzDataGrid>
    </section>

    <!-- DzDataGrid (server-driven) -->
    <section class="demo-section">
      <h2 class="section-title">
        DzDataGrid -- server-driven (manual mode)
      </h2>
      <p class="section-description">
        Uses the new <code>manual</code> + <code>total</code> props -- the grid skips its own sort / filter /
        paginate of <code>data</code> and renders the page slice straight from the (mock) server. Every
        <code>update:sortModel</code>, <code>update:filters</code>, <code>pageChange</code> and
        <code>pageSizeChange</code> emit triggers a 450ms re-fetch and is logged below. Try
        <kbd>Shift</kbd> + click a sortable header to chain multi-column sort.
      </p>

      <DzDataGrid
        :data="serverData"
        :columns="userColumns"
        :sort-model="serverSortModel"
        :filters="serverFilters"
        :pagination="{ pageSize: serverPageSize, pageSizeOptions: [5, 10, 25] }"
        :loading="serverLoading"
        :manual="true"
        :total="serverTotal"
        sortable
        filterable
        row-key="id"
        @update:sort-model="onServerSort"
        @update:filters="onServerFilter"
        @page-change="onServerPageChange"
        @page-size-change="onServerPageSizeChange"
      >
        <template #empty>
          No results for the current query.
        </template>
      </DzDataGrid>

      <div class="event-log" aria-label="Event log">
        <header>Event log</header>
        <ol v-if="eventLog.length > 0">
          <li v-for="(line, idx) in eventLog" :key="idx">
            {{ line }}
          </li>
        </ol>
        <p v-else class="muted-text">
          Interact with the grid to see emit traffic.
        </p>
      </div>
    </section>

    <!-- DzDataGrid (large dataset / sticky header) -->
    <section class="demo-section">
      <h2 class="section-title">
        DzDataGrid -- 1k rows with sticky header
      </h2>
      <p class="section-description">
        1,000 synthetic rows paged at 25 per page. The wrapper scrolls vertically and applies
        <code>position: sticky</code> to header cells from the sandbox side -- a true virtualized body would need a
        core change (see Next improvements).
      </p>

      <div class="sticky-grid-wrap">
        <DzDataGrid
          v-model:sort-model="bigSortModel"
          :data="bigDataset"
          :columns="bigColumns"
          :pagination="{ pageSize: 25, pageSizeOptions: [25, 50, 100, 200] }"
          sortable
          filterable
          density="compact"
          row-key="id"
        />
      </div>
      <p class="muted-text">
        Total dataset: {{ bigDataset.length.toLocaleString() }} rows.
      </p>
    </section>

    <!-- Next steps -->
    <section class="demo-section">
      <h2 class="section-title">
        Next improvements
      </h2>
      <p class="section-description">
        Items deferred from this pass because they touch frozen core contracts or span multiple packages.
      </p>
      <ul class="todo-list">
        <li>
          <strong>Built-in skeleton variants for DzList / DzTable / DzTree</strong> -- promote the
          <code>loading</code> prop from "ARIA only" to a rendered skeleton, matching DzDataGrid's overlay. Touches
          <code>.vue</code> + <code>.variants.ts</code> + <code>.contract.spec.ts</code> in each component; align on
          shape before landing.
        </li>
        <li>
          <strong>Keyboard-navigation audit</strong> -- DzTreeItem handles ArrowLeft / ArrowRight / Enter / Space; add
          ArrowUp / ArrowDown / Home / End traversal + typeahead, mirror for interactive DzList, then encode in the
          family <code>.contract.spec.ts</code> files. Bundle with an a11y snapshot.
        </li>
        <li>
          <strong>Storybook parity</strong> -- replicate every section here in <code>packages/core/stories/data/</code>
          (filter popover, cell renderer, paged feed, custom tree slot, async grid, sticky big grid). Separate PR; one
          story per scenario.
        </li>
        <li>
          <strong>Body virtualization for DzDataGrid</strong> -- the 1k-row demo above is paginated, not virtualized.
          Wire a windowing strategy (TanStack Virtual or hand-rolled) behind a <code>virtualized</code> prop. Needs
          perf budget + a11y review for keyboard scrolling.
        </li>
        <li>
          <strong>DzTree drag-and-drop</strong> -- <code>draggable</code> is now explicitly documented as reserved.
          Decide: ship an HTML5 DnD reference impl, or remove the prop and rev the contract.
        </li>
        <li>
          <strong>Column visibility / reorder</strong> -- exposed via a popover anchored to a grid toolbar slot
          (new slot on DzDataGrid).
        </li>
        <li>
          <strong>Visible Shift+click hint</strong> -- header tooltip / cursor cue when a column is part of a
          multi-sort chain, plus a numeric badge showing sort priority.
        </li>
        <li>
          <strong>Manual-mode developer ergonomics</strong> -- consider an opt-in <code>autoLoading</code> + a hook
          for declarative fetchers (similar to TanStack Query's <code>queryFn</code>) so consumers don't need to
          hand-roll the watch / pendingFetch dance in the sandbox above.
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
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
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 4px;
}

.section-description {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.control-select {
  padding: 6px 8px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
}

.control-button {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
  cursor: pointer;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.frame {
  padding: 16px;
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  min-height: 80px;
}

.frame-center {
  display: flex;
  justify-content: center;
}

.muted-text {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 8px 0 0;
}

.is-busy {
  position: relative;
}

.is-busy::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--dz-surface, #ffffff);
  opacity: 0.5;
  border-radius: inherit;
  pointer-events: none;
}

.list-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
  font-size: 11px;
  font-weight: 700;
}

.list-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
}

/* Status pill (table + grid) -- tone-aware via semantic tokens */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
}

.status-pill[data-status="paid"],
.status-pill[data-tone="success"] {
  background: var(--dz-success-muted);
  color: var(--dz-success);
}

.status-pill[data-status="pending"],
.status-pill[data-tone="warning"] {
  background: var(--dz-warning-muted);
  color: var(--dz-warning);
}

.status-pill[data-status="overdue"],
.status-pill[data-tone="danger"] {
  background: var(--dz-danger-muted);
  color: var(--dz-danger);
}

/* Role pill */
.role-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--dz-radius-sm, 4px);
  font-size: 11px;
  font-weight: 600;
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
}

.role-pill[data-role="admin"] {
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.role-pill[data-role="editor"] {
  background: var(--dz-info-muted);
  color: var(--dz-info);
}

/* Score cell */
.score-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
  width: 100%;
}

.score-bar {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--dz-muted, #f1f5f9);
  overflow: hidden;
  min-width: 40px;
}

.score-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--dz-muted-foreground, #64748b);
  transition: width var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.score-fill[data-tone="high"] { background: var(--dz-success); }
.score-fill[data-tone="mid"]  { background: var(--dz-warning); }
.score-fill[data-tone="low"]  { background: var(--dz-danger); }

.score-value {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 12px;
  min-width: 24px;
  text-align: right;
}

.score-trend {
  font-size: 10px;
  width: 12px;
  text-align: center;
}

.score-trend[data-direction="up"]   { color: var(--dz-success); }
.score-trend[data-direction="down"] { color: var(--dz-danger); }

/* Tree custom item -- icon comes from TreeNode.icon via DzTreeItem */
.tree-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.tree-label {
  flex: 1;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
}

.tree-size {
  font-size: 11px;
  color: var(--dz-muted-foreground, #64748b);
  font-variant-numeric: tabular-nums;
}

.tree-action {
  font-size: 11px;
  color: var(--dz-muted-foreground, #64748b);
  opacity: 0;
  transition: opacity var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.tree-row:hover .tree-action {
  opacity: 1;
}

/* Feed tag */
.feed-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--dz-radius-sm, 4px);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-muted-foreground, #64748b);
  min-width: 88px;
  justify-content: center;
}

.feed-tag[data-category="engineering"] {
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.feed-tag[data-category="design"] {
  background: var(--dz-info-muted);
  color: var(--dz-info);
}

.feed-tag[data-category="product"] {
  background: var(--dz-success-muted);
  color: var(--dz-success);
}

.feed-tag[data-category="ops"] {
  background: var(--dz-warning-muted);
  color: var(--dz-warning);
}

.feed-title {
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  font-weight: 500;
}

.feed-meta {
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
  white-space: nowrap;
}

.feed-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* Event log */
.event-log {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--dz-muted, #f8fafc);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--dz-foreground, #1a202c);
}

.event-log header {
  font-family: inherit;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #64748b);
  margin-bottom: 6px;
}

.event-log ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.event-log li + li {
  margin-top: 2px;
}

/* Sticky-header wrapper for the 1k-row grid */
.sticky-grid-wrap {
  position: relative;
  max-height: 480px;
  overflow: auto;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
}

.sticky-grid-wrap :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--dz-surface, #ffffff);
  box-shadow: inset 0 -1px 0 var(--dz-border, #e2e8f0);
}

.todo-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  line-height: 1.55;
}

.todo-list code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}
</style>
