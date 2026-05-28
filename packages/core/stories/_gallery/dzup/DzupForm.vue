<script setup lang="ts">
// dzup-ui equivalent of FreestyleForm — ONLY @dzup-ui/core components + --dz-* tokens.

import { computed, ref } from 'vue'
import { DzButton } from '../../../src/components/buttons'
import { DzCard, DzCardBody, DzCardFooter, DzCardHeader } from '../../../src/components/cards'
import {
  DzCheckbox,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzSelect,
  DzSwitch,
} from '../../../src/components/forms'
import { DzInput, DzTextarea } from '../../../src/components/inputs'
import { DzHeading, DzText } from '../../../src/components/typography'
import type { DzSelectItem } from '../../../src/components/forms'

const name = ref('')
const visibility = ref<'private' | 'team' | 'public'>('team')
const description = ref('')
const notifications = ref(true)
const isPublic = ref(false)
const touched = ref(false)

const nameError = computed(() =>
  touched.value && name.value.trim() === '' ? 'Name is required' : '',
)

const visibilityItems: DzSelectItem[] = [
  { label: 'Private — only you', value: 'private' },
  { label: 'Team — everyone in workspace', value: 'team' },
  { label: 'Public — anyone with the link', value: 'public' },
]

function submit() {
  touched.value = true
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-[var(--dz-background)] px-4 py-12 text-[var(--dz-foreground)] antialiased"
  >
    <div class="w-full max-w-lg">
      <form @submit.prevent="submit">
        <DzCard variant="elevated" padding="none">
          <!-- Header -->
          <DzCardHeader>
            <div class="px-7 pb-5 pt-6">
              <DzText
                as="p"
                size="xs"
                weight="semibold"
                class="mb-1 uppercase tracking-[0.2em] text-[var(--dz-primary)]"
              >
                Workspace
              </DzText>
              <DzHeading :level="1" size="lg" weight="semibold">Create Project</DzHeading>
              <DzText as="p" size="sm" tone="muted" class="mt-1">
                Spin up a new project and invite your team.
              </DzText>
            </div>
          </DzCardHeader>

          <!-- Body -->
          <DzCardBody>
            <div class="space-y-5 px-7 py-6">
              <!-- Text input -->
              <DzFormField :error="nameError" :invalid="!!nameError">
                <DzFormLabel>Project name</DzFormLabel>
                <DzInput
                  v-model="name"
                  placeholder="e.g. Atlas Migration"
                  :invalid="!!nameError"
                  @blur="touched = true"
                />
                <DzFormMessage />
              </DzFormField>

              <!-- Select -->
              <DzFormField>
                <DzFormLabel>Visibility</DzFormLabel>
                <DzSelect v-model="visibility" :items="visibilityItems" />
              </DzFormField>

              <!-- Textarea -->
              <DzFormField>
                <DzFormLabel>Description</DzFormLabel>
                <DzTextarea
                  v-model="description"
                  :rows="3"
                  placeholder="What is this project about?"
                />
              </DzFormField>

              <div class="border-t border-[var(--dz-border)] pt-5">
                <!-- Checkbox row -->
                <div class="flex items-start gap-3 py-1">
                  <DzCheckbox v-model="notifications" class="mt-0.5" />
                  <span>
                    <DzText as="span" size="sm" weight="medium" class="block"
                      >Enable notifications</DzText
                    >
                    <DzText as="span" size="xs" tone="muted" class="block">
                      Get an email when activity happens in this project.
                    </DzText>
                  </span>
                </div>

                <!-- Toggle switch -->
                <div class="mt-3 flex items-center justify-between py-1">
                  <span>
                    <DzText as="span" size="sm" weight="medium" class="block">Make public</DzText>
                    <DzText as="span" size="xs" tone="muted" class="block">
                      Anyone with the link can view this project.
                    </DzText>
                  </span>
                  <DzSwitch v-model="isPublic" aria-label="Make public" />
                </div>
              </div>
            </div>
          </DzCardBody>

          <!-- Footer -->
          <DzCardFooter>
            <div
              class="flex items-center justify-end gap-3 border-t border-[var(--dz-border)] bg-[var(--dz-muted)] px-7 py-4"
            >
              <DzButton type="button" variant="outline" tone="neutral">Cancel</DzButton>
              <DzButton type="submit" variant="solid" tone="primary">Create Project</DzButton>
            </div>
          </DzCardFooter>
        </DzCard>
      </form>
    </div>
  </div>
</template>
