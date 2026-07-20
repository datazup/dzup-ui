<script setup lang="ts">
import { LINKS } from '../config.ts'

// Footer columns (spec §4.10). Pro column items are Phase-2 placeholders that
// route to the /pro coming-soon page for now.
const columns = [
  {
    title: 'Docs',
    links: [
      { label: 'Getting started', href: LINKS.gettingStarted, external: true },
      { label: 'Components', href: LINKS.components, external: true },
      { label: 'Theming', href: LINKS.theming, external: true },
      { label: 'Accessibility', href: LINKS.accessibility, external: true },
      { label: 'Contributing', href: LINKS.contributing, external: true },
    ],
  },
  {
    title: 'Pro',
    links: [
      { label: 'Components', href: LINKS.pro, external: false },
      { label: 'Pricing', href: LINKS.pro, external: false },
      { label: 'License', href: LINKS.pro, external: false },
      { label: 'Contact', href: 'mailto:hello@dzup-ui.com', external: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blocks', href: '/blocks', external: false },
      { label: 'Compare', href: '/compare', external: false },
      { label: 'Changelog', href: LINKS.changelog, external: false },
      // No npm / Nuxt-module links yet: the package is unpublished and the Nuxt
      // guide does not exist — a footer link to a 404 says "unmaintained"
      // louder than the link's absence (TASK-FREE-11). Re-add when they exist.
    ],
  },
  {
    // Community = the surfaces that actually exist today: the repo and its
    // issue tracker. The old Discord invite and X handle were 404s and the
    // repo has GitHub Discussions disabled — none of them may ship as links.
    title: 'Community',
    links: [
      { label: 'GitHub', href: LINKS.github, external: true },
      { label: 'Issues', href: LINKS.issues, external: true },
    ],
  },
]

/**
 * `external: true` means "not a router route" — it does NOT mean "open in a new
 * tab" (TASK-FREE3-07).
 *
 * The Contact entry is a `mailto:`, and it was rendered through the same branch
 * as the https docs links: `target="_blank"`. Several browsers handle that by
 * opening a blank tab, handing the URL to the mail client, and leaving the empty
 * tab behind — the user hands off to their mail app and comes back to a stray
 * about:blank. A `mailto:` has no document to put in a tab, so there is nothing
 * for `_blank` to be right about.
 *
 * Scheme is the discriminator rather than another hand-set flag on each entry:
 * a flag has to be remembered, `mailto:` is self-evident from the href, and the
 * next `tel:`/`sms:` link gets the correct behaviour without anyone noticing it
 * needed a decision.
 */
const NON_DOCUMENT_SCHEME = /^(?:mailto|tel|sms):/i

/** `_blank` for real external documents; default navigation for handoff schemes. */
function linkTarget(href: string): string | undefined {
  return NON_DOCUMENT_SCHEME.test(href) ? undefined : '_blank'
}

/**
 * `rel` hygiene belongs with `target="_blank"` and only there — it exists to
 * sever `window.opener` and referrer leakage for a newly opened document, and a
 * mail handoff opens no document to sever.
 */
function linkRel(href: string): string | undefined {
  return NON_DOCUMENT_SCHEME.test(href) ? undefined : 'noreferrer noopener'
}

/** Derived, not typed — a hardcoded 2026 would still read “© 2026” in 2028. */
const year = new Date().getFullYear()

// The badge colour is `0766ee` — `--dz-colors-primary-500`, the brand blue the
// favicon, manifest and theme-color all use (TASK-FREE3-08). It was `6366f1`, a
// generic indigo. Unlike a `var(--dz-*, #hex)` fallback this is not a
// degradation path: a shields.io query string cannot reference a CSS variable,
// so the literal is what every visitor sees on every load. Keep it in step with
// the ramp — `landing-token-fallbacks.spec.ts` recomputes it from tokens.css.
//
// shields.io badges — every one must render TODAY (TASK-FREE-11): the repo is
// public so the live stars badge resolves; npm-backed badges (version,
// bundlephobia, npm license) rendered shields' "not found" placeholders while
// @dzup-ui/core is unpublished, so they are gone until the package is public.
// The license badge is static (the LICENSE file is MIT) and links to the file.
const badges = [
  {
    alt: 'GitHub stars',
    src: 'https://img.shields.io/github/stars/datazup/dzup-ui?label=stars&color=0766ee',
    href: LINKS.github,
  },
  {
    alt: 'MIT license',
    src: 'https://img.shields.io/badge/license-MIT-0766ee',
    href: LINKS.license,
  },
  {
    // Core Web Vitals budget the CI `landing-perf` job enforces on every push
    // (Lighthouse: LCP < 2.5s, CLS < 0.1). A static badge stating the enforced
    // budget — links to the CI workflow where the live run + report artifact live.
    alt: 'Core Web Vitals budget — LCP under 2.5s, CLS under 0.1, enforced in CI',
    src: 'https://img.shields.io/badge/Core%20Web%20Vitals-LCP%3C2.5s%20%C2%B7%20CLS%3C0.1-0766ee',
    href: 'https://github.com/datazup/dzup-ui/actions/workflows/ci.yml',
  },
]
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">dz</span>
          <span class="brand-word">dzup-ui</span>
        </div>
        <p class="footer-tag">
          The open-source Vue 3 component library for serious products.
        </p>
        <ul class="footer-badges" aria-label="Project badges">
          <li v-for="badge in badges" :key="badge.alt">
            <a :href="badge.href" target="_blank" rel="noreferrer noopener">
              <img :src="badge.src" :alt="badge.alt" height="20" loading="lazy" decoding="async">
            </a>
          </li>
        </ul>
      </div>

      <nav class="footer-cols" aria-label="Footer">
        <div v-for="col in columns" :key="col.title" class="footer-col">
          <h3 class="footer-col-title">
            {{ col.title }}
          </h3>
          <ul>
            <li v-for="link in col.links" :key="link.label">
              <a
                v-if="link.external"
                :href="link.href"
                :target="linkTarget(link.href)"
                :rel="linkRel(link.href)"
              >{{ link.label }}</a>
              <router-link v-else :to="link.href">
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="footer-bottom">
      <span>© {{ year }} dzup-ui · Core released under the MIT license.</span>
      <a :href="LINKS.pro">dzup-ui Pro — commercial license</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--dz-border, #b5b7bb);
  background: var(--dz-surface, #ffffff);
  transition: var(--dz-landing-theme-transition);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(40px, 6vw, 72px) 24px 32px;
  display: grid;
  grid-template-columns: 1.4fr 3fr;
  gap: 40px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-weight: 700;
  font-size: var(--dz-text-lg, 1.125rem);
  color: var(--dz-foreground, #1b1d1f);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dz-radius-md, 6px);
  background: linear-gradient(135deg, var(--dz-colors-primary-500, #0766ee), var(--dz-colors-secondary-500, #7260bd));
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.footer-tag {
  margin: 14px 0 0;
  max-width: 32ch;
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-muted-foreground, #585b60);
  line-height: 1.6;
}

.footer-badges {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.footer-badges img {
  display: block;
  height: 20px;
}

.footer-cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.footer-col-title {
  margin: 0 0 12px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 700;
  color: var(--dz-foreground, #1b1d1f);
}

.footer-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-col a {
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-muted-foreground, #585b60);
  text-decoration: none;
  transition: color var(--dz-duration-fast, 150ms);
}

.footer-col a:hover {
  color: var(--dz-primary, #0766ee);
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 24px;
  border-top: 1px solid var(--dz-border, #b5b7bb);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #585b60);
}

.footer-bottom a {
  color: var(--dz-muted-foreground, #585b60);
  text-decoration: none;
}

.footer-bottom a:hover {
  color: var(--dz-primary, #0766ee);
}

@media (max-width: 860px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .footer-cols {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 460px) {
  .footer-cols {
    grid-template-columns: 1fr;
  }
}
</style>
