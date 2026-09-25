# Rollback policy — `@dzup-ui/*` on npm

Owner decision, 2026-09-25 (`docs/qa/release-decisions-2026-09-25/ADMISSION.md`).
It applies to the six published packages in
`packages/tooling/scripts/release-policy.json`.

## Who acts

**The owner of the `@dzup-ui` npm scope (the operator)** runs every command
below. An agent or contributor may diagnose a bad release, prepare the fix
(branch, changeset, commands), and open the PR. An agent never runs
`npm deprecate`, `npm dist-tag` or `npm unpublish`.

## A bad release is fixed forward

Release a fix; do not remove the published version.

1. **Deprecate the bad version**, so installs warn and say what to use:

   ```sh
   npm deprecate @dzup-ui/<pkg>@<bad-version> "Broken: <one line>. Use <good-version> or later."
   ```

2. **Publish a superseding patch.** Revert or fix the change on `main` with a
   `patch` changeset, and let the Release workflow's PR carry it as normal.
   Under `packages/contracts/VERSIONING.md` (0.x), a fix that restores a removed
   export is a patch.

3. **If users need to be protected before the patch lands**, point `latest` back
   at the last good version. Move it forward again once the patch is out:

   ```sh
   npm dist-tag add @dzup-ui/<pkg>@<last-good-version> latest
   ```

Use a linked set together. `@dzup-ui/core` and `@dzup-ui/tokens` version as a
pair (`.changeset/config.json` `linked`), so deprecate and re-tag both.

## Unpublish is for emergencies only

`npm unpublish @dzup-ui/<pkg>@<version>` is used **only** when:

- the tarball contains a leaked secret or credential, **and**
- the version is less than 72 hours old (npm's unpublish window).

A version number can never be reused after unpublish, so the fix still ships as
a new patch.

A leaked secret is revoked first, whatever the age of the release. Unpublishing
does not un-leak it.

## Record it

Each rollback gets a short note under `docs/qa/release/`, next to the release
bundle it concerns. The note gives:

- the version;
- the symptom;
- the commands run and who ran them;
- the superseding version.
