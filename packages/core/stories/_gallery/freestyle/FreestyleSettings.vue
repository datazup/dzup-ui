<script setup lang="ts">
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

import { Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'

const fullName = ref('Jane Doe')
const email = ref('jane@acme.com')
const bio = ref('Product designer focused on developer tools and design systems.')

const emailNotifications = ref(true)
const weeklyDigest = ref(false)
const productUpdates = ref(true)
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 px-4 py-12 font-sans text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100"
  >
    <div class="mx-auto w-full max-w-3xl">
      <!-- Page header -->
      <header class="mb-8">
        <h1 class="text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account, profile, and notification preferences.
        </p>
      </header>

      <div class="space-y-6">
        <!-- Profile card -->
        <section
          class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
        >
          <div class="border-b border-slate-100 px-7 py-5 dark:border-white/5">
            <h2 class="text-base font-semibold tracking-tight">
              Profile
            </h2>
            <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              This information will be displayed on your public profile.
            </p>
          </div>

          <div class="space-y-6 px-7 py-7">
            <!-- Avatar row -->
            <div class="flex items-center gap-5">
              <span
                class="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-semibold text-white shadow-md shadow-indigo-600/20 ring-1 ring-inset ring-white/15"
                aria-hidden="true"
              >
                JD
              </span>
              <div class="space-y-2">
                <button
                  type="button"
                  class="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5 dark:focus-visible:ring-offset-slate-900"
                >
                  Change
                </button>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG or GIF. Recommended 256×256px, max 2MB.
                </p>
              </div>
            </div>

            <!-- Two-column field row -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  for="fs-name"
                  class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Full name
                </label>
                <input
                  id="fs-name"
                  v-model="fullName"
                  type="text"
                  placeholder="e.g. Jane Doe"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
                >
              </div>

              <div>
                <label
                  for="fs-email"
                  class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Email
                </label>
                <input
                  id="fs-email"
                  v-model="email"
                  type="text"
                  placeholder="you@example.com"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
                >
              </div>
            </div>

            <!-- Bio -->
            <div>
              <label
                for="fs-bio"
                class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Bio
              </label>
              <textarea
                id="fs-bio"
                v-model="bio"
                rows="3"
                placeholder="A short description about yourself."
                class="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Brief description for your profile. Markdown is supported.
              </p>
            </div>
          </div>
        </section>

        <!-- Preferences card -->
        <section
          class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
        >
          <div class="border-b border-slate-100 px-7 py-5 dark:border-white/5">
            <h2 class="text-base font-semibold tracking-tight">
              Preferences
            </h2>
            <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Choose what you want to hear about.
            </p>
          </div>

          <div class="px-7">
            <!-- Email notifications -->
            <div class="flex items-center justify-between gap-6 py-5">
              <span class="min-w-0">
                <span class="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email notifications
                </span>
                <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  Receive emails about your account activity.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                :aria-checked="emailNotifications"
                aria-label="Email notifications"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                :class="emailNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'"
                @click="emailNotifications = !emailNotifications"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="emailNotifications ? 'translate-x-[22px]' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <!-- Weekly digest -->
            <div
              class="flex items-center justify-between gap-6 border-t border-slate-100 py-5 dark:border-white/5"
            >
              <span class="min-w-0">
                <span class="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Weekly digest
                </span>
                <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  A summary of your team's activity, every Monday.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                :aria-checked="weeklyDigest"
                aria-label="Weekly digest"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                :class="weeklyDigest ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'"
                @click="weeklyDigest = !weeklyDigest"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="weeklyDigest ? 'translate-x-[22px]' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <!-- Product updates -->
            <div
              class="flex items-center justify-between gap-6 border-t border-slate-100 py-5 dark:border-white/5"
            >
              <span class="min-w-0">
                <span class="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Product updates
                </span>
                <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  News about features and improvements.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                :aria-checked="productUpdates"
                aria-label="Product updates"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                :class="productUpdates ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'"
                @click="productUpdates = !productUpdates"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
                  :class="productUpdates ? 'translate-x-[22px]' : 'translate-x-0.5'"
                />
              </button>
            </div>
          </div>
        </section>

        <!-- Danger zone card -->
        <section
          class="overflow-hidden rounded-2xl border border-rose-200/80 bg-rose-50/40 shadow-xl shadow-rose-900/5 ring-1 ring-rose-500/[0.04] dark:border-rose-500/20 dark:bg-rose-950/20 dark:shadow-black/40"
        >
          <div class="border-b border-rose-200/70 px-7 py-5 dark:border-rose-500/15">
            <h2 class="text-base font-semibold tracking-tight text-rose-700 dark:text-rose-300">
              Danger zone
            </h2>
            <p class="mt-1.5 text-sm text-rose-600/80 dark:text-rose-300/70">
              Irreversible and destructive actions.
            </p>
          </div>

          <div class="px-7 py-7">
            <div
              class="flex flex-col gap-4 rounded-xl border border-rose-200/70 bg-white/60 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-rose-500/15 dark:bg-slate-900/40"
            >
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-rose-700 dark:text-rose-300">
                  Delete account
                </span>
                <span class="mt-1 block text-sm text-rose-600/80 dark:text-rose-300/70">
                  Permanently remove your account and all of its data. This action cannot be undone.
                </span>
              </span>
              <button
                type="button"
                class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:border-rose-500/40 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 dark:focus-visible:ring-offset-slate-900"
              >
                <Trash2 class="h-4 w-4" aria-hidden="true" />
                Delete account
              </button>
            </div>
          </div>
        </section>

        <!-- Footer action row — transparent, sits on page background -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5 dark:focus-visible:ring-offset-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 active:translate-y-0 dark:focus-visible:ring-offset-slate-900"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
