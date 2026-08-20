<script setup lang="ts">
import {
  DzAlert,
  DzBadge,
  DzButton,
  DzButtonGroup,
  DzCodeBlock,
  DzIconButton,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
} from '@dzup-ui/core'
import {
  Bold,
  Braces,
  Check,
  Code2,
  Eye,
  FileDiff,
  FileJson,
  FileText,
  Italic,
  Link2,
  List as ListIcon,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  RotateCcw,
  SquareCode,
  Strikethrough,
  Underline,
  WrapText,
  X,
} from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'

// ---------------------------------------------------------------------------
// DzCodeEditor — Monaco/CodeMirror wrap (sandbox stub)
// Demonstrates the planned API: v-model, language, readonly, line-numbers,
// minimap, word-wrap. The textarea is a stand-in for the real editor surface
// that will live in @dzup-ui/pro.
// ---------------------------------------------------------------------------

const codeLanguages = ['typescript', 'json', 'vue', 'markdown', 'css'] as const
type CodeLanguage = (typeof codeLanguages)[number]

const codeLanguage = ref<CodeLanguage>('typescript')
const codeReadonly = ref(false)
const codeShowLineNumbers = ref(true)
const codeWordWrap = ref(false)
const codeMinimap = ref(true)

const codeSamples: Record<CodeLanguage, string> = {
  typescript: `import { defineComponent, ref } from 'vue'

export const Counter = defineComponent({
  setup() {
    const count = ref(0)
    const increment = (): void => {
      count.value += 1
    }
    return { count, increment }
  },
})
`,
  json: `{
  "name": "dzup-ui",
  "version": "0.5.0",
  "components": 155,
  "families": [
    "buttons", "cards", "data", "feedback"
  ]
}
`,
  vue: `<script setup lang="ts">
import { ref } from 'vue'
const message = ref('Hello dzup-ui')
<\/script>

<template>
  <h1>{{ message }}</h1>
</template>
`,
  markdown: `# dzup-ui

A **token-driven** Vue 3 component library.

- Contract-first design
- Tree-shakeable
- Accessible by default
`,
  css: `.dz-button {
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
  border-radius: var(--dz-radius-md);
}
`,
}

const codeValue = ref<string>(codeSamples.typescript)

watch(codeLanguage, (next) => {
  codeValue.value = codeSamples[next]
})

const codeLineCount = computed(() => codeValue.value.split('\n').length)
const codeCharCount = computed(() => codeValue.value.length)
const codeFilename = computed(() => `main.${codeLanguage.value === 'typescript' ? 'ts' : codeLanguage.value}`)

// ---------------------------------------------------------------------------
// DzMarkdownEditor — sandbox stub
// Side-by-side source + rendered preview with a minimal markdown parser.
// ---------------------------------------------------------------------------

const markdownSource = ref(`# Quick start

A **token-driven** Vue 3 component library.

## Install

\`\`\`bash
yarn add @dzup-ui/core @dzup-ui/tokens
\`\`\`

Read the [docs](https://example.com) for the full reference.

- Composable architecture
- WCAG AA out of the box
- Works with Nuxt, Vite, Astro

> Components are styled exclusively through CSS variables — no raw colors.
`)

function renderMarkdown(src: string): string {
  // Minimal markdown — enough for a faithful preview without pulling a dep.
  // Real DzMarkdownEditor should delegate to a vetted parser.
  const escape = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const lines = src.split('\n')
  const out: string[] = []
  let inCode = false
  let codeLang = ''
  let codeBuf: string[] = []
  let inList = false
  let inQuote = false

  const flushList = (): void => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }
  const flushQuote = (): void => {
    if (inQuote) {
      out.push('</blockquote>')
      inQuote = false
    }
  }

  const inline = (s: string): string => {
    let r = escape(s)
    r = r.replace(/`([^`]+)`/g, '<code>$1</code>')
    r = r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    r = r.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>')
    return r
  }

  for (const raw of lines) {
    if (raw.startsWith('```')) {
      if (inCode) {
        out.push(`<pre class="md-code" data-lang="${codeLang}"><code>${escape(codeBuf.join('\n'))}</code></pre>`)
        codeBuf = []
        codeLang = ''
        inCode = false
      }
      else {
        flushList()
        flushQuote()
        codeLang = raw.slice(3).trim()
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuf.push(raw)
      continue
    }

    if (/^#{1,3} /.test(raw)) {
      flushList()
      flushQuote()
      const level = raw.match(/^#+/)![0]!.length
      out.push(`<h${level}>${inline(raw.replace(/^#+ /, ''))}</h${level}>`)
      continue
    }
    if (/^>\s?/.test(raw)) {
      flushList()
      if (!inQuote) {
        out.push('<blockquote>')
        inQuote = true
      }
      out.push(`<p>${inline(raw.replace(/^>\s?/, ''))}</p>`)
      continue
    }
    if (/^[-*] /.test(raw)) {
      flushQuote()
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inline(raw.replace(/^[-*] /, ''))}</li>`)
      continue
    }
    if (raw.trim() === '') {
      flushList()
      flushQuote()
      continue
    }
    flushList()
    flushQuote()
    out.push(`<p>${inline(raw)}</p>`)
  }
  flushList()
  flushQuote()
  if (inCode)
    out.push(`<pre class="md-code"><code>${escape(codeBuf.join('\n'))}</code></pre>`)

  return out.join('\n')
}

const markdownRendered = computed(() => renderMarkdown(markdownSource.value))
const markdownView = ref<'split' | 'edit' | 'preview'>('split')
const markdownWordCount = computed(() =>
  markdownSource.value.trim().length === 0
    ? 0
    : markdownSource.value.trim().split(/\s+/).length,
)

function wrapSelection(prefix: string, suffix: string = prefix): void {
  const ta = document.getElementById('md-textarea') as HTMLTextAreaElement | null
  if (!ta)
    return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const before = ta.value.slice(0, start)
  const middle = ta.value.slice(start, end) || 'text'
  const after = ta.value.slice(end)
  markdownSource.value = `${before}${prefix}${middle}${suffix}${after}`
  void nextTick(() => {
    ta.focus()
    ta.selectionStart = before.length + prefix.length
    ta.selectionEnd = before.length + prefix.length + middle.length
  })
}

// ---------------------------------------------------------------------------
// DzJsonEditor — sandbox stub
// Validation, format, minify. Demonstrates the v-model: parsed JS value
// channel that the real component will expose alongside v-model: string.
// ---------------------------------------------------------------------------

const jsonSource = ref<string>(JSON.stringify(
  {
    name: 'dzup-ui',
    version: '0.5.0',
    family: 'editors',
    components: [
      { name: 'DzCodeEditor', engine: 'monaco' },
      { name: 'DzJsonEditor', engine: 'codemirror' },
      { name: 'DzMarkdownEditor', engine: 'codemirror' },
    ],
    accessibility: { wcag: 'AA', focusManagement: true },
  },
  null,
  2,
))

interface JsonValidation {
  ok: boolean
  error?: { message: string, line?: number, column?: number }
  value?: unknown
}

const jsonValidation = computed<JsonValidation>(() => {
  try {
    return { ok: true, value: JSON.parse(jsonSource.value) }
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const positionMatch = message.match(/position (\d+)/i)
    if (positionMatch && positionMatch[1]) {
      const pos = Number(positionMatch[1])
      const upto = jsonSource.value.slice(0, pos)
      const lines = upto.split('\n')
      return {
        ok: false,
        error: {
          message,
          line: lines.length,
          column: lines[lines.length - 1]!.length + 1,
        },
      }
    }
    return { ok: false, error: { message } }
  }
})

function formatJson(): void {
  if (!jsonValidation.value.ok)
    return
  jsonSource.value = JSON.stringify(jsonValidation.value.value, null, 2)
}

function minifyJson(): void {
  if (!jsonValidation.value.ok)
    return
  jsonSource.value = JSON.stringify(jsonValidation.value.value)
}

function injectInvalid(): void {
  jsonSource.value = jsonSource.value.replace(/,\s*"family"/, ' "family"')
}

// ---------------------------------------------------------------------------
// DzRichTextEditor — sandbox stub
// Contenteditable + toolbar. Real component will be Tiptap/ProseMirror-backed
// with a serialized document model exposed via v-model.
// ---------------------------------------------------------------------------

const richHtml = ref<string>(`<h2>Release notes — v0.5.0</h2>
<p>The editors family ships <strong>five new components</strong> for content authoring.</p>
<ul>
  <li>Code, Markdown, JSON, RichText, Diff</li>
  <li>All <em>token-only</em> styled (ADR-04)</li>
</ul>
<blockquote>Editors are headless on the contract layer — pick your own engine.</blockquote>
`)
const richSurface = ref<HTMLElement | null>(null)
const richShowSource = ref(false)

function exec(cmd: string, value?: string): void {
  richSurface.value?.focus()
  // execCommand is deprecated but adequate for a sandbox stub.
  // The real DzRichTextEditor will use Tiptap commands instead.
  document.execCommand(cmd, false, value)
  if (richSurface.value) {
    richHtml.value = richSurface.value.innerHTML
  }
}

function onRichInput(event: Event): void {
  const target = event.currentTarget as HTMLElement
  richHtml.value = target.innerHTML
}

// ---------------------------------------------------------------------------
// DzDiffViewer — sandbox stub
// Naive LCS diff. The real component will use a proper diff engine
// (myers / patience) and expose side-by-side + unified views.
// ---------------------------------------------------------------------------

const initialLeft = `function greet(name) {
  if (!name) {
    return 'Hello, stranger!'
  }
  return 'Hello, ' + name + '!'
}

export default greet
`
const initialRight = `export function greet(name: string): string {
  if (!name) {
    return 'Hello, stranger!'
  }
  return \`Hello, \${name}!\`
}
`

const diffLeft = ref<string>(initialLeft)
const diffRight = ref<string>(initialRight)
const diffMode = ref<'split' | 'unified'>('split')
const diffTab = ref<string>('diff')

interface DiffRow {
  type: 'equal' | 'remove' | 'add'
  left?: { n: number, text: string }
  right?: { n: number, text: string }
}

function computeDiff(a: string, b: string): DiffRow[] {
  const left = a.split('\n')
  const right = b.split('\n')
  const n = left.length
  const m = right.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array.from<number>({ length: m + 1 }).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = left[i] === right[j]
        ? dp[i + 1]![j + 1]! + 1
        : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
    }
  }
  const rows: DiffRow[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (left[i] === right[j]) {
      rows.push({ type: 'equal', left: { n: i + 1, text: left[i]! }, right: { n: j + 1, text: right[j]! } })
      i++
      j++
    }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      rows.push({ type: 'remove', left: { n: i + 1, text: left[i]! } })
      i++
    }
    else {
      rows.push({ type: 'add', right: { n: j + 1, text: right[j]! } })
      j++
    }
  }
  while (i < n) {
    rows.push({ type: 'remove', left: { n: i + 1, text: left[i]! } })
    i++
  }
  while (j < m) {
    rows.push({ type: 'add', right: { n: j + 1, text: right[j]! } })
    j++
  }
  return rows
}

const diffRows = computed(() => computeDiff(diffLeft.value, diffRight.value))
const diffStats = computed(() => {
  let add = 0
  let rem = 0
  for (const r of diffRows.value) {
    if (r.type === 'add')
      add++
    else if (r.type === 'remove')
      rem++
  }
  return { add, rem }
})

function resetDiff(): void {
  diffLeft.value = initialLeft
  diffRight.value = initialRight
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Editors
    </h1>
    <p class="page-description">
      Content authoring surfaces. Each demo below is a sandbox stub that mirrors the planned
      <code>@dzup-ui/pro</code> editor API — paired with the shipping
      <code>DzCodeBlock</code> for static code display.
    </p>

    <DzAlert
      variant="subtle"
      tone="info"
      title="Heads up — these are preview stubs"
      class="preview-alert"
    >
      The real <code>DzCodeEditor</code>, <code>DzMarkdownEditor</code>, <code>DzJsonEditor</code>,
      <code>DzRichTextEditor</code> and <code>DzDiffViewer</code> components live in
      <code>@dzup-ui/pro</code> (see <code>packages/core/src/resolver.ts</code>) and will wrap
      Monaco / CodeMirror / Tiptap. The textareas below are intentional placeholders that
      exercise the planned props, slots and events using only <code>@dzup-ui/core</code> chrome
      and design tokens.
    </DzAlert>

    <!-- ===================================================================
         DzCodeBlock (shipping today — for reference)
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          DzCodeBlock <DzBadge tone="success" variant="subtle">
            shipping
          </DzBadge>
        </h2>
        <p class="section-description">
          The static, read-only baseline. Already in <code>@dzup-ui/core/data</code>. Editors below
          should match its chrome (header + language pill + copy action) so the family feels
          cohesive.
        </p>
      </header>

      <DzCodeBlock
        :code="codeSamples.typescript"
        language="typescript"
        filename="counter.ts"
        show-line-numbers
        copyable
      />
    </section>

    <!-- ===================================================================
         DzCodeEditor
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          DzCodeEditor <DzBadge tone="warning" variant="subtle">
            planned
          </DzBadge>
        </h2>
        <p class="section-description">
          Syntax-highlighted editing surface. Engine choice (Monaco vs CodeMirror) is hidden behind
          the contract — the public API stays the same.
        </p>
      </header>

      <div class="control-row">
        <label class="control-label">language</label>
        <select v-model="codeLanguage" class="control-select">
          <option v-for="lang in codeLanguages" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>

        <label class="control-label">
          <input v-model="codeReadonly" type="checkbox"> readonly
        </label>
        <label class="control-label">
          <input v-model="codeShowLineNumbers" type="checkbox"> line-numbers
        </label>
        <label class="control-label">
          <input v-model="codeWordWrap" type="checkbox"> word-wrap
        </label>
        <label class="control-label">
          <input v-model="codeMinimap" type="checkbox"> minimap
        </label>
      </div>

      <div class="editor-shell">
        <header class="editor-head">
          <div class="editor-chrome">
            <span class="editor-icon"><Code2 :size="14" /></span>
            <span class="editor-title">{{ codeFilename }}</span>
            <span class="editor-lang-pill">{{ codeLanguage }}</span>
          </div>
          <div class="editor-actions">
            <DzBadge v-if="codeReadonly" tone="neutral" variant="subtle">
              read-only
            </DzBadge>
            <DzIconButton
              :icon="WrapText"
              size="sm"
              variant="ghost"
              aria-label="Toggle word wrap"
              :aria-pressed="codeWordWrap"
              @click="codeWordWrap = !codeWordWrap"
            />
          </div>
        </header>
        <div class="code-editor" :data-wrap="codeWordWrap">
          <pre
            v-if="codeShowLineNumbers"
            class="code-gutter"
            aria-hidden="true"
          ><span
            v-for="ln in codeLineCount"
            :key="ln"
            class="code-gutter-line"
          >{{ ln }}</span></pre>
          <textarea
            v-model="codeValue"
            class="code-textarea"
            :readonly="codeReadonly"
            spellcheck="false"
            :aria-label="`${codeLanguage} editor`"
          />
          <aside v-if="codeMinimap" class="code-minimap" aria-hidden="true">
            <span
              v-for="(line, idx) in codeValue.split('\n')"
              :key="idx"
              class="code-minimap-line"
              :style="{ width: `${Math.min(100, line.length * 1.6)}%` }"
            />
          </aside>
        </div>
        <footer class="editor-foot">
          <span class="footer-stat">{{ codeLineCount }} lines · {{ codeCharCount }} chars</span>
          <span class="footer-stat">UTF-8 · LF</span>
        </footer>
      </div>
    </section>

    <!-- ===================================================================
         DzMarkdownEditor
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          DzMarkdownEditor <DzBadge tone="warning" variant="subtle">
            planned
          </DzBadge>
        </h2>
        <p class="section-description">
          Source + rendered preview with split / edit / preview views and a formatting toolbar.
          v-model exposes the markdown source; <code>@change</code> also emits the parsed HTML.
        </p>
      </header>

      <div class="editor-shell">
        <header class="editor-head">
          <DzButtonGroup size="sm">
            <DzButton
              variant="ghost"
              tone="neutral"
              :aria-pressed="markdownView === 'edit'"
              :data-active="markdownView === 'edit'"
              @click="markdownView = 'edit'"
            >
              <template #prefix>
                <FileText :size="14" />
              </template>
              Edit
            </DzButton>
            <DzButton
              variant="ghost"
              tone="neutral"
              :aria-pressed="markdownView === 'split'"
              :data-active="markdownView === 'split'"
              @click="markdownView = 'split'"
            >
              <template #prefix>
                <SquareCode :size="14" />
              </template>
              Split
            </DzButton>
            <DzButton
              variant="ghost"
              tone="neutral"
              :aria-pressed="markdownView === 'preview'"
              :data-active="markdownView === 'preview'"
              @click="markdownView = 'preview'"
            >
              <template #prefix>
                <Eye :size="14" />
              </template>
              Preview
            </DzButton>
          </DzButtonGroup>

          <div class="editor-toolbar" :aria-disabled="markdownView === 'preview'">
            <DzIconButton :icon="Bold" size="sm" variant="ghost" aria-label="Bold" @click="wrapSelection('**')" />
            <DzIconButton :icon="Italic" size="sm" variant="ghost" aria-label="Italic" @click="wrapSelection('*')" />
            <DzIconButton :icon="Code2" size="sm" variant="ghost" aria-label="Inline code" @click="wrapSelection('`')" />
            <DzIconButton :icon="Link2" size="sm" variant="ghost" aria-label="Link" @click="wrapSelection('[', '](https://)')" />
            <span class="toolbar-divider" aria-hidden="true" />
            <DzIconButton :icon="ListIcon" size="sm" variant="ghost" aria-label="Bullet list" @click="wrapSelection('\n- ', '')" />
            <DzIconButton :icon="Quote" size="sm" variant="ghost" aria-label="Block quote" @click="wrapSelection('\n> ', '')" />
          </div>
        </header>

        <div class="markdown-grid" :data-view="markdownView">
          <textarea
            v-if="markdownView !== 'preview'"
            id="md-textarea"
            v-model="markdownSource"
            class="md-textarea"
            spellcheck="false"
            aria-label="Markdown source"
          />
          <div
            v-if="markdownView !== 'edit'"
            class="md-preview"
            aria-label="Rendered markdown preview"
            v-html="markdownRendered"
          />
        </div>

        <footer class="editor-foot">
          <span class="footer-stat">{{ markdownWordCount }} words</span>
          <span class="footer-stat">CommonMark · GFM</span>
        </footer>
      </div>
    </section>

    <!-- ===================================================================
         DzJsonEditor
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          DzJsonEditor <DzBadge tone="warning" variant="subtle">
            planned
          </DzBadge>
        </h2>
        <p class="section-description">
          Schema-aware JSON editing. Validates on input, exposes parsed value as a second v-model
          channel, and bridges to <code>@dzup-ui/core/forms</code> field validation.
        </p>
      </header>

      <div class="control-row">
        <DzButton variant="outline" size="sm" :disabled="!jsonValidation.ok" @click="formatJson">
          <template #prefix>
            <Braces :size="14" />
          </template>
          Format
        </DzButton>
        <DzButton variant="outline" size="sm" :disabled="!jsonValidation.ok" @click="minifyJson">
          <template #prefix>
            <Minus :size="14" />
          </template>
          Minify
        </DzButton>
        <DzButton variant="ghost" tone="danger" size="sm" @click="injectInvalid">
          Inject syntax error
        </DzButton>

        <span class="muted-text grow">
          <DzBadge v-if="jsonValidation.ok" tone="success" variant="subtle">
            Valid JSON
          </DzBadge>
          <DzBadge v-else tone="danger" variant="subtle">
            Invalid · line {{ jsonValidation.error?.line ?? '?' }}
          </DzBadge>
        </span>
      </div>

      <div class="editor-shell">
        <header class="editor-head">
          <div class="editor-chrome">
            <span class="editor-icon"><FileJson :size="14" /></span>
            <span class="editor-title">config.json</span>
          </div>
          <div class="editor-actions">
            <span
              class="validity-dot"
              :data-ok="jsonValidation.ok"
              :aria-label="jsonValidation.ok ? 'Valid' : 'Invalid'"
            >
              <Check v-if="jsonValidation.ok" :size="12" />
              <X v-else :size="12" />
            </span>
          </div>
        </header>
        <textarea
          v-model="jsonSource"
          class="json-textarea"
          spellcheck="false"
          aria-label="JSON editor"
        />
        <div v-if="!jsonValidation.ok" class="editor-foot editor-foot--error">
          <strong>Parse error · line {{ jsonValidation.error?.line ?? '?' }}, col {{ jsonValidation.error?.column ?? '?' }}</strong>
          <code>{{ jsonValidation.error?.message }}</code>
        </div>
      </div>
    </section>

    <!-- ===================================================================
         DzRichTextEditor
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          DzRichTextEditor <DzBadge tone="warning" variant="subtle">
            planned
          </DzBadge>
        </h2>
        <p class="section-description">
          WYSIWYG authoring. The real component will be Tiptap-backed and expose a structured doc
          model; the toolbar here exercises the contract via legacy <code>execCommand</code>.
        </p>
      </header>

      <div class="editor-shell">
        <header class="editor-head">
          <div class="editor-toolbar">
            <DzIconButton :icon="Bold" size="sm" variant="ghost" aria-label="Bold" @click="exec('bold')" />
            <DzIconButton :icon="Italic" size="sm" variant="ghost" aria-label="Italic" @click="exec('italic')" />
            <DzIconButton :icon="Underline" size="sm" variant="ghost" aria-label="Underline" @click="exec('underline')" />
            <DzIconButton :icon="Strikethrough" size="sm" variant="ghost" aria-label="Strikethrough" @click="exec('strikeThrough')" />
            <span class="toolbar-divider" aria-hidden="true" />
            <DzIconButton :icon="Pilcrow" size="sm" variant="ghost" aria-label="Paragraph" @click="exec('formatBlock', 'p')" />
            <DzButton size="sm" variant="ghost" tone="neutral" class="toolbar-h-button" aria-label="Heading 2" @click="exec('formatBlock', 'h2')">
              H2
            </DzButton>
            <DzIconButton :icon="Quote" size="sm" variant="ghost" aria-label="Quote" @click="exec('formatBlock', 'blockquote')" />
            <span class="toolbar-divider" aria-hidden="true" />
            <DzIconButton :icon="ListIcon" size="sm" variant="ghost" aria-label="Bullet list" @click="exec('insertUnorderedList')" />
            <DzIconButton :icon="ListOrdered" size="sm" variant="ghost" aria-label="Numbered list" @click="exec('insertOrderedList')" />
          </div>

          <DzButton
            size="sm"
            variant="ghost"
            :aria-pressed="richShowSource"
            @click="richShowSource = !richShowSource"
          >
            <template #prefix>
              <Code2 :size="14" />
            </template>
            {{ richShowSource ? 'Hide source' : 'Show source' }}
          </DzButton>
        </header>

        <div
          ref="richSurface"
          class="rich-surface"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          aria-label="Rich text editor"
          spellcheck="true"
          @input="onRichInput"
          v-html="richHtml"
        />
      </div>

      <div v-if="richShowSource" class="rich-source">
        <DzCodeBlock
          :code="richHtml"
          language="html"
          filename="document.html"
          max-height="200px"
          :copyable="true"
        />
      </div>
    </section>

    <!-- ===================================================================
         DzDiffViewer
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          DzDiffViewer <DzBadge tone="warning" variant="subtle">
            planned
          </DzBadge>
        </h2>
        <p class="section-description">
          Side-by-side and unified diff views. Useful for code-review surfaces and version
          comparisons. Stub below uses a naive LCS diff; real component should plug in a battle-
          tested engine.
        </p>
      </header>

      <div class="control-row">
        <DzButtonGroup size="sm">
          <DzButton
            variant="ghost"
            :data-active="diffMode === 'split'"
            @click="diffMode = 'split'"
          >
            Split
          </DzButton>
          <DzButton
            variant="ghost"
            :data-active="diffMode === 'unified'"
            @click="diffMode = 'unified'"
          >
            Unified
          </DzButton>
        </DzButtonGroup>

        <span class="diff-stats">
          <span class="diff-stat diff-stat--add">+{{ diffStats.add }}</span>
          <span class="diff-stat diff-stat--rem">−{{ diffStats.rem }}</span>
        </span>

        <DzButton variant="ghost" size="sm" @click="resetDiff">
          <template #prefix>
            <RotateCcw :size="14" />
          </template>
          Reset
        </DzButton>
      </div>

      <DzTabs v-model="diffTab" variant="line">
        <DzTabList>
          <DzTabTrigger value="diff">
            <FileDiff :size="14" class="tab-icon" /> Diff
          </DzTabTrigger>
          <DzTabTrigger value="left">
            Before
          </DzTabTrigger>
          <DzTabTrigger value="right">
            After
          </DzTabTrigger>
        </DzTabList>

        <DzTabContent value="diff">
          <div class="editor-shell diff-shell">
            <!-- Split mode -->
            <div v-if="diffMode === 'split'" class="diff-grid">
              <div class="diff-pane diff-pane--left" aria-label="Before">
                <header class="diff-pane-head">
                  Before · greet.js
                </header>
                <div class="diff-rows">
                  <div
                    v-for="(row, idx) in diffRows"
                    :key="`l-${idx}`"
                    class="diff-row"
                    :data-type="row.type === 'add' ? 'empty' : row.type"
                  >
                    <span class="diff-num">{{ row.left?.n ?? '' }}</span>
                    <span class="diff-sign">{{
                      row.type === 'remove' ? '−' : row.type === 'add' ? '' : ' '
                    }}</span>
                    <span class="diff-text">{{ row.left?.text ?? '' }}</span>
                  </div>
                </div>
              </div>
              <div class="diff-pane diff-pane--right" aria-label="After">
                <header class="diff-pane-head">
                  After · greet.ts
                </header>
                <div class="diff-rows">
                  <div
                    v-for="(row, idx) in diffRows"
                    :key="`r-${idx}`"
                    class="diff-row"
                    :data-type="row.type === 'remove' ? 'empty' : row.type"
                  >
                    <span class="diff-num">{{ row.right?.n ?? '' }}</span>
                    <span class="diff-sign">{{
                      row.type === 'add' ? '+' : row.type === 'remove' ? '' : ' '
                    }}</span>
                    <span class="diff-text">{{ row.right?.text ?? '' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Unified mode -->
            <div v-else class="diff-unified" aria-label="Unified diff">
              <header class="diff-pane-head">
                greet.js → greet.ts
              </header>
              <div class="diff-rows">
                <div
                  v-for="(row, idx) in diffRows"
                  :key="`u-${idx}`"
                  class="diff-row"
                  :data-type="row.type"
                >
                  <span class="diff-num">{{ row.left?.n ?? '' }}</span>
                  <span class="diff-num">{{ row.right?.n ?? '' }}</span>
                  <span class="diff-sign">{{
                    row.type === 'add' ? '+' : row.type === 'remove' ? '−' : ' '
                  }}</span>
                  <span class="diff-text">{{ row.right?.text ?? row.left?.text ?? '' }}</span>
                </div>
              </div>
            </div>
          </div>
        </DzTabContent>

        <DzTabContent value="left">
          <div class="editor-shell">
            <textarea
              v-model="diffLeft"
              class="diff-textarea"
              spellcheck="false"
              aria-label="Before source"
            />
          </div>
        </DzTabContent>

        <DzTabContent value="right">
          <div class="editor-shell">
            <textarea
              v-model="diffRight"
              class="diff-textarea"
              spellcheck="false"
              aria-label="After source"
            />
          </div>
        </DzTabContent>
      </DzTabs>
    </section>

    <!-- ===================================================================
         Next improvements
    =================================================================== -->
    <section class="demo-section">
      <header class="section-header">
        <h2 class="section-title">
          Next improvements
        </h2>
        <p class="section-description">
          Concrete follow-ups required to promote these stubs into real
          <code>@dzup-ui/pro</code> components.
        </p>
      </header>

      <ul class="todo-list">
        <li>
          <strong>Scaffold <code>packages/pro/</code></strong> — create the workspace package
          (mirror <code>core</code>'s layout: <code>buttons/</code>, <code>data/</code> …), register
          it in the root <code>package.json</code> workspaces, and add it to
          <code>apps/sandbox/package.json</code> as <code>workspace:*</code>. Without this, the
          <code>DzResolver({ includePro: true })</code> branch is unreachable.
        </li>
        <li>
          <strong>Pick engines and lock them in <code>@dzup-ui/contracts</code></strong> —
          contracts must own the prop shapes before any pro component ships (ADR-02). Proposal:
          Monaco for <code>DzCodeEditor</code> (best TS / IntelliSense), CodeMirror 6 for
          <code>DzJsonEditor</code> + <code>DzMarkdownEditor</code> (smaller bundle, friendlier
          theming), Tiptap for <code>DzRichTextEditor</code>, the <code>diff</code> package + a
          custom renderer for <code>DzDiffViewer</code>. Each gets a
          <code>*.contract.spec.ts</code> conformance test.
        </li>
        <li>
          <strong>Token coverage for editor surfaces</strong> — add
          <code>--dz-editor-bg</code>, <code>--dz-editor-fg</code>, <code>--dz-editor-gutter-bg</code>,
          <code>--dz-editor-selection-bg</code>, <code>--dz-editor-cursor</code>, and the
          syntax-token scale (<code>--dz-syntax-keyword</code>, <code>--dz-syntax-string</code>,
          <code>--dz-syntax-comment</code>, …) to <code>@dzup-ui/tokens</code>. The stubs above are
          hard-coded against <code>--dz-muted</code> / <code>--dz-foreground</code>; that breaks as
          soon as a syntax theme is wired in.
        </li>
        <li>
          <strong>Lazy-load the engines</strong> — Monaco alone is ~2 MB. The pro index should
          re-export each editor via <code>defineAsyncComponent</code> so consumers who only use
          <code>DzJsonEditor</code> don't ship Monaco. Add a bundle-size test and a Storybook
          performance story to lock this in.
        </li>
        <li>
          <strong>Form integration</strong> — every editor must hook into
          <code>DzFormField</code> / <code>DzFormMessage</code> via the
          <code>BaseValidationProps</code> contract. <code>DzJsonEditor</code> in particular needs
          <code>v-model:value</code> (string) <em>and</em> <code>v-model:parsed</code> (unknown), so
          consumers can bind directly to validated form state.
        </li>
        <li>
          <strong>Accessibility audit</strong> — code surfaces need screen-reader-only labels for
          line numbers, ARIA live region announcements for parse errors, and keyboard parity
          with the underlying engine. Encode <code>jest-axe</code>-style assertions in each
          family's contract spec.
        </li>
        <li>
          <strong>Real diff engine + word-level highlights</strong> — replace the LCS stub above
          with the <code>diff</code> package (Myers) and add intra-line word highlights using
          <code>diffWordsWithSpace</code>. Add a <code>collapseUnchanged</code> prop with a
          configurable context window — large diffs are unusable otherwise.
        </li>
        <li>
          <strong>Codemod entries</strong> — once shipped, <code>@dzup-ui/codemods</code> needs
          mappings from common community components (<code>vue-monaco</code>,
          <code>md-editor-v3</code>, <code>vue-json-pretty</code>, <code>vue-diff</code>) to the
          dzup equivalents. Mirror the migration pattern used for buttons / inputs.
        </li>
        <li>
          <strong>Sandbox parity story</strong> — once <code>@dzup-ui/pro</code> exists, swap the
          textareas in this page for the real components and delete the stub helpers
          (<code>renderMarkdown</code>, <code>computeDiff</code>, <code>exec</code>). This page
          then becomes the integration smoke test for the family.
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 24px;
  line-height: 1.6;
}

.preview-alert {
  margin-bottom: 32px;
}

.demo-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 4px;
}

.section-description {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0;
  line-height: 1.55;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.control-row .grow {
  margin-left: auto;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.control-select {
  padding: 6px 8px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
}

.muted-text {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ─── Editor shell (shared chrome) ──────────────────────────── */
.editor-shell {
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  overflow: hidden;
}

.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-muted, #f8fafc);
}

.editor-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 14px;
  border-top: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-muted, #f8fafc);
  font-size: 11px;
  color: var(--dz-muted-foreground, #64748b);
}

.editor-foot--error {
  background: var(--dz-danger-muted);
  color: var(--dz-danger);
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.editor-foot--error strong {
  font-size: 12px;
}

.editor-foot--error code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  background: transparent;
  padding: 0;
}

.editor-chrome {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.editor-icon {
  display: inline-flex;
  width: 22px;
  height: 22px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
  align-items: center;
  justify-content: center;
}

.editor-title {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--dz-foreground, #1a202c);
}

.editor-lang-pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-foreground, #1a202c);
  color: var(--dz-surface, #ffffff);
  opacity: 0.85;
}

.editor-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.editor-toolbar {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

.editor-toolbar[aria-disabled="true"] {
  opacity: 0.4;
  pointer-events: none;
}

.toolbar-divider {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: var(--dz-border, #e2e8f0);
  margin: 0 6px;
}

.toolbar-h-button {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 700;
  min-width: 28px;
  padding-left: 6px;
  padding-right: 6px;
}

.footer-stat {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--dz-muted-foreground, #64748b);
}

.validity-dot {
  display: inline-flex;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
}

.validity-dot[data-ok="true"] {
  background: var(--dz-success-muted);
  color: var(--dz-success);
}

.validity-dot[data-ok="false"] {
  background: var(--dz-danger-muted);
  color: var(--dz-danger);
}

/* ─── DzCodeEditor ─────────────────────────────────────────── */
.code-editor {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  background: var(--dz-muted, #f8fafc);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  line-height: 1.55;
  min-height: 240px;
}

.code-gutter {
  margin: 0;
  padding: 12px 8px;
  text-align: right;
  color: var(--dz-muted-foreground, #64748b);
  opacity: 0.6;
  user-select: none;
  border-right: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-muted, #f8fafc);
  font-size: 12px;
}

.code-gutter-line {
  display: block;
  min-width: 28px;
}

.code-textarea {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  resize: vertical;
  color: var(--dz-foreground, #1a202c);
  font: inherit;
  outline: none;
  min-height: 240px;
  tab-size: 2;
  white-space: pre;
  overflow-x: auto;
}

.code-editor[data-wrap="true"] .code-textarea {
  white-space: pre-wrap;
  overflow-x: hidden;
}

.code-textarea:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dz-primary);
}

.code-minimap {
  width: 80px;
  padding: 12px 8px;
  border-left: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-muted, #f8fafc);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.code-minimap-line {
  display: block;
  height: 3px;
  border-radius: 1px;
  background: var(--dz-border, #e2e8f0);
}

/* ─── DzMarkdownEditor ─────────────────────────────────────── */
.markdown-grid {
  display: grid;
  background: var(--dz-surface, #ffffff);
  min-height: 320px;
}

.markdown-grid[data-view="split"] {
  grid-template-columns: 1fr 1fr;
}

.markdown-grid[data-view="split"] .md-textarea {
  border-right: 1px solid var(--dz-border, #e2e8f0);
}

.md-textarea {
  width: 100%;
  min-height: 320px;
  padding: 16px;
  border: none;
  resize: vertical;
  background: var(--dz-muted, #f8fafc);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dz-foreground, #1a202c);
  outline: none;
}

.md-textarea:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dz-primary);
}

.md-preview {
  padding: 16px 24px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--dz-foreground, #1a202c);
  overflow-y: auto;
  max-height: 480px;
}

.md-preview :deep(h1) {
  font-size: 22px;
  margin: 8px 0 12px;
  font-weight: 700;
}

.md-preview :deep(h2) {
  font-size: 17px;
  margin: 16px 0 8px;
  font-weight: 600;
}

.md-preview :deep(h3) {
  font-size: 14px;
  margin: 12px 0 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground, #64748b);
}

.md-preview :deep(p) { margin: 0 0 10px; }

.md-preview :deep(ul) {
  margin: 0 0 10px;
  padding-left: 22px;
}

.md-preview :deep(li) { margin-bottom: 4px; }

.md-preview :deep(a) {
  color: var(--dz-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.md-preview :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}

.md-preview :deep(pre.md-code) {
  padding: 12px 14px;
  background: var(--dz-foreground, #1a202c);
  color: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-md, 6px);
  margin: 0 0 12px;
  overflow-x: auto;
  font-size: 12px;
}

.md-preview :deep(pre.md-code code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.md-preview :deep(blockquote) {
  margin: 0 0 12px;
  padding: 8px 14px;
  border-left: 3px solid var(--dz-primary);
  background: var(--dz-primary-muted);
  border-radius: 0 var(--dz-radius-sm, 4px) var(--dz-radius-sm, 4px) 0;
  color: var(--dz-foreground, #1a202c);
}

.md-preview :deep(blockquote p) { margin: 0; }

/* ─── DzJsonEditor ─────────────────────────────────────────── */
.json-textarea {
  width: 100%;
  min-height: 280px;
  padding: 16px;
  border: none;
  background: var(--dz-muted, #f8fafc);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dz-foreground, #1a202c);
  resize: vertical;
  outline: none;
  tab-size: 2;
  display: block;
}

.json-textarea:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dz-primary);
}

/* ─── DzRichTextEditor ─────────────────────────────────────── */
.rich-surface {
  min-height: 260px;
  padding: 20px 24px;
  background: var(--dz-surface, #ffffff);
  font-size: 14px;
  line-height: 1.65;
  color: var(--dz-foreground, #1a202c);
  outline: none;
}

.rich-surface:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dz-primary);
}

.rich-surface :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px;
}

.rich-surface :deep(p) { margin: 0 0 10px; }

.rich-surface :deep(ul),
.rich-surface :deep(ol) {
  margin: 0 0 10px;
  padding-left: 22px;
}

.rich-surface :deep(blockquote) {
  margin: 0 0 10px;
  padding: 6px 14px;
  border-left: 3px solid var(--dz-primary);
  background: var(--dz-primary-muted);
  border-radius: 0 var(--dz-radius-sm, 4px) var(--dz-radius-sm, 4px) 0;
}

.rich-source {
  margin-top: 12px;
}

/* ─── DzDiffViewer ─────────────────────────────────────────── */
.diff-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.diff-stat {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.diff-stat--add {
  background: var(--dz-success-muted);
  color: var(--dz-success);
}

.diff-stat--rem {
  background: var(--dz-danger-muted);
  color: var(--dz-danger);
}

.diff-shell {
  margin-top: 12px;
}

.diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.diff-pane--left {
  border-right: 1px solid var(--dz-border, #e2e8f0);
}

.diff-pane-head {
  padding: 8px 14px;
  background: var(--dz-muted, #f8fafc);
  border-bottom: 1px solid var(--dz-border, #e2e8f0);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

.diff-rows {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.55;
  max-height: 360px;
  overflow-y: auto;
}

.diff-row {
  display: grid;
  grid-template-columns: 40px 18px 1fr;
  align-items: stretch;
  padding: 0 8px;
  min-height: 19px;
}

.diff-unified .diff-row {
  grid-template-columns: 40px 40px 18px 1fr;
}

.diff-row[data-type="add"] { background: var(--dz-success-muted); }
.diff-row[data-type="remove"] { background: var(--dz-danger-muted); }
.diff-row[data-type="empty"] {
  background: repeating-linear-gradient(
    -45deg,
    transparent 0 4px,
    var(--dz-muted, #f8fafc) 4px 8px
  );
}

.diff-num {
  color: var(--dz-muted-foreground, #64748b);
  opacity: 0.7;
  text-align: right;
  padding-right: 8px;
  user-select: none;
}

.diff-sign {
  font-weight: 700;
  text-align: center;
}

.diff-row[data-type="add"] .diff-sign { color: var(--dz-success); }
.diff-row[data-type="remove"] .diff-sign { color: var(--dz-danger); }

.diff-text {
  white-space: pre;
  color: var(--dz-foreground, #1a202c);
  overflow-x: auto;
}

.diff-textarea {
  width: 100%;
  min-height: 220px;
  padding: 14px 16px;
  border: none;
  background: var(--dz-muted, #f8fafc);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  resize: vertical;
  outline: none;
  display: block;
}

.diff-textarea:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dz-primary);
}

.tab-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 4px;
}

/* Active state for ghost buttons used as view-switchers */
:deep([data-active="true"]) {
  background: var(--dz-primary-muted) !important;
  color: var(--dz-primary) !important;
}

/* Todo list */
.todo-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  color: var(--dz-foreground, #1a202c);
  line-height: 1.55;
}

.todo-list code,
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}
</style>
