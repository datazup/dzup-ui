<script setup lang="ts">
import type {
  HeadingLevel,
  HeadingSize,
  HeadingWeight,
  TextAlign,
  TextElement,
  TextSize,
  TextTone,
  TextWeight,
} from '@dzup-ui/core'
import {
  DzBlockquote,
  DzCaption,
  DzCode,
  DzHeading,
  DzIconButton,
  DzText,
} from '@dzup-ui/core'
import { h, ref } from 'vue'
import SandboxControl from '../components/SandboxControl.vue'

const headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6]
const headingSizes: HeadingSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']
const headingWeights: HeadingWeight[] = ['light', 'normal', 'medium', 'semibold', 'bold']

const textSizes: TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const textWeights: TextWeight[] = ['light', 'normal', 'medium', 'semibold', 'bold']
const textTones: TextTone[] = ['default', 'muted', 'success', 'warning', 'danger']
const textElements: TextElement[] = ['p', 'span', 'div', 'label', 'small', 'strong', 'em']
const aligns: TextAlign[] = ['left', 'center', 'right']

const inlineSnippet = `const greeting = 'hello world'`

const blockSnippetTs = `function greet(name: string): string {
  return \`Hello, \${name}!\`
}

const message = greet('dzup-ui')`

const blockSnippetVue = `<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
<\/script>

<template>
  <DzHeading :level="1" size="2xl">Hello</DzHeading>
  <DzText tone="muted">Subtitle text</DzText>
</template>`

const longText = 'This is a longer line of text used to demonstrate truncation with ellipsis when the container width is constrained and overflow occurs.'

// ── Live-edit playground state ────────────────────────────────────────────
const playHeadingLevel = ref<HeadingLevel>(2)
const playHeadingSize = ref<HeadingSize>('xl')
const playHeadingWeight = ref<HeadingWeight>('semibold')
const playHeadingAlign = ref<TextAlign>('left')

const playTextSize = ref<TextSize>('md')
const playTextWeight = ref<TextWeight>('normal')
const playTextTone = ref<TextTone>('default')
const playTextElement = ref<TextElement>('p')

const playCodeVariant = ref<'inline' | 'block'>('block')
const playCodeLanguage = ref('typescript')

const playHeadingText = ref('Designing with dzup-ui')
const playTextContent = ref('Compose semantic primitives with canonical size, weight, and tone props.')

// ── Copy-to-clipboard ─────────────────────────────────────────────────────
const copiedKey = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyCode(key: string, code: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(code)
    copiedKey.value = key
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedKey.value = null
    }, 1500)
  }
  catch {
    copiedKey.value = null
  }
}

const ClipboardIcon = () =>
  h('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }, [
    h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
    h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }),
  ])

const CheckIcon = () =>
  h('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2.5',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }, [
    h('path', { d: 'M20 6 9 17l-5-5' }),
  ])
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Typography
    </h1>
    <p class="page-description">
      Heading, text, code, blockquote, and caption components — sizes, weights, tones, and elements.
      Toggle theme from the dev drawer to verify dark-mode parity.
    </p>

    <!-- ── Live-edit playground ───────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Live playground
      </h2>
      <p class="section-hint">
        Tweak props and watch the preview update — useful for catching prop combinations grids miss.
      </p>

      <div class="play-controls">
        <SandboxControl label="Heading level">
          <select v-model.number="playHeadingLevel">
            <option v-for="lvl in headingLevels" :key="lvl" :value="lvl">
              h{{ lvl }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Heading size">
          <select v-model="playHeadingSize">
            <option v-for="s in headingSizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Heading weight">
          <select v-model="playHeadingWeight">
            <option v-for="w in headingWeights" :key="w" :value="w">
              {{ w }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Heading align">
          <select v-model="playHeadingAlign">
            <option v-for="a in aligns" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </SandboxControl>

        <SandboxControl label="Text size">
          <select v-model="playTextSize">
            <option v-for="s in textSizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Text weight">
          <select v-model="playTextWeight">
            <option v-for="w in textWeights" :key="w" :value="w">
              {{ w }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Text tone">
          <select v-model="playTextTone">
            <option v-for="t in textTones" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Text as">
          <select v-model="playTextElement">
            <option v-for="el in textElements" :key="el" :value="el">
              {{ el }}
            </option>
          </select>
        </SandboxControl>

        <SandboxControl label="Code variant">
          <select v-model="playCodeVariant">
            <option value="inline">
              inline
            </option>
            <option value="block">
              block
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="Code language">
          <input v-model="playCodeLanguage" type="text" placeholder="typescript">
        </SandboxControl>
      </div>

      <div class="play-text-fields">
        <SandboxControl label="Heading text">
          <input v-model="playHeadingText" type="text">
        </SandboxControl>
        <SandboxControl label="Body text">
          <input v-model="playTextContent" type="text">
        </SandboxControl>
      </div>

      <div class="play-preview">
        <DzHeading
          :level="playHeadingLevel"
          :size="playHeadingSize"
          :weight="playHeadingWeight"
          :align="playHeadingAlign"
        >
          {{ playHeadingText }}
        </DzHeading>
        <DzText
          :as="playTextElement"
          :size="playTextSize"
          :weight="playTextWeight"
          :tone="playTextTone"
        >
          {{ playTextContent }}
        </DzText>
        <DzCode
          v-if="playCodeVariant === 'inline'"
          :language="playCodeLanguage"
        >
          {{ inlineSnippet }}
        </DzCode>
        <DzCode
          v-else
          variant="block"
          :language="playCodeLanguage"
        >{{ blockSnippetTs }}</DzCode>
      </div>
    </section>

    <!-- ── DzHeading: Semantic Levels ──────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzHeading — Semantic Levels
      </h2>
      <p class="section-hint">
        <code>level</code> sets the rendered HTML element (<code>h1</code>–<code>h6</code>).
      </p>
      <div class="demo-stack">
        <DzHeading v-for="lvl in headingLevels" :key="lvl" :level="lvl">
          Heading level {{ lvl }}
        </DzHeading>
      </div>
    </section>

    <!-- ── DzHeading: Sizes ────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzHeading — Visual Sizes
      </h2>
      <p class="section-hint">
        <code>size</code> is independent of <code>level</code> — semantic vs visual decoupled.
      </p>
      <div class="demo-stack">
        <DzHeading v-for="s in headingSizes" :key="s" :level="2" :size="s">
          The quick brown fox ({{ s }})
        </DzHeading>
      </div>
    </section>

    <!-- ── DzHeading: Weights ──────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzHeading — Weights
      </h2>
      <div class="demo-stack">
        <DzHeading v-for="w in headingWeights" :key="w" :level="3" size="lg" :weight="w">
          Heading weight: {{ w }}
        </DzHeading>
      </div>
    </section>

    <!-- ── DzHeading: Alignment + Truncate ─────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzHeading — Alignment & Truncate
      </h2>
      <p class="section-hint">
        Truncated elements pass the full string via <code>title</code> so hover reveals it.
      </p>
      <div class="demo-stack">
        <DzHeading :level="3" size="md" align="left">
          Left aligned
        </DzHeading>
        <DzHeading :level="3" size="md" align="center">
          Center aligned
        </DzHeading>
        <DzHeading :level="3" size="md" align="right">
          Right aligned
        </DzHeading>
        <div class="truncate-box">
          <DzHeading :level="4" size="md" truncate :title="longText">
            {{ longText }}
          </DzHeading>
        </div>
      </div>
    </section>

    <!-- ── DzText: Sizes ───────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzText — Sizes
      </h2>
      <div class="demo-stack">
        <DzText v-for="s in textSizes" :key="s" :size="s">
          Body text at size <strong>{{ s }}</strong> — the quick brown fox jumps over the lazy dog.
        </DzText>
      </div>
    </section>

    <!-- ── DzText: Weights ─────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzText — Weights
      </h2>
      <div class="demo-stack">
        <DzText v-for="w in textWeights" :key="w" :weight="w">
          Weight {{ w }} — readable paragraph text.
        </DzText>
      </div>
    </section>

    <!-- ── DzText: Tones ───────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzText — Tones
      </h2>
      <p class="section-hint">
        Verify each tone is legible in both light and dark themes.
      </p>
      <div class="demo-stack">
        <DzText v-for="t in textTones" :key="t" :tone="t">
          Tone <strong>{{ t }}</strong> — semantic color for paragraph text.
        </DzText>
      </div>
    </section>

    <!-- ── DzText: Element Polymorphism ────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzText — Polymorphic <code>as</code>
      </h2>
      <p class="section-hint">
        Same component, different semantic HTML element.
      </p>
      <div class="demo-stack">
        <DzText v-for="el in textElements" :key="el" :as="el">
          Rendered as &lt;{{ el }}&gt;
        </DzText>
      </div>
    </section>

    <!-- ── DzText: Truncate ────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzText — Truncate
      </h2>
      <div class="truncate-box">
        <DzText truncate :title="longText">
          {{ longText }}
        </DzText>
      </div>
    </section>

    <!-- ── DzCode: Inline ──────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzCode — Inline
      </h2>
      <DzText>
        Use <DzCode>const</DzCode> to declare immutable bindings, e.g.
        <DzCode>{{ inlineSnippet }}</DzCode>. Inline code flows naturally
        with surrounding <DzCode>DzText</DzCode>.
      </DzText>
    </section>

    <!-- ── DzCode: Block + Copy-to-clipboard ───────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzCode — Block
      </h2>
      <p class="section-hint">
        <code>variant="block"</code> renders <code>&lt;pre&gt;&lt;code&gt;</code> with monospace styling.
        <br>
        <strong>Note:</strong> <code>language</code> is currently a metadata hint only — set as
        <code>data-language</code> on the element, but no syntax highlighting is applied. See
        the typography README for the highlighting roadmap.
      </p>
      <div class="demo-stack">
        <div class="code-wrap">
          <DzCode variant="block" language="typescript">{{ blockSnippetTs }}</DzCode>
          <DzIconButton
            class="code-copy"
            :icon="copiedKey === 'ts' ? CheckIcon : ClipboardIcon"
            :ariaLabel="copiedKey === 'ts' ? 'Copied' : 'Copy code'"
            size="sm"
            variant="ghost"
            :tone="copiedKey === 'ts' ? 'success' : 'neutral'"
            @click="copyCode('ts', blockSnippetTs)"
          />
        </div>
        <div class="code-wrap">
          <DzCode variant="block" language="vue">{{ blockSnippetVue }}</DzCode>
          <DzIconButton
            class="code-copy"
            :icon="copiedKey === 'vue' ? CheckIcon : ClipboardIcon"
            :ariaLabel="copiedKey === 'vue' ? 'Copied' : 'Copy code'"
            size="sm"
            variant="ghost"
            :tone="copiedKey === 'vue' ? 'success' : 'neutral'"
            @click="copyCode('vue', blockSnippetVue)"
          />
        </div>
      </div>
    </section>

    <!-- ── DzBlockquote ────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzBlockquote
      </h2>
      <p class="section-hint">
        Renders a semantic <code>&lt;blockquote&gt;</code> with optional <code>cite</code> attribute
        and a <code>footer</code> slot for attribution.
      </p>
      <div class="demo-stack">
        <DzBlockquote>
          Design is not just what it looks like and feels like. Design is how it works.
        </DzBlockquote>

        <DzBlockquote cite="https://example.com/jobs">
          Design is not just what it looks like and feels like. Design is how it works.
          <template #footer>
            — Steve Jobs
          </template>
        </DzBlockquote>

        <DzBlockquote>
          Programs must be written for people to read, and only incidentally for machines to execute.
          <template #footer>
            <DzCaption tone="muted">
              Harold Abelson, <em>SICP</em>
            </DzCaption>
          </template>
        </DzBlockquote>
      </div>
    </section>

    <!-- ── DzCaption ───────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        DzCaption — Tones
      </h2>
      <p class="section-hint">
        Small secondary text for helper labels, form hints, and metadata.
      </p>
      <div class="demo-stack">
        <DzCaption v-for="t in textTones" :key="t" :tone="t">
          Caption tone <strong>{{ t }}</strong> — small secondary text.
        </DzCaption>
      </div>
    </section>

    <!-- ── Composition ─────────────────────────────────────────────────── -->
    <section class="demo-section">
      <h2 class="section-title">
        Composition — Article Layout
      </h2>
      <article class="article">
        <DzHeading :level="1" size="3xl" weight="bold">
          Designing with dzup-ui
        </DzHeading>
        <DzText size="lg" tone="muted">
          A short introduction to composing typographic primitives.
        </DzText>

        <DzHeading :level="2" size="xl" weight="semibold">
          Getting started
        </DzHeading>
        <DzText>
          Import components from <DzCode>@dzup-ui/core</DzCode> and compose them with
          standard Vue template syntax. Every primitive accepts canonical size, weight,
          and tone props.
        </DzText>

        <DzBlockquote>
          Form follows function.
          <template #footer>
            <DzCaption tone="muted">
              Louis Sullivan
            </DzCaption>
          </template>
        </DzBlockquote>

        <div class="code-wrap">
          <DzCode variant="block" language="typescript">{{ blockSnippetTs }}</DzCode>
          <DzIconButton
            class="code-copy"
            :icon="copiedKey === 'article' ? CheckIcon : ClipboardIcon"
            :ariaLabel="copiedKey === 'article' ? 'Copied' : 'Copy code'"
            size="sm"
            variant="ghost"
            :tone="copiedKey === 'article' ? 'success' : 'neutral'"
            @click="copyCode('article', blockSnippetTs)"
          />
        </div>

        <DzCaption tone="muted">
          See the contracts package for the full type taxonomy.
        </DzCaption>
      </article>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
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
  margin: 0 0 32px;
}

.demo-section {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.section-hint {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
  line-height: 1.55;
}

.section-hint code,
.section-title code {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: 12px;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.truncate-box {
  max-width: 360px;
  padding: 12px;
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-muted, #f8fafc);
}

.article {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Live playground ───────────────────────────────────────────────── */
.play-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.play-text-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.play-text-fields :deep(input[type='text']) {
  width: 100%;
}

.play-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-muted, #f8fafc);
}

/* ── Copy-to-clipboard overlay ─────────────────────────────────────── */
.code-wrap {
  position: relative;
}

.code-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.code-wrap:hover .code-copy,
.code-copy:focus-visible {
  opacity: 1;
}
</style>
