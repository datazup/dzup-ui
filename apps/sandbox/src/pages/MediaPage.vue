<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import type {
  AvatarShape,
  CarouselOrientation,
  DzAvatarProps,
  DzCarouselProps,
  DzIconProps,
  DzImageProps,
  DzLightboxProps,
  IconSize,
  LightboxImage,
} from '@dzup-ui/core'
import {
  DzAvatar,
  DzAvatarGroup,
  DzCarousel,
  DzCarouselDots,
  DzCarouselNext,
  DzCarouselPrevious,
  DzCarouselSlide,
  DzIcon,
  DzImage,
  DzLightbox,
} from '@dzup-ui/core'
import {
  Bell,
  Check,
  Heart,
  ImageOff,
  Search,
  Star,
  User,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import DemoCode from '../components/DemoCode.vue'
import SandboxControl from '../components/SandboxControl.vue'
import { useDemoSnippet } from '../composables/useDemoSnippet.ts'
import { useUrlState } from '../composables/useUrlState.ts'

const sizes: CanonicalSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const iconSizes: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const shapes: AvatarShape[] = ['circle', 'square']
const fits: NonNullable<DzImageProps['fit']>[] = ['cover', 'contain', 'fill', 'none']
const aspectRatios = [
  { label: '1 / 1', value: '1/1' },
  { label: '4 / 3', value: '4/3' },
  { label: '16 / 9', value: '16/9' },
  { label: '21 / 9', value: '21/9' },
]
const carouselOrientations: CarouselOrientation[] = ['horizontal', 'vertical']

const SAMPLE_AVATAR = 'https://i.pravatar.cc/120?img=12'
const SAMPLE_AVATAR_2 = 'https://i.pravatar.cc/120?img=32'
const SAMPLE_AVATAR_3 = 'https://i.pravatar.cc/120?img=47'
const SAMPLE_AVATAR_4 = 'https://i.pravatar.cc/120?img=58'
const SAMPLE_AVATAR_5 = 'https://i.pravatar.cc/120?img=68'
const BROKEN_AVATAR = 'https://invalid.example/missing.jpg'
const SAMPLE_IMAGE = 'https://picsum.photos/seed/dzup-media/640/360'
const BROKEN_IMAGE = 'https://invalid.example/missing.jpg'
const FALLBACK_IMAGE = 'https://picsum.photos/seed/dzup-fallback/640/360'

const gallery: LightboxImage[] = [
  { src: 'https://picsum.photos/seed/dzup-gal-1/1200/800', alt: 'Mountain ridge', caption: 'Mountain ridge at dawn' },
  { src: 'https://picsum.photos/seed/dzup-gal-2/1200/800', alt: 'City skyline', caption: 'City skyline, blue hour' },
  { src: 'https://picsum.photos/seed/dzup-gal-3/1200/800', alt: 'Forest path', caption: 'Forest path in autumn' },
  { src: 'https://picsum.photos/seed/dzup-gal-4/1200/800', alt: 'Coastal dunes', caption: 'Coastal dunes, late afternoon' },
]

const carouselSlides = [
  { src: 'https://picsum.photos/seed/dzup-car-1/960/540', alt: 'Slide one', label: 'Featured project' },
  { src: 'https://picsum.photos/seed/dzup-car-2/960/540', alt: 'Slide two', label: 'New release' },
  { src: 'https://picsum.photos/seed/dzup-car-3/960/540', alt: 'Slide three', label: 'Customer story' },
  { src: 'https://picsum.photos/seed/dzup-car-4/960/540', alt: 'Slide four', label: 'Team retrospective' },
]

// ── Avatar controls ──
const avatarSize = useUrlState<CanonicalSize>('av-size', 'md')
const avatarShape = useUrlState<AvatarShape>('av-shape', 'circle')
const avatarUseImage = useUrlState<boolean>('av-img', true)

// ── AvatarGroup controls ──
const groupSize = useUrlState<CanonicalSize>('avg-size', 'md')
const groupMax = useUrlState<number>('avg-max', 3)

// ── Image controls ──
const imageFit = useUrlState<NonNullable<DzImageProps['fit']>>('img-fit', 'cover')
const imageAspect = useUrlState<string>('img-aspect', '16/9')
const imageLazy = useUrlState<boolean>('img-lazy', true)

// ── Icon controls ──
const iconSize = useUrlState<IconSize>('ic-size', 'md')
const iconStrokeWidth = useUrlState<number>('ic-stroke', 2)
const iconLabeled = useUrlState<boolean>('ic-labeled', false)

// ── Lightbox state ──
const lightboxOpen = ref(false)
const lightboxStart = ref(0)

function openLightboxAt(index: number): void {
  lightboxStart.value = index
  lightboxOpen.value = true
}

// ── Carousel controls ──
const carouselOrientation = useUrlState<CarouselOrientation>('car-orient', 'horizontal')
const carouselAutoplay = useUrlState<boolean>('car-auto', false)
const carouselInterval = useUrlState<number>('car-interval', 3000)
const carouselLoop = useUrlState<boolean>('car-loop', true)
const carouselSize = useUrlState<CanonicalSize>('car-size', 'md')
const carouselIndex = ref(0)

const showcaseIcons = [
  { label: 'Search', component: Search },
  { label: 'Bell', component: Bell },
  { label: 'Heart', component: Heart },
  { label: 'Star', component: Star },
  { label: 'Check', component: Check },
  { label: 'User', component: User },
] as const

const avatarSnippet = useDemoSnippet<Partial<DzAvatarProps>>(() => ({
  tag: 'DzAvatar',
  props: avatarUseImage.value
    ? { src: SAMPLE_AVATAR, alt: 'Jane Doe', size: avatarSize.value, shape: avatarShape.value }
    : { fallback: 'JD', size: avatarSize.value, shape: avatarShape.value },
  defaults: { shape: 'circle' },
  children: null,
}))

const avatarGroupSnippet = useDemoSnippet<{ max: number, size: CanonicalSize }>(() => ({
  tag: 'DzAvatarGroup',
  props: { max: groupMax.value, size: groupSize.value },
  children: `  <DzAvatar src="/u1.jpg" alt="User 1" />
  <DzAvatar src="/u2.jpg" alt="User 2" />
  <DzAvatar src="/u3.jpg" alt="User 3" />
  <DzAvatar src="/u4.jpg" alt="User 4" />
  <DzAvatar src="/u5.jpg" alt="User 5" />`,
}))

const imageSnippet = useDemoSnippet<Partial<DzImageProps>>(() => ({
  tag: 'DzImage',
  props: {
    src: '/photo.jpg',
    alt: 'Demo photo',
    fit: imageFit.value,
    aspectRatio: imageAspect.value,
    lazy: imageLazy.value,
  },
  defaults: { fit: 'cover', lazy: false },
  children: null,
}))

const iconSnippet = useDemoSnippet<Partial<DzIconProps> & { ariaLabel?: string }>(() => ({
  tag: 'DzIcon',
  props: {
    size: iconSize.value,
    strokeWidth: iconStrokeWidth.value,
    ...(iconLabeled.value ? { ariaLabel: 'Search' } : {}),
  },
  attrs: { ':icon': 'Search' },
  children: null,
}))

const lightboxSnippet = useDemoSnippet<Partial<DzLightboxProps>>(() => ({
  tag: 'DzLightbox',
  props: { images: gallery, startIndex: lightboxStart.value },
  defaults: { startIndex: 0 },
  attrs: { 'v-model': 'open' },
  children: null,
}))

const carouselSnippet = useDemoSnippet<Partial<DzCarouselProps>>(() => ({
  tag: 'DzCarousel',
  props: {
    orientation: carouselOrientation.value,
    autoplay: carouselAutoplay.value,
    interval: carouselInterval.value,
    loop: carouselLoop.value,
    size: carouselSize.value,
  },
  defaults: { orientation: 'horizontal', autoplay: false, interval: 5000, loop: false, size: 'md' },
  attrs: { 'v-model': 'index' },
  children: `  <DzCarouselSlide v-for="s in slides" :key="s.src">...</DzCarouselSlide>
  <DzCarouselPrevious />
  <DzCarouselNext />
  <DzCarouselDots />`,
}))

const compositionSnippet = `<DzCard>
  <DzFlex align="center" gap="md">
    <DzAvatar src="/user.jpg" alt="Jane Doe" size="lg" />
    <DzStack gap="xs">
      <strong>Jane Doe</strong>
      <DzFlex align="center" gap="xs" class="muted">
        <DzIcon :icon="Check" size="sm" aria-label="Verified" />
        <span>Verified member</span>
      </DzFlex>
    </DzStack>
  </DzFlex>
  <DzImage src="/cover.jpg" alt="Cover" aspect-ratio="16/9" lazy />
</DzCard>`

const carouselFrameStyle = computed(() =>
  carouselOrientation.value === 'vertical' ? { height: '320px' } : {},
)
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Media
    </h1>
    <p class="page-description">
      Media primitives -- avatars (single and stacked), images with loading and error states,
      icon wrappers, fullscreen lightbox, and slide carousel.
    </p>

    <!-- DzAvatar -->
    <section class="demo-section">
      <h2 class="section-title">
        DzAvatar
      </h2>
      <p class="section-description">
        Renders an image when <code>src</code> resolves; falls back to initials, a custom slot,
        or your own icon when the image is unavailable or broken.
      </p>

      <div class="control-row">
        <SandboxControl label="size">
          <select v-model="avatarSize">
            <option v-for="s in sizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="shape">
          <select v-model="avatarShape">
            <option v-for="s in shapes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="use image">
          <input v-model="avatarUseImage" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame frame-center">
        <DzAvatar
          v-if="avatarUseImage"
          :src="SAMPLE_AVATAR"
          alt="Jane Doe"
          :size="avatarSize"
          :shape="avatarShape"
        />
        <DzAvatar
          v-else
          fallback="JD"
          :size="avatarSize"
          :shape="avatarShape"
        />
      </div>

      <h3 class="subsection-title">
        Size scale
      </h3>
      <div class="frame frame-row frame-center">
        <DzAvatar
          v-for="s in sizes"
          :key="s"
          :src="SAMPLE_AVATAR_2"
          :alt="`Sample ${s}`"
          :size="s"
        />
      </div>

      <h3 class="subsection-title">
        Fallback states
      </h3>
      <p class="section-description">
        Image fallback uses initials; broken images degrade gracefully; a slot replaces
        the fallback entirely with custom content.
      </p>
      <div class="frame frame-row frame-center">
        <DzAvatar fallback="JD" size="lg" alt="Jane Doe" />
        <DzAvatar fallback="AK" size="lg" alt="Alex Kim" shape="square" />
        <DzAvatar :src="BROKEN_AVATAR" fallback="!" size="lg" alt="Broken" />
        <DzAvatar :src="BROKEN_AVATAR" size="lg" alt="With icon">
          <DzIcon :icon="User" size="md" />
        </DzAvatar>
      </div>

      <DemoCode :code="avatarSnippet" />
    </section>

    <!-- DzAvatarGroup -->
    <section class="demo-section">
      <h2 class="section-title">
        DzAvatarGroup
      </h2>
      <p class="section-description">
        Stacks avatars with a negative overlap and renders a <code>+N</code> indicator when the
        child count exceeds <code>max</code>. Size is propagated to all children via context.
      </p>

      <div class="control-row">
        <SandboxControl label="size">
          <select v-model="groupSize">
            <option v-for="s in sizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="max">
          <input v-model.number="groupMax" type="number" min="1" max="6" step="1">
        </SandboxControl>
      </div>

      <div class="frame frame-center">
        <DzAvatarGroup :max="groupMax" :size="groupSize" aria-label="Project collaborators">
          <DzAvatar :src="SAMPLE_AVATAR" alt="User 1" />
          <DzAvatar :src="SAMPLE_AVATAR_2" alt="User 2" />
          <DzAvatar :src="SAMPLE_AVATAR_3" alt="User 3" />
          <DzAvatar :src="SAMPLE_AVATAR_4" alt="User 4" />
          <DzAvatar :src="SAMPLE_AVATAR_5" alt="User 5" />
        </DzAvatarGroup>
      </div>

      <DemoCode :code="avatarGroupSnippet" />
    </section>

    <!-- DzImage -->
    <section class="demo-section">
      <h2 class="section-title">
        DzImage
      </h2>
      <p class="section-description">
        Image wrapper with loading placeholder, error fallback (to a secondary URL or slot),
        lazy loading, configurable <code>object-fit</code>, and an aspect-ratio hint.
      </p>

      <div class="control-row">
        <SandboxControl label="fit">
          <select v-model="imageFit">
            <option v-for="f in fits" :key="f" :value="f">
              {{ f }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="aspect-ratio">
          <select v-model="imageAspect">
            <option v-for="r in aspectRatios" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="lazy">
          <input v-model="imageLazy" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame">
        <div class="image-stage">
          <DzImage
            :src="SAMPLE_IMAGE"
            alt="Random demo photo"
            :fit="imageFit"
            :aspect-ratio="imageAspect"
            :lazy="imageLazy"
            class="image-demo"
          />
        </div>
      </div>

      <h3 class="subsection-title">
        Object-fit modes side by side
      </h3>
      <div class="image-grid">
        <div v-for="f in fits" :key="f" class="image-grid-cell">
          <DzImage
            :src="SAMPLE_IMAGE"
            :alt="`fit ${f}`"
            :fit="f"
            aspect-ratio="1/1"
            class="image-square"
          />
          <span class="image-grid-label">fit="{{ f }}"</span>
        </div>
      </div>

      <h3 class="subsection-title">
        Error fallback
      </h3>
      <p class="section-description">
        On failed load, <code>fallback</code> retries with a secondary URL; if that also fails the
        <code>error</code> slot is rendered.
      </p>
      <div class="image-grid">
        <div class="image-grid-cell">
          <DzImage
            :src="BROKEN_IMAGE"
            :fallback="FALLBACK_IMAGE"
            alt="Recovered via fallback URL"
            aspect-ratio="1/1"
            class="image-square"
          />
          <span class="image-grid-label">fallback URL</span>
        </div>
        <div class="image-grid-cell">
          <DzImage
            :src="BROKEN_IMAGE"
            alt="Custom error slot"
            aspect-ratio="1/1"
            class="image-square"
          >
            <template #error>
              <div class="image-error-slot">
                <DzIcon :icon="ImageOff" size="lg" aria-label="Image unavailable" />
                <span>Image unavailable</span>
              </div>
            </template>
          </DzImage>
          <span class="image-grid-label">#error slot</span>
        </div>
      </div>

      <DemoCode :code="imageSnippet" />
    </section>

    <!-- DzIcon -->
    <section class="demo-section">
      <h2 class="section-title">
        DzIcon
      </h2>
      <p class="section-description">
        Icon wrapper enforcing the canonical size scale and accessibility semantics. Decorative
        by default (<code>aria-hidden="true"</code>); pass <code>aria-label</code> to expose the
        icon to assistive tech as <code>role="img"</code>. Sandbox uses
        <code>lucide-vue-next</code>, matching the documented integration.
      </p>

      <div class="control-row">
        <SandboxControl label="size">
          <select v-model="iconSize">
            <option v-for="s in iconSizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="stroke-width">
          <input v-model.number="iconStrokeWidth" type="number" min="0.5" max="3" step="0.25">
        </SandboxControl>
        <SandboxControl label="labeled (meaningful)">
          <input v-model="iconLabeled" type="checkbox">
        </SandboxControl>
      </div>

      <div class="frame frame-row frame-center">
        <DzIcon
          :icon="Search"
          :size="iconSize"
          :stroke-width="iconStrokeWidth"
          :aria-label="iconLabeled ? 'Search' : undefined"
        />
        <code class="icon-state">{{ iconLabeled ? 'role="img"' : 'aria-hidden="true"' }}</code>
      </div>

      <h3 class="subsection-title">
        Size scale
      </h3>
      <div class="frame frame-row frame-center">
        <div v-for="s in iconSizes" :key="s" class="icon-size-cell">
          <DzIcon :icon="Star" :size="s" />
          <span class="icon-size-label">{{ s }}</span>
        </div>
      </div>

      <h3 class="subsection-title">
        Icon set
      </h3>
      <div class="icon-set">
        <div v-for="ico in showcaseIcons" :key="ico.label" class="icon-set-cell">
          <DzIcon :icon="ico.component" size="lg" />
          <span class="icon-set-label">{{ ico.label }}</span>
        </div>
      </div>

      <DemoCode :code="iconSnippet" />
    </section>

    <!-- DzLightbox -->
    <section class="demo-section">
      <h2 class="section-title">
        DzLightbox
      </h2>
      <p class="section-description">
        Fullscreen image viewer built on Reka UI <code>DialogRoot</code>. Click a thumbnail
        to open at that index; arrow keys navigate; <kbd>Esc</kbd> closes.
      </p>

      <div class="lightbox-thumbs">
        <button
          v-for="(img, idx) in gallery"
          :key="img.src"
          type="button"
          class="lightbox-thumb"
          :aria-label="`Open ${img.alt} in lightbox`"
          @click="openLightboxAt(idx)"
        >
          <DzImage
            :src="img.src"
            :alt="img.alt ?? ''"
            aspect-ratio="4/3"
            fit="cover"
            lazy
            class="lightbox-thumb-img"
          />
          <span class="lightbox-thumb-caption">{{ img.caption }}</span>
        </button>
      </div>

      <DzLightbox
        v-model="lightboxOpen"
        :images="gallery"
        :start-index="lightboxStart"
      />

      <DemoCode :code="lightboxSnippet" />
    </section>

    <!-- DzCarousel -->
    <section class="demo-section">
      <h2 class="section-title">
        DzCarousel
      </h2>
      <p class="section-description">
        Compound carousel with slides, prev/next, dots, and optional autoplay. Pause-on-hover is
        built in. Active slide is two-way bound via <code>v-model</code>.
      </p>

      <div class="control-row">
        <SandboxControl label="orientation">
          <select v-model="carouselOrientation">
            <option v-for="o in carouselOrientations" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="size">
          <select v-model="carouselSize">
            <option v-for="s in sizes" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </SandboxControl>
        <SandboxControl label="autoplay">
          <input v-model="carouselAutoplay" type="checkbox">
        </SandboxControl>
        <SandboxControl label="interval (ms)">
          <input v-model.number="carouselInterval" type="number" min="500" max="10000" step="500">
        </SandboxControl>
        <SandboxControl label="loop">
          <input v-model="carouselLoop" type="checkbox">
        </SandboxControl>
        <SandboxControl label="active">
          <code class="active-index">{{ carouselIndex + 1 }} / {{ carouselSlides.length }}</code>
        </SandboxControl>
      </div>

      <div class="frame carousel-frame" :style="carouselFrameStyle">
        <DzCarousel
          v-model="carouselIndex"
          :orientation="carouselOrientation"
          :autoplay="carouselAutoplay"
          :interval="carouselInterval"
          :loop="carouselLoop"
          :size="carouselSize"
          aria-label="Featured projects"
          class="carousel-host"
        >
          <DzCarouselSlide v-for="slide in carouselSlides" :key="slide.src">
            <div class="carousel-slide">
              <DzImage
                :src="slide.src"
                :alt="slide.alt"
                fit="cover"
                aspect-ratio="16/9"
                lazy
                class="carousel-slide-img"
              />
              <span class="carousel-slide-label">{{ slide.label }}</span>
            </div>
          </DzCarouselSlide>
          <DzCarouselPrevious />
          <DzCarouselNext />
          <DzCarouselDots />
        </DzCarousel>
      </div>

      <DemoCode :code="carouselSnippet" />
    </section>

    <!-- Composition -->
    <section class="demo-section">
      <h2 class="section-title">
        Composition
      </h2>
      <p class="section-description">
        Avatars, icons, and images combine into typical profile-card patterns.
      </p>

      <div class="frame composition-grid">
        <article v-for="n in 3" :key="n" class="profile-card">
          <DzImage
            :src="`https://picsum.photos/seed/dzup-cover-${n}/640/360`"
            :alt="`Cover ${n}`"
            aspect-ratio="16/9"
            lazy
            class="profile-cover"
          />
          <div class="profile-body">
            <div class="profile-head">
              <DzAvatar
                :src="`https://i.pravatar.cc/120?img=${n * 14}`"
                :alt="`Member ${n}`"
                size="lg"
              />
              <div class="profile-meta">
                <strong>Member {{ n }}</strong>
                <span class="profile-role">
                  <DzIcon :icon="Check" size="xs" aria-label="Verified" />
                  Verified team lead
                </span>
              </div>
            </div>
            <div class="profile-stats">
              <span><DzIcon :icon="Star" size="sm" /> 4.{{ 4 + n }}</span>
              <span><DzIcon :icon="Heart" size="sm" /> {{ 120 + n * 13 }}</span>
              <span><DzIcon :icon="Bell" size="sm" /> {{ n * 4 }} new</span>
            </div>
            <div class="profile-collab">
              <span class="profile-collab-label">Collaborators</span>
              <DzAvatarGroup :max="3" size="sm">
                <DzAvatar :src="SAMPLE_AVATAR" alt="Collab 1" />
                <DzAvatar :src="SAMPLE_AVATAR_2" alt="Collab 2" />
                <DzAvatar :src="SAMPLE_AVATAR_3" alt="Collab 3" />
                <DzAvatar :src="SAMPLE_AVATAR_4" alt="Collab 4" />
                <DzAvatar :src="SAMPLE_AVATAR_5" alt="Collab 5" />
              </DzAvatarGroup>
            </div>
          </div>
        </article>
      </div>

      <DemoCode :code="compositionSnippet" />
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
  margin: 0 0 4px;
}

.section-description {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 20px 0 8px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.frame {
  padding: 16px;
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  min-height: 80px;
}

.frame-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.frame-center {
  align-items: center;
  justify-content: center;
}

.image-stage {
  max-width: 640px;
  margin: 0 auto;
}

.image-demo {
  width: 100%;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-md, 6px);
  overflow: hidden;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.image-grid-cell {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.image-grid-label {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--dz-muted-foreground, #64748b);
  text-align: center;
}

.image-square {
  width: 100%;
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
  overflow: hidden;
}

.image-error-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

.icon-state {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  color: var(--dz-foreground, #1a202c);
}

.icon-size-cell,
.icon-set-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--dz-foreground, #1a202c);
}

.icon-size-label,
.icon-set-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
}

.icon-set {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
  padding: 16px;
  background: var(--dz-muted, #f8fafc);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
}

.lightbox-thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.lightbox-thumb {
  appearance: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  cursor: pointer;
  overflow: hidden;
  text-align: left;
  transition: transform 150ms ease, border-color 150ms ease;
}

.lightbox-thumb:hover,
.lightbox-thumb:focus-visible {
  transform: translateY(-2px);
  border-color: var(--dz-primary, #2563eb);
  outline: none;
}

.lightbox-thumb-img {
  width: 100%;
}

.lightbox-thumb-caption {
  padding: 6px 10px 10px;
  font-size: 12.5px;
  color: var(--dz-foreground, #1a202c);
}

.carousel-frame {
  padding: 0;
  background: transparent;
  border: none;
}

.carousel-host {
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  overflow: hidden;
}

.carousel-slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide-img {
  width: 100%;
  display: block;
}

.carousel-slide-label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-primary-foreground, #ffffff);
  background: color-mix(in srgb, #0f172a 65%, transparent);
  border-radius: var(--dz-radius-sm, 4px);
  backdrop-filter: blur(4px);
}

.active-index {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  color: var(--dz-foreground, #1a202c);
}

kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  padding: 1px 5px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.composition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-lg, 8px);
  overflow: hidden;
}

.profile-cover {
  width: 100%;
}

.profile-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px 16px;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: var(--dz-foreground, #1a202c);
}

.profile-role {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

.profile-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

.profile-stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.profile-collab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px dashed var(--dz-border, #e2e8f0);
}

.profile-collab-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 4px;
  background: var(--dz-muted, #f1f5f9);
  border-radius: 3px;
}
</style>
