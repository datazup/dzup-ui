<script setup lang="ts">
// dzup-ui settings/account scene — ONLY @dzup-ui/core components + --dz-* tokens.

import { ref } from 'vue'
import { DzButton } from '../../../src/components/buttons'
import { DzCard, DzCardBody, DzCardHeader } from '../../../src/components/cards'
import { DzFormField, DzFormLabel, DzSwitch } from '../../../src/components/forms'
import { DzInput, DzTextarea } from '../../../src/components/inputs'
import { DzAlert } from '../../../src/components/feedback'
import { DzAvatar } from '../../../src/components/media'
import { DzHeading, DzText } from '../../../src/components/typography'

const fullName = ref('Jane Doe')
const email = ref('jane@acme.com')
const bio = ref('Product designer focused on developer tools and design systems.')

const emailNotifications = ref(true)
const weeklyDigest = ref(false)
const productUpdates = ref(true)
</script>

<template>
  <div
    class="min-h-screen bg-[var(--dz-background)] px-4 py-12 text-[var(--dz-foreground)] antialiased"
  >
    <div class="mx-auto w-full max-w-3xl">
      <!-- Page header -->
      <header class="mb-8">
        <DzHeading :level="1" size="xl" weight="semibold">Settings</DzHeading>
        <DzText as="p" size="sm" tone="muted" class="mt-1">
          Manage your account, profile, and notification preferences.
        </DzText>
      </header>

      <div class="space-y-6">
        <!-- Profile card -->
        <DzCard variant="elevated" padding="none">
          <DzCardHeader>
            <div class="border-b border-[var(--dz-border)] px-7 py-5">
              <DzHeading :level="2" size="md" weight="semibold">Profile</DzHeading>
              <DzText as="p" size="sm" tone="muted" class="mt-1">
                This information will be displayed on your public profile.
              </DzText>
            </div>
          </DzCardHeader>

          <DzCardBody>
            <div class="space-y-6 px-7 py-7">
              <!-- Avatar row -->
              <div class="flex items-center gap-5">
                <DzAvatar size="lg" fallback="JD" alt="Jane Doe" />
                <div class="space-y-2">
                  <DzButton type="button" variant="outline" tone="neutral" size="sm">
                    Change
                  </DzButton>
                  <DzText as="p" size="xs" tone="muted">
                    JPG, PNG or GIF. Recommended 256×256px, max 2MB.
                  </DzText>
                </div>
              </div>

              <!-- Two-column field row -->
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DzFormField>
                  <DzFormLabel>Full name</DzFormLabel>
                  <DzInput v-model="fullName" placeholder="e.g. Jane Doe" />
                </DzFormField>

                <DzFormField>
                  <DzFormLabel>Email</DzFormLabel>
                  <DzInput v-model="email" type="text" placeholder="you@example.com" />
                </DzFormField>
              </div>

              <!-- Bio -->
              <DzFormField>
                <DzFormLabel>Bio</DzFormLabel>
                <DzTextarea
                  v-model="bio"
                  :rows="3"
                  placeholder="A short description about yourself."
                />
                <DzText as="p" size="xs" tone="muted" class="mt-1.5">
                  Brief description for your profile. Markdown is supported.
                </DzText>
              </DzFormField>
            </div>
          </DzCardBody>
        </DzCard>

        <!-- Preferences card -->
        <DzCard variant="elevated" padding="none">
          <DzCardHeader>
            <div class="border-b border-[var(--dz-border)] px-7 py-5">
              <DzHeading :level="2" size="md" weight="semibold">Preferences</DzHeading>
              <DzText as="p" size="sm" tone="muted" class="mt-1">
                Choose what you want to hear about.
              </DzText>
            </div>
          </DzCardHeader>

          <DzCardBody>
            <div class="px-7">
              <!-- Email notifications -->
              <div class="flex items-center justify-between gap-6 py-5">
                <span class="min-w-0">
                  <DzText as="span" size="sm" weight="medium" class="block">
                    Email notifications
                  </DzText>
                  <DzText as="span" size="xs" tone="muted" class="block">
                    Receive emails about your account activity.
                  </DzText>
                </span>
                <DzSwitch v-model="emailNotifications" aria-label="Email notifications" />
              </div>

              <!-- Weekly digest -->
              <div
                class="flex items-center justify-between gap-6 border-t border-[var(--dz-border)] py-5"
              >
                <span class="min-w-0">
                  <DzText as="span" size="sm" weight="medium" class="block"> Weekly digest </DzText>
                  <DzText as="span" size="xs" tone="muted" class="block">
                    A summary of your team's activity, every Monday.
                  </DzText>
                </span>
                <DzSwitch v-model="weeklyDigest" aria-label="Weekly digest" />
              </div>

              <!-- Product updates -->
              <div
                class="flex items-center justify-between gap-6 border-t border-[var(--dz-border)] py-5"
              >
                <span class="min-w-0">
                  <DzText as="span" size="sm" weight="medium" class="block">
                    Product updates
                  </DzText>
                  <DzText as="span" size="xs" tone="muted" class="block">
                    News about features and improvements.
                  </DzText>
                </span>
                <DzSwitch v-model="productUpdates" aria-label="Product updates" />
              </div>
            </div>
          </DzCardBody>
        </DzCard>

        <!-- Danger zone card -->
        <DzCard variant="elevated" padding="none">
          <DzCardHeader>
            <div class="border-b border-[var(--dz-border)] px-7 py-5">
              <DzHeading :level="2" size="md" weight="semibold">Danger zone</DzHeading>
              <DzText as="p" size="sm" tone="muted" class="mt-1">
                Irreversible and destructive actions.
              </DzText>
            </div>
          </DzCardHeader>

          <DzCardBody>
            <div class="px-7 py-7">
              <DzAlert variant="subtle" tone="danger" title="Delete account">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <span class="block">
                    Permanently remove your account and all of its data. This action cannot be
                    undone.
                  </span>
                  <DzButton type="button" variant="outline" tone="danger" size="sm">
                    Delete account
                  </DzButton>
                </div>
              </DzAlert>
            </div>
          </DzCardBody>
        </DzCard>

        <!-- Footer action row — transparent, sits on page background -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <DzButton type="button" variant="outline" tone="neutral">Cancel</DzButton>
          <DzButton type="button" variant="solid" tone="primary">Save changes</DzButton>
        </div>
      </div>
    </div>
  </div>
</template>
