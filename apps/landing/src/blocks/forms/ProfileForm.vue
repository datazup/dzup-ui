<script setup lang="ts">
import type { DzSelectItem } from '@dzup-ui/core'
import {
  DzButton,
  DzCard,
  DzDivider,
  DzFileUpload,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzHeading,
  DzInput,
  DzSelect,
  DzSwitch,
  DzTagsInput,
  DzText,
  DzTextarea,
} from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Profile form — an account "edit profile" panel.
 *
 * A broad settings card combining a DzFileUpload avatar drop zone, name /
 * username DzInputs, a DzSelect role picker, a DzTextarea bio with a maxlength
 * counter, a DzTagsInput for free-text skills (v-model:value), and a DzSwitch
 * for profile visibility — closed by a sticky-feeling action row. Self-contained:
 * local ref() state only.
 *
 * Inputs family: DzInput, DzTextarea.
 * Forms family: DzFileUpload, DzSelect, DzTagsInput, DzSwitch, DzFormField,
 * DzFormLabel, DzFormDescription.
 */

const avatar = ref<File[]>([])
const fullName = ref('Jamie Rivera')
const username = ref('jamie')
const role = ref('design')
const bio = ref('Product designer focused on design systems and accessible UI.')
const skills = ref<string[]>(['Design Systems', 'Accessibility', 'Vue'])
const publicProfile = ref(true)

const BIO_MAX = 160

const ROLES: DzSelectItem[] = [
  { label: 'Product Designer', value: 'design' },
  { label: 'Frontend Engineer', value: 'frontend' },
  { label: 'Product Manager', value: 'pm' },
  { label: 'Founder', value: 'founder' },
  { label: 'Other', value: 'other' },
]
</script>

<template>
  <section class="pr-wrap" aria-labelledby="pr-title">
    <DzCard variant="elevated" padding="lg" class="pr-card">
      <header class="pr-head">
        <DzHeading id="pr-title" :level="4" size="xl" weight="semibold">
          Edit profile
        </DzHeading>
        <DzText tone="muted" size="sm" as="p">
          This information appears on your public profile.
        </DzText>
      </header>

      <form class="pr-form" @submit.prevent>
        <DzFormField>
          <DzFormLabel>Profile photo</DzFormLabel>
          <DzFileUpload
            v-model="avatar"
            accept="image/*"
            :max-files="1"
            :max-size="2_000_000"
            aria-label="Profile photo"
          />
          <DzFormDescription>PNG or JPG, up to 2&nbsp;MB.</DzFormDescription>
        </DzFormField>

        <div class="pr-grid">
          <DzFormField required>
            <DzFormLabel>Full name</DzFormLabel>
            <DzInput v-model="fullName" autocomplete="name" />
          </DzFormField>
          <DzFormField required>
            <DzFormLabel>Username</DzFormLabel>
            <DzInput v-model="username" autocomplete="username">
              <template #prefix>
                <span class="pr-at">@</span>
              </template>
            </DzInput>
          </DzFormField>
        </div>

        <DzFormField>
          <DzFormLabel>Role</DzFormLabel>
          <DzSelect v-model="role" :items="ROLES" aria-label="Role" />
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Bio</DzFormLabel>
          <DzTextarea
            v-model="bio"
            :rows="3"
            :maxlength="BIO_MAX"
            auto-resize
            placeholder="A short line about you…"
          />
          <DzFormDescription>
            <span class="pr-counter">{{ bio.length }} / {{ BIO_MAX }}</span>
          </DzFormDescription>
        </DzFormField>

        <DzFormField>
          <DzFormLabel>Skills</DzFormLabel>
          <DzTagsInput
            v-model:value="skills"
            placeholder="Type a skill and press Enter…"
            :max="8"
            chip-variant="subtle"
            chip-tone="primary"
            aria-label="Skills"
          />
          <DzFormDescription>Press Enter or comma to add. Up to 8 tags.</DzFormDescription>
        </DzFormField>

        <DzDivider decorative />

        <div class="pr-switch-row">
          <div class="pr-switch-copy">
            <DzText size="sm" weight="medium" as="div">
              Public profile
            </DzText>
            <DzText size="xs" tone="muted" as="div">
              Anyone with the link can view it.
            </DzText>
          </div>
          <DzSwitch v-model="publicProfile" aria-label="Public profile" />
        </div>

        <div class="pr-actions">
          <DzButton variant="ghost" tone="neutral">
            Cancel
          </DzButton>
          <DzButton type="submit" variant="solid" tone="primary">
            Save changes
          </DzButton>
        </div>
      </form>
    </DzCard>
  </section>
</template>

<style scoped>
.pr-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 3rem) var(--dz-space-4, 1rem);
  min-height: 100%;
  background: var(--dz-background, #fff);
}

.pr-card {
  width: 100%;
  max-width: 36rem;
}

.pr-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.pr-form {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.pr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dz-space-4, 1rem);
}

.pr-at {
  color: var(--dz-muted-foreground, #6b7280);
}

.pr-counter {
  font-variant-numeric: tabular-nums;
}

.pr-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
}

.pr-switch-copy {
  line-height: 1.3;
  min-width: 0;
}

.pr-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-1, 0.25rem);
}

@media (max-width: 540px) {
  .pr-grid {
    grid-template-columns: 1fr;
  }

  .pr-actions {
    flex-direction: column-reverse;
  }

  .pr-actions :deep(button) {
    width: 100%;
  }
}
</style>
