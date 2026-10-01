import type { AsyncOptionsState, LoadOptionsRequest } from '@dzup-ui/contracts'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Ref } from 'vue'
import type { DzSelectItem } from '../../src/components/forms'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { ref, watch } from 'vue'
import { DzButton } from '../../src/components/buttons'
import { DzSelect } from '../../src/components/forms'
import { darkModeDecorator, DemoSection } from '../_shared'

/**
 * The six states of the shared async-options seam, on one page.
 *
 * Every selection control in the family runs remote options through one
 * composable — `useAsyncOptions` (renderer contract C9) — and renders one shared
 * row, `DzOptionsState`. Each control's own page carries an `Async Options` story
 * that walks four of the seam's states (`loading → ready → error → retry`). Three
 * more are the ones a schema-driven form actually fails on, and until TASK-S3-O2
 * none of them had story evidence anywhere in this repository: an **empty**
 * result, a **dependent** option set that must clear when its parent changes, and
 * a **superseded** request whose late answer must be discarded.
 *
 * This page covers all six against `DzSelect`, the richest host of the seam — the
 * only control that requests on `open`, on `search` *and* on retry, so it is the
 * only one that can put two requests in flight, which is what the discard state
 * needs. Nothing here adds behaviour: every story drives the seam that shipped in
 * TASK-FORM-OSS-03.
 *
 * Core never fetches. The hosts below are mocks with no network and no timers, so
 * every phase is deterministic. Each `play()` drives its host **programmatically**
 * rather than by clicking the on-page buttons: the panel is a dismissable layer
 * and a pointer-down outside it closes the panel, which aborts the request in
 * flight. The buttons are there so a reader can walk the same states by hand.
 *
 * The same six states are **measured** in
 * `packages/core/src/components/forms/DzSelect.asyncStates.spec.ts`, which runs in
 * `yarn test` rather than only under the browser lane. That file is also where
 * finding `D-S3O2-5` is pinned: `data-options-state` publishes the raw
 * `optionsState`, not the row the control is rendering, so it reads `ready` on an
 * empty row and `idle` on a loading row.
 */
const meta = {
  title: 'Core/Forms/Async Options',
  component: undefined,
  tags: ['autodocs', 'status:stable'],
  parameters: {
    docs: {
      description: {
        component:
          'The six states of the shared async-options seam (useAsyncOptions / DzOptionsState): '
          + 'loading, empty result, error with retry, dependency-change clearing, stale-response '
          + 'discard, and the accessible announcement of each.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// A host that keeps every request, so a superseded one can be proved superseded
// ---------------------------------------------------------------------------

interface TrackingHost {
  readonly state: Ref<AsyncOptionsState>
  readonly error: Ref<string | undefined>
  readonly items: Ref<DzSelectItem[]>
  /** Every request the control has emitted, oldest first. */
  readonly requests: Ref<LoadOptionsRequest[]>
  readonly retries: Ref<number>
  /** How many of those requests the control has already superseded. */
  readonly aborted: () => number
  onLoadOptions: (request: LoadOptionsRequest) => void
  onRetryOptions: () => void
  /**
   * Answer request `index` with `rows`.
   *
   * Returns `false` — and changes nothing — when that request was already
   * superseded, which is how a well-written host fences. `'ready'` with rows,
   * `'empty'` without: a host that reports `ready` with nothing to show means the
   * same thing as one that reports `empty`, and the seam treats them alike.
   */
  answer: (index: number, rows: DzSelectItem[]) => boolean
  /** Answer the newest request. */
  answerLatest: (rows: DzSelectItem[]) => boolean
  /** Answer the newest request the control has already abandoned. */
  answerAbandoned: (rows: DzSelectItem[]) => boolean
  /** Fail the newest request. */
  fail: (message?: string) => void
  /** A host-initiated refresh: loading, with nothing to show yet. */
  reload: () => void
  reset: () => void
}

/**
 * The mock host these stories bind.
 *
 * Deliberately *not* `createMockOptionsHost` from `../_shared`: that one keeps a
 * single `pending` request, which is exactly the shape that cannot express two in
 * flight — and two in flight is the premise of the discard state. The four-phase
 * walk on every control's own page keeps using the shared host; this page needs a
 * host with a memory.
 *
 * Created at module level, one per story, so `render` and `play` share it, with
 * `reset()` in `setup` so a re-render starts clean.
 */
function createTrackingHost(): TrackingHost {
  const state = ref<AsyncOptionsState>('idle')
  const error = ref<string | undefined>(undefined)
  const items = ref([]) as Ref<DzSelectItem[]>
  const requests = ref([]) as Ref<LoadOptionsRequest[]>
  const retries = ref(0)

  function answer(index: number, rows: DzSelectItem[]): boolean {
    const request = requests.value[index]
    if (request === undefined || request.signal.aborted)
      return false
    items.value = rows
    error.value = undefined
    state.value = rows.length > 0 ? 'ready' : 'empty'
    return true
  }

  return {
    state,
    error,
    items,
    requests,
    retries,
    aborted: () => requests.value.filter(r => r.signal.aborted).length,
    onLoadOptions(request) {
      requests.value = [...requests.value, request]
      error.value = undefined
      state.value = 'loading'
    },
    onRetryOptions() {
      retries.value += 1
    },
    answer,
    answerLatest(rows) {
      return answer(requests.value.length - 1, rows)
    },
    answerAbandoned(rows) {
      // The newest request that the control has already superseded. Its answer
      // must change nothing at all.
      for (let i = requests.value.length - 1; i >= 0; i -= 1) {
        if (requests.value[i]?.signal.aborted === true)
          return answer(i, rows)
      }
      return false
    },
    fail(message = 'The directory did not answer') {
      const latest = requests.value.at(-1)
      if (latest !== undefined && latest.signal.aborted)
        return
      items.value = []
      error.value = message
      state.value = 'error'
    },
    reload() {
      items.value = []
      error.value = undefined
      state.value = 'loading'
    },
    reset() {
      requests.value = []
      retries.value = 0
      items.value = []
      error.value = undefined
      state.value = 'idle'
    },
  }
}

const PEOPLE: DzSelectItem[] = [
  { label: 'Ada Lovelace', value: 'ada' },
  { label: 'Alan Turing', value: 'alan' },
  { label: 'Grace Hopper', value: 'grace' },
]

const STALE: DzSelectItem[] = [
  { label: 'STALE — the answer to an abandoned query', value: 'stale' },
]

/** `[data-part="options-state"]`, wherever the portalled panel rendered it. */
function optionsRow(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[data-part="options-state"]')
}

/** The row's message text — what a polite live region announces. */
function announcement(): string {
  return optionsRow()?.querySelector('[data-part="options-message"]')?.textContent?.trim() ?? ''
}

const hostControls = `
  <div class="flex flex-wrap gap-2" role="group" aria-label="Mock host">
    <DzButton size="sm" variant="outline" @click="host.answerLatest(rows)">Answer</DzButton>
    <DzButton size="sm" variant="outline" @click="host.answerLatest([])">Answer empty</DzButton>
    <DzButton size="sm" variant="outline" @click="host.fail()">Fail</DzButton>
    <DzButton size="sm" variant="outline" @click="host.reload()">Reload</DzButton>
  </div>
  <p class="text-sm text-[var(--dz-muted-foreground)]" data-testid="host-log">
    state: {{ host.state.value }} · requests: {{ host.requests.value.length }} · retries: {{ host.retries.value }}
  </p>
`

const oneSelect = `
  <div class="space-y-3 max-w-xs">
    <DzSelect
      :items="host.items.value"
      :options-state="host.state.value"
      :options-error="host.error.value"
      placeholder="Pick a person"
      aria-label="Person"
      @load-options="host.onLoadOptions"
      @retry-options="host.onRetryOptions"
    />
    ${hostControls}
  </div>
`

/** One story's render, over a host the play() also holds. */
function selectStory(host: TrackingHost): () => Record<string, unknown> {
  return () => ({
    components: { DzSelect, DzButton },
    setup() {
      host.reset()
      return { host, rows: PEOPLE }
    },
    template: oneSelect,
  })
}

/**
 * Open the panel and wait for the loading row.
 *
 * The control asks twice here and that is correct, not a defect: `useAsyncOptions`
 * asks once on mount (a host that renders a driven control with nothing is asking
 * for options, and waiting for an interaction that may never come would leave the
 * panel empty forever), and `DzSelect` asks again on open while it still has
 * nothing. The second supersedes the first, which is the fence state 5 proves.
 */
async function openPanel(canvasElement: HTMLElement, host: TrackingHost): Promise<void> {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole('combobox'))
  await waitFor(() => expect(host.requests.value.length).toBeGreaterThan(0))
  await waitFor(() => expect(optionsRow()).toHaveAttribute('data-options-state', 'loading'))
}

// ---------------------------------------------------------------------------
// State 1 — loading
// ---------------------------------------------------------------------------

const loadingHost = createTrackingHost()

/**
 * **State 1 of 6 — loading.** Opening the panel emits `load-options` with an
 * `AbortSignal`, and until the host answers the control renders one row *instead
 * of* its list — not above it, so the two can never both be on screen.
 */
export const Loading: Story = {
  name: '1. Loading',
  render: selectStory(loadingHost),
  play: async ({ canvasElement, step }) => {
    await step('the control asks the host and shows the loading row', async () => {
      await openPanel(canvasElement, loadingHost)
      await expect(announcement()).toBe('Loading options')
      await expect(screen.queryByRole('option')).toBeNull()
    })

    await step('the request carries a live signal the host can fence on', async () => {
      const latest = loadingHost.requests.value.at(-1)!
      await expect(latest.reason).toBe('open')
      await expect(latest.signal.aborted).toBe(false)
    })
  },
}

// ---------------------------------------------------------------------------
// State 2 — empty result
// ---------------------------------------------------------------------------

const emptyHost = createTrackingHost()

/**
 * **State 2 of 6 — an empty result.** The load succeeded and matched nothing.
 *
 * A distinct state from `loading` and from an error, and the one no story
 * exercised before TASK-S3-O2. A host that answers with zero rows, or that
 * reports `ready` with an empty collection, gets the same row either way — the
 * seam infers `empty` from `ready + nothing to show`, so a control cannot render a
 * blank panel for one and a message for the other.
 */
export const EmptyResult: Story = {
  name: '2. Empty result',
  render: selectStory(emptyHost),
  play: async ({ canvasElement, step }) => {
    await step('loading, then an answer with no rows at all', async () => {
      await openPanel(canvasElement, emptyHost)
      await expect(emptyHost.answerLatest([])).toBe(true)
      await waitFor(() => expect(optionsRow()).toHaveAttribute('data-options-state', 'empty'))
      await expect(announcement()).toBe('No options found')
      await expect(screen.queryByRole('option')).toBeNull()
    })

    await step('a `ready` state with an empty collection means the same thing', async () => {
      emptyHost.state.value = 'ready'
      emptyHost.items.value = []
      await waitFor(() => expect(announcement()).toBe('No options found'))
      // FINDING `D-S3O2-5`, pinned rather than fixed: the row is the empty row and
      // says so, but `data-options-state` publishes the RAW state, so a consumer
      // styling `[data-options-state="empty"]` gets nothing in exactly the case the
      // seam infers. Changing a published `data-*` value on seven controls is not
      // additive and is an owner decision — see TASK-S3-O2-decisions.md §5.
      await expect(optionsRow()).toHaveAttribute('data-options-state', 'ready')
    })

    await step('an answer with rows replaces the empty row with the list', async () => {
      await expect(emptyHost.answerLatest(PEOPLE)).toBe(true)
      await waitFor(() => expect(optionsRow()).toBeNull())
      await expect(await screen.findByRole('option', { name: 'Ada Lovelace' })).toBeVisible()
    })
  },
}

// ---------------------------------------------------------------------------
// State 3 — error with retry
// ---------------------------------------------------------------------------

const errorHost = createTrackingHost()

/**
 * **State 3 of 6 — an error, with a retry that actually retries.** The row names
 * the failure the *host* reported, not a generic one, and offers a single
 * control; pressing it emits `retry-options` **and** a fresh `load-options`, so a
 * host that listens to only one of the two still reloads.
 */
export const ErrorWithRetry: Story = {
  name: '3. Error with retry',
  render: selectStory(errorHost),
  play: async ({ step, canvasElement }) => {
    await step('the load fails and the row says what the host said', async () => {
      await openPanel(canvasElement, errorHost)
      errorHost.fail('The directory did not answer')
      await waitFor(() => expect(optionsRow()).toHaveAttribute('data-options-state', 'error'))
      await expect(announcement()).toBe('The directory did not answer')
    })

    await step('retry emits retry-options and a fresh request, then the list returns', async () => {
      const before = errorHost.requests.value.length
      const retry = optionsRow()!.querySelector<HTMLElement>('[data-part="options-retry"]')
      await expect(retry).not.toBeNull()
      await expect(retry).toHaveTextContent('Try again')
      // The retry control is inside the panel, so clicking it does not dismiss it.
      await userEvent.click(retry!)
      await waitFor(() => expect(errorHost.retries.value).toBe(1))
      await waitFor(() => expect(errorHost.requests.value.length).toBe(before + 1))
      await waitFor(() => expect(optionsRow()).toHaveAttribute('data-options-state', 'loading'))
      await expect(errorHost.answerLatest(PEOPLE)).toBe(true)
      await waitFor(() => expect(optionsRow()).toBeNull())
      await expect(await screen.findByRole('option', { name: 'Grace Hopper' })).toBeVisible()
    })
  },
}

// ---------------------------------------------------------------------------
// State 4 — dependency-change clearing (the cascading load)
// ---------------------------------------------------------------------------

const CITIES: Record<string, DzSelectItem[]> = {
  de: [
    { label: 'Berlin', value: 'berlin' },
    { label: 'Hamburg', value: 'hamburg' },
  ],
  jp: [
    { label: 'Tokyo', value: 'tokyo' },
    { label: 'Osaka', value: 'osaka' },
  ],
}

const cityHost = createTrackingHost()

/**
 * **State 4 of 6 — a dependent option set clearing when its parent changes.**
 *
 * The behaviour schema-driven forms fail on most. A city field whose options
 * depend on a country field must do three things the instant the country changes:
 * **drop its own value** (Berlin is not a city in Japan), **drop the stale option
 * set**, and **ask again**. A form that does only the third keeps a value its
 * schema now rejects and never shows the user why.
 *
 * The clearing is the host's job, not the control's — a control does not know
 * which other field it depends on, and one that guessed would be a control an
 * application cannot correct. What the seam provides is the vocabulary: the host
 * puts `options-state` back to `loading` with an empty collection, and the control
 * renders the loading row again instead of a stale list.
 *
 * Also this page's `RealWorld*` composition: two selects and a dependency is the
 * smallest real form that has one.
 */
export const RealWorldDependentSelects: Story = {
  name: '4. Dependency-change clearing (country → city)',
  render: () => ({
    components: { DzSelect, DzButton },
    setup() {
      cityHost.reset()
      const country = ref('')
      const city = ref('')
      const countries: DzSelectItem[] = [
        { label: 'Germany', value: 'de' },
        { label: 'Japan', value: 'jp' },
      ]

      // The host's half of a cascading load: clear the dependent value, drop the
      // stale option set, and go back to `loading` so the control asks again.
      watch(country, () => {
        city.value = ''
        cityHost.reload()
      })

      return {
        cityHost,
        country,
        city,
        countries,
        answerForCountry: () => cityHost.answerLatest(CITIES[country.value] ?? []),
      }
    },
    template: `
      <div class="space-y-3 max-w-sm">
        <DzSelect
          v-model="country"
          :items="countries"
          placeholder="Pick a country"
          aria-label="Country"
        />
        <DzSelect
          v-model="city"
          :items="cityHost.items.value"
          :options-state="cityHost.state.value"
          :options-error="cityHost.error.value"
          placeholder="Pick a city"
          aria-label="City"
          @load-options="cityHost.onLoadOptions"
          @retry-options="cityHost.onRetryOptions"
        />
        <div class="flex flex-wrap gap-2" role="group" aria-label="Mock host">
          <DzButton size="sm" variant="outline" @click="answerForCountry()">Answer for country</DzButton>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]" data-testid="host-log">
          country: {{ country || '—' }} · city: {{ city || '—' }} ·
          city options: {{ cityHost.items.value.length }} · state: {{ cityHost.state.value }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const log = (): string => canvas.getByTestId('host-log').textContent ?? ''
    const countryTrigger = (): HTMLElement => canvas.getByRole('combobox', { name: 'Country' })
    const cityTrigger = (): HTMLElement => canvas.getByRole('combobox', { name: 'City' })

    await step('pick Germany, load its cities, choose Berlin', async () => {
      await userEvent.click(countryTrigger())
      await userEvent.click(await screen.findByRole('option', { name: 'Germany' }))
      await waitFor(() => expect(log()).toContain('country: de'))

      await userEvent.click(cityTrigger())
      await waitFor(() => expect(optionsRow()).toHaveAttribute('data-options-state', 'loading'))
      await expect(cityHost.answerLatest(CITIES.de!)).toBe(true)
      await waitFor(() => expect(log()).toContain('city options: 2'))
      await userEvent.click(await screen.findByRole('option', { name: 'Berlin' }))
      await waitFor(() => expect(log()).toContain('city: berlin'))
    })

    await step('change the country: the city value AND its option set are cleared', async () => {
      await userEvent.click(countryTrigger())
      await userEvent.click(await screen.findByRole('option', { name: 'Japan' }))
      await waitFor(() => expect(log()).toContain('country: jp'))
      // The three things a cascading form must do, asserted one at a time.
      await waitFor(() => expect(log()).toContain('city: —'))
      await waitFor(() => expect(log()).toContain('city options: 0'))
      await waitFor(() => expect(log()).toContain('state: loading'))
      // And the stale option is gone from the DOM, not merely unselected.
      await expect(screen.queryByRole('option', { name: 'Berlin' })).toBeNull()
    })

    await step('reopening shows the loading row, and the new country answers with new cities', async () => {
      await userEvent.click(cityTrigger())
      await waitFor(() => expect(optionsRow()).toHaveAttribute('data-options-state', 'loading'))
      await expect(announcement()).toBe('Loading options')
      await expect(cityHost.answerLatest(CITIES.jp!)).toBe(true)
      await waitFor(() => expect(log()).toContain('city options: 2'))
      await expect(await screen.findByRole('option', { name: 'Tokyo' })).toBeVisible()
      await expect(screen.queryByRole('option', { name: 'Berlin' })).toBeNull()
    })
  },
}

// ---------------------------------------------------------------------------
// State 5 — stale-response discard
// ---------------------------------------------------------------------------

const staleHost = createTrackingHost()

/**
 * **State 5 of 6 — a superseded request's answer is discarded.**
 *
 * `useAsyncOptions` aborts the previous request *before* emitting the next one,
 * which is the composable's stated reason to exist: without it every control would
 * grow its own `latestRequestId` counter. The failure it prevents is the one every
 * remote-search field has shipped at least once — the answer to "a" arrives after
 * the answer to "ab", and the user sees results for a query they have already
 * finished typing.
 *
 * The fence existed and was unit-tested; **no story had ever put two requests in
 * flight**, so nothing demonstrated it. The host here keeps every request, so the
 * walk can answer an abandoned one on purpose and prove the answer is refused.
 *
 * The invariant is asserted rather than a request count: *every request but the
 * newest is aborted*. A count would bind the story to how many times `DzSelect`
 * happens to ask (mount, then open, then once per keystroke) and would go red on
 * any change to that, while saying nothing about the fence.
 */
export const StaleResponseDiscard: Story = {
  name: '5. Stale-response discard',
  render: () => ({
    components: { DzSelect, DzButton },
    setup() {
      staleHost.reset()
      return {
        host: staleHost,
        rows: PEOPLE,
        answerAbandoned: () => staleHost.answerAbandoned(STALE),
      }
    },
    template: `
      <div class="space-y-3 max-w-xs">
        <DzSelect
          searchable
          :items="host.items.value"
          :options-state="host.state.value"
          :options-error="host.error.value"
          placeholder="Search people"
          aria-label="Person"
          @load-options="host.onLoadOptions"
          @retry-options="host.onRetryOptions"
        />
        <div class="flex flex-wrap gap-2" role="group" aria-label="Mock host">
          <DzButton size="sm" variant="outline" @click="host.answerLatest(rows)">Answer latest</DzButton>
          <DzButton size="sm" variant="outline" @click="answerAbandoned()">Answer the abandoned query</DzButton>
        </div>
        <p class="text-sm text-[var(--dz-muted-foreground)]" data-testid="host-log">
          requests: {{ host.requests.value.length }} · options: {{ host.items.value.length }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    await step('two searches, one after the other, put two requests in flight', async () => {
      await openPanel(canvasElement, staleHost)
      const before = staleHost.requests.value.length
      const search = await screen.findByRole('searchbox', { name: 'Filter options' })
      // The search box is inside the panel, so typing does not dismiss it. One
      // request per keystroke, each superseding the last.
      //
      // The query is `ad` rather than any two letters because `searchable` ALSO
      // filters host-supplied items locally (`DzSelect.filteredItems`), so the
      // dataset the host answers with has to match the query the control is
      // holding — which is what a real host returns. See finding `D-RES04-2`
      // below.
      await userEvent.type(search, 'ad')
      await waitFor(() => expect(staleHost.requests.value.length).toBe(before + 2))
      await expect(staleHost.requests.value.at(-1)!.reason).toBe('search')
      await expect(staleHost.requests.value.at(-1)!.query).toBe('ad')
    })

    await step('every request but the newest is aborted, which is the fence', async () => {
      const total = staleHost.requests.value.length
      await waitFor(() => expect(staleHost.aborted()).toBe(total - 1))
      await expect(staleHost.requests.value.at(-1)!.signal.aborted).toBe(false)
    })

    await step('the abandoned query\'s late answer changes nothing at all', async () => {
      await expect(staleHost.answerAbandoned(STALE)).toBe(false)
      await expect(staleHost.items.value).toHaveLength(0)
      await expect(screen.queryByRole('option', { name: /STALE/ })).toBeNull()
      // A refused answer must not resolve the state either.
      await expect(optionsRow()).toHaveAttribute('data-options-state', 'loading')
    })

    await step('the newest request\'s answer is the one that renders', async () => {
      await expect(staleHost.answerLatest(PEOPLE)).toBe(true)
      await waitFor(() => expect(optionsRow()).toBeNull())
      await expect(await screen.findByRole('option', { name: 'Ada Lovelace' })).toBeVisible()
      await expect(screen.queryByRole('option', { name: /STALE/ })).toBeNull()
      // FINDING `D-RES04-2`, pinned rather than fixed: what renders is the host's
      // answer *narrowed again by the live query*. `Grace Hopper` was in the rows
      // the host returned for `ad` and is not on screen, because `searchable`
      // re-applies its own label-substring filter to host-supplied items. The
      // comment on `DzSelect.handleSearch` calls that filter "a no-op" when a host
      // drives the options; it is not. A host that matches on anything but the
      // label — an e-mail, a fuzzy score, a server ranking — has its rows silently
      // hidden. Measured only in the browser lane, because the jsdom twin uses a
      // query its dataset matches. Fixing it means changing what seven published
      // controls render, so it is an owner decision, not a story's to take.
      await expect(screen.queryByRole('option', { name: 'Grace Hopper' })).toBeNull()
    })
  },
}

// ---------------------------------------------------------------------------
// State 6 — the accessible announcement of each
// ---------------------------------------------------------------------------

const a11yHost = createTrackingHost()

/**
 * **State 6 of 6 — every state is announced, and announced politely.**
 *
 * These changes all arrive *after* first paint, so a user who opened a panel and
 * is waiting has no other way to learn that the load finished, failed, or found
 * nothing. `DzOptionsState` is therefore one `role="status"` /
 * `aria-live="polite"` region whose text changes **in place**: the same element
 * for all three states, so an AT announces a *change* rather than the arrival of
 * a new node — and polite rather than assertive, because it is information, not
 * an interruption.
 *
 * The strings come from the application's message catalog (`i18n` group
 * `DzAsyncOptions`), shared by all seven selection controls so a translator
 * writes them once. A host-supplied `options-error` replaces the catalog's
 * generic error, which is the only one of the three a host can improve on.
 */
export const Accessibility: Story = {
  name: '6. Accessible announcement of each state',
  render: selectStory(a11yHost),
  play: async ({ canvasElement, step }) => {
    let firstRow: HTMLElement | null = null

    await step('the region is a polite live region', async () => {
      await openPanel(canvasElement, a11yHost)
      firstRow = optionsRow()
      await expect(firstRow).toHaveAttribute('role', 'status')
      await expect(firstRow).toHaveAttribute('aria-live', 'polite')
      await expect(announcement()).toBe('Loading options')
    })

    await step('the empty state announces its own message in the same region', async () => {
      await expect(a11yHost.answerLatest([])).toBe(true)
      await waitFor(() => expect(announcement()).toBe('No options found'))
      // The same element, re-texted — not a new node an AT would have to discover.
      await expect(optionsRow()).toBe(firstRow)
    })

    await step('the error state announces what the host said, and names one control', async () => {
      a11yHost.fail('The directory did not answer')
      await waitFor(() => expect(announcement()).toBe('The directory did not answer'))
      await expect(optionsRow()).toBe(firstRow)
      const retry = optionsRow()!.querySelector<HTMLElement>('[data-part="options-retry"]')
      await expect(retry).toHaveAccessibleName('Try again')
    })

    await step('and the region disappears once there is a list to read instead', async () => {
      await expect(a11yHost.answerLatest(PEOPLE)).toBe(true)
      await waitFor(() => expect(optionsRow()).toBeNull())
    })
  },
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

/**
 * The three rows the seam can render, side by side and with no interaction — the
 * states as a reader sees them rather than as a walk drives them. Each select is
 * given a state directly, which is what a host does.
 */
export const StatesMatrix: Story = {
  name: 'States Matrix',
  render: () => ({
    components: { DzSelect, DemoSection },
    setup() {
      return {
        errorMessage: 'The directory did not answer',
      }
    },
    template: `
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DemoSection label="Loading" class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
          <DzSelect :items="[]" options-state="loading" placeholder="Loading" aria-label="Loading example" />
        </DemoSection>
        <DemoSection label="Empty result" class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
          <DzSelect :items="[]" options-state="empty" placeholder="Empty" aria-label="Empty example" />
        </DemoSection>
        <DemoSection label="Error with retry" class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] p-4">
          <DzSelect :items="[]" options-state="error" :options-error="errorMessage" placeholder="Error" aria-label="Error example" />
        </DemoSection>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

/**
 * The seam's error row in dark mode.
 *
 * The panel portals to `document.body`, so this story also sets the `theme`
 * global: `darkModeDecorator` themes a wrapper `<div>` and a portalled panel
 * escapes it, which is the known blind spot `validate:story-dod` records.
 */
export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  globals: { theme: 'dark' },
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzSelect },
    setup() {
      return { errorMessage: 'The directory did not answer' }
    },
    template: `
      <div class="max-w-xs">
        <DzSelect
          :items="[]"
          options-state="error"
          :options-error="errorMessage"
          placeholder="Pick a person"
          aria-label="Person"
        />
      </div>
    `,
  }),
}
