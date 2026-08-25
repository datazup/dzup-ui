<script setup lang="ts">
import { DzButton, DzDropdownMenu, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuTrigger } from '@dzup-ui/core'
import { ChevronDown, Github, Menu, Star, X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useLiveStats } from '../composables/useLiveStats.ts'
import { LINKS } from '../config.ts'
import { isGroup, NAV, navLeaves } from '../nav.ts'
import ThemeToggle from './ThemeToggle.vue'

/**
 * TopNav (TASK-DS-12) — nine flat items regrouped into five.
 *
 * The old bar had two real defects, both fixed here:
 *
 * - **"Components" and "Docs" both dumped you into Storybook.** They are now
 *   distinct menus: Components lists things you drop into an app (the component
 *   index, Blocks, Templates, Animations); Docs lists guides you read.
 * - **"Ecosystem" duplicated its own children.** It linked to the `#ecosystem`
 *   section whose tiles are Blocks / Templates / Animations / Themes — three of
 *   which sat beside it as top-level siblings. The nav entry is gone; its
 *   children are now real destinations, and the home-page section stays put.
 *
 * `/templates` also joins the nav for the first time — it had a route and an
 * Ecosystem tile, but no way to reach it from the header.
 *
 * Menus are Reka-backed `DzDropdownMenu` (roving focus, Escape, arrow keys,
 * aria-haspopup/aria-expanded) rather than hand-rolled, and non-modal so the
 * page behind them stays scrollable and interactive.
 */

const route = useRoute()

// The star pill shows the real count once the repo is public; until
// then the GitHub API 404s, `githubStars` stays null, and the pill reads "Star"
// as a call to action rather than a fabricated figure.
const { githubStars } = useLiveStats()

// Sticky nav grows a blurred background + border once the user scrolls (§4.1).
const scrolled = ref(false)
const mobileOpen = ref(false)
const menuButton = useTemplateRef<HTMLButtonElement>('menuButton')
const mobileNav = useTemplateRef<HTMLElement>('mobileNav')

function onScroll(): void {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// A drawer that survives navigation is a trap: close it whenever the route lands.
watch(() => route.fullPath, () => {
  mobileOpen.value = false
})

/**
 * Selector for what counts as the drawer's first stop. The drawer holds links
 * only, but naming the whole focusable set keeps this correct if a control is
 * ever added — and `:not([tabindex="-1"])` skips anything deliberately taken out
 * of the tab order.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Opening the drawer moves focus into it (TASK-FREE3-07).
 *
 * The toggle sits at the END of the utility cluster, and the drawer renders after
 * it in the DOM — so without this, a keyboard user who opens the menu is still
 * standing on the button, and Tab walks them through whatever follows before it
 * reaches the menu they just asked for. `closeMobile` already returns focus to the
 * toggle; this is the matching half of that contract.
 *
 * `nextTick` because the drawer is `v-if` — it does not exist in the DOM at the
 * moment `mobileOpen` flips. Deliberately NOT a focus trap: the drawer is
 * non-modal (the page behind it stays scrollable and interactive), so Tab must be
 * free to leave it. This is an entry move, nothing more.
 */
watch(mobileOpen, (open) => {
  if (!open)
    return
  void nextTick(() => {
    // Template ref, not getElementById: scoped to THIS instance's drawer, so a
    // second mounted nav (as in a test file, or a preview embed) cannot be the
    // one that receives focus.
    mobileNav.value?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  })
})

function closeMobile(): void {
  if (!mobileOpen.value)
    return
  mobileOpen.value = false
  // Escape must return focus to the control that opened the drawer, or the user
  // is dropped at the top of the document.
  menuButton.value?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape')
    closeMobile()
}

/**
 * A group's trigger is not a link, so it cannot be `aria-current="page"`. It can
 * still say "the current page lives in here" — `aria-current="true"` marks the
 * current item within a set. The leaf itself gets `page` for free from RouterLink.
 */
const activeGroups = computed(() =>
  new Set(
    NAV.filter(isGroup)
      .filter(group => group.items.some(item => !item.external && item.href === route.path))
      .map(group => group.label),
  ),
)

/** Top-level entries that are plain links — the flat tail of the mobile drawer. */
const leaves = navLeaves()
</script>

<template>
  <header class="nav" :class="{ scrolled }" @keydown="onKeydown">
    <div class="nav-inner">
      <RouterLink to="/" class="brand" aria-label="dzup-ui home">
        <span class="brand-mark" aria-hidden="true">dz</span>
        <span class="brand-word">dzup-ui</span>
      </RouterLink>

      <nav class="nav-links" aria-label="Primary">
        <template v-for="entry in NAV" :key="entry.label">
          <DzDropdownMenu v-if="isGroup(entry)" :modal="false">
            <DzDropdownMenuTrigger>
              <button
                type="button"
                class="nav-link nav-trigger"
                :aria-current="activeGroups.has(entry.label) ? 'true' : undefined"
              >
                {{ entry.label }}
                <ChevronDown :size="14" aria-hidden="true" class="nav-chevron" />
              </button>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent align="start" :side-offset="8" class="nav-menu">
              <template v-for="item in entry.items" :key="item.href">
                <DzDropdownMenuItem v-if="item.external" as="a" :href="item.href" class="lp-menu-item">
                  {{ item.label }}
                </DzDropdownMenuItem>
                <DzDropdownMenuItem v-else as-child>
                  <RouterLink :to="item.href" class="lp-menu-item">
                    {{ item.label }}
                  </RouterLink>
                </DzDropdownMenuItem>
              </template>
            </DzDropdownMenuContent>
          </DzDropdownMenu>

          <a v-else-if="entry.external" :href="entry.href" class="nav-link">{{ entry.label }}</a>
          <RouterLink v-else :to="entry.href" class="nav-link">
            {{ entry.label }}
          </RouterLink>
        </template>
      </nav>

      <div class="nav-utils">
        <a
          class="star-btn"
          :href="LINKS.github"
          target="_blank"
          rel="noreferrer noopener"
          :aria-label="githubStars !== null ? `${githubStars} GitHub stars` : 'Star dzup-ui on GitHub'"
        >
          <Github :size="16" aria-hidden="true" />
          <span class="star-label">
            <Star :size="13" aria-hidden="true" />
            {{ githubStars ?? 'Star' }}
          </span>
        </a>
        <ThemeToggle />
        <DzButton size="sm" variant="solid" tone="primary" as="a" :href="LINKS.components" class="nav-cta">
          Browse components
        </DzButton>
        <button
          ref="menuButton"
          type="button"
          class="menu-btn"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" :size="20" aria-hidden="true" />
          <Menu v-else :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- The drawer mirrors the desktop grouping: labelled sections, not a flat
         list, so the same information architecture reads on a phone. -->
    <nav
      v-if="mobileOpen"
      id="mobile-nav"
      ref="mobileNav"
      class="mobile-sheet"
      aria-label="Primary (mobile)"
    >
      <template v-for="entry in NAV" :key="entry.label">
        <div v-if="isGroup(entry)" class="mobile-group">
          <p :id="`mobile-group-${entry.label}`" class="mobile-group-label">
            {{ entry.label }}
          </p>
          <ul class="mobile-list" :aria-labelledby="`mobile-group-${entry.label}`">
            <li v-for="item in entry.items" :key="item.href">
              <a v-if="item.external" :href="item.href" class="mobile-link">{{ item.label }}</a>
              <RouterLink v-else :to="item.href" class="mobile-link">
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </template>

      <ul class="mobile-list mobile-list--flat">
        <li v-for="entry in leaves" :key="entry.label">
          <a v-if="entry.external" :href="entry.href" class="mobile-link">{{ entry.label }}</a>
          <RouterLink v-else :to="entry.href" class="mobile-link">
            {{ entry.label }}
          </RouterLink>
        </li>
        <li>
          <a class="mobile-link" :href="LINKS.github" target="_blank" rel="noreferrer noopener">GitHub</a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid transparent;
  transition: var(--dz-landing-theme-transition), border-color var(--dz-duration-normal, 220ms);
}

.nav.scrolled {
  background: color-mix(in oklch, var(--dz-background, #e7e8e9) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom-color: var(--dz-border, #b5b7bb);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: var(--dz-foreground, #1b1d1f);
  font-weight: 700;
  font-size: var(--dz-text-lg, 1.125rem);
  border-radius: var(--dz-radius-md, 6px);
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
  box-shadow:
    0 2px 8px -2px color-mix(in oklch, var(--dz-primary, #0766ee) 60%, transparent),
    inset 0 1px 0 color-mix(in oklch, #fff 35%, transparent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-inline-end: auto;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: var(--dz-radius-md, 6px);
  text-decoration: none;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-muted-foreground, #585b60);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--dz-duration-fast, 150ms), background var(--dz-duration-fast, 150ms);
}

.nav-link:hover {
  color: var(--dz-foreground, #1b1d1f);
  background: var(--dz-muted, #d3d4d7);
}

/* The active route — and the group that contains it — read as current. */
.nav-link[aria-current] {
  color: var(--dz-foreground, #1b1d1f);
  font-weight: 600;
}

.brand:focus-visible,
.nav-link:focus-visible,
.star-btn:focus-visible,
.menu-btn:focus-visible,
.mobile-link:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

.nav-chevron {
  opacity: 0.65;
  transition: transform var(--dz-duration-fast, 150ms);
}

.nav-trigger[data-state="open"] .nav-chevron {
  transform: rotate(180deg);
}

.nav-menu {
  min-width: 200px;
}

.nav-utils {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #ffffff);
  color: var(--dz-foreground, #1b1d1f);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  text-decoration: none;
  transition: border-color var(--dz-duration-fast, 150ms), background var(--dz-duration-fast, 150ms);
}

.star-btn:hover {
  border-color: var(--dz-border-hover, #b5b7bb);
  background: var(--dz-muted, #d3d4d7);
}

.star-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dz-muted-foreground, #585b60);
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #ffffff);
  color: var(--dz-foreground, #1b1d1f);
  cursor: pointer;
}

.mobile-sheet {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  gap: 10px;
  background: var(--dz-surface, #ffffff);
  border-bottom: 1px solid var(--dz-border, #b5b7bb);
}

.mobile-group-label {
  margin: 8px 0 2px;
  padding: 0 12px;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mobile-list--flat {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--dz-border, #b5b7bb);
}

.mobile-link {
  display: block;
  padding: 12px;
  border-radius: var(--dz-radius-md, 6px);
  text-decoration: none;
  font-size: var(--dz-text-base, 1rem);
  font-weight: 500;
  color: var(--dz-foreground, #1b1d1f);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.mobile-link:hover {
  background: var(--dz-muted, #d3d4d7);
}

.mobile-link[aria-current="page"] {
  font-weight: 700;
  color: var(--dz-primary-muted-foreground);
}

@media (max-width: 980px) {
  .nav-links,
  .star-label,
  .nav-cta {
    display: none;
  }
  .menu-btn {
    display: inline-flex;
  }
  .mobile-sheet {
    display: flex;
  }
  .nav-links {
    margin-inline-end: 0;
  }
  .nav-inner {
    justify-content: space-between;
  }
  .brand {
    margin-inline-end: auto;
  }
}
</style>
