<script setup lang="ts">
const families = [
  { name: 'Buttons', count: 5, description: 'Button, ButtonGroup, IconButton, SplitButton, ToggleButton' },
  { name: 'Inputs', count: 6, description: 'Input, NumberInput, PasswordInput, SearchInput, OtpInput, Textarea' },
  { name: 'Forms', count: 12, description: 'Select, Checkbox, Radio, Switch, Slider, DatePicker, and more' },
  { name: 'Feedback', count: 8, description: 'Alert, Badge, Empty, Notification, Progress, Result, Skeleton, Spinner, Toast' },
  { name: 'Overlays', count: 7, description: 'Dialog, Popover, Tooltip, Sheet, DropdownMenu, ContextMenu, CommandPalette' },
  { name: 'Cards', count: 3, description: 'Card, CardHeader, CardContent, CardFooter' },
  { name: 'Data', count: 5, description: 'Table, DataGrid, Pagination, Tree, List' },
  { name: 'Layout', count: 6, description: 'Container, Stack, Grid, Divider, Spacer, AspectRatio' },
  { name: 'Navigation', count: 5, description: 'Tabs, Breadcrumbs, Navbar, Sidebar, Steps' },
  { name: 'Media', count: 3, description: 'Avatar, Image, Icon' },
  { name: 'Typography', count: 3, description: 'Heading, Text, Code' },
]
</script>

<template>
  <div class="home-page">
    <header class="page-header">
      <h1 class="page-title">
        dzip-ui Sandbox
      </h1>
      <p class="page-description">
        Development playground for testing and exploring dzip-ui components.
        Select a component family from the sidebar to view interactive demos.
      </p>
    </header>

    <section class="stats-bar">
      <div class="stat">
        <span class="stat-value">11</span>
        <span class="stat-label">Families</span>
      </div>
      <div class="stat">
        <span class="stat-value">146+</span>
        <span class="stat-label">Core Components</span>
      </div>
      <div class="stat">
        <span class="stat-value">40+</span>
        <span class="stat-label">Pro Components</span>
      </div>
      <div class="stat">
        <span class="stat-value">2300+</span>
        <span class="stat-label">Tests Passing</span>
      </div>
    </section>

    <section class="family-grid">
      <router-link
        v-for="family in families"
        :key="family.name"
        :to="`/${family.name.toLowerCase()}`"
        class="family-card"
      >
        <h3 class="family-name">
          {{ family.name }}
        </h3>
        <span class="family-count">{{ family.count }} components</span>
        <p class="family-desc">
          {{ family.description }}
        </p>
      </router-link>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 960px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-colors-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-colors-muted-foreground, #64748b);
  margin: 0;
  line-height: 1.6;
}

.stats-bar {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  background: var(--dz-colors-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-colors-border, #e2e8f0);
  margin-bottom: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--dz-colors-primary-600, #2563eb);
}

.stat-label {
  font-size: 12px;
  color: var(--dz-colors-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.family-card {
  display: block;
  padding: 20px;
  background: var(--dz-colors-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-colors-border, #e2e8f0);
  text-decoration: none;
  transition: all 0.15s ease;
}

.family-card:hover {
  border-color: var(--dz-colors-primary-300, #93c5fd);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.06);
}

.family-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-colors-foreground, #1a202c);
}

.family-count {
  font-size: 12px;
  color: var(--dz-colors-primary-600, #2563eb);
  font-weight: 500;
}

.family-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--dz-colors-muted-foreground, #64748b);
  line-height: 1.5;
}
</style>
