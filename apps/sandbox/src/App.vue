<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const families = [
  { name: 'Home', path: '/', icon: 'H' },
  { name: 'Buttons', path: '/buttons', icon: 'B' },
  { name: 'Inputs', path: '/inputs', icon: 'I' },
  { name: 'Forms', path: '/forms', icon: 'F' },
  { name: 'Cards', path: '/cards', icon: 'C' },
  { name: 'Data', path: '/data', icon: 'D' },
  { name: 'Feedback', path: '/feedback', icon: 'Fb' },
  { name: 'Layout', path: '/layout', icon: 'L' },
  { name: 'Navigation', path: '/navigation', icon: 'N' },
  { name: 'Overlays', path: '/overlays', icon: 'O' },
  { name: 'Media', path: '/media', icon: 'M' },
  { name: 'Typography', path: '/typography', icon: 'T' },
] as const

const currentPath = computed(() => route.path)
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="sidebar-title">
          dzip-ui
        </h1>
        <span class="sidebar-badge">sandbox</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="family in families"
          :key="family.path"
          :to="family.path"
          class="nav-link"
          :class="{ active: currentPath === family.path }"
        >
          <span class="nav-icon">{{ family.icon }}</span>
          <span class="nav-label">{{ family.name }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--dz-colors-background, #f8f9fa);
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--dz-colors-surface, #ffffff);
  border-right: 1px solid var(--dz-colors-border, #e2e8f0);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px 16px 12px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-bottom: 1px solid var(--dz-colors-border, #e2e8f0);
  margin-bottom: 8px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--dz-colors-foreground, #1a202c);
}

.sidebar-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-colors-primary-100, #dbeafe);
  color: var(--dz-colors-primary-700, #1d4ed8);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--dz-radius-md, 6px);
  text-decoration: none;
  color: var(--dz-colors-muted-foreground, #64748b);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.nav-link:hover {
  background: var(--dz-colors-muted, #f1f5f9);
  color: var(--dz-colors-foreground, #1a202c);
}

.nav-link.active {
  background: var(--dz-colors-primary-50, #eff6ff);
  color: var(--dz-colors-primary-700, #1d4ed8);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-colors-muted, #f1f5f9);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.nav-link.active .nav-icon {
  background: var(--dz-colors-primary-100, #dbeafe);
  color: var(--dz-colors-primary-700, #1d4ed8);
}

.main-content {
  flex: 1;
  padding: 32px 40px;
  max-width: 1200px;
  overflow-y: auto;
}
</style>
