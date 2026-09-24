# Supply-chain evidence — `@dzup-ui/*`

> Generated 2026-09-24T20:39:30.225Z by `release:evidence`.
> Source: `0a47569ece7f5a1c41f05e2eb8fcb3281256ee8c` on `release-evidence-20260924` · worktree **clean** · **admissible: true**

## Tarballs

| Package | Version | Bytes | Files | sha256 |
|---|---|---|---|---|
| `@dzup-ui/contracts` | 0.1.0 | 63,168 | 50 | `b7b4e62e12a012d5cc934a86d62e8459e2605c41d0cc5a1a8185701fd3e0a70f` |
| `@dzup-ui/core` | 0.2.0 | 740,898 | 1461 | `c5cccf27e6e93f89122ff48ef3abf851c7f5c75afa19346a41c35b643bbbba54` |
| `@dzup-ui/mcp` | 0.2.0 | 37,028 | 17 | `1ebfcd0418344c2e099ddf243bf6e9456a9654f5e0cde2dde08bc84aacc7b6ec` |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 8,536 | 7 | `47781cafd01f32e741482c21978f949c6ca8b290c5e618c30de2f7f0d865557e` |
| `@dzup-ui/testing` | 0.1.0 | 58,346 | 34 | `21f4d5e509368c9eebade2ff55f6df514455c0b166a8ac9bd5cdd240de8b3fcb` |
| `@dzup-ui/tokens` | 0.2.0 | 53,569 | 17 | `dfb00023e634d9de227ce892359c11d9ac18bb3dd8a068f93d90ff9a16777667` |

### Installability — local protocols in the packed manifests

**0 across all tarballs.** Every `@dzup-ui/*` sibling range in a packed `package.json` is a real semver range, which is what `yarn pack` resolves `workspace:*` to. `npm pack` copies the literal string and the tarball dies with `EUNSUPPORTEDPROTOCOL`; this row is read from the manifest **inside the tarball**, not from `npm pack --dry-run` output (which prints a file list and therefore never matched the grep that CI and the rehearsal both rely on — TASK-R1-O2 F2 / D151).

## Vulnerabilities

**The advisory query did not run for 3 of 6 packages.** A count of zero is not claimed for those.

- `@dzup-ui/contracts`: the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit
- `@dzup-ui/testing`: the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit
- `@dzup-ui/tokens`: the package declares no runtime dependencies — there is nothing to query, which is not the same as a clean audit

| Severity | Package | Advisory | Vulnerable | Reached via |
|---|---|---|---|---|
| **high** | `fast-uri` | [1158524](https://github.com/advisories/GHSA-f65p-4m7j-42xc) — fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization | `>=3.0.0 <3.1.6` | `@dzup-ui/mcp` |
| **high** | `fast-uri` | [1158530](https://github.com/advisories/GHSA-jqff-g426-hqxp) — fast-uri vulnerable to host confusion via percent-encoded scheme normalization | `>=3.0.0 <3.1.6` | `@dzup-ui/mcp` |
| **high** | `fast-uri` | [1130720](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7) — fast-uri vulnerable to host confusion via backslash authority introducer | `>=3.0.0 <3.1.5` | `@dzup-ui/mcp` |
| **high** | `fast-uri` | [1124064](https://github.com/advisories/GHSA-v2hh-gcrm-f6hx) — fast-uri vulnerable to host confusion via literal backslash authority delimiter | `>=3.0.0 <=3.1.3` | `@dzup-ui/mcp` |
| **high** | `fast-uri` | [1204921](https://github.com/advisories/GHSA-4c8g-83qw-93j6) — fast-uri vulnerable to host confusion via failed IDN canonicalization | `>=3.0.0 <3.1.3` | `@dzup-ui/mcp` |
| **high** | `fast-uri` | [1145559](https://github.com/advisories/GHSA-q3j6-qgpj-74h6) — fast-uri vulnerable to path traversal via percent-encoded dot segments | `>=3.0.0 <=3.1.0` | `@dzup-ui/mcp` |
| **high** | `fast-uri` | [1153168](https://github.com/advisories/GHSA-v39h-62p7-jpjc) — fast-uri vulnerable to host confusion via percent-encoded authority delimiters | `>=3.0.0 <=3.1.1` | `@dzup-ui/mcp` |
| **high** | `ip-address` | [1130722](https://github.com/advisories/GHSA-mwp4-54f8-5fhr) — ip-address: Address4 decodes leading-zero octets as decimal while resolvers decode them as octal, allowing SSRF and trust-boundary bypass | `<=10.3.0` | `@dzup-ui/mcp` |
| **moderate** | `@hono/node-server` | [1139322](https://github.com/advisories/GHSA-frvp-7c67-39w9) — Node.js Adapter for Hono: Path traversal in `serve-static` on Windows via encoded backslash (`%5C`) | `<1.19.15` | `@dzup-ui/mcp` |
| **moderate** | `hono` | [1130733](https://github.com/advisories/GHSA-8j4g-w8fx-2239) — Hono: ReDoS in CORS middleware via Access-Control-Request-Headers | `<4.12.34` | `@dzup-ui/mcp` |
| **moderate** | `hono` | [1138771](https://github.com/advisories/GHSA-f23p-vx2j-j53r) — Hono: `memo()` retains SSR output across requests, leading to cross-user data disclosure | `>=3.8.0 <4.12.34` | `@dzup-ui/mcp` |
| **moderate** | `hono` | [1138773](https://github.com/advisories/GHSA-54fx-42gc-7vw4) — Hono: Algorithmic Complexity DoS in Language Middleware | `>=4.12.0 <4.12.34` | `@dzup-ui/mcp` |
| **moderate** | `hono` | [1193729](https://github.com/advisories/GHSA-gqvv-2mrq-wpjv) — Hono: Incomplete fix for CVE-2026-39408: `toSSG()` still writes files outside the output directory | `<4.13.5` | `@dzup-ui/mcp` |
| **moderate** | `hono` | [1193730](https://github.com/advisories/GHSA-g6gw-c38x-mqfc) — Hono: Unbounded dot-notation nesting in `parseBody()` can cause memory exhaustion | `<4.13.5` | `@dzup-ui/mcp` |
| **moderate** | `hono` | [1193731](https://github.com/advisories/GHSA-crvj-82cr-hjcx) — Hono: Query parser reads parameters after the URL fragment, causing cache-key and proxy interpretation differentials | `<4.13.5` | `@dzup-ui/mcp` |
| **moderate** | `ip-address` | [1130723](https://github.com/advisories/GHSA-4xrf-jv44-h6hh) — ip-address: a CIDR suffix on the parsed address suppresses special-use classification and can bypass SSRF and trust-boundary checks | `>=10.1.1 <=10.2.1` | `@dzup-ui/mcp` |
| **moderate** | `ip-address` | [1130724](https://github.com/advisories/GHSA-22jq-vg5j-6vgg) — ip-address: misclassification of IPv4-mapped/NAT64 IPv6 addresses can bypass SSRF and trust-boundary checks | `>=10.1.1 <=10.2.0` | `@dzup-ui/mcp` |
| **moderate** | `qs` | [1158506](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) — qs array-limit bypass via bracket-key comma parsing | `>=6.14.2 <=6.15.3` | `@dzup-ui/mcp` |
| **moderate** | `qs` | [1158507](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) — qs: Denial of Service via Attacker Controlled isBuffer | `>=2.2.5 <6.16.0` | `@dzup-ui/mcp` |
| **low** | `hono` | [1138772](https://github.com/advisories/GHSA-79qm-7rj5-m7r9) — Hono: Proxy Helper does not remove response headers listed in the `Connection` header | `>=4.7.0 <4.12.34` | `@dzup-ui/mcp` |

## Licences

Policy: `packages/tooling/src/license-audit.ts` — the same allow/block sets `yarn validate:licenses` gates on. Exceptions: `packages/tooling/scripts/licence-exceptions.json` (0 entries, each with an owner).

**Nothing needs attention:** no blocked licence, no unread licence and no exception in use.

**Totals across all tarballs:** 143 distinct dependencies · 0 blocked · 0 unknown · 0 excepted. Rows classified `allowed` or `first-party` are omitted from the table above and are in `supply-chain.json`.

## Provenance

| Fact | Value |
|---|---|
| Builder | local workstation — node v24.20.0, yarn 4.16.0, os linux x64 |
| Build command | `yarn build && yarn workspace <pkg> pack` |
| Source commit | `0a47569ece7f5a1c41f05e2eb8fcb3281256ee8c` |
| Worktree | clean |
| Signed | **no** — signing requires a key and an authorised operator |
| Trusted publishing (npm provenance) | **never exercised** — `.github/workflows/release.yml` requests `id-token: write` and no workflow has ever published |
| Admissible as release evidence | **true** |

Per-tarball statements: `provenance.json`. Per-file hashes: `hashes.json`. SBOMs: `sbom.cdx.json` (aggregate) and `sbom/<package>.cdx.json`.

