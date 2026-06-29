<script setup lang="ts">
/**
 * Chat / Messages — featured app template (docs/templates.md §6.4, C5 reference).
 *
 * A DzAppShell messaging app: an app-nav rail, a conversation list (DzSearchInput
 * + a DzList of DzListItems with DzAvatar, presence dots and unread DzBadge) and a
 * thread pane — message bubbles in a DzScrollArea with day separators and read
 * receipts, plus a composer (DzTextarea + a DzDropdownMenu attach menu + a send
 * DzButton). Built only from free `@dzup-ui/core` components, token-styled with a
 * cyan re-skin, correct in light + dark, and reflowing to a single pane at 390px
 * (the list and thread swap, with a back affordance).
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuTrigger,
  DzHeading,
  DzInput,
  DzList,
  DzListItem,
  DzScrollArea,
  DzSearchInput,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzTextarea,
  DzText,
} from '@dzup-ui/core'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessagesSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Video,
} from 'lucide-vue-next'
import { computed, nextTick, reactive, ref } from 'vue'
import {
  APP_NAV,
  APP_NAV_SECONDARY,
  ATTACH_OPTIONS,
  CONVERSATIONS,
  THREADS,
  type Conversation,
  type Message,
} from './data.ts'

// Local, mutable copies so the preview feels live (selecting, searching, sending).
const conversations = reactive<Conversation[]>(CONVERSATIONS.map((c) => ({ ...c })))
const threads = reactive<Record<string, Message[]>>(
  Object.fromEntries(Object.entries(THREADS).map(([id, msgs]) => [id, msgs.map((m) => ({ ...m }))])),
)

const activeId = ref('c-01')
const listQuery = ref('')
const threadQuery = ref('')
const draft = ref('')
/** On mobile the list and thread share one column; this picks which is visible. */
const mobilePane = ref<'list' | 'thread'>('list')

const activeConversation = computed(() => conversations.find((c) => c.id === activeId.value))

const filteredConversations = computed(() => {
  const q = listQuery.value.trim().toLowerCase()
  if (!q) return conversations
  return conversations.filter(
    (c) => c.name.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q),
  )
})

const activeMessages = computed<Message[]>(() => threads[activeId.value] ?? [])

const totalUnread = computed(() => conversations.reduce((sum, c) => sum + c.unread, 0))

/**
 * Messages grouped into day buckets for the separators. When the in-thread search
 * is active we skip grouping and show a flat, filtered result list instead.
 */
const messageGroups = computed<{ day: string; messages: Message[] }[]>(() => {
  const groups: { day: string; messages: Message[] }[] = []
  for (const message of activeMessages.value) {
    const last = groups[groups.length - 1]
    if (last && last.day === message.day) last.messages.push(message)
    else groups.push({ day: message.day, messages: [message] })
  }
  return groups
})

const searchHits = computed<Message[]>(() => {
  const q = threadQuery.value.trim().toLowerCase()
  if (!q) return []
  return activeMessages.value.filter((m) => m.text.toLowerCase().includes(q))
})

const threadEnd = ref<HTMLElement | null>(null)

function selectConversation(id: string) {
  activeId.value = id
  threadQuery.value = ''
  mobilePane.value = 'thread'
  const convo = conversations.find((c) => c.id === id)
  if (convo) convo.unread = 0
  scrollToEnd()
}

function scrollToEnd() {
  void nextTick(() => threadEnd.value?.scrollIntoView({ block: 'end' }))
}

function send() {
  const text = draft.value.trim()
  if (!text || !activeConversation.value) return
  threads[activeId.value]?.push({
    id: `m-${activeId.value}-${activeMessages.value.length + 1}`,
    author: 'me',
    text,
    time: 'now',
    day: 'Today',
    status: 'sent',
  })
  activeConversation.value.snippet = `You: ${text}`
  activeConversation.value.time = 'now'
  draft.value = ''
  scrollToEnd()
}

/** Enter sends; Shift+Enter inserts a newline (handled natively by the textarea). */
function onComposerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}
</script>

<template>
  <DzAppShell aria-label="Messages" class="cm">
    <template #sidebar>
      <DzSidebar aria-label="App">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><MessagesSquare :size="18" /></span>
            <span class="brand-name">Pulse</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Messaging">
          <DzSidebarItem v-for="item in APP_NAV" :key="item.label" :active="item.active" href="#">
            <template #icon><component :is="item.icon" :size="18" /></template>
            {{ item.label }}
            <template v-if="item.badge" #badge>
              <DzBadge variant="solid" tone="primary" size="sm">{{ item.badge }}</DzBadge>
            </template>
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarSection title="Account">
          <DzSidebarItem v-for="item in APP_NAV_SECONDARY" :key="item.label" href="#">
            <template #icon><component :is="item.icon" :size="18" /></template>
            {{ item.label }}
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarFooter>
          <span class="user">
            <DzAvatar fallback="AR" size="sm" />
            <span class="user-meta">
              <DzText size="sm" weight="medium" as="span">Ava Restić</DzText>
              <DzText size="xs" tone="muted" as="span">ava@northwind.io</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="cm-title">
        <DzHeading :level="1" size="lg" weight="semibold">Messages</DzHeading>
        <DzBadge v-if="totalUnread" variant="subtle" tone="primary" size="sm">
          {{ totalUnread }} unread
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzButton size="sm" variant="solid" tone="primary">
        <template #prefix><MessagesSquare :size="15" aria-hidden="true" /></template>
        New message
      </DzButton>
    </template>

    <div class="cm-body" :data-pane="mobilePane">
      <!-- Conversation list ------------------------------------------------ -->
      <section class="cm-list" aria-label="Conversations">
        <div class="cm-list-search">
          <DzSearchInput
            v-model="listQuery"
            placeholder="Search conversations"
            size="sm"
            aria-label="Search conversations"
          />
        </div>

        <DzScrollArea class="cm-list-scroll">
          <DzList variant="divided" interactive aria-label="Conversation list">
            <DzListItem
              v-for="c in filteredConversations"
              :key="c.id"
              :active="c.id === activeId"
              class="convo"
              @click="selectConversation(c.id)"
            >
              <template #prefix>
                <span class="avatar-wrap">
                  <DzAvatar :fallback="c.initials" size="md" />
                  <span v-if="c.online" class="online-dot" aria-hidden="true" />
                </span>
              </template>

              <div class="convo-main">
                <div class="convo-row">
                  <DzText size="sm" weight="semibold" as="span" class="convo-name">{{ c.name }}</DzText>
                  <DzText size="xs" tone="muted" as="span" class="convo-time">{{ c.time }}</DzText>
                </div>
                <div class="convo-row">
                  <DzText size="sm" tone="muted" as="span" class="convo-snippet">{{ c.snippet }}</DzText>
                  <DzBadge v-if="c.unread" variant="solid" tone="primary" size="sm">{{ c.unread }}</DzBadge>
                </div>
              </div>
            </DzListItem>
          </DzList>
        </DzScrollArea>
      </section>

      <!-- Thread pane ------------------------------------------------------- -->
      <section v-if="activeConversation" class="cm-thread" aria-label="Conversation">
        <header class="thread-head">
          <DzButton
            class="thread-back"
            size="sm"
            variant="ghost"
            tone="neutral"
            aria-label="Back to conversations"
            @click="mobilePane = 'list'"
          >
            <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
          </DzButton>

          <span class="avatar-wrap">
            <DzAvatar :fallback="activeConversation.initials" size="sm" />
            <span v-if="activeConversation.online" class="online-dot" aria-hidden="true" />
          </span>

          <div class="thread-id">
            <DzText size="sm" weight="semibold" as="div">{{ activeConversation.name }}</DzText>
            <DzText size="xs" tone="muted" as="div">{{ activeConversation.presence }}</DzText>
          </div>

          <div class="thread-search">
            <DzInput
              v-model="threadQuery"
              placeholder="Search in chat"
              size="sm"
              aria-label="Search in this conversation"
            >
              <template #prefix><Search :size="15" aria-hidden="true" /></template>
            </DzInput>
          </div>

          <div class="thread-actions">
            <DzButton size="sm" variant="ghost" tone="neutral" aria-label="Start a call">
              <template #prefix><Phone :size="16" aria-hidden="true" /></template>
            </DzButton>
            <DzButton size="sm" variant="ghost" tone="neutral" aria-label="Start a video call">
              <template #prefix><Video :size="16" aria-hidden="true" /></template>
            </DzButton>
            <DzDropdownMenu>
              <DzDropdownMenuTrigger>
                <DzButton size="sm" variant="ghost" tone="neutral" aria-label="Conversation options">
                  <template #prefix><MoreVertical :size="16" aria-hidden="true" /></template>
                </DzButton>
              </DzDropdownMenuTrigger>
              <DzDropdownMenuContent align="end">
                <DzDropdownMenuItem>View profile</DzDropdownMenuItem>
                <DzDropdownMenuItem>Mute notifications</DzDropdownMenuItem>
                <DzDropdownMenuItem>Archive conversation</DzDropdownMenuItem>
              </DzDropdownMenuContent>
            </DzDropdownMenu>
          </div>
        </header>

        <DzScrollArea class="thread-scroll">
          <div class="thread-messages">
            <!-- Search results (flat) ----------------------------------- -->
            <template v-if="threadQuery.trim()">
              <DzText size="xs" tone="muted" as="div" class="search-note">
                {{ searchHits.length }} {{ searchHits.length === 1 ? 'match' : 'matches' }} for
                “{{ threadQuery.trim() }}”
              </DzText>
              <div
                v-for="m in searchHits"
                :key="m.id"
                class="msg-row"
                :class="m.author === 'me' ? 'is-me' : 'is-them'"
              >
                <div class="bubble">
                  <DzText size="sm" as="p" class="bubble-text">{{ m.text }}</DzText>
                  <span class="bubble-meta">
                    <DzText size="xs" tone="muted" as="span">{{ m.day }} · {{ m.time }}</DzText>
                  </span>
                </div>
              </div>
            </template>

            <!-- Normal grouped thread ----------------------------------- -->
            <template v-else>
              <template v-for="group in messageGroups" :key="group.day">
                <div class="day-sep" role="separator" :aria-label="group.day">
                  <span class="day-pill">{{ group.day }}</span>
                </div>
                <div
                  v-for="m in group.messages"
                  :key="m.id"
                  class="msg-row"
                  :class="m.author === 'me' ? 'is-me' : 'is-them'"
                >
                  <div class="bubble">
                    <DzText
                      v-if="m.sender"
                      size="xs"
                      weight="semibold"
                      as="div"
                      class="bubble-sender"
                    >
                      {{ m.sender }}
                    </DzText>
                    <DzText size="sm" as="p" class="bubble-text">{{ m.text }}</DzText>
                    <span class="bubble-meta">
                      <DzText size="xs" tone="muted" as="span">{{ m.time }}</DzText>
                      <span v-if="m.author === 'me'" class="receipt" :class="`is-${m.status}`">
                        <Check v-if="m.status === 'sent'" :size="13" aria-hidden="true" />
                        <CheckCheck v-else :size="13" aria-hidden="true" />
                      </span>
                    </span>
                  </div>
                </div>
              </template>
            </template>
            <div ref="threadEnd" />
          </div>
        </DzScrollArea>

        <!-- Composer ---------------------------------------------------- -->
        <footer class="composer">
          <DzDropdownMenu>
            <DzDropdownMenuTrigger>
              <DzButton size="sm" variant="ghost" tone="neutral" aria-label="Add attachment">
                <template #prefix><Paperclip :size="18" aria-hidden="true" /></template>
              </DzButton>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent side="top" align="start">
              <DzDropdownMenuItem v-for="opt in ATTACH_OPTIONS" :key="opt.label">
                {{ opt.label }}
                <template #suffix>
                  <DzText size="xs" tone="muted" as="span">{{ opt.hint }}</DzText>
                </template>
              </DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>

          <DzTextarea
            v-model="draft"
            class="composer-field"
            placeholder="Write a message…"
            :rows="1"
            auto-resize
            :max-rows="5"
            aria-label="Message"
            @keydown="onComposerKeydown"
          />

          <DzButton
            size="md"
            variant="solid"
            tone="primary"
            :disabled="!draft.trim()"
            aria-label="Send message"
            @click="send"
          >
            <template #prefix><Send :size="16" aria-hidden="true" /></template>
          </DzButton>
        </footer>
      </section>
    </div>
  </DzAppShell>
</template>

<style scoped>
/* ── Cyan re-skin (token-only) ────────────────────────────────────
   Alias the consumed `--dz-primary*` family (+ focus ring) to the cyan spectrum,
   the same approach the shipped violet pricing / emerald checkout pages use, so
   every Dz control re-tints. Light below; the dark block mirrors the token
   layer's lighter-on-dark ramp choices so contrast holds. No raw colour. */
.cm {
  --dz-primary: var(--dz-colors-cyan-500);
  --dz-primary-foreground: var(--dz-colors-cyan-50);
  --dz-primary-hover: var(--dz-colors-cyan-600);
  --dz-primary-active: var(--dz-colors-cyan-700);
  --dz-primary-muted: var(--dz-colors-cyan-100);
  --dz-primary-muted-foreground: var(--dz-colors-cyan-700);
  --dz-primary-border: var(--dz-colors-cyan-200);
  --dz-ring: var(--dz-colors-cyan-500);

  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

[data-theme='dark'] .cm {
  --dz-primary: var(--dz-colors-cyan-400);
  --dz-primary-foreground: var(--dz-colors-cyan-950);
  --dz-primary-hover: var(--dz-colors-cyan-300);
  --dz-primary-active: var(--dz-colors-cyan-200);
  --dz-primary-muted: var(--dz-colors-cyan-900);
  --dz-primary-muted-foreground: var(--dz-colors-cyan-300);
  --dz-primary-border: var(--dz-colors-cyan-800);
  --dz-ring: var(--dz-colors-cyan-400);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .cm {
    --dz-primary: var(--dz-colors-cyan-400);
    --dz-primary-foreground: var(--dz-colors-cyan-950);
    --dz-primary-hover: var(--dz-colors-cyan-300);
    --dz-primary-active: var(--dz-colors-cyan-200);
    --dz-primary-muted: var(--dz-colors-cyan-900);
    --dz-primary-muted-foreground: var(--dz-colors-cyan-300);
    --dz-primary-border: var(--dz-colors-cyan-800);
    --dz-ring: var(--dz-colors-cyan-400);
  }
}

/* Brand lockup + user footer (mirrors the shipped app-shell references). */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.cm-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Two-pane layout — list + thread, filling the app-shell main area. */
.cm-body {
  display: grid;
  grid-template-columns: minmax(260px, 340px) 1fr;
  gap: 16px;
  /* Fill the shell content height so the thread scrolls internally. */
  height: calc(100vh - 132px);
  min-height: 460px;
}

.cm-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-card);
  overflow: hidden;
}

.cm-list-search {
  padding: 12px;
  border-bottom: 1px solid var(--dz-border);
}

.cm-list-scroll {
  flex: 1;
  min-height: 0;
}

.convo {
  cursor: pointer;
}

.convo-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.convo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.convo-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.convo-time {
  flex: none;
}

.convo-snippet {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-wrap {
  position: relative;
  display: inline-flex;
  flex: none;
}

.online-dot {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-success);
  outline: 2px solid var(--dz-card);
}

/* Thread pane. */
.cm-thread {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-card);
  overflow: hidden;
}

.thread-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--dz-border);
}

.thread-back {
  display: none;
}

.thread-id {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.thread-search {
  margin-left: auto;
  width: 188px;
}

.thread-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.thread-scroll {
  flex: 1;
  min-height: 0;
  background: var(--dz-muted);
}

.thread-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.day-sep {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.day-pill {
  padding: 3px 12px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-card);
  border: 1px solid var(--dz-border);
  font-size: var(--dz-text-xs);
  color: var(--dz-muted-foreground);
}

.search-note {
  text-align: center;
  margin-bottom: 4px;
}

.msg-row {
  display: flex;
  max-width: 100%;
}

.msg-row.is-me {
  justify-content: flex-end;
}

.bubble {
  max-width: min(78%, 460px);
  padding: 8px 12px;
  border-radius: var(--dz-radius-lg);
  box-shadow: var(--dz-shadow-xs);
}

.is-them .bubble {
  background: var(--dz-card);
  border: 1px solid var(--dz-border);
  border-bottom-left-radius: var(--dz-radius-xs);
}

.is-me .bubble {
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
  border-bottom-right-radius: var(--dz-radius-xs);
}

.bubble-sender {
  color: var(--dz-primary);
  margin-bottom: 2px;
}

.bubble-text {
  margin: 0;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Own bubbles invert the text colour; keep the timestamp legible on primary. */
.is-me .bubble-text {
  color: var(--dz-primary-foreground);
}

.bubble-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}

.is-me .bubble-meta :deep(*) {
  color: color-mix(in oklch, var(--dz-primary-foreground) 75%, transparent);
}

.receipt {
  display: inline-flex;
  color: color-mix(in oklch, var(--dz-primary-foreground) 75%, transparent);
}

.receipt.is-read {
  color: var(--dz-primary-foreground);
}

/* Composer. */
.composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--dz-border);
  background: var(--dz-card);
}

.composer-field {
  flex: 1;
}

@media (max-width: 860px) {
  .thread-search {
    display: none;
  }
}

/* ── Mobile: a single pane (list OR thread) with a back affordance ─────── */
@media (max-width: 720px) {
  .cm-body {
    grid-template-columns: 1fr;
    height: calc(100vh - 120px);
  }
  .cm-body[data-pane='list'] .cm-thread {
    display: none;
  }
  .cm-body[data-pane='thread'] .cm-list {
    display: none;
  }
  .thread-back {
    display: inline-flex;
  }
  .bubble {
    max-width: 86%;
  }
}
</style>
