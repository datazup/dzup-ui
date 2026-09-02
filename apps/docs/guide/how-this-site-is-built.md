---
title: How this site is built
description: What is generated, what is hand-written, and what makes the build fail.
---

# How this site is built

This site is a **renderer**. Almost nothing on it is written by a person, and the
parts that are, are kept in separate files so the boundary is visible.

## Generated

- Every component page under `/components/`, including its prop, event, slot and
  expose tables, its taxonomy line, its v-model bindings, its declared anatomy
  parts, its usage snippet, its per-page fidelity block and its
  *Accessibility and evidence* section.
- The component roster at `/components/`.
- Every page under `/evidence/`, including the two statements — their prose is
  authored, and every number in them is read from an artifact at build time.
- The sidebar and its family grouping.

The API tables are projected from `packages/core/docs/component-meta.json` by
`yarn generate:docs-pages`. The body of each component page is rendered by the
same function that renders `llms-full.txt`, so the two cannot diverge. The
evidence sections and the `/evidence/` pages are projected from the quality
matrix, the capability matrix, the assistive-technology scaffold and the
measured-deviation registers, which are listed with their SHA-256 at the foot of
each evidence page.

## Hand-written

- The guide pages you are reading.
- Optional per-component usage prose in `apps/docs/components/_usage/<Name>.md`,
  merged into the generated page under a *Usage notes* heading. Prose only — a
  hand-typed API table would be the exact defect this arrangement exists to
  prevent.

## What makes the build fail

Staleness checks on three axes, plus three agreement checks:

1. **Artifact vs source.** Before any page is written, the generator re-extracts
   every component from source and compares the result against the committed
   metadata artifact. If they disagree, nothing is generated and the site build
   stops. This reuses the repository's existing `validate:component-meta`
   freshness clause rather than re-implementing it.
2. **Pages vs artifact.** The generated navigation records the SHA-256 of the
   artifact the pages were rendered from. If the artifact has moved since, the
   VitePress config throws before the first page is compiled.
3. **Pages vs the evidence artifacts.** The same fingerprint, applied to every
   artifact the evidence layer reads. An artifact that has changed — or appeared,
   or vanished — invalidates the render, because the absence of a measurement is
   itself something these pages print.
4. **The two matrices must agree.** The capability summary carried in the
   metadata artifact is compared against the capability matrix it was joined
   from, component by component. If one has been regenerated and the other has
   not, nothing is generated.
5. **The screen-reader summary must not overstate the raw records.** If the
   summary cell for a component claims more than its append-only run rows
   support, the generator refuses. See
   [why](/evidence/accessibility#why-this-site-reads-the-raw-scaffold-and-not-the-summary-cell).
6. **The dragging-movements audit must cover exactly the components that drag.**
   The audit is bound to the generated `drags` trait, so a new drag surface
   cannot appear without the conformance statement being revisited.

A dead internal link also fails the build.

## What this site does not claim

- **It is not versioned.** It publishes the tip of `main`. A versioning story
  follows the library's release policy, which is not yet stated.
- **The evidence it publishes is locally qualified.** Every state under
  [Evidence](/evidence/) was produced by a local run on a developer machine
  against a working tree carrying uncommitted work. It is not
  continuous-integration evidence, not release evidence and not production
  evidence, and it is not a conformance claim. That sentence is printed on every
  page that carries a measurement, not only here.
- **It has no live playground yet.** Usage snippets are real story source, shown
  as code.
