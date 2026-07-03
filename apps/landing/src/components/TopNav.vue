<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
import { Github, Menu, Star, X } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { FACTS, LINKS } from '../config.ts'

const router = useRouter()

// Sticky nav grows a blurred background + border once the user scrolls (§4.1).
const scrolled = ref(false)
const mobileOpen = ref(false)

function onScroll(): void {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// External Storybook links. "Themes" now points to the in-app /themes editor
// (a router-link below), so it's no longer duplicated here.
const navLinks = [
  { label: 'Components', href: LINKS.components, external: true },
  { label: 'Docs', href: LINKS.gettingStarted, external: true },
]

function goPro(): void {
  mobileOpen.value = false
  void router.push(LINKS.pro)
}
</script>

<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <router-link to="/" class="brand" aria-label="dzup-ui home">
        <span class="brand-mark" aria-hidden="true">dz</span>
        <span class="brand-word">dzup-ui</span>
      </router-link>

      <nav class="nav-links" aria-label="Primary">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="nav-link"
        >{{ link.label }}</a>
        <router-link :to="{ path: '/', hash: '#ecosystem' }" class="nav-link">Ecosystem</router-link>
        <router-link to="/blocks" class="nav-link">Blocks</router-link>
        <router-link to="/animations" class="nav-link">Animations</router-link>
        <router-link to="/themes" class="nav-link">Themes</router-link>
        <router-link to="/ai" class="nav-link">AI IDE</router-link>
        <router-link to="/compare" class="nav-link">Compare</router-link>
        <router-link to="/pro" class="nav-link">Pro</router-link>
      </nav>

      <div class="nav-utils">
        <a class="star-btn" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
          <Github :size="16" aria-hidden="true" />
          <span class="star-label">
            <Star :size="13" aria-hidden="true" />
            {{ FACTS.githubStars ?? 'Star' }}
          </span>
        </a>
        <ThemeToggle />
        <DzButton size="sm" variant="solid" tone="primary" as="a" :href="LINKS.components" class="nav-cta">
          Browse components
        </DzButton>
        <button
          type="button"
          class="menu-btn"
          :aria-expanded="mobileOpen"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" :size="20" aria-hidden="true" />
          <Menu v-else :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="mobile-sheet">
      <a
        v-for="link in navLinks"
        :key="link.label"
        :href="link.href"
        class="mobile-link"
        @click="mobileOpen = false"
      >{{ link.label }}</a>
      <router-link :to="{ path: '/', hash: '#ecosystem' }" class="mobile-link" @click="mobileOpen = false">Ecosystem</router-link>
      <router-link to="/blocks" class="mobile-link" @click="mobileOpen = false">Blocks</router-link>
      <router-link to="/animations" class="mobile-link" @click="mobileOpen = false">Animations</router-link>
      <router-link to="/themes" class="mobile-link" @click="mobileOpen = false">Themes</router-link>
      <router-link to="/ai" class="mobile-link" @click="mobileOpen = false">AI IDE</router-link>
      <router-link to="/compare" class="mobile-link" @click="mobileOpen = false">Compare</router-link>
      <button type="button" class="mobile-link" @click="goPro">Pro</button>
      <a class="mobile-link" :href="LINKS.github" target="_blank" rel="noreferrer noopener">GitHub</a>
    </div>
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
  background: color-mix(in oklch, var(--dz-background, #fff) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom-color: var(--dz-border, #e2e8f0);
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
  color: var(--dz-foreground, #1a202c);
  font-weight: 700;
  font-size: var(--dz-text-lg, 1.125rem);
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
  box-shadow:
    0 2px 8px -2px color-mix(in oklch, var(--dz-primary, #6366f1) 60%, transparent),
    inset 0 1px 0 color-mix(in oklch, #fff 35%, transparent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: auto;
}

.nav-link {
  padding: 8px 12px;
  border-radius: var(--dz-radius-md, 6px);
  text-decoration: none;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--dz-duration-fast, 150ms), background var(--dz-duration-fast, 150ms);
}

.nav-link:hover {
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-muted, #f1f5f9);
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
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #1a202c);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  text-decoration: none;
  transition: border-color var(--dz-duration-fast, 150ms), background var(--dz-duration-fast, 150ms);
}

.star-btn:hover {
  border-color: var(--dz-border-hover, #cbd5e1);
  background: var(--dz-muted, #f1f5f9);
}

.star-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dz-muted-foreground, #64748b);
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #1a202c);
  cursor: pointer;
}

.mobile-sheet {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  gap: 2px;
  background: var(--dz-surface, #fff);
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
}

.mobile-link {
  padding: 12px;
  border-radius: var(--dz-radius-md, 6px);
  text-decoration: none;
  font-size: var(--dz-text-base, 1rem);
  font-weight: 500;
  color: var(--dz-foreground, #1a202c);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.mobile-link:hover {
  background: var(--dz-muted, #f1f5f9);
}

@media (max-width: 860px) {
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
    margin-right: 0;
  }
  .nav-inner {
    justify-content: space-between;
  }
  .brand {
    margin-right: auto;
  }
}
</style>
