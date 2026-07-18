<script setup lang="ts">
import type { DzPageHeroProps, DzPageHeroSlots } from './DzPageHero.types.ts'
/**
 * DzPageHero -- dark gradient hero band for top-level views: eyebrow,
 * gradient h1, description, meta row, and a glass-treated actions cluster.
 * Extracted from docs-app's DocsPageHero (docs-theme.css) so every app on
 * the neural-indigo preset can share the band.
 *
 * @example
 * ```vue
 * <DzPageHero title="Library" eyebrow="Docs" description="All documents">
 *   <template #meta><span>128 documents</span></template>
 *   <template #actions><DzButton>New document</DzButton></template>
 * </DzPageHero>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzHeading from '../typography/DzHeading.vue'
import {
  pageHeroActionsVariants,
  pageHeroBodyVariants,
  pageHeroDescVariants,
  pageHeroEyebrowVariants,
  pageHeroMetaVariants,
  pageHeroTitleVariants,
  pageHeroVariants,
} from './DzPageHero.variants.ts'

defineOptions({
  inheritAttrs: false,
})

defineProps<DzPageHeroProps>()

defineSlots<DzPageHeroSlots>()

const attrs = useAttrs()

const classes = computed(() => cn(pageHeroVariants(), attrs.class as string | undefined))
</script>

<template>
  <header :class="classes" v-bind="{ ...$attrs, class: undefined }">
    <div :class="pageHeroBodyVariants()">
      <p v-if="eyebrow" :class="pageHeroEyebrowVariants()">
        {{ eyebrow }}
      </p>
      <DzHeading :level="1" :class="pageHeroTitleVariants()">
        {{ title }}
      </DzHeading>
      <p v-if="description || $slots.description" :class="pageHeroDescVariants()">
        <slot name="description">
          {{ description }}
        </slot>
      </p>
      <div v-if="$slots.meta" :class="pageHeroMetaVariants()">
        <slot name="meta" />
      </div>
    </div>
    <div v-if="$slots.actions" :class="pageHeroActionsVariants()">
      <slot name="actions" />
    </div>
  </header>
</template>
