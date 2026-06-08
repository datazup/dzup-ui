<script setup lang="ts">
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

import { ref, computed } from 'vue'

const name = ref('')
const visibility = ref<'private' | 'team' | 'public'>('team')
const description = ref('')
const notifications = ref(true)
const isPublic = ref(false)
const touched = ref(false)

const nameError = computed(() =>
  touched.value && name.value.trim() === '' ? 'Name is required' : '',
)

function submit() {
  touched.value = true
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 px-4 py-12 font-sans text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100"
  >
    <div class="w-full max-w-lg">
      <!-- Card -->
      <form
        class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
        @submit.prevent="submit"
      >
        <!-- Header -->
        <div class="border-b border-slate-100 px-7 pb-5 pt-6 dark:border-white/5">
          <p
            class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
          >
            Workspace
          </p>
          <h1 class="text-xl font-semibold tracking-tight">Create Project</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Spin up a new project and invite your team.
          </p>
        </div>

        <!-- Body -->
        <div class="space-y-5 px-7 py-6">
          <!-- Text input -->
          <div>
            <label
              for="fp-name"
              class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Project name
            </label>
            <input
              id="fp-name"
              v-model="name"
              type="text"
              placeholder="e.g. Atlas Migration"
              class="w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
              :class="
                nameError
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/30 dark:border-rose-500/60'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-white/10'
              "
              @blur="touched = true"
            />
            <p
              v-if="nameError"
              class="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              <span aria-hidden="true">⚠</span>
              {{ nameError }}
            </p>
          </div>

          <!-- Select -->
          <div>
            <label
              for="fp-visibility"
              class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Visibility
            </label>
            <div class="relative">
              <select
                id="fp-visibility"
                v-model="visibility"
                class="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100"
              >
                <option value="private">Private — only you</option>
                <option value="team">Team — everyone in workspace</option>
                <option value="public">Public — anyone with the link</option>
              </select>
              <span
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
                aria-hidden="true"
                >▾</span
              >
            </div>
          </div>

          <!-- Textarea -->
          <div>
            <label
              for="fp-desc"
              class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Description
            </label>
            <textarea
              id="fp-desc"
              v-model="description"
              rows="3"
              placeholder="What is this project about?"
              class="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div class="border-t border-slate-100 pt-5 dark:border-white/5">
            <!-- Checkbox row -->
            <label class="flex cursor-pointer items-start gap-3 py-1">
              <input
                v-model="notifications"
                type="checkbox"
                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 shadow-sm transition focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-0 dark:border-white/20 dark:bg-slate-950"
              />
              <span>
                <span class="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >Enable notifications</span
                >
                <span class="block text-xs text-slate-500 dark:text-slate-400"
                  >Get an email when activity happens in this project.</span
                >
              </span>
            </label>

            <!-- Toggle switch -->
            <div class="mt-3 flex items-center justify-between py-1">
              <span>
                <span class="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >Make public</span
                >
                <span class="block text-xs text-slate-500 dark:text-slate-400"
                  >Anyone with the link can view this project.</span
                >
              </span>
              <button
                type="button"
                role="switch"
                :aria-checked="isPublic"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                :class="isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'"
                @click="isPublic = !isPublic"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="isPublic ? 'translate-x-[22px]' : 'translate-x-0.5'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-7 py-4 dark:border-white/5 dark:bg-white/[0.02]"
        >
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 active:translate-y-0 dark:focus-visible:ring-offset-slate-900"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
