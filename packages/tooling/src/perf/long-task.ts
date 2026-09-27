/**
 * Long-task accounting (TASK-R2-O7).
 *
 * Doc 06 §Performance asks for a long-task budget: work that occupies the main
 * thread for more than 50 ms, which is the point at which an interaction stops
 * feeling like a direct manipulation. It is the second failure class a size
 * budget cannot see — a component can be small, mount fast on average, and
 * still freeze the tab for 300 ms on the keystroke that opens its menu.
 *
 * **Why this is not `PerformanceObserver({ entryTypes: ['longtask'] })`.** That
 * API exists only in a browser, and only for tasks the *browser's* scheduler
 * ran; jsdom has neither the entry type nor a scheduler to report on. Using it
 * would mean a lane that silently observes nothing, which is worse than no
 * lane — the repository has an explicit rule against evidence that passes
 * vacuously (`expectRtlComputed` throws rather than passing when jsdom cannot
 * resolve layout).
 *
 * **What is measured instead, stated precisely.** A *step* is one scripted
 * action plus the synchronous work Vue does for it before control returns:
 * dispatch an event, flush, read the clock. In a single-threaded runtime that
 * span **is** the task — it is the interval during which nothing else, paint
 * included, could have run. The lane reports the count of steps over the 50 ms
 * budget and the worst span, and the count is the metric: on a contended host
 * the duration is partly the machine, but "some single action blocked past the
 * responsiveness budget" survives contention far better than the millisecond
 * does. The 9-of-11 `variance-exceeds-signal` verdicts in the committed runtime
 * baselines are the evidence for preferring the count.
 *
 * The honest limits, so nobody over-reads the number: jsdom does no layout and
 * no paint, so this sees script cost only. A step that is cheap here can still
 * be a long task in a browser through style recalculation. This lane is a floor
 * — what it finds is real; what it misses is the browser lane's job.
 *
 * @module @dzup-ui/tooling/perf/long-task
 */

/** The responsiveness budget, in milliseconds (RAIL / Long Tasks API). */
export const LONG_TASK_MS = 50

/** One scripted step and what it cost. */
export interface TaskSpan {
  readonly label: string
  readonly ms: number
}

export interface LongTaskReport {
  readonly spans: readonly TaskSpan[]
  /** Spans over {@link LONG_TASK_MS}. This is the recorded metric. */
  readonly over: readonly TaskSpan[]
  /** The worst span, or `undefined` when nothing ran. */
  readonly worst: TaskSpan | undefined
  readonly totalMs: number
}

/**
 * A recorder a scripted interaction hands its steps to.
 *
 * `step()` times one action. It deliberately awaits the action *inside* the
 * measured span: an interaction whose cost is deferred to a microtask is still
 * an interaction the user waited for, and stopping the clock at the `await`
 * would hide exactly the cost that the async paths in this catalogue carry.
 */
export function longTaskRecorder(): {
  step: <T>(label: string, action: () => T | Promise<T>) => Promise<T>
  report: () => LongTaskReport
} {
  const spans: TaskSpan[] = []

  return {
    async step<T>(label: string, action: () => T | Promise<T>): Promise<T> {
      const start = performance.now()
      try {
        return await action()
      }
      finally {
        spans.push({ label, ms: performance.now() - start })
      }
    },
    report(): LongTaskReport {
      const over = spans.filter(span => span.ms > LONG_TASK_MS)
      const worst = spans.reduce<TaskSpan | undefined>(
        (best, span) => (best === undefined || span.ms > best.ms ? span : best),
        undefined,
      )
      return {
        spans: [...spans],
        over,
        worst,
        totalMs: spans.reduce((sum, span) => sum + span.ms, 0),
      }
    },
  }
}

/** A failure message that names the steps, not just the count. */
export function describeLongTasks(report: LongTaskReport): string {
  if (report.over.length === 0) {
    return report.worst === undefined
      ? 'no steps recorded'
      : `0 over ${LONG_TASK_MS}ms (worst ${report.worst.label} ${report.worst.ms.toFixed(1)}ms)`
  }
  return `${report.over.length} over ${LONG_TASK_MS}ms: ${
    report.over.map(span => `${span.label} ${span.ms.toFixed(1)}ms`).join(', ')}`
}
