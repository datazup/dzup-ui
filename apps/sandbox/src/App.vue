<script setup lang="ts">
import { DzToastProvider, DzToastViewport } from '@dzup-ui/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DevDrawer from './components/DevDrawer.vue'
import { useTheme } from './composables/useTheme.ts'
import { sandboxRoutes } from './routes.ts'

const route = useRoute()
useTheme()

const currentPath = computed(() => route.path)
</script>

<template>
  <DzToastProvider>
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="sidebar-title">
            dzup-ui
          </h1>
          <span class="sidebar-badge">sandbox</span>
        </div>

        <nav class="sidebar-nav">
          <router-link
            v-for="family in sandboxRoutes"
            :key="family.path"
            :to="family.path"
            class="nav-link"
            :class="{ active: currentPath === family.path }"
          >
            <span class="nav-icon">{{ family.icon }}</span>
            <span class="nav-label">{{ family.label }}</span>
          </router-link>
        </nav>
      </aside>

      <main class="main-content" data-sandbox-main>
        <router-view />
      </main>

      <DevDrawer />
    </div>
    <DzToastViewport position="bottom-right" />
  </DzToastProvider>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% -20%, color-mix(in oklch, var(--dz-primary, #3b82f6) 14%, transparent), transparent 48%),
    var(--dz-background, #f8f9fa);
}

.sidebar {
  width: 252px;
  flex-shrink: 0;
  background: var(--dz-surface, #ffffff);
  border-right: 1px solid var(--dz-border, #e2e8f0);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px 16px 14px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
  margin-bottom: 8px;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
}

.sidebar-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-colors-primary-100, #dbeafe);
  color: var(--dz-colors-primary-700, #1d4ed8);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  gap: 2px;
  flex: 1;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--dz-border, #e2e8f0);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--dz-radius-md, 6px);
  text-decoration: none;
  color: var(--dz-muted-foreground, #64748b);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.nav-link:hover {
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
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
  background: var(--dz-muted, #f1f5f9);
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
  width: 100%;
  padding: 32px 40px;
  max-width: 1280px;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    position: sticky;
    top: 0;
    z-index: 20;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--dz-border, #e2e8f0);
    overflow-y: visible;
  }

  .sidebar-header {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 10px;
  }

  .sidebar-nav {
    flex-direction: row;
    gap: 6px;
    overflow-x: auto;
    padding: 0 12px 12px;
    scrollbar-width: thin;
  }

  .sidebar-footer {
    display: none;
  }

  .nav-link {
    white-space: nowrap;
  }

  .main-content {
    max-width: none;
    padding: 24px 16px;
  }
}
</style>
