<script setup lang="ts">
import type {
  DzFileUploadEmits,
  DzFileUploadProps,
  DzFileUploadSlots,
} from './DzFileUpload.types.ts'
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
import { cn } from '../../utilities/cn.ts'
import { fileUploadVariants } from './DzFileUpload.variants.ts'

const model = defineModel<File[]>({ default: () => [] })

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
  ariaLabel: 'Upload files',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzFileUploadEmits>()
defineSlots<DzFileUploadSlots>()

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

const resolvedId = computed(() => props.id ?? autoId)

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

/** Validate and add files */
function processFiles(fileList: FileList | File[]): void {
  const files = Array.from(fileList)
  const validFiles: File[] = []

  for (const file of files) {
    // Check max files limit
    if (props.maxFiles && (model.value.length + validFiles.length) >= props.maxFiles) {
      emit('error', { file, reason: `Maximum ${props.maxFiles} files allowed` })
      continue
    }

    // Check file size
    if (props.maxSize && file.size > props.maxSize) {
      emit('error', { file, reason: `File exceeds maximum size of ${formatSize(props.maxSize)}` })
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length > 0) {
    model.value = [...model.value, ...validFiles]
    emit('upload', validFiles)
  }
}

function removeFile(file: File): void {
  model.value = model.value.filter(f => f !== file)
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

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
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
      class="sr-only"
      :aria-hidden="true"
      tabindex="-1"
      @change="handleInputChange"
    >

    <!-- Drop zone -->
    <div
      role="button"
      :tabindex="resolvedDisabled ? -1 : 0"
      :class="dropzoneClasses"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
      :aria-invalid="ariaInvalid ?? (isInvalid || undefined)"
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

    <!-- File list -->
    <div v-if="model.length > 0" :class="styles.fileList()">
      <div
        v-for="(file, index) in model"
        :key="`${file.name}-${index}`"
        :class="styles.fileItem()"
      >
        <slot name="file-item" :file="file" :remove="() => removeFile(file)">
          <span :class="styles.fileName()">{{ file.name }}</span>
          <span :class="styles.fileSize()">{{ formatSize(file.size) }}</span>
          <button
            type="button"
            :class="styles.removeButton()"
            :aria-label="`Remove ${file.name}`"
            @click="removeFile(file)"
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
      :id="`${resolvedId}-error`"
      class="text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
