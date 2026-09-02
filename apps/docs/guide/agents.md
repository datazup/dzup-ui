---
title: For AI agents
description: The machine-readable surfaces dzup-ui ships, and why they cannot disagree with this site.
---

# For AI agents

A coding assistant writing dzup-ui code and a human reading this site are
answering the same question, so they are served from the same extraction.

## What is published

| Surface | What it is |
| --- | --- |
| `llms.txt` | The concise index: one bullet per component with its description, own prop names, frozen taxonomy and v-model bindings. |
| `llms-full.txt` | The same roster expanded to full prop / event / slot / expose tables plus a usage snippet per component. |
| `@dzup-ui/mcp` | An MCP server exposing component discovery, per-component metadata and verbatim story examples as tools. |
| `component-meta.json` | The generated metadata artifact all three of the above — and every page on this site — are projections of. |

## Why they agree with each other

There is exactly **one** component-API extraction in this repository. It reads
the real `.vue` and `.types.ts` sources through a TypeScript program and writes
`packages/core/docs/component-meta.json`. `llms.txt`, `llms-full.txt`, the MCP
tools and this site's component pages are all renderers over that file. None of
them parses a component source of its own — a second extractor is precisely the
drift the artifact exists to prevent, and a validator fails the build if one
appears.

The per-component sections of `llms-full.txt` and the API tables on this site are
produced by *the same function*. They cannot say different things.

## What the machine-readable surfaces will not do

- They do not synthesise example markup. A usage snippet is a verbatim slice of a
  real Storybook story, or the document says no story exists.
- They do not print an effective default where only a declared one is known. Many
  props declare `undefined` on purpose so a provider supplies the value at
  runtime (ADR-20); the published value is the declared one and is labelled as
  such.
- They do not render an empty table as if it were an empty API. Where extraction
  failed, the component says so.

## Freshness

The committed agent documents are compared byte for byte against a fresh render
on every validation run, and the metadata artifact is compared against a fresh
extraction of the sources. A source change nobody regenerated for turns the gate
red rather than silently shipping stale answers.
