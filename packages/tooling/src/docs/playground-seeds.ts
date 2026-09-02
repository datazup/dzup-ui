/**
 * playground-seeds.ts — TASK-N2-D3.
 *
 * Builds `apps/docs/public/playground/seeds.json`: for every public component
 * that has one, the SFC a playground opens with.
 *
 * **Every byte of the `<template>` in a seed is a story file's own bytes.** The
 * only thing this module writes is the `<script setup>` import line, which
 * Storybook supplies through the story's `components:` option and a plain Vue
 * sandbox has to be told. That wrapper is `wrapStoryTemplate()` in
 * `packages/tooling/src/playground/playground-contract.ts`, and the component
 * names it imports are read out of the template, never chosen.
 *
 * Why a separate artifact instead of inlining the seed into the page markdown:
 *
 *   - **Size.** Every byte in a page is a byte in the 20.67 MB static build and
 *     a byte in the offline MiniSearch index, which TASK-N2-D2's F-10 already
 *     measured doubling to 1,542,784 B because evidence headings are indexed.
 *     Nobody searches for `<script setup lang="ts">`.
 *   - **Isolation.** The requirement is that non-playground pages do not pay the
 *     playground's cost. A seed fetched on demand by name is not in any page's
 *     bundle; a seed inlined in 144 pages is in all of them.
 *
 * It is produced by `buildDocsPages()` like every other generated file, so the
 * freshness gate, the orphan sweep, the nav fingerprint and
 * `yarn validate:docs-pages` all cover it with no second generator — D1 §14's
 * rule, restated by D2 §14 rule 2.
 */
import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import type {
  PlaygroundSeed,
  PlaygroundSeeds,
  SeedRefusal,
} from '../playground/playground-contract.ts'
import {
  componentTagsIn,
  PLAYGROUND_SEEDS_SCHEMA_VERSION,
  wrapStoryTemplate,
} from '../playground/playground-contract.ts'
import { publicComponents } from './docs-pages.ts'

export type { PlaygroundSeed, PlaygroundSeeds, SeedRefusal }

/**
 * Component tags a template opens that the library does not export.
 *
 * A story may compose a bare HTML wrapper or a locally-defined helper; importing
 * a name `@dzup-ui/core` does not export would make the sandbox throw on load
 * rather than render. The artifact is the authority on what is exported —
 * constraint **B9**, and the reason this reads `artifact.components` instead of
 * matching a `Dz` prefix (**B12**).
 */
export function unexportedTags(
  tags: readonly string[],
  artifact: ComponentMetaArtifact,
): string[] {
  const known = new Set(artifact.components.map(c => c.name))
  return tags.filter(tag => !known.has(tag))
}

/**
 * The seed for one component, or the MEASURED reason there is none.
 *
 * One function returns both, deliberately: a caller that asked "is there a
 * seed?" and a caller that asked "why not?" answering from two code paths is
 * how a page comes to print a reason that is not the reason. Three pages did
 * exactly that before this was written — see `SeedRefusalReason`.
 */
export function seedOrRefusal(
  record: ComponentMetaRecord,
  artifact: ComponentMetaArtifact,
): { seed: PlaygroundSeed } | { refusal: SeedRefusal } {
  const runnable = record.stories?.runnable
  const file = record.stories?.file
  if (file === undefined)
    return { refusal: { reason: 'no-stories-file' } }
  if (runnable?.template === undefined)
    return { refusal: { reason: 'no-runnable-story', file } }

  const tags = componentTagsIn(runnable.template)
  // A template that opens no component tag at all renders nothing a reader would
  // recognise as this component; that is not a playground, it is an empty box.
  if (tags.length === 0)
    return { refusal: { reason: 'no-component-tag', file } }
  // A tag the library does not export cannot be imported, and guessing where it
  // comes from would be synthesis.
  const unexported = unexportedTags(tags, artifact)
  if (unexported.length > 0)
    return { refusal: { reason: 'unexported-tags', file, tags: unexported } }

  return {
    seed: {
      code: wrapStoryTemplate(tags, runnable.template),
      storyId: runnable.id,
      ...(runnable.name === undefined ? {} : { storyName: runnable.name }),
      storyFile: file,
      storyLines: runnable.lines,
    },
  }
}

/** The seed for one component, or `undefined` when no story qualifies. */
export function seedFor(
  record: ComponentMetaRecord,
  artifact: ComponentMetaArtifact,
): PlaygroundSeed | undefined {
  const result = seedOrRefusal(record, artifact)
  return 'seed' in result ? result.seed : undefined
}

/**
 * One seeded component per family, alphabetically first within each, families
 * in the order the components appear in the artifact.
 *
 * Derived rather than curated — see the field's doc comment for why a
 * hand-picked list of "good examples" is the wrong shape here.
 */
export function pickRepresentatives(
  pub: readonly ComponentMetaRecord[],
  seeded: ReadonlySet<string>,
): string[] {
  const byFamily = new Map<string, string>()
  for (const record of pub) {
    if (!seeded.has(record.name))
      continue
    const current = byFamily.get(record.family)
    if (current === undefined || record.name.localeCompare(current) < 0)
      byFamily.set(record.family, record.name)
  }
  return [...byFamily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, name]) => name)
}

/** The whole seeds artifact, deterministic and sorted. */
export function buildPlaygroundSeeds(artifact: ComponentMetaArtifact): PlaygroundSeeds {
  const seeds: Record<string, PlaygroundSeed> = {}
  const refusals: Record<string, SeedRefusal> = {}
  const withoutSeed: string[] = []
  const pub = publicComponents(artifact)
  for (const record of pub) {
    const result = seedOrRefusal(record, artifact)
    if ('seed' in result) {
      seeds[record.name] = result.seed
    }
    else {
      withoutSeed.push(record.name)
      refusals[record.name] = result.refusal
    }
  }
  return {
    schemaVersion: PLAYGROUND_SEEDS_SCHEMA_VERSION,
    generatedFrom: 'packages/core/docs/component-meta.json',
    sourceCommit: artifact.sourceCommit,
    totals: {
      publicComponents: pub.length,
      withSeed: Object.keys(seeds).length,
      withoutSeed: withoutSeed.sort(),
    },
    representatives: pickRepresentatives(pub, new Set(Object.keys(seeds))),
    seeds: Object.fromEntries(Object.entries(seeds).sort(([a], [b]) => a.localeCompare(b))),
    refusals: Object.fromEntries(Object.entries(refusals).sort(([a], [b]) => a.localeCompare(b))),
  }
}

/**
 * Components whose page claims a playground.
 *
 * `renderPlayground()` emits the `<DzPlayground>` tag from `stories.runnable`;
 * this derives the set from the *seeds*, which apply two further rules. If the
 * two ever disagree a page promises a playground the site cannot serve, so
 * `validate:docs-pages` compares them. That is the same defect shape as D1's
 * missing-page clause, one level down.
 */
export function componentsWithSeed(seeds: PlaygroundSeeds): Set<string> {
  return new Set(Object.keys(seeds.seeds))
}

/**
 * The measured refusal for every public component that has no seed.
 *
 * The renderer takes this map rather than re-deriving the reason from the
 * record, which is the whole point: exactly one place decides, and the page
 * prints what it decided.
 */
export function refusalsOf(seeds: PlaygroundSeeds): ReadonlyMap<string, SeedRefusal> {
  return new Map(Object.entries(seeds.refusals))
}
