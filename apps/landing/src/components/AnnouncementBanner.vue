<script setup lang="ts">
/**
 * AnnouncementBanner — the thin, dismissible bar above the nav (landing.md
 * reserves this slot for surfacing releases/news and driving repeat traffic).
 *
 * Config-driven: it reads the single `ANNOUNCEMENT` entry from config.ts and
 * renders nothing when that's `null`, so removing the bar is a one-line edit.
 * Dismissal persists in localStorage keyed by the announcement's `id`, so a
 * visitor who closes it won't see it again — but bumping `id` for a NEW
 * announcement re-shows it to everyone (the old key no longer matches).
 *
 * Accessibility: a labelled `role="region"` landmark; the CTA is a real link
 * (router-link for in-app paths, `<a>` for external); the dismiss control is a
 * real `<button>` (keyboard- and screen-reader-operable) with an explicit label.
 */
import { X } from 'lucide-vue-next'
import { ref } from 'vue'
import { ANNOUNCEMENT } from '../config.ts'

/** localStorage key namespacing the dismissal by announcement id. */
const storageKey = ANNOUNCEMENT ? `dz-announcement-dismissed:${ANNOUNCEMENT.id}` : ''

/** An in-app path (starts with a single '/') routes internally; else external. */
const isInternal = !!ANNOUNCEMENT?.href && /^\/(?!\/)/.test(ANNOUNCEMENT.href)

/** Read the persisted dismissal — SSR/prerender-safe (no window ⇒ show). */
function isDismissed(): boolean {
  if (!ANNOUNCEMENT || typeof localStorage === 'undefined')
    return false
  try {
    return localStorage.getItem(storageKey) === '1'
  }
  catch {
    // Private-mode / blocked storage: fail open (show the bar) rather than throw.
    return false
  }
}

// Initialise synchronously so the bar never flashes in only to hide (the app
// mounts client-side, so `localStorage` is available here).
const visible = ref(!!ANNOUNCEMENT && !isDismissed())

function dismiss(): void {
  visible.value = false
  if (typeof localStorage === 'undefined')
    return
  try {
    localStorage.setItem(storageKey, '1')
  }
  catch {
    // Ignore write failures — the bar still closes for this session.
  }
}
</script>

<template>
  <div
    v-if="ANNOUNCEMENT && visible"
    class="announcement"
    role="region"
    aria-label="Site announcement"
  >
    <p class="announcement-inner">
      <span class="announcement-message">{{ ANNOUNCEMENT.message }}</span>
      <RouterLink
        v-if="ANNOUNCEMENT.href && isInternal"
        :to="ANNOUNCEMENT.href"
        class="announcement-cta"
      >
        {{ ANNOUNCEMENT.linkLabel ?? 'Learn more' }}
      </RouterLink>
      <a
        v-else-if="ANNOUNCEMENT.href"
        :href="ANNOUNCEMENT.href"
        class="announcement-cta"
        target="_blank"
        rel="noreferrer noopener"
      >
        {{ ANNOUNCEMENT.linkLabel ?? 'Learn more' }}
      </a>
    </p>
    <button
      type="button"
      class="announcement-close"
      aria-label="Dismiss announcement"
      @click="dismiss"
    >
      <X :size="16" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.announcement {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 40px;
  padding: 8px 48px;
  background: linear-gradient(
    90deg,
    var(--dz-colors-primary-500, #6366f1),
    var(--dz-colors-secondary-500, #a855f7)
  );
  color: #fff;
  font-size: var(--dz-text-sm, 0.875rem);
  text-align: center;
}

.announcement-inner {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 12px;
  margin: 0;
  line-height: 1.4;
}

.announcement-message {
  font-weight: 500;
}

.announcement-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px solid color-mix(in oklch, #fff 55%, transparent);
  border-radius: var(--dz-radius-full, 9999px);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.announcement-cta:hover {
  background: color-mix(in oklch, #fff 18%, transparent);
}

.announcement-cta:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.announcement-close {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--dz-radius-md, 6px);
  background: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.85;
  transition: background var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.announcement-close:hover {
  opacity: 1;
  background: color-mix(in oklch, #fff 18%, transparent);
}

.announcement-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .announcement {
    padding: 8px 44px;
    text-align: left;
    justify-content: flex-start;
  }
}
</style>
