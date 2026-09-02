/**
 * The authored policy prose the evidence pages are built around (TASK-N2-D2).
 *
 * The task separates two things deliberately. Evidence is **data** and is
 * rendered from artifacts. A *statement* — where the library stands on styling,
 * what it is willing to claim about browsers — is **policy**, and policy is
 * written by a person. This module is the only hand-written prose in the
 * evidence layer, kept in one file for the same reason `llms-content.ts` is: so
 * that "how much of this is unverifiable assertion" has a file-sized answer.
 *
 * ## The rule this file is under
 *
 * **No metric appears in this prose.** Engine versions, layer names, pilot
 * counts, cell counts, component counts — every one of them is read from a
 * generated artifact by `evidence-pages.ts` and composed into the page around
 * these paragraphs. A hand-typed number in a published statement is the class
 * this program has now found five times (README exports, phantom token exports,
 * the MCP server version, story-vs-source defaults, install snippets), and the
 * fifth was found by a lint rule that would have silently made a documented
 * install order wrong.
 *
 * `statements.spec.ts` enforces it: every digit run and every English number
 * word in every string below must appear in {@link PROSE_LITERAL_ALLOWLIST}
 * with a reason. The residual hazard the scan cannot see is a spelled-out
 * quantity written as something else ("a handful", "most"), so those are
 * avoided by construction rather than by gate — where a quantity matters, the
 * renderer supplies it.
 *
 * @module @dzup-ui/tooling/docs/statements
 */

/**
 * Literals allowed to appear in the prose below, each with the reason it is not
 * a metric.
 *
 * A metric is something that can change without anyone editing this file. An
 * ADR number and a specification version cannot: they are names.
 */
export const PROSE_LITERAL_ALLOWLIST: Readonly<Record<string, string>> = {
  'ADR-19': 'The name of the styling-contract ADR. A name, not a count.',
  'ADR-20': 'The name of the provider-contract ADR.',
  'WCAG 2.2': 'The version of the specification being conformed to. Fixed by the W3C, not by this repository.',
  '0.x': 'The semver range the library is in. A policy statement, not a measurement.',
  '2.5.7': 'A WCAG success-criterion identifier. An identifier, not a count.',
  '2.1.1': 'A WCAG success-criterion identifier.',
}

/** One authored statement: a title, a summary line, and named prose blocks. */
export interface StatementProse {
  title: string
  description: string
  blocks: Readonly<Record<string, readonly string[]>>
}

// ---------------------------------------------------------------------------
// The styling posture
// ---------------------------------------------------------------------------

/**
 * "Restyleable by contract, not unstyled."
 *
 * The corrected rationale from the 2026-08-28 program reassessment,
 * `01-plan-challenge.md` §A6: the earlier fallback position — *"core primitives
 * remain the supported headless escape hatch"* — contradicted the library's own
 * rule that the underlying primitives are not public ABI. The refusal to ship an
 * unstyled mode stands; the reason for it changed.
 */
export const STYLING_POSTURE: StatementProse = {
  title: 'Styling posture',
  description:
    'Where dzup-ui stands on unstyled mode, and what "restyleable by contract" obliges the library to keep stable.',
  blocks: {
    position: [
      'dzup-ui is **restyleable by contract, not unstyled**.',
      '',
      'The library ships opinionated styling and a named, versioned surface for replacing it. It does',
      'not ship an unstyled or headless mode, and it does not intend to. That is a position, not a',
      'backlog item.',
    ],

    // The correction the reassessment made, stated plainly rather than quietly adopted.
    whyCorrected: [
      '## Why the earlier answer was wrong',
      '',
      'The position this replaces said that if you wanted headless components you could reach past the',
      'styling to the primitives underneath, and that this was the supported escape hatch. That',
      'contradicted the library\'s own rule that those primitives are not part of its public interface.',
      'A support promise and a "do not depend on this" warning cannot both be true of the same code.',
      '',
      'So the escape hatch moved out of the library rather than being deleted. If you want headless',
      'primitives, use [Reka UI](https://reka-ui.com) directly. That is a real, well-maintained,',
      'accessible answer to the question — it is simply not an answer dzup-ui can support for you,',
      'because the moment it did, every internal refactor would become a breaking change for somebody.',
      '',
      'The refusal did not change. The reason did, and the reason is what a consumer has to be able to',
      'check.',
    ],

    contract: [
      '## What "by contract" obliges',
      '',
      'A restyling surface is only worth anything if it is stable, so each layer below is something the',
      'library commits to keeping — and something a consumer can point at when it moves.',
    ],

    cascade: [
      '## Library CSS always loses',
      '',
      'Everything the library emits sits inside cascade layers. Unlayered author CSS beats every',
      'layered rule regardless of specificity, so your stylesheet wins by default: no `!important`, no',
      'specificity war, no `:where()` tricks. This is the part of the contract that costs a consumer',
      'nothing to use and is the reason an unstyled mode buys less than it appears to.',
    ],

    notClaimed: [
      '## What this statement does not claim',
      '',
      '- **The contract is specified but not accepted.** ADR-19 is still *Proposed*; accepting it is an',
      '  owner decision. Its mechanisms are shipped and load-bearing today, which is a weaker thing',
      '  than a ratified contract and is stated here rather than glossed.',
      '- **Declaring an anatomy is a rollout, not a fact about every component.** A component page shows',
      '  its parts when it has declared them and says nothing when it has not. *Has not declared parts*',
      '  is not *has no parts*, and this site does not collapse them.',
      '- **The typed override prop is a pilot.** It is on the components named in the table above and',
      '  nowhere else.',
      '- **Class names are not in the contract.** They are output of the recipe engine and carry no',
      '  stability promise. Use a token re-map, then the override prop, then a part selector — in that',
      '  order.',
      '- **The library is pre-release.** Under 0.x the surfaces above can still move; what this statement',
      '  fixes is *which* surfaces are the ones to depend on, not that they are frozen.',
    ],
  },
}

// ---------------------------------------------------------------------------
// Browser support
// ---------------------------------------------------------------------------

/**
 * The browser-support statement.
 *
 * Written against a repository that declares **no** browser target: there is no
 * `browserslist`, no build `target`, and no Baseline tier anywhere in it. So the
 * statement says what is measured, says what is not, and marks the target itself
 * as an owner decision rather than inventing one.
 */
export const BROWSER_SUPPORT: StatementProse = {
  title: 'Browser support',
  description:
    'What dzup-ui has actually been measured in, what that measurement is worth, and what it is not.',
  blocks: {
    position: [
      'dzup-ui is measured in each major engine, on every rendering condition the matrix defines,',
      'against every interactive component the lane can drive. Those numbers are below and they are',
      'generated.',
      '',
      'What follows them matters as much: the measurement is a local run, the engines are Playwright',
      'builds rather than the browsers you ship to, and the library declares no supported-browser',
      'floor at all.',
    ],

    whatRuns: [
      '## The engine lane',
      '',
      'Each engine is driven across the same conditions against the same targets, so a cell is a real',
      'component rendered in a real engine under a real condition — not a feature-detection table.',
      'The conditions exist because they are where component libraries actually break: forced colours,',
      'reduced motion, right-to-left, coarse pointers and heavy zoom.',
    ],

    webkit: [
      '## What the WebKit lane is, and what it is not',
      '',
      '::: danger Not Safari evidence',
      'The WebKit engine used here is Playwright\'s own build. On Windows that is the WinCairo port,',
      'and it reports a macOS user-agent string while being neither macOS nor Safari. It shares WebKit',
      'with Safari and it is genuinely useful for catching engine-level divergence — but Safari has its',
      'own process model, its own media stack and its own accessibility bridge, and none of them are in',
      'this lane.',
      '',
      '**No result on this page is evidence about Safari.** A Safari claim needs a run on macOS, and no',
      'such run has happened.',
      ':::',
    ],

    history: [
      '## How the current numbers came to be, including the part that was wrong',
      '',
      'The lane did not start green, and the record of how it got there is published rather than',
      'summarised, because a clean table with no history is the easiest kind of evidence to fake.',
      '',
      'A cross-engine ledger of measured failures was accumulated first, all of them WCAG 2.2',
      'target-size and reflow defects. Parts of that record then turned out to be wrong. The surviving',
      'chromium record covered only some of the conditions — an ordinary partial re-run had overwritten',
      'the full sweep before it, so the failure count had always been a partial number rather than the',
      'total it was read as. And a share of the reflow entries turned out to be a harness defect: the',
      'test canvas was',
      'sized by the story\'s content rather than being given a narrow containing block, so the condition',
      'was not measuring reflow at all.',
      '',
      'Both were fixed, the remaining defects were fixed at the token and recipe layer, and every engine',
      'was then re-run across every condition. The ledger is now empty. It is a ratchet, not a clean',
      'slate: an entry can only be removed with a measured number, and can only be added back with',
      'another.',
    ],

    baseline: [
      '## The supported-browser floor is undecided',
      '',
      '::: warning `[!owner]` — no browser target is declared anywhere in this repository',
      'There is no `browserslist`, no build `target`, and no declared Baseline tier in any package.',
      'The build has never been asked to down-level anything for a named browser range, and no',
      'published document says which browsers are supported.',
      '',
      'Adopting **Baseline Widely Available** — the interoperability tier a feature reaches once it has',
      'shipped in every major engine and stayed there for the Baseline waiting period — is the natural',
      'answer, and it is close to what the engine lane already demonstrates in practice. But it is a',
      'commitment, not a measurement: it would oblige the library to refuse features below the tier and',
      'to gate that refusal. **This page will not claim a tier the repository does not declare.**',
      '',
      'Deciding it, declaring it in the packages, and adding the gate that keeps it true is an owner',
      'action. Until then, the honest statement of browser support is the measured lane above and',
      'nothing beyond it.',
      ':::',
    ],

    notMeasured: [
      '## What is not measured',
      '',
      '- **Real Safari, on real macOS or iOS.** See above.',
      '- **Real mobile browsers.** The touch condition emulates a coarse pointer in a desktop engine.',
      '  It is not a device.',
      '- **Continuous integration.** These runs happened on a developer machine. Nothing on this page is',
      '  a CI result, and the lane has never gated a merge.',
      '- **Screen readers.** Assistive-technology behaviour is a separate matrix, and it is unrun.',
      '- **Content-Security-Policy acceptance.** The security specs prove which constructs are emitted;',
      '  no browser has been asked whether it accepts them under a strict policy.',
    ],
  },
}

// ---------------------------------------------------------------------------
// Accessibility conformance
// ---------------------------------------------------------------------------

/**
 * The accessibility conformance statement.
 *
 * The one thing this page must not do is publish a conformance badge. The
 * library has an open, measured, level-AA gap and an entirely unrun
 * screen-reader matrix, and both are stated before anything green is.
 */
export const ACCESSIBILITY_STATEMENT: StatementProse = {
  title: 'Accessibility conformance',
  description:
    'What dzup-ui has measured against WCAG 2.2, the gap that is still open, and the screen-reader matrix that has not been run.',
  blocks: {
    position: [
      'dzup-ui does not claim WCAG 2.2 AA conformance, and this page exists so that you can see exactly',
      'why not and decide for yourself what the remainder is worth.',
      '',
      'A component library cannot conform on its own in any case — conformance is a property of a page,',
      'and most of a page is yours. What a library can do is measure the criteria it is able to fail,',
      'publish the result per component including the failures, and say plainly which criteria nothing',
      'has measured. That is what the component pages do.',
    ],

    open: [
      '## The open gap',
      '',
      'A success criterion is measured as **not met**. It is stated before any total, because a summary',
      'that leads with what passed is how an open defect becomes invisible.',
    ],

    at: [
      '## The screen-reader matrix has not been run',
      '',
      '::: danger Nothing here has been driven with a screen reader',
      'The assistive-technology matrix is a scaffold: every component that owes a manual run has a row',
      'for every declared assistive-technology and browser pairing, every row is `unrun`, and `unrun`',
      'means the pairing was not available and was not attempted. It does **not** mean the component',
      'was tried and behaved.',
      '',
      'Executable scripts exist for the highest-risk components — the story to open, the keys to press,',
      'and the announcement each step must produce, derived from the pattern rather than from what the',
      'component currently does, so that a real defect is recorded as a failure instead of being',
      'written into the expectation. What does not exist is a named tester and a cadence, and neither',
      'is something a generator can supply.',
      ':::',
    ],

    cellDefect: [
      '## Why this site reads the raw scaffold and not the summary cell',
      '',
      '::: warning A known defect in the summariser, disclosed rather than inherited',
      'The capability matrix carries a summary cell per component for the screen-reader lane. Its',
      'resolution counts rows that are not `unrun` and never inspects what they say — so a component',
      'whose every pairing had **failed** would be summarised as a pass. The cell state type has no',
      '`fail` value at all, so repairing it is a schema change several tools read, and it is an owner',
      'decision rather than something a documentation packet may do quietly.',
      '',
      'It is latent today only because nothing has been executed. Rather than wait for it to become',
      'visible, the pages on this site read the append-only scaffold rows directly, and the generator',
      'refuses to build a page whose summary cell claims more than those rows support.',
      ':::',
    ],

    keyboard: [
      '## Keyboard tables are not yet derived',
      '',
      'Every component page has a keyboard section, and on every component page it says *not yet',
      'derived*. That is deliberate.',
      '',
      'The repository can measure *that* a specification asserts key handling; it has nowhere to record',
      '*which* key does *what*. Writing those tables by hand would produce the most quoted, least',
      'checkable content on the site — and the first time a key binding changed, the table would be',
      'wrong with nothing to catch it. So each page links the pattern it is held to, states what has',
      'actually been measured, and leaves the table unwritten until there is somewhere to derive it',
      'from.',
      '',
      'An honest gap is worth more than a plausible table.',
    ],

    scope: [
      '## What "in scope" means on a component page',
      '',
      'Each component lists the success criteria **it can fail**, derived from its risk tier and the',
      'behaviours it declares. Criteria that belong to a page rather than to a component — bypass',
      'blocks, page titles, document language, consistent navigation — are deliberately absent: they',
      'are yours, and listing them here would bury the ones that are ours.',
      '',
      'A criterion in that list has **not** been verified by appearing there. Verification is the',
      'evidence table underneath it, cell by cell, including the cells that say `unrun`.',
    ],
  },
}

// ---------------------------------------------------------------------------
// The evidence hub
// ---------------------------------------------------------------------------

/** The landing page for the evidence section. */
export const EVIDENCE_INDEX: StatementProse = {
  title: 'Evidence',
  description:
    'What has been measured about dzup-ui, what has not, and where each number comes from.',
  blocks: {
    position: [
      'Most component libraries describe themselves as accessible and tested. This section is the',
      'attempt to publish the underlying measurements instead, including the ones that came out badly',
      'and those that have not been taken at all.',
      '',
      'Everything here is generated from artifacts in the repository. Nothing on these pages is typed',
      'by hand, no state is rounded up, and no absence is hidden: a requirement nothing has measured',
      'renders as `unrun`, in the same table and with the same weight as a requirement that passed.',
    ],

    howToRead: [
      '## How to read a state',
      '',
      '| State | What it means |',
      '| --- | --- |',
      '| `pass` | A lane ran against this component and passed. |',
      '| `present` | An artifact exists and is bound to this component. It exists; it is not a result. |',
      '| `stale` | The artifact exists but predates the component\'s last change, so it describes older behaviour. |',
      '| `excepted` | The requirement was waived, with a recorded reason that travels with the row. |',
      '| `unrun` | **Nothing has measured it.** Not a pass, not a failure, not an oversight — an absence. |',
      '',
      'There is no state meaning "failed". That is a real limitation of the matrix schema rather than a',
      'claim that nothing fails, and where a measured failure exists it is published as its own record',
      'rather than squeezed into a cell that cannot hold it.',
    ],

    admissibility: [
      '## What this evidence is admissible for',
      '',
      'It is **locally qualified**: produced by local runs on a developer machine, against a working',
      'tree carrying uncommitted work. That makes it useful for judging the library and useless as a',
      'compliance record.',
      '',
      'It is not continuous-integration evidence — no gate in a pipeline produced any of it. It is not',
      'release evidence — nothing here is bound to a published version. It is not production evidence.',
      'Those are the distinctions the library refuses to blur, and they are printed on every page',
      'rather than confined to this page.',
    ],
  },
}
