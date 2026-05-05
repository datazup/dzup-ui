# 04 Security Review

Scope: static security review of `ui/dzup-ui` with emphasis on authn/authz, tenant isolation, secret handling, unsafe input paths, file/path access, SSRF-like fetch paths, webhook exposure, queue/job trust boundaries, config defaults, and sensitive-data exposure.

Assessment summary: no high/critical vulnerability was confirmed in this repository’s own runtime scope. One medium-confidence client-side issue and two low-severity hardening gaps were identified.

## Repository Overview

`dzup-ui` is an open-source Vue 3 component-library monorepo (`core`, `tokens`, `contracts`, `compat`, `codemods`, `nuxt`) rather than an application backend or API service ([README.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/README.md:3), [README.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/README.md:53)).  
The repository summary in `out/` also classifies it as a UI repo/package set, with Storybook and sandbox demo surfaces ([ui-dzup-ui.md](/media/ninel/Second/code/datazup/ai-internal-dev/out/code-features-current/summaries/repos/ui-dzup-ui.md:1)).  
This matters for security interpretation: most real authn/authz and tenant isolation controls are expected in consuming apps/services, not in this library itself.

## Trust Boundaries

- Users: end users interact with downstream apps that render these components; this repo does not run the app auth boundary directly ([README.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/README.md:3)).
- Tenants: no tenant model or tenant-scoped data model exists in this codebase.
- Admins: no admin policy engine or privileged route guard subsystem exists in this repo.
- External providers: npm publish and GitHub release automation rely on GitHub Actions + npm registry credentials (`NPM_TOKEN`, `GITHUB_TOKEN`) ([release.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/release.yml:51), [publish-prerelease.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/publish-prerelease.yml:57)).
- Webhooks: no inbound webhook handlers were found in runtime packages.
- Background jobs/queues: no queue worker/job processor surface was found in runtime packages.
- Storage: browser `localStorage` is used for UI preference persistence (theme/sidebar), not session credentials ([DzThemeProvider.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/providers/DzThemeProvider.vue:44), [useSidebar.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useSidebar/useSidebar.ts:65)).
- Internal services: no service-to-service calls or backend client layer is present in runtime component code.

## Security Strengths

- Theme persistence is allowlisted to expected values (`light|dark|system`) before use, reducing storage-tampering impact ([DzThemeProvider.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/providers/DzThemeProvider.vue:45)).
- Theme bootstrap string generation uses `JSON.stringify` for user-configurable fields, which reduces script-construction injection risk in that helper ([theme-script.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/providers/theme-script.ts:52)).
- CI uses immutable install mode (`yarn install --immutable`), reducing lockfile drift and accidental dependency mutation during pipeline runs ([ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:37)).
- Secret-hygiene workflow exists (`scan:credentials`) and includes working-tree + git-history scanning patterns ([package.json](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/package.json:50), [credential-scan.sh](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/scripts/credential-scan.sh:53)).
- Private vulnerability disclosure policy is documented ([SECURITY.md](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/SECURITY.md:11)).

## Findings

### SR-01 (Medium): Unvalidated navigable URL props are forwarded to anchor navigation sinks

- Impact: if consuming applications bind attacker-controlled URLs to `href`/string `to`, this can enable client-side XSS via `javascript:` URIs or malicious redirect/navigation.
- Evidence: direct sink forwarding appears in [DzButton.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/buttons/DzButton.vue:126), [DzMenuItem.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/navigation/DzMenuItem.vue:49), [DzBreadcrumbItem.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/navigation/DzBreadcrumbItem.vue:49), and [DzSidebarItem.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/navigation/DzSidebarItem.vue:83). Related prop types are unconstrained `string` ([DzButton.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/buttons/DzButton.types.ts:47), [DzMenu.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/navigation/DzMenu.types.ts:56), [DzBreadcrumb.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/navigation/DzBreadcrumb.types.ts:50), [DzSidebar.types.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/components/navigation/DzSidebar.types.ts:80)).
- Attack path: attacker controls URL-like content (CMS/profile/link field) -> downstream app maps it into these props -> user clicks rendered element -> browser navigates/executes payload.
- Remediation: introduce a shared URL sanitizer/validator for all navigable props with explicit allowlist (`http:`, `https:`, `mailto:`, `tel:`, safe relative paths), reject active/mixed schemes (`javascript:`, `data:`), and add contract tests with obfuscated payload variants.

### SR-02 (Low): Nuxt integration injects inline script with `innerHTML` by default, pressuring CSP relaxation

- Impact: consumers with strict CSP may weaken policy to keep theme pre-init behavior, increasing exploitability of unrelated DOM injection bugs in downstream apps.
- Evidence: Nuxt module pushes inline head script via `innerHTML` with no security toggle/nonce integration in options ([module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:3), [module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:273), [module.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/nuxt/src/module.ts:275)).
- Attack path: downstream app allows `'unsafe-inline'` to accommodate module behavior -> unrelated script injection elsewhere becomes materially easier to weaponize.
- Remediation: add module options to disable inline injection and/or support nonce/hash-based CSP-safe mode; provide external-script alternative and explicit CSP guidance.

### SR-03 (Low): CI/release workflows use third-party GitHub Actions by mutable major tags instead of immutable SHAs

- Impact: compromised upstream action release or tag hijack increases supply-chain risk in CI/release pipeline.
- Evidence: workflows use `@v4`/`@v1` tag pins for actions (for example `actions/checkout@v4`, `actions/setup-node@v4`, `changesets/action@v1`) ([ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:22), [release.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/release.yml:20), [release.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/release.yml:53)).
- Attack path: malicious or compromised upstream action update under same major tag -> pipeline executes unreviewed code with repo and publish credentials.
- Remediation: pin critical actions to full commit SHAs and add periodic update workflow for controlled upgrades.

## Sensitive Data And Secrets Review

- No hard-coded high-confidence credentials were identified in repository source by targeted static pattern review (excluding dependencies/build artifacts).
- Publish credentials are referenced through GitHub Secrets and environment injection (`NPM_TOKEN`, `NODE_AUTH_TOKEN`, `GITHUB_TOKEN`), not plaintext commits ([release.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/release.yml:60), [publish-prerelease.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/publish-prerelease.yml:61)).
- Runtime preference persistence uses `localStorage` for theme/sidebar state; no session token persistence path was found in core runtime code ([DzThemeProvider.vue](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/providers/DzThemeProvider.vue:44), [useSidebar.ts](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/packages/core/src/composables/useSidebar/useSidebar.ts:69)).
- No `document.cookie` handling, auth header construction, or session/csrf token management was found in runtime packages.
- Secret scanning exists as a script but is not currently visible as a mandatory CI gate in the reviewed workflows ([credential-scan.sh](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/scripts/credential-scan.sh:53), [ci.yml](/media/ninel/Second/code/datazup/ai-internal-dev/ui/dzup-ui/.github/workflows/ci.yml:13)).

## Authorization And Isolation Review

- No route guards, login/session middleware, RBAC/ABAC framework, or server-side authorization enforcement is implemented in this repo’s runtime surface.
- No tenant/team isolation logic exists in package runtime code; multi-tenant separation is delegated to consuming applications/services.
- Component states such as `disabled`, `active`, or role labels are presentation semantics, not authorization controls.
- No public sharing endpoints, webhook ingest routes, or privileged admin API surfaces were found in the repository runtime code.
- Conclusion: authn/authz and tenant isolation are out-of-scope by architecture for this repo; security contract should explicitly state these responsibilities for integrators.

## Residual Risks

- Primary residual risk is downstream misuse: consumers may bind untrusted URL/content into component props without validation, creating XSS/open-redirect conditions in host apps.
- CSP and security-header posture are mostly downstream app/server concerns; this repo cannot guarantee safe defaults at deployment perimeter.
- Release pipeline supply-chain exposure remains non-zero while actions are major-tag pinned and credential scanning is optional rather than enforced.
- Demo/storybook surfaces include external image URLs; while not a direct vulnerability here, they create outbound request behavior in preview environments.

## Recommended Remediation Plan

1. Immediate: implement `sanitizeNavigableUrl` in `@dzup-ui/core` and apply it consistently to all `href`/string `to` sinks before DOM binding.
2. Immediate: add security-focused tests for malicious URI schemes and obfuscation variants across `DzButton`, `DzMenuItem`, `DzBreadcrumbItem`, and `DzSidebarItem`.
3. Immediate: document a clear consumer security contract in repo docs: authn/authz/tenant enforcement is app-owned, and navigable props must be treated as untrusted input.
4. Short-term: extend `@dzup-ui/nuxt` options for CSP-safe theme bootstrap (disable inline mode, nonce/hash support, external script strategy).
5. Short-term: make secret scanning and dependency/audit checks first-class CI gates, not just local scripts.
6. Short-term: pin critical GitHub Actions to immutable SHAs and enable controlled update cadence.
7. Structural: add a lightweight security checklist to PR/release workflow covering URL sanitization, CSP compatibility, and supply-chain hardening controls.