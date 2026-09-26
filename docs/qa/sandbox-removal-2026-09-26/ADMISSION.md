# Admission — DZUP-UI-SANDBOX-REMOVAL-20260926-R1

| Field | Value |
|---|---|
| Packet | DZUP-UI-SANDBOX-REMOVAL-20260926-R1 |
| Repository | `ui/dzup-ui` (`datazup/dzup-ui`) |
| Base | `dd8efad116fd9de099ce49cc4f1ad5604f3ceb3b` (`refs/heads/main`, local = origin) |
| Worktree | `/data/storage/datazup-runtime/ninel/worktrees/dzup-ui/dzup-ui-sandbox-removal-20260926` |
| Branch | `chore/sandbox-removal-20260926` |
| Plan reference | Owner decision **D177** (a), taken 2026-09-26: remove `apps/sandbox` fully, including its Coolify resource and DNS record |
| Authorisation | Operator, 2026-09-26: "do proceed with the recommended work" |

## The production half, measured first (read-only)

D177 named a Coolify resource, `dzup-ui-sandbox-production`, and its DNS
record. Both were checked on 2026-09-26 before anything was changed:

- **Coolify has no such application.** `list_applications` returns 31
  applications and none is a dzup-ui app. A lookup by name
  (`dzup-ui-sandbox`) and by domain (`dzup-ui-sandbox.dziphost.com`) both find
  nothing.
- **There is no DNS record of its own.** `dzup-ui-sandbox.dziphost.com` resolves
  to 213.199.40.69 and answers 503. So does a made-up name,
  `nonexistent-probe-7f3a.dziphost.com`: that is the `*.dziphost.com` wildcard
  and the proxy's answer for an unknown host.

`deploy/sandbox/coolify{,.staging}.json` declared a deployment that does not
exist. There is nothing in production to delete, so this packet takes no
production action.

## Scope

- Delete `apps/sandbox/` (33 tracked files) and `deploy/sandbox/` (2 files).
- Remove `@dzup-ui/sandbox` from `.changeset/config.json` `ignore` and from
  `release-policy.json` `private`; `yarn.lock` follows from `yarn install`.
- Regenerate the docs pages that list the files the browser-target probe read
  (`apps/docs/evidence/browser-support.md` names three sandbox files).
- Mark D177 executed in the register.

Historical documents that mention `apps/sandbox` (`docs/*.md`, reports, code
comments recording its retirement) are left as they are. They describe what
happened.

## Allowed paths

`apps/sandbox/**`, `deploy/sandbox/**`, `.changeset/config.json`,
`packages/tooling/scripts/release-policy.json`, `yarn.lock`,
`apps/docs/evidence/**`, `apps/docs/components/**`,
`apps/docs/.vitepress/generated/nav.json`, `apps/docs/public/playground/seeds.json`,
`docs/program-2026-09-04/reports/owner-decision-register-2026-09.md`,
`docs/qa/sandbox-removal-2026-09-26/**`.

## Acceptance

`yarn validate:release-policy` reports 4 private packages; `yarn validate:all`,
`yarn lint`, `yarn typecheck:all` and the tooling tests exit 0; CI is green.

## Authority

| Class | Granted |
|---|---|
| Candidate commit, local integration, push `refs/heads/main` | yes |
| Cleanup of this packet's worktree and branch | yes |
| Production (Coolify, DNS) | not needed: nothing exists to remove |
| Publish, tag, secrets, PR #3 merge | **no** |
