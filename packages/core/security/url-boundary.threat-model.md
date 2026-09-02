<!-- Hand-written. TASK-N1-O5 reads this file, via coverage.json, as the
     `threat-model` evidence for every component listed in §1; the content is a
     review artifact, not generated. -->

# The URL and payload boundaries — threat model

**Fourteen components · boundaries `url` (13) and `payload` (1)**
**Written 2026-09-01 against `packages/core/security/url-boundary.url-policy.spec.ts`
and `url-boundary.malicious-corpus.spec.ts`, at `main` @ `51dec93` (worktree
dirty — locally qualified, not release evidence).**

One document rather than fourteen. These components do not have fourteen threat
models; they have **two**, and which one applies is decided entirely by whether
the URL they are given is *followed* or *fetched*. Writing the same page
fourteen times would hide that, and the difference between the two is the whole
finding.

## 1. Scope

| Component | Family | Tier | Boundary | The sink |
|---|---|---|---|---|
| `DzButton` | buttons | B | url | `href` prop → root `<a href>` |
| `DzAnchor` | navigation | B | url | `items[].href` → `<a href>` in the recursive renderer |
| `DzBreadcrumb` | navigation | B | url | `DzBreadcrumbItem`'s `href` → `<a href>` |
| `DzMenu` | navigation | B | url | `DzMenuItem`'s `href` → `<a href>` |
| `DzSidebar` | navigation | C | url | `DzSidebarItem`'s `href` → `<a href>` |
| `DzMegaMenu` | navigation | C | url | `items[].href` and `groups[].items[].href` → `<a href>` (4 sites) |
| `DzAvatar` | media | A | url | `src` prop → `<img src>` |
| `DzAvatarGroup` | media | A | url | a slotted `DzAvatar`'s `src` — no sink of its own |
| `DzImage` | media | A | url | `src`, and `fallback` after an error → `<img src>` |
| `DzImageCard` | cards | A | url | `src` prop → `<img src>` |
| `DzImageComparison` | media | B | url | `beforeSrc` / `afterSrc` → two `<img src>` |
| `DzLightbox` | media | B | url | `images[].src` → `<img src>` inside a teleported dialog |
| `DzPersonaSelector` | forms | C | url | `personas[].avatarUrl` → `<img src>` in the open listbox |
| `DzQRCode` | media | A | payload | `value` → SVG `<path>` geometry; **plus an undeclared `icon` → `<img src>`** |

## 2. The two threat models

### 2a. Navigation sinks — six components

A host-supplied URL becomes an `<a href>` that a person activates. The scheme
decides everything: `https:` is a link, `javascript:` is **script execution in
the host's own origin**, with the host's cookies and the host's DOM, triggered
by an ordinary click on something that looks like a menu item.

The source is never the application's own code in the interesting case. It is a
CMS row, a navigation tree from an API, a user profile, or — increasingly — a
model response rendered into a menu. Every one of those is untrusted.

**Finding U1 (high). There is no URL policy anywhere in `packages/core/src`.**
No scheme check, no allowlist, no normalization; the value is bound straight to
the attribute at every one of the six components' sinks. Measured, not
inferred: all nine `url-scheme` fixtures reach the rendered `href` verbatim on
all six components — 54 measurements, recorded in `security-deviations.json` as
S1–S12 with severity.

**Why it is not fixed here.** Refusing `javascript:` is a **breaking change**.
`javascript:void(0)` is a widespread legacy idiom in exactly the item-list props
these components take; today it renders and works, and after a policy it would
not. That is a public-behaviour change, which this task's stop condition routes
to a defect report rather than a silent fix, and which the release lane
(TASK-N5-02, alongside the ARIA-prop gaps) is the place to make legal.

**What a fix should look like, so the decision is a decision and not a design
exercise.** An allowlist, not a denylist — `http`, `https`, `mailto`, `tel`,
`sms`, relative and fragment URLs — applied after WHATWG normalization
(`effectiveScheme` in `boundary-suites.ts` is exactly that function and already
handles the mixed-case, leading-control and embedded-tab evasions the corpus
carries). Rejection should render the anchor with **no `href`** rather than a
different one: silently rewriting a URL to `#` produces a control that looks
operable and is not, which is a worse failure than refusing to draw a link. An
opt-out prop would re-open the hole for the consumers most likely to need it,
so the escape hatch belongs at the provider (ADR-20), once, with a name that
says what it costs.

### 2b. Subresource sinks — seven components (plus `DzQRCode`'s `icon`)

A host-supplied URL becomes an `<img src>` that the browser fetches. This is a
materially weaker threat and it is important not to inflate it:

- `javascript:` and `vbscript:` in an `<img src>` have not executed in any
  shipping engine this decade. The element fires `error`; that is all.
- `data:image/svg+xml` in an `<img>` is script-**disabled** by specification
  (SVG secure-static processing). The same URL in `<object>`, `<embed>`,
  `<iframe>` or a CSS `url()` is a different question, and none of these
  components use any of those.
- `data:text/html` is refused by the image decoder.

**Measured:** every one of the eight subresource bindings holds the value on an
`<img>`, builds no element and no handler from it, and therefore meets the
corpus's `inert` outcome. **Zero deviations.**

**The residual is not XSS; it is a request.** An arbitrary `src` is an
unconditional GET to an origin the page's author did not choose — a tracking
pixel, an internal-network probe from the user's browser, or a 200 MB response.
No component can decide which origins a consumer trusts, and one that tried
would be useless (avatars come from CDNs). **This is the host's `img-src`
directive, and the documentation has to say so.** Recorded here so the empty
deviation list is not read as "there is nothing left".

**Finding U2 (medium). `DzImage`'s `fallback` is a second, quieter sink.** It
is only reached after the first URL fails, so a hostile `src` that errors is
what puts the fallback URL into the DOM. Same required outcome, same measured
result; noted because a reviewer looking for "the URL prop" finds one and there
are two.

### 2c. The payload boundary — `DzQRCode`

`value` is encoded into SVG path geometry. Inside the document it is inert, and
that is asserted rather than assumed: the suite checks the value never appears
as an `href` or a `src` anywhere in the render.

The threat is entirely outside the document. **A camera follows whatever the
value turns out to be, with no browser, no CSP and no URL bar between the
payload and the person scanning it.** No encoder can decide whether a payload is
legitimate, and one that silently rewrote it would be a worse component. This is
a documentation obligation on the host — *do not encode untrusted content* —
recorded so the corpus is never read as a claim that the QR content was made
safe.

**Finding U3 (medium). `DzQRCode` has an undeclared URL sink.** The `icon` prop
is a host-supplied URL rendered as `<img src>` over the code — word for word the
property `DzImage`'s boundary justification uses. `SecurityBoundary` holds
**one value per component**, so declaring `payload` means the `url-policy` row
is never asked for. The sink is bound and asserted here regardless (it measures
`inert`, like the other seven), but the matrix cannot express it. Making
`securityBoundary` a set is an owner decision; until then, this paragraph is
the record.

## 3. Sources, sinks and trust

| Source | Reaches | Trusted? |
|---|---|---|
| `href` / `src` / `items[].href` / `images[].src` props | the rendered attribute, unmodified | **No** — author-supplied only in the trivial case |
| `label` / `alt` / `caption` / `fallback` / `name` props | a text node or an attribute value | **No** |
| `color` / `background` (`DzQRCode`) | the SVG `fill` attribute | **No** |
| variant / size / tone props | `tv()` recipes | Yes — a closed enum |
| slot content | wherever the consumer puts it | The consumer's own; outside this boundary |

## 4. What was measured, and what was not

Measured, in `packages/core/security/`:

- **54/54** navigation-sink URL cases: all `passed-through` (Finding U1).
- **72/72** subresource-sink URL cases across eight bindings: all `inert`.
- **151/151** hostile-content cases (markup injection, degenerate input, CSS
  injection on `DzQRCode`'s `color`): all `escaped`, asserted against the DOM.
  **No component in this document has a markup-escaping defect.**

Not measured, and owed:

- **A browser.** Every assertion above is jsdom. `inert` for a subresource is a
  statement about how engines treat `<img src>`, and it is cited, not executed.
- **SSR.** These specs render client-side. E6 in the ledger records a live
  defect that only SSR emits, so an SSR pass over the same corpus is a real gap.
- **`DzMegaMenu`'s panel links.** The suite binds the top-level `href`; the
  three nested sites share the code path and the same absent policy, but they
  are asserted by inspection, not by a mount.

## 5. What would change this document

- Any component gaining a scheme check — that closes U1 and this file has to say
  which schemes and where the escape hatch is.
- Any component rendering a URL through `<object>`, `<embed>`, `<iframe>` or a
  CSS `url()` — §2b's `inert` reasoning is scoped to `<img>` and does not
  transfer.
- `createObjectURL` appearing anywhere in `packages/core/src`.
- `securityBoundary` becoming a set — U3 stops being a footnote and becomes a
  row.
