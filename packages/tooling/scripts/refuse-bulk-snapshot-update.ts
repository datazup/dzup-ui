/**
 * `yarn test:e2e:update` — deliberately removed (TASK-N1-O6).
 *
 * It used to be `playwright test --update-snapshots`: one command that rewrote
 * every committed baseline in the repository, leaving a diff nobody could read
 * and a green run that meant nothing. That is the exact failure the visual
 * lane's authority rule exists to prevent, so the command is kept as a
 * signpost rather than deleted — a missing script sends people to the
 * Playwright docs, which tell them to run the flag directly.
 *
 * The flag itself is refused inside the run by `e2e/visual/authority.ts`, and
 * an image changed around both is caught by `yarn validate:visual-baselines`.
 */

import process from 'node:process'

console.error(`
✗ \`yarn test:e2e:update\` no longer exists, and neither does any bulk path.

  A changed baseline is a changed product. Accepting one is an act with an
  author and a stated cause — the same shape as lowering a perf threshold.
  Accept them one at a time:

    yarn visual:accept --component DzButton --theme dark \\
      --by "<name>" --reason "<what changed, and why the new image is correct>"

  To see the diffs first:

    yarn test:e2e:visual:pilot     # per-component lane (buttons)
    yarn test:e2e:visual           # screen-level lane (gallery, theme recipes)

  The rules and the review workflow: e2e/visual/README.md
`.trim())

process.exit(1)
