<script setup lang="ts">
import type {
  DzFileRef,
  DzFileUploadEmits,
  DzFileUploadProps,
  DzFileUploadSlots,
  DzFileUploadValue,
} from './DzFileUpload.types.ts'
import { isFileRef, toFileRef } from '@dzup-ui/contracts'
/**
 * DzFileUpload — File upload with drag-and-drop support.
 *
 * Built from scratch (no Reka UI primitive).
 * v-model via defineModel<File[]>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzFileUpload v-model="files" accept="image/*" :max-size="5242880" multiple />
 * <DzFileUpload v-model="docs" accept=".pdf,.doc" :max-files="3">
 *   <template #file-item="{ file, remove }">
 *     <span>{{ file.name }}</span>
 *     <button @click="remove">X</button>
 *   </template>
 * </DzFileUpload>
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { fileUploadVariants } from './DzFileUpload.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/**
 * The value, in whichever mode the consumer asked for.
 *
 * `File[]` by default — unchanged — and `DzFileRef[]` under
 * `model-mode="ref"`, which is what a persisted form document can actually
 * hold. The union is a **type widening**: a consumer who annotated their ref as
 * `File[]` widens it to `DzFileUploadValue`. Nothing changes at runtime in the
 * default mode.
 */
const model = defineModel<DzFileUploadValue>({ default: () => [] })

const props = withDefaults(defineProps<DzFileUploadProps>(), {
  accept: undefined,
  maxSize: undefined,
  maxFiles: undefined,
  multiple: false,
  disabled: false,
  size: 'md',
  invalid: false,
  error: undefined,
  required: false,
  name: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  modelMode: 'file',
})

const emit = defineEmits<DzFileUploadEmits>()

defineSlots<DzFileUploadSlots>()

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzFileUpload')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()
const fieldContext = useFormFieldContext()
const autoId = useId()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(
  () => props.required || (fieldContext?.isRequired.value ?? false),
)

/**
 * Own prop, then the DzFormField context, then a generated id.
 *
 * It skipped the middle step, so a `<DzFormLabel>` inside the same field
 * pointed its `for` at an id this control never used and clicking the label
 * did nothing (renderer contract C2).
 */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/**
 * The binaries, held beside the value rather than in it.
 *
 * Keyed by ref id in reference mode. This is the whole point of the mode: the
 * `File` never enters the model, so it is never serialized into a document, and
 * a builder preview rendering a saved form has no live handles in it. The map
 * is local state, dropped with the component.
 */
const filesByRef = new Map<string, File>()

/** Abort controllers for in-flight uploads, keyed by ref id. */
const abortByRef = new Map<string, AbortController>()

/** Ids are only unique within this control, which is all they need to be. */
let refSequence = 0
function nextRefId(): string {
  refSequence += 1
  return `${resolvedId.value}-file-${refSequence}`
}

/** The entries as rows to render, whatever the model holds. */
interface FileRow {
  key: string
  name: string
  size: number
  status: DzFileRef['status']
  error?: string
  entry: File | DzFileRef
}

const rows = computed<FileRow[]>(() =>
  model.value.map((entry, index) =>
    isFileRef(entry)
      ? { key: entry.id, name: entry.name, size: entry.size, status: entry.status, error: entry.error, entry }
      : {
          key: `${index}-${entry.name}`,
          name: entry.name,
          size: entry.size,
          status: 'uploaded' as const,
          entry,
        },
  ),
)

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

const styles = computed(() =>
  fileUploadVariants({
    size: props.size,
    invalid: isInvalid.value || undefined,
    disabled: resolvedDisabled.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const dropzoneClasses = computed(() =>
  cn(
    styles.value.dropzone(),
    isDragOver.value ? styles.value.dropzoneDragOver() : '',
  ),
)

/** Format file size for display */
function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Whether a file satisfies one `accept` token.
 *
 * The three forms the HTML spec defines: a MIME wildcard (`image/*`), an exact
 * MIME type (`application/pdf`), and an extension (`.pdf`). Extensions are
 * compared case-insensitively, because a file named `REPORT.PDF` is a PDF.
 */
function matchesAcceptToken(file: File, token: string): boolean {
  const rule = token.trim().toLowerCase()
  if (rule === '')
    return false
  if (rule.startsWith('.'))
    return file.name.toLowerCase().endsWith(rule)
  const type = file.type.toLowerCase()
  if (rule.endsWith('/*'))
    return type.startsWith(rule.slice(0, -1))
  return type === rule
}

/**
 * Whether `accept` admits this file.
 *
 * **This is enforced here and not only on the input.** `:accept` on
 * `<input type="file">` filters the operating system's picker and does nothing
 * at all to a drop: `DataTransfer.files` arrives unfiltered, so before this
 * check a component rendering "Accepted: image/\*" would take a dropped `.exe`
 * into its model without a word. The picker and the drop zone are two doors
 * into the same list and have to apply the same rule.
 *
 * A file the browser could not type-sniff (`file.type === ''`) is matched on
 * its extension alone; if `accept` names only MIME types, it is rejected. That
 * is the conservative direction, and it is the one a UI control should take —
 * the documentation says the server must revalidate regardless.
 */
function isAccepted(file: File): boolean {
  if (!props.accept)
    return true
  return props.accept.split(',').some(token => matchesAcceptToken(file, token))
}

/** Validate and add files */
function processFiles(fileList: FileList | File[]): void {
  const files = Array.from(fileList)
  const validFiles: File[] = []

  for (const file of files) {
    // A single-file control takes one file, whichever door it came through.
    // `multiple` on the input constrains the picker and, like `accept`, has no
    // effect on a drop.
    if (!props.multiple && (model.value.length + validFiles.length) >= 1) {
      emit('error', { file, reason: 'Only one file is accepted' })
      continue
    }

    // Check max files limit
    if (props.maxFiles && (model.value.length + validFiles.length) >= props.maxFiles) {
      emit('error', { file, reason: `Maximum ${props.maxFiles} files allowed` })
      continue
    }

    // Check file type
    if (!isAccepted(file)) {
      emit('error', { file, reason: `File type is not accepted (${props.accept})` })
      continue
    }

    // Check file size
    if (props.maxSize && file.size > props.maxSize) {
      emit('error', { file, reason: `File exceeds maximum size of ${formatSize(props.maxSize)}` })
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length === 0)
    return

  if (props.modelMode === 'ref') {
    // The reference goes into the value; the binary goes to the host through an
    // event and is held here until the upload resolves or the row is removed.
    const refs = validFiles.map((file) => {
      const ref = toFileRef(file, nextRefId())
      filesByRef.set(ref.id, file)
      return ref
    })
    model.value = [...(model.value as DzFileRef[]), ...refs]
    emit('upload', validFiles)
    for (const ref of refs) {
      const controller = new AbortController()
      abortByRef.set(ref.id, controller)
      emit('uploadRequest', { file: filesByRef.get(ref.id)!, ref, signal: controller.signal })
    }
    return
  }

  model.value = [...(model.value as File[]), ...validFiles]
  emit('upload', validFiles)
}

function removeRow(row: FileRow): void {
  if (isFileRef(row.entry)) {
    const { id } = row.entry
    // Removing a row that is still uploading has to cancel it: the host is
    // holding a signal, and the reference it would report against is gone.
    abortByRef.get(id)?.abort()
    abortByRef.delete(id)
    const file = filesByRef.get(id)
    filesByRef.delete(id)
    model.value = (model.value as DzFileRef[]).filter(entry => entry.id !== id)
    // `remove` has always carried a File and still does, so a consumer's
    // handler keeps working; in reference mode it is the file behind the row.
    if (file !== undefined)
      emit('remove', file)
    return
  }
  const file = row.entry
  model.value = (model.value as File[]).filter(f => f !== file)
  emit('remove', file)
}

function handleClick(): void {
  if (resolvedDisabled.value)
    return
  inputRef.value?.click()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}

function handleInputChange(event: Event): void {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(target.files)
    // Reset input so same file can be re-selected
    target.value = ''
  }
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(): void {
  isDragOver.value = false
}

function handleDrop(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = false
  if (resolvedDisabled.value)
    return
  if (event.dataTransfer?.files) {
    processFiles(event.dataTransfer.files)
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <div
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :name="name"
      :disabled="resolvedDisabled"
      :required="resolvedRequired"
      class="sr-only"
      :aria-hidden="true"
      tabindex="-1"
      @change="handleInputChange"
    >

    <!--
      Drop zone.

      This carries the id, not the hidden `<input>`. The input is
      `aria-hidden` and `tabindex="-1"` — a label pointing at it would name a
      node no user can reach. The drop zone is the focusable control, so it is
      what a `DzFormLabel`'s `for` must resolve to.

      `resolvedId` was computed and then rendered nowhere at all, so this
      control had no id in the DOM and nothing could reference it (renderer
      contract C2).
    -->
    <div
      :id="resolvedId"
      role="button"
      :tabindex="resolvedDisabled ? -1 : 0"
      :class="dropzoneClasses"
      :aria-label="resolvedAriaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="ariaInvalid ?? (isInvalid || undefined)"
      :aria-required="resolvedRequired || undefined"
      :aria-disabled="resolvedDisabled || undefined"
      @click="handleClick"
      @keydown="handleKeydown"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <slot :is-drag-over="isDragOver">
        <!-- Default drop zone content -->
        <svg
          :class="styles.icon()"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span :class="styles.label()">
          Drop files here or click to upload
        </span>
        <span :class="styles.hint()">
          <template v-if="accept">Accepted: {{ accept }}</template>
          <template v-if="maxSize"> &middot; Max: {{ formatSize(maxSize) }}</template>
        </span>
      </slot>
    </div>

    <!--
      File list.

      Driven by `rows` rather than by the model directly, because the model
      holds `File`s in the default mode and `DzFileRef`s in reference mode and
      the row needs the same three things from either. `data-file-status` is
      what a stylesheet keys off to show an upload that is still pending or has
      failed — in the default mode every row is `uploaded`, because a `File`
      already in the model has nowhere else to be.
    -->
    <div v-if="rows.length > 0" :class="styles.fileList()">
      <div
        v-for="row in rows"
        :key="row.key"
        :class="styles.fileItem()"
        :data-file-status="row.status"
      >
        <slot name="file-item" :file="row.entry" :row="row" :remove="() => removeRow(row)">
          <span :class="styles.fileName()">{{ row.name }}</span>
          <span :class="styles.fileSize()">{{ formatSize(row.size) }}</span>
          <span v-if="row.status === 'failed'" :class="styles.fileError()">{{ row.error }}</span>
          <button
            type="button"
            :class="styles.removeButton()"
            :aria-label="`Remove ${row.name}`"
            @click="removeRow(row)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
