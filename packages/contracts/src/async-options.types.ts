/**
 * The async-options seam — clause C9 of the renderer-facing control contract
 * (TASK-FORM-OSS-03).
 *
 * Seven Core controls choose from a set of options, and until now every one of
 * them took a static array. A form renderer whose options come from a remote
 * source therefore had nowhere to put "loading", "that failed", or "there is
 * nothing to show", and no way to say "stop, the user typed something else".
 * Left to each control, that would have become seven conventions and seven
 * adapters in the renderer's registry.
 *
 * **What Core owns and what it does not.** Core owns the *surface*: the state a
 * control displays, the rows it renders for each state, the announcement, and
 * the request it emits. Core never performs the request. No URL, no credential,
 * no `fetch` — the host owns execution, cancellation policy, sequence fencing
 * and caching (form spec 04 §5 and 06). A control that fetched its own options
 * would be a control an application cannot secure.
 *
 * @module @dzup-ui/contracts/async-options
 */

/**
 * Where a control's option set currently is.
 *
 * Five states rather than a boolean, because "loading" and "empty" and "that
 * failed" need different rows, different announcements, and — for `error` —
 * a way back. A boolean `loading` collapses the last three into "not loading",
 * which is how a failed load comes to look identical to a successful one that
 * returned nothing.
 *
 * - `idle` — nothing has been requested yet. The control has not been opened.
 * - `loading` — a request is in flight. Focus stays where it is.
 * - `ready` — options are current.
 * - `empty` — the request succeeded and matched nothing. Not an error.
 * - `error` — the request failed. `optionsError` says why; retry is offered.
 */
export type AsyncOptionsState = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

/**
 * Why a control is asking for options.
 *
 * - `open` — the panel was opened and has no current options.
 * - `search` — the user typed in the control's search field.
 * - `more` — the user reached the end of the list and more may exist.
 */
export type LoadOptionsReason = 'open' | 'search' | 'more'

/**
 * The request a control emits when it needs options.
 *
 * The `signal` is the control's, and the control aborts it before emitting the
 * next request. A host that ignores it gets stale results and has to fence them
 * itself; a host that honours it gets cancellation for free.
 */
export interface LoadOptionsRequest {
  /** The current search text, or `''` when the reason is not `search`. */
  readonly query: string
  /** Why the control is asking. */
  readonly reason: LoadOptionsReason
  /** Aborted when the control supersedes this request. */
  readonly signal: AbortSignal
}

/**
 * Props a control accepts to be driven by a remote option source.
 *
 * All optional: a control given none of them behaves exactly as it did with a
 * static `options`/`items` array, which is what keeps this additive.
 */
export interface AsyncOptionsProps {
  /**
   * Where the option set is. Omitted means the options are static and the
   * control renders no state rows at all.
   */
  optionsState?: AsyncOptionsState
  /**
   * Why the load failed, shown in the error row. Ignored unless
   * `optionsState` is `'error'`.
   */
  optionsError?: string
  /**
   * Whether to offer a retry control in the error row.
   *
   * Defaults to true when `optionsState` can be `'error'`. Set false when the
   * host retries on its own and a button would be a second, competing path.
   */
  optionsRetryable?: boolean
}

/**
 * Events a control emits for a remote option source.
 *
 * Spelled as an interface so a component's own `Emits` can extend it and keep
 * the payload identical across all seven controls.
 */
export interface AsyncOptionsEmits {
  /** The control needs options. See {@link LoadOptionsRequest}. */
  loadOptions: [request: LoadOptionsRequest]
  /** The user asked to try again after an error. */
  retryOptions: []
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

/** What a file reference's upload is doing. */
export type DzFileRefStatus = 'pending' | 'uploaded' | 'failed'

/**
 * A file as it appears in a form value.
 *
 * The form document is persisted JSON (form spec 03), so a `File` in the model
 * is either serialized into nothing or lost on reload — and it leaks a live
 * handle into a builder preview. The reference is what gets stored; the binary
 * travels through an event to the host, which uploads it and reports back.
 *
 * Every field is JSON-serializable, and the shape is stable enough to be a
 * schema: `id` is the host's handle for the uploaded object, and the rest is
 * what a UI needs to render the row without asking anybody.
 */
export interface DzFileRef {
  /** Stable identifier. The host's handle once uploaded; a local id before. */
  id: string
  /** File name as the user sees it. */
  name: string
  /** Size in bytes. */
  size: number
  /** MIME type, or `''` when the browser reported none. */
  type: string
  /** Where the upload is. */
  status: DzFileRefStatus
  /** Why it failed. Present only when `status` is `'failed'`. */
  error?: string
}

/**
 * The request a file control emits so the host can perform an upload.
 *
 * The `File` is here and **only** here — never in the model. `ref` is the entry
 * already in the model, which the host updates in place as the upload
 * progresses.
 */
export interface UploadRequest {
  /** The binary. Does not appear in the control's value. */
  readonly file: File
  /** The reference already present in the model, awaiting a status. */
  readonly ref: DzFileRef
  /** Aborted when the control supersedes or removes this upload. */
  readonly signal: AbortSignal
}
