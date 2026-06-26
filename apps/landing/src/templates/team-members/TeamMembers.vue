<script setup lang="ts">
/**
 * Team Members — full-page directory template (docs/templates.md §6.1).
 *
 * A members directory: a header with an invite DzButton that opens a DzDialog
 * (DzDialogContent + DzDialogTitle + a DzMultiSelect of teams), and a DzDataGrid
 * of members with DzAvatar, DzBadge role/status chips and a per-row
 * DzDropdownMenu of actions. Built only from free `@dzup-ui/core` components,
 * token-styled, light + dark, reflows to 390px.
 */
import {
  DzAvatar,
  DzBadge,
  DzButton,
  DzDataGrid,
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogTitle,
  DzDialogTrigger,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzHeading,
  DzIconButton,
  DzMultiSelect,
  DzText,
} from '@dzup-ui/core'
import type { ColumnDef } from '@dzup-ui/core'
import { MoreHorizontal, UserPlus } from 'lucide-vue-next'
import { ref } from 'vue'
import {
  MEMBERS,
  ROLE_TONE,
  STATUS_TONE,
  TEAM_OPTIONS,
  type MemberRow,
} from './data.ts'

const inviteOpen = ref(false)
const inviteTeams = ref<string[]>(['product'])

const columns: ColumnDef<MemberRow>[] = [
  { field: 'name', header: 'Member' },
  { field: 'role', header: 'Role' },
  { field: 'status', header: 'Status' },
  { field: 'id', header: '', align: 'right', width: 56 },
]
</script>

<template>
  <div class="team-page">
    <div class="team-wrap">
      <header class="team-head">
        <div>
          <DzHeading :level="1" size="xl" weight="semibold">Team members</DzHeading>
          <DzText tone="muted" as="p">{{ MEMBERS.length }} people in your workspace.</DzText>
        </div>

        <DzDialog v-model:open="inviteOpen">
          <DzDialogTrigger as-child>
            <DzButton variant="solid" tone="primary">
              <template #prefix><UserPlus :size="16" aria-hidden="true" /></template>
              Invite people
            </DzButton>
          </DzDialogTrigger>
          <DzDialogContent size="md">
            <DzDialogTitle>Invite teammates</DzDialogTitle>
            <DzDialogDescription>
              Add people to one or more teams. They'll receive an email invitation.
            </DzDialogDescription>

            <div class="invite-body">
              <label class="invite-label" for="invite-teams">Teams</label>
              <DzMultiSelect
                v-model="inviteTeams"
                :items="TEAM_OPTIONS"
                placeholder="Select teams…"
                aria-label="Teams"
                name="invite-teams"
              />
            </div>

            <div class="invite-foot">
              <DzDialogClose as-child>
                <DzButton variant="ghost" tone="neutral">Cancel</DzButton>
              </DzDialogClose>
              <DzDialogClose as-child>
                <DzButton variant="solid" tone="primary">Send invites</DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
      </header>

      <div class="team-grid">
        <DzDataGrid :data="MEMBERS" :columns="columns" row-key="id">
          <template #cell="{ row, column, value }">
            <template v-if="column.field === 'name'">
              <div class="member-cell">
                <DzAvatar :fallback="(row as MemberRow).name.slice(0, 1)" size="sm" />
                <div class="member-meta">
                  <DzText size="sm" weight="medium" as="div">{{ (row as MemberRow).name }}</DzText>
                  <DzText size="xs" tone="muted" as="div">{{ (row as MemberRow).email }}</DzText>
                </div>
              </div>
            </template>
            <template v-else-if="column.field === 'role'">
              <DzBadge variant="outline" :tone="ROLE_TONE[(row as MemberRow).role]" size="sm">
                {{ (row as MemberRow).role }}
              </DzBadge>
            </template>
            <template v-else-if="column.field === 'status'">
              <DzBadge variant="subtle" :tone="STATUS_TONE[(row as MemberRow).status]" size="sm">
                {{ (row as MemberRow).status }}
              </DzBadge>
            </template>
            <template v-else-if="column.field === 'id'">
              <DzDropdownMenu>
                <DzDropdownMenuTrigger as-child>
                  <DzIconButton
                    :icon="MoreHorizontal"
                    ariaLabel="Member actions"
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                  />
                </DzDropdownMenuTrigger>
                <DzDropdownMenuContent align="end">
                  <DzDropdownMenuItem>View profile</DzDropdownMenuItem>
                  <DzDropdownMenuItem>Change role</DzDropdownMenuItem>
                  <DzDropdownMenuItem>Resend invite</DzDropdownMenuItem>
                  <DzDropdownMenuSeparator />
                  <DzDropdownMenuItem>Remove from team</DzDropdownMenuItem>
                </DzDropdownMenuContent>
              </DzDropdownMenu>
            </template>
            <template v-else>{{ value }}</template>
          </template>
        </DzDataGrid>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-page {
  min-height: 100vh;
  width: 100%;
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  padding: clamp(20px, 4vw, 48px);
}

.team-wrap {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.team-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.team-grid {
  overflow-x: auto;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-meta {
  line-height: 1.2;
  min-width: 0;
}

.invite-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}

.invite-label {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
}

.invite-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
