/**
 * How every `SecurityBoundary` declarer is reached with a hostile value
 * (TASK-N1-O5).
 *
 * One file, one entry per component, because the interesting content of a
 * corpus spec is exactly this: *which prop reaches which element*. Spreading
 * fourteen four-line files around the directory would hide the one table a
 * reviewer wants — "is `DzMenu`'s sink really its item's `href`, and is that
 * really the only one?" — behind fourteen file opens.
 *
 * Three of the declarers have **no sink of their own**: `DzMenu`, `DzSidebar`
 * and `DzBreadcrumb` are containers whose compound sub-parts (`DzMenuItem`,
 * `DzSidebarItem`, `DzBreadcrumbItem`) carry the `href`, and those sub-parts
 * are not rows in the quality matrix. The binding therefore mounts the parent
 * with the child inside it, which is both how the boundary is actually crossed
 * and how a consumer writes it.
 *
 * @module
 */

import type { BoundaryBinding } from './boundary-suites.ts'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import DzButton from '../src/components/buttons/DzButton.vue'
import DzImageCard from '../src/components/cards/DzImageCard.vue'
import DzPersonaSelector from '../src/components/forms/DzPersonaSelector.vue'
import DzAvatar from '../src/components/media/DzAvatar.vue'
import DzAvatarGroup from '../src/components/media/DzAvatarGroup.vue'
import DzImage from '../src/components/media/DzImage.vue'
import DzImageComparison from '../src/components/media/DzImageComparison.vue'
import DzLightbox from '../src/components/media/DzLightbox.vue'
import DzQRCode from '../src/components/media/DzQRCode.vue'
import DzAnchor from '../src/components/navigation/DzAnchor.vue'
import DzBreadcrumb from '../src/components/navigation/DzBreadcrumb.vue'
import DzBreadcrumbItem from '../src/components/navigation/DzBreadcrumbItem.vue'
import DzMegaMenu from '../src/components/navigation/DzMegaMenu.vue'
import DzMenu from '../src/components/navigation/DzMenu.vue'
import DzMenuItem from '../src/components/navigation/DzMenuItem.vue'
import DzSidebar from '../src/components/navigation/DzSidebar.vue'
import DzSidebarItem from '../src/components/navigation/DzSidebarItem.vue'

/* eslint-disable ts/no-explicit-any -- `mount` on a
   `<script setup>` SFC has no exported props type to narrow against; every
   prop object below is checked by the component at runtime instead. */

type AnyWrapper = ReturnType<typeof mount> & { element: Element }

/** The root when it is itself the anchor, otherwise the first descendant one. */
function anchor(root: Element): Element | null {
  return root.tagName === 'A' ? root : root.querySelector('a')
}

/** The first image, root included. */
function image(root: Element): Element | null {
  return root.tagName === 'IMG' ? root : root.querySelector('img')
}

function m(component: unknown, options: Record<string, unknown>): AnyWrapper {
  return mount(component as any, options as any) as AnyWrapper
}

// ---------------------------------------------------------------------------
// navigation sinks — a host-supplied URL becomes a navigation
// ---------------------------------------------------------------------------

const navigation: Record<string, BoundaryBinding> = {
  DzButton: {
    component: 'DzButton',
    sink: 'navigation',
    via: 'the `href` prop, which makes the root an <a>',
    render: p => m(DzButton, { props: { href: p }, slots: { default: 'Open' } }),
    locate: anchor,
  },
  DzAnchor: {
    component: 'DzAnchor',
    sink: 'navigation',
    via: '`items[].href`, rendered into an <a> by the recursive list renderer',
    render: p => m(DzAnchor, { props: { items: [{ href: p, label: 'Section' }] } }),
    locate: anchor,
  },
  DzBreadcrumb: {
    component: 'DzBreadcrumb',
    sink: 'navigation',
    via: '`DzBreadcrumbItem`\'s `href` prop — the container has no sink of its own',
    render: p => m(DzBreadcrumb, {
      slots: { default: () => h(DzBreadcrumbItem as any, { href: p }, () => 'Crumb') },
    }),
    locate: anchor,
  },
  DzMenu: {
    component: 'DzMenu',
    sink: 'navigation',
    via: '`DzMenuItem`\'s `href` prop — the container has no sink of its own',
    render: p => m(DzMenu, {
      slots: { default: () => h(DzMenuItem as any, { href: p }, () => 'Item') },
    }),
    locate: anchor,
  },
  DzSidebar: {
    component: 'DzSidebar',
    sink: 'navigation',
    via: '`DzSidebarItem`\'s `href` prop — the container has no sink of its own',
    render: p => m(DzSidebar, {
      slots: { default: () => h(DzSidebarItem as any, { href: p, label: 'Item' }) },
    }),
    locate: anchor,
  },
  DzMegaMenu: {
    component: 'DzMegaMenu',
    sink: 'navigation',
    via: '`items[].href` on a top-level entry with no panel',
    render: p => m(DzMegaMenu, {
      props: { items: [{ id: 'one', label: 'One', href: p }] },
    }),
    locate: anchor,
  },
}

// ---------------------------------------------------------------------------
// subresource sinks — a host-supplied URL becomes a fetch
// ---------------------------------------------------------------------------

const subresource: Record<string, BoundaryBinding> = {
  DzAvatar: {
    component: 'DzAvatar',
    sink: 'subresource',
    via: 'the `src` prop on the <img>',
    render: p => m(DzAvatar, { props: { src: p, alt: 'Person' } }),
    locate: image,
  },
  DzAvatarGroup: {
    component: 'DzAvatarGroup',
    sink: 'subresource',
    via: 'a slotted `DzAvatar`\'s `src` — the group renders no image of its own',
    render: p => m(DzAvatarGroup, {
      slots: { default: () => h(DzAvatar as any, { src: p, alt: 'Person' }) },
    }),
    locate: image,
  },
  DzImage: {
    component: 'DzImage',
    sink: 'subresource',
    via: 'the `src` prop on the <img>',
    render: p => m(DzImage, { props: { src: p, alt: 'Photo' } }),
    locate: image,
  },
  DzImageCard: {
    component: 'DzImageCard',
    sink: 'subresource',
    via: 'the `src` prop on the card\'s <img>',
    render: p => m(DzImageCard, { props: { src: p, alt: 'Photo' } }),
    locate: image,
  },
  DzImageComparison: {
    component: 'DzImageComparison',
    sink: 'subresource',
    via: 'the `beforeSrc` prop (the `afterSrc` prop is the same code path)',
    render: p => m(DzImageComparison, {
      props: { beforeSrc: p, beforeAlt: 'Before', afterSrc: '/after.png', afterAlt: 'After' },
    }),
    locate: image,
  },
  DzLightbox: {
    component: 'DzLightbox',
    sink: 'subresource',
    via: '`images[].src`, rendered full-viewport inside a teleported dialog',
    render: p => m(DzLightbox, {
      props: { modelValue: true, images: [{ src: p, alt: 'Photo' }] },
      attachTo: document.body,
    }),
    locate: image,
    teleports: true,
  },
  DzPersonaSelector: {
    component: 'DzPersonaSelector',
    sink: 'subresource',
    via: '`personas[].avatarUrl`, rendered only once the combobox list is open',
    render: async (p) => {
      const wrapper = m(DzPersonaSelector, {
        props: { personas: [{ id: 'p1', name: 'Ada', role: 'Engineer', avatarUrl: p }] },
        attachTo: document.body,
      })
      await nextTick()
      // The avatar lives in the combobox's item template, so an unopened
      // selector renders no image and the suite would measure `rejected` on a
      // component that simply had not been asked to draw anything yet.
      const trigger = wrapper.element.querySelector('input')
      trigger?.click()
      await nextTick()
      await nextTick()
      return wrapper
    },
    locate: image,
    teleports: true,
  },
}

// ---------------------------------------------------------------------------
// encoded-payload sink — the value leaves the origin without a browser
// ---------------------------------------------------------------------------

const encoded: Record<string, BoundaryBinding> = {
  DzQRCode: {
    component: 'DzQRCode',
    sink: 'encoded-payload',
    via: 'the `value` prop, encoded into an SVG <path>',
    render: p => m(DzQRCode, { props: { value: p } }),
    locate: root => root.querySelector('svg path'),
  },
}

/**
 * `DzQRCode`'s second, undeclared sink.
 *
 * `icon` is a host-supplied URL that becomes a subresource load — the same
 * property `DzImage`'s boundary justification uses word for word — but
 * `SecurityBoundary` holds one value per component and this component's is
 * `payload`, so the URL rows are never asked for. Bound and asserted here
 * regardless: what the component does is not a function of what the matrix can
 * express about it.
 */
const encodedIcon: BoundaryBinding = {
  component: 'DzQRCode',
  sink: 'subresource',
  via: 'the `icon` prop, rendered as a logo <img> over the code — an undeclared URL sink',
  render: p => m(DzQRCode, { props: { value: 'https://example.test/', icon: p } }),
  locate: image,
}

// ---------------------------------------------------------------------------
// content sinks — host-supplied text reaching a text node or an attribute
// ---------------------------------------------------------------------------

const content: Record<string, BoundaryBinding> = {
  DzButton: {
    component: 'DzButton',
    sink: 'attribute',
    via: 'the `ariaLabel` prop on the root',
    render: p => m(DzButton, { props: { ariaLabel: p }, slots: { default: 'Open' } }),
    locate: root => root,
  },
  DzAnchor: {
    component: 'DzAnchor',
    sink: 'text',
    via: '`items[].label`, rendered as the link text',
    render: p => m(DzAnchor, { props: { items: [{ href: '#a', label: p }] } }),
    locate: anchor,
  },
  DzBreadcrumb: {
    component: 'DzBreadcrumb',
    sink: 'attribute',
    via: '`DzBreadcrumbItem`\'s `ariaLabel`',
    render: p => m(DzBreadcrumb, {
      slots: { default: () => h(DzBreadcrumbItem as any, { href: '/a', ariaLabel: p }, () => 'Crumb') },
    }),
    locate: anchor,
  },
  DzMenu: {
    component: 'DzMenu',
    sink: 'attribute',
    via: '`DzMenuItem`\'s `ariaLabel`',
    render: p => m(DzMenu, {
      slots: { default: () => h(DzMenuItem as any, { href: '/a', ariaLabel: p }, () => 'Item') },
    }),
    locate: anchor,
  },
  DzSidebar: {
    component: 'DzSidebar',
    sink: 'text',
    via: '`DzSidebarItem`\'s `label` prop, rendered as the item text',
    render: p => m(DzSidebar, {
      slots: { default: () => h(DzSidebarItem as any, { href: '/a', label: p }) },
    }),
    locate: anchor,
  },
  DzMegaMenu: {
    component: 'DzMegaMenu',
    sink: 'text',
    via: '`items[].label`, rendered as the menubar entry text',
    render: p => m(DzMegaMenu, { props: { items: [{ id: 'one', label: p, href: '/a' }] } }),
    locate: anchor,
  },
  DzAvatar: {
    component: 'DzAvatar',
    sink: 'text',
    via: 'the `fallback` prop, rendered when there is no image',
    render: p => m(DzAvatar, { props: { fallback: p } }),
    locate: root => root,
  },
  DzAvatarGroup: {
    component: 'DzAvatarGroup',
    sink: 'text',
    via: 'a slotted `DzAvatar`\'s `fallback`',
    render: p => m(DzAvatarGroup, {
      slots: { default: () => h(DzAvatar as any, { fallback: p }) },
    }),
    locate: root => root,
  },
  DzImage: {
    component: 'DzImage',
    sink: 'attribute',
    via: 'the `alt` prop on the <img>',
    render: p => m(DzImage, { props: { src: '/photo.png', alt: p } }),
    locate: image,
  },
  DzImageCard: {
    component: 'DzImageCard',
    sink: 'attribute',
    via: 'the `alt` prop on the card image',
    render: p => m(DzImageCard, { props: { src: '/photo.png', alt: p } }),
    locate: image,
  },
  DzImageComparison: {
    component: 'DzImageComparison',
    sink: 'text',
    via: 'the `beforeLabel` prop, rendered as a caption chip over the image',
    render: p => m(DzImageComparison, {
      props: {
        beforeSrc: '/before.png',
        beforeAlt: 'Before',
        afterSrc: '/after.png',
        afterAlt: 'After',
        beforeLabel: p,
      },
    }),
    locate: root => root,
  },
  DzLightbox: {
    component: 'DzLightbox',
    sink: 'text',
    via: '`images[].caption`, rendered under the image in the teleported dialog',
    render: p => m(DzLightbox, {
      props: { modelValue: true, images: [{ src: '/photo.png', alt: 'Photo', caption: p }] },
      attachTo: document.body,
    }),
    locate: root => root,
    teleports: true,
  },
  DzPersonaSelector: {
    component: 'DzPersonaSelector',
    sink: 'text',
    via: '`personas[].name`, rendered as the option label',
    render: async (p) => {
      const wrapper = m(DzPersonaSelector, {
        props: { personas: [{ id: 'p1', name: p, role: 'Engineer' }] },
        attachTo: document.body,
      })
      await nextTick()
      wrapper.element.querySelector('input')?.click()
      await nextTick()
      await nextTick()
      return wrapper
    },
    locate: root => root,
    teleports: true,
  },
  DzQRCode: {
    component: 'DzQRCode',
    sink: 'attribute',
    via: 'the `ariaLabel` prop on the root',
    render: p => m(DzQRCode, { props: { value: 'https://example.test/', ariaLabel: p } }),
    locate: root => root,
  },
}

/**
 * A style sink: `DzQRCode` writes `color` and `background` straight into the
 * SVG `fill` attributes, so a host-supplied CSS value reaches a paint property.
 */
const style: Record<string, BoundaryBinding> = {
  DzQRCode: {
    component: 'DzQRCode',
    sink: 'style',
    via: 'the `color` prop, written into the code path\'s `fill` attribute',
    render: p => m(DzQRCode, { props: { value: 'https://example.test/', color: p } }),
    locate: root => root.querySelector('svg path'),
  },
}

/** Every binding, grouped by the suite that runs it. */
export const BINDINGS = {
  navigation,
  subresource,
  encoded,
  encodedIcon,
  content,
  style,
} as const

/** The components a URL-boundary suite covers, in matrix order. */
export const URL_BOUNDARY_COMPONENTS: readonly string[] = [
  ...Object.keys(navigation),
  ...Object.keys(subresource),
].sort()

/** Every component with a content suite. */
export const CONTENT_COMPONENTS: readonly string[] = Object.keys(content).sort()
