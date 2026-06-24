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
      { label: 'GitHub', href: LINKS.github, external: true },
      { label: 'Changelog', href: LINKS.changelog, external: true },
      { label: 'npm', href: LINKS.npm, external: true },
      { label: 'Nuxt module', href: LINKS.nuxtModule, external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: LINKS.discord, external: true },
      { label: 'X / Twitter', href: LINKS.twitter, external: true },
      { label: 'Discussions', href: LINKS.discussions, external: true },
    ],
  },
]

const year = 2026
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
      </div>

      <nav class="footer-cols" aria-label="Footer">
        <div v-for="col in columns" :key="col.title" class="footer-col">
          <h3 class="footer-col-title">{{ col.title }}</h3>
          <ul>
            <li v-for="link in col.links" :key="link.label">
              <a
                v-if="link.external"
                :href="link.href"
                target="_blank"
                rel="noreferrer noopener"
              >{{ link.label }}</a>
              <router-link v-else :to="link.href">{{ link.label }}</router-link>
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
  border-top: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
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
  color: var(--dz-foreground, #1a202c);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dz-radius-md, 6px);
  background: linear-gradient(135deg, var(--dz-colors-primary-500, #6366f1), var(--dz-colors-secondary-500, #a855f7));
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.footer-tag {
  margin: 14px 0 0;
  max-width: 32ch;
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-muted-foreground, #64748b);
  line-height: 1.6;
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
  color: var(--dz-foreground, #1a202c);
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
  color: var(--dz-muted-foreground, #64748b);
  text-decoration: none;
  transition: color var(--dz-duration-fast, 150ms);
}

.footer-col a:hover {
  color: var(--dz-primary, #4f46e5);
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 24px;
  border-top: 1px solid var(--dz-border, #e2e8f0);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #64748b);
}

.footer-bottom a {
  color: var(--dz-muted-foreground, #64748b);
  text-decoration: none;
}

.footer-bottom a:hover {
  color: var(--dz-primary, #4f46e5);
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
