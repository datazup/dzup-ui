---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**An application can now install one HTML sanitizer for the whole library, and gets a safe one until it does.**

`DzProvider` grows a tenth concern, `sanitizer` — the seam 08-11 doc 06 asked
for and `@dzup-ui-pro/pro` has been blocked on since its security packet
(`docs/security.md` §10: *"No shared sanitizer provider. Each component resolves
DOMPurify itself; a consumer cannot supply one organisation-wide adapter."*).
Pro could not solve it on its own side: ADR-20 §9 forbids a second provider, and
it is right to.

```vue
<DzProvider :sanitizer="{ sanitize: html => DOMPurify.sanitize(html) }">
```

**The default escapes rather than passing through.** Set nothing and rich
content renders as visible text. That is deliberate and it is the whole
argument: a pass-through default is the vulnerability the seam exists to remove,
and it fails in the direction where nothing looks wrong until it is. Bundling a
sanitizer was the other option and would have put a parser and an allowlist into
every consumer's bundle for a library that renders no HTML of its own — Core has
**zero** `v-html` and `innerHTML` sinks, and all fifteen of its
`SecurityBoundary` declarers are URL or payload boundaries. Escaping is safe
with no dependency, identical on a server and in a browser, and *visibly* wrong
when it is wrong, which is the only kind of wrong a security default should be.

**The ceilings belong to the seam, not to your adapter.** The commonest
installation is one line handing over `DOMPurify.sanitize`, so requiring every
host to re-derive an input bound is how the bound comes to be missing.
`useDzSanitizer()` applies `maxLength` and `maxDepth` **before** anything parses
and throws `DzSanitizeLimitError`. The numbers — 128 KiB and depth 64 — are
carried over from Pro's measurement rather than re-guessed: the cost is in the
HTML parser, not in the sanitizer's walk, and depth and length multiply, so the
pair bounds the amplification an attacker can construct rather than the size of
a document. The depth guard is a scanner, never a parse, because the parse is
the cost being bounded.

**Three states, not two.** Omitting the prop means "nobody configured one" and
resolves to the escaping default. Passing `null` means "the host will supply
one", and if nothing then does, `useDzSanitizer()` throws in development — a
configuration mistake should not turn into a rendering difference nobody looks
for. Production falls back to escaping either way.

**Nesting works per field.** `<DzProvider :sanitizer="{ limits: { maxDepth: 8 } }">`
inside a provider that installed DOMPurify keeps DOMPurify and tightens only the
ceiling, and a provider mounted to change the locale leaves an application's
sanitizer exactly as it found it.

`DzSanitizerAdapter`, `DzSanitizeContext`, `DzSanitizeLimits`,
`DzSanitizerOptions`, `DzSanitizeSink`, `DzObjectUrlSink`, `DZ_SANITIZER_KEY`
and `DzSanitizeLimitError` are exported from `@dzup-ui/contracts`, so Pro and
your own components resolve the same policy through the same symbols without
importing Core's runtime. The sink vocabulary is Pro's registry vocabulary
verbatim — `markdown`, `mermaid-svg`, `notebook-output`, `diff-highlight`,
`rich-text-paste` — with the three object-URL contexts typed apart so
`sanitize(html, { sink: 'download-blob' })` cannot be written by accident.

`DZ_PROVIDER_DEFAULTS` gains a `sanitizer` key. It is the first field that
object has grown since ADR-20 published it, so it is called out rather than
buried: code comparing against the whole object sees a new key. Recorded as
ADR-20 amendment A6.
