<!-- Hand-written. TASK-OSS-P5-06 reads this file's existence as the `threat-model`
     evidence for DzFileUpload; the content is a review artifact, not generated. -->

# `DzFileUpload` — threat model

**Tier D · boundary `file` · source `packages/core/src/components/forms/DzFileUpload.vue`**
**Written 2026-08-24 against `packages/core/security/DzFileUpload.malicious-corpus.spec.ts`.**

`DzFileUpload` is the only Core component whose primary job is to cross a data
boundary. It takes files a person chooses and puts them in a `File[]` the host
application then does something with. Everything below is about the gap between
"the control looks like it filtered them" and "they were filtered".

## What it is, and what it is not

It is a **UI control**. It does not read file contents, does not parse them,
does not upload them, and never constructs a URL. Its entire security surface is
which `File` objects reach `v-model` and whether the person and the developer
have the same belief about that.

It is **not a validator**. Every check it performs is a courtesy to the user:
telling somebody their 40 MB video is too large before they wait for an upload
is good product behaviour, and it is worth exactly nothing against an attacker,
who does not use the control. **A server must revalidate size, type and content,
and must scan.** That sentence belongs in the component's documentation and in
the docs of every application that uses it.

## Sources, sinks, and the trust boundary

| Source | Reaches | Trusted? |
|---|---|---|
| The OS file picker, via `<input type="file">` | `processFiles` | No |
| A drop, via `DataTransfer.files` | `processFiles` | No |
| `accept`, `maxSize`, `maxFiles`, `multiple` props | the checks in `processFiles` | Yes — author-supplied |
| `File.name`, `File.type`, `File.size` | the checks, and the rendered file list | **No** — all three are attacker-influenced |

There is no HTML sink, no URL sink and no parser. `File.name` is rendered as
text through Vue's interpolation, which escapes it; the corpus asserts that
rather than assuming it.

## Findings

### F1 — `accept` was not enforced on the drop path (fixed in this packet)

`:accept` on `<input type="file">` filters the operating system's picker. It has
**no effect on a drop**: `DataTransfer.files` arrives unfiltered. Before this
packet `processFiles` checked `maxFiles` and `maxSize` and nothing else, so a
component rendering the words *"Accepted: image/\*"* directly under its drop zone
would take a dropped `.exe` into `v-model` and emit `upload`, with no `error`
event and nothing on screen to suggest anything had been skipped.

The developer's belief ("this control gives me images"), the user's belief (the
label says images), and the behaviour were three different things. Fixed by
enforcing `accept` inside `processFiles`, where both doors pass.

### F2 — `multiple: false` was not enforced on the drop path (fixed in this packet)

The same shape. `multiple` constrains the picker; a drop of nine files into a
single-file control put nine files in the model. Fixed alongside F1.

### F3 — a type-less file is admitted on extension alone

`File.type` is a browser guess from the extension and the OS registry, and it is
frequently `''`. When it is, `accept="image/*"` cannot match and the file is
rejected; `accept=".png"` matches on the name. This is deliberate and it is the
conservative direction, but note what it means: **`accept` is a filename check
much of the time.** A file named `photo.png` containing a PE binary passes.
Nothing client-side can prevent that, which is why the first section says what
it says.

### F4 — the reported reason is author-visible, not user-visible

`error` payloads carry a `reason` string that today is English and assembled
from fragments. Applications surface it. It is a **diagnostic**, and it contains
`File.name` — so an application that logs the payload logs a filename the user
supplied. Not a defect in the component; a note for the host, recorded because
the reassessment's rule is that components do not log document content and hosts
should not either.

## The two Tier D rows that were excepted, and are not any more

Until 2026-09-01 this section said `url-policy` and `csp-fixture` were
**non-applicable** and recorded both as exceptions in `component-tiers.ts`. That
was wrong twice over, and TASK-N1-O5 replaced both with real specs.

### `url-policy` — the exception was describing a policy, not an absence

The claim ("the component accepts no URL of any kind") was true. Its shape was
the problem: *"there is no URL here"* is not the absence of a policy, it **is**
a policy, and the strictest one available — an allowlist of zero schemes. A
policy can be asserted; an exception can only be believed.

`DzFileUpload.url-policy.spec.ts` now asserts it: no URL-bearing attribute
(`href`, `src`, `srcset`, `action`, `formaction`, `poster`, `data`, `cite`,
`background`, `ping`, `xlink:href`) appears anywhere in the render, in any
state, under every fixture in the hostile corpus; `URL.createObjectURL` is
spied on and never called, on both the picker path and the drop path, in both
model modes. The day somebody adds an image preview, that spec turns red on the
line that says the count is zero — where the exception would have stayed
`excepted` until a human re-read this document.

### `csp-fixture` — one of the exception's five clauses was false

It read: *"No inline style, no inline script, no `blob:` or `data:` URL, no HTML
sink and no worker."* Four were true. **"No inline style" was not.** The
template root carried `style="contain: layout style"`. A `style` **attribute**
is governed by `style-src-attr`, which falls back to `style-src`, so a strict
CSP without `'unsafe-inline'` blocks it — and the containment it declared is
exactly what keeps a 4 096-character file name inside the component box. The
hosts that configured CSP most carefully got the least contained control, and
nothing could see it.

Fixed by moving the declaration into the `tv()` recipe as
`[contain:layout_style]` — the form `DzCard` and `DzPanel` already used, and the
form the styling contract requires (ADR-04/ADR-19: `tv()` in `.variants.ts`,
never a style attribute). The CSS is unchanged; only its carrier is.
`DzFileUpload.csp-fixture.spec.ts` now asserts the whole render is free of every
construct the policy blocks, in every state, under the hostile corpus, and
across a real interaction sequence — plus that the component injects no `<style>`
and therefore needs no nonce (ADR-20).

**Still owed:** jsdom does not enforce CSP. These specs prove the component
emits nothing a strict policy blocks; they do not prove a browser served with a
real `Content-Security-Policy` header accepted the page. That is a Playwright
lane and it is recorded as a gap, not as done.

## What would change this document

- Reading file contents for a preview (`FileReader`, `createObjectURL`) — that
  adds a `blob:` sink and makes `csp-fixture` apply immediately.
- Uploading directly, rather than handing `File[]` to the host.
- Rendering any part of a file as markup.

Any one of those is a new threat model, not an amendment to this one.
