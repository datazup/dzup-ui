---
"@dzup-ui/contracts": minor
"@dzup-ui/core": minor
---

**Six navigation components stop rendering a hostile URL as a live link.**

`DzButton`, `DzAnchor`, `DzBreadcrumb`, `DzMenu`, `DzSidebar` and `DzMegaMenu`
put whatever `href` they were given straight into the DOM. Measured, not
inferred: all nine `url-scheme` fixtures in the security corpus reached the
rendered `href` **verbatim** on all six components — 54 measurements, severity
high, recorded as `S1`–`S12` in
`packages/core/security/security-deviations.json`. A `javascript:` URL from
whatever populates a menu, breadcrumb, sidebar or anchor list — a CMS row, an
API navigation tree, a user profile, a model response — executed **in your
origin, with your cookies**, on an ordinary click.

There is now one URL policy, and it is on by default.

```vue
<!-- renders a <button>, not a link; `href` is not in the DOM -->
<DzButton href="javascript:void(0)" @click="save">Save</DzButton>
```

**This is a breaking change, and it is the point.** `javascript:void(0)` is a
widespread legacy idiom in exactly these item-list props. It renders today and
it does not after this release. Under `packages/contracts/VERSIONING.md` (0.x:
minor = breaking) that is a `minor`.

**Migration.** Every component keeps the non-link branch it already had, so a
refused URL degrades rather than disappears: `DzButton`, `DzMenuItem` and
`DzSidebarItem` render their `<button>` and still emit `click`;
`DzBreadcrumbItem` renders its `<span role="link">`; `DzAnchor` renders the same
`<a>` with no `href`, which is not a link. So the common case —
`href="javascript:void(0)"` beside a `@click` handler — keeps working as a
button. If you were relying on the URL itself running, move the code into the
click handler. If a scheme you legitimately need is refused, widen the policy
once at the provider (below) rather than per call site.

**The allowlist.** `http`, `https`, `mailto`, `tel`, `sms`, plus every relative,
query and fragment URL, which carry no scheme and resolve against the document
you already served. Everything else is refused — `javascript:`, `vbscript:`,
`data:`, `file:`, `blob:`, and every scheme nobody has thought of yet. An
allowlist is wrong in the safe direction; a denylist is a list of the attacks
somebody remembered.

**A refused URL is refused, never rewritten.** The attribute is omitted and the
element carries `data-state="url-rejected"`, which you can style and a test can
see. Rewriting to `#` would produce a control that looks operable and is not,
which is a worse failure than refusing to draw a link, and is invisible to
everything except a click. Development builds warn once per component, prop and
scheme — once, because a hostile menu is a *list* of them and a warning per row
is a warning nobody reads.

**The decision is made after WHATWG normalization**, not on the raw string: the
URL parser strips leading and trailing C0 controls and spaces, removes tab, LF
and CR from anywhere in the input, and compares schemes case-insensitively. A
check written as `startsWith('javascript:')` closes one of the four evasions the
corpus carries and admits the other three.

**One escape hatch, at the provider.**

```vue
<DzProvider :url-policy="{ allow: (url, ctx) => ctx.allowedByDefault || url.startsWith('slack:') }">
<DzProvider :url-policy="{ allowedSchemes: ['https'] }">
```

`allow` sees the library's own verdict, so widening is one line that cannot
accidentally disable the base policy, and narrowing is the same line inverted.
There is deliberately **no per-component opt-out prop**: it would re-open the
hole for exactly the consumers most likely to reach for it, one call site at a
time and with no central record. Nesting folds per field — a nested provider
narrowing `allowedSchemes` keeps an ancestor's `allow`.

**Forgetting the provider gives you the strict policy, not an open one.** The
key has no `null` arm, unlike the sanitizer: a policy whose absent value is the
safe value cannot be switched off by forgetting something.

`DzUrlPolicy`, `DzUrlPolicyOptions`, `DzUrlPolicyContext`, `DzUrlSink`,
`DZ_URL_POLICY_KEY` and `DZ_ALLOWED_URL_SCHEMES` are exported from
`@dzup-ui/contracts`, and `useDzUrlPolicy()` from `@dzup-ui/core`, so Pro and
your own components resolve one policy through the same symbols.
`DZ_PROVIDER_DEFAULTS` gains a `urlPolicy` key. Recorded as ADR-20 amendment A7.

**Also in this release: `securityBoundary` is a set.** A component can cross two
boundaries and one does — `DzQRCode` encodes an arbitrary `value` into a
machine-readable code *and* renders a host-supplied `icon` as an `<img src>`.
With a single value it declared `payload` and its URL sink was invisible to the
capability matrix while being asserted in the corpus. `ComponentQuality
.securityBoundary` and the `securityBoundary` field of `quality-matrix.json`,
`capability-matrix.json` and `component-meta.json` are now arrays
(`["url","payload"]`, `["none"]`). If you read those artifacts, that is a shape
change.
