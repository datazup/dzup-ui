# Supply-chain evidence — `@dzup-ui/*`

> Generated 2026-09-25T06:44:38.841Z by `release:evidence`.
> Source: `3c3f94a836f9a1fbbbc8da16a10e9e4fcd40c477` on `chore/release-decisions-20260925` · worktree **clean** · **admissible: true**

## Tarballs

| Package | Version | Bytes | Files | sha256 |
|---|---|---|---|---|
| `@dzup-ui/contracts` | 0.1.0 | 63,231 | 50 | `57cae4de32a72875f02aa8d032bef4b0dbfe5c002cb74c1e2b354625b5f99767` |
| `@dzup-ui/core` | 0.2.0 | 740,945 | 1461 | `217a51a52dde641ab0e454fca66ef6ab69984bb55ae713cb756fe78a538d0a6e` |
| `@dzup-ui/mcp` | 0.2.0 | 37,028 | 17 | `1ebfcd0418344c2e099ddf243bf6e9456a9654f5e0cde2dde08bc84aacc7b6ec` |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 8,585 | 7 | `ddaaf61719a1cd53e2adc4711c5b905f2474230499f4a1ed0a2ae187ad7e9a85` |
| `@dzup-ui/testing` | 0.1.0 | 58,389 | 34 | `b03144b88b77e502b00e62332affc4fdb6222013035a516778125e3e18aa2303` |
| `@dzup-ui/tokens` | 0.2.0 | 53,620 | 17 | `fd056a74632175f36b0c7e80d89b1e7084c6c5a6753e606e9823beee7805fe2f` |

### Installability — local protocols in the packed manifests

**0 across all tarballs.** Every `@dzup-ui/*` sibling range in a packed `package.json` is a real semver range, which is what `yarn pack` resolves `workspace:*` to. `npm pack` copies the literal string and the tarball dies with `EUNSUPPORTEDPROTOCOL`; this row is read from the manifest **inside the tarball**, not from `npm pack --dry-run` output (which prints a file list and therefore never matched the grep that CI and the rehearsal both rely on — TASK-R1-O2 F2 / D151).

## Vulnerabilities

**The advisory query did not run for 3 of 6 packages.** A count of zero is not claimed for those.

- `@dzup-ui/contracts`: the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit
- `@dzup-ui/testing`: the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit
- `@dzup-ui/tokens`: the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit

Source: `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk`, keyed by exact resolved version. **0 advisories** across 143 distinct resolved dependencies for the packages that were queried.

## Licences

Policy: `packages/tooling/src/license-audit.ts` — the same allow/block sets `yarn validate:licenses` gates on. Exceptions: `packages/tooling/scripts/licence-exceptions.json` (0 entries, each with an owner).

**Nothing needs attention:** no blocked licence, no unread licence and no exception in use.

**Totals across all tarballs:** 143 distinct dependencies · 0 blocked · 0 unknown · 0 excepted. Rows classified `allowed` or `first-party` are omitted from the table above and are in `supply-chain.json`.

## Provenance

| Fact | Value |
|---|---|
| Builder | local workstation — node v24.20.0, yarn 4.16.0, os linux x64 |
| Build command | `yarn build && yarn workspace <pkg> pack` |
| Source commit | `3c3f94a836f9a1fbbbc8da16a10e9e4fcd40c477` |
| Worktree | clean |
| Signed | **no** — signing requires a key and an authorised operator |
| Trusted publishing (npm provenance) | **never exercised** — `.github/workflows/release.yml` requests `id-token: write` and no workflow has ever published |
| Admissible as release evidence | **true** |

Per-tarball statements: `provenance.json`. Per-file hashes: `hashes.json`. SBOMs: `sbom.cdx.json` (aggregate) and `sbom/<package>.cdx.json`.

