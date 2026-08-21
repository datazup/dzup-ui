// Fixture: a family barrel re-exporting a .vue component, a type, and a leaf.
export type { LeafInterface } from './leaf.ts'
export { leafValue } from './leaf.ts'
export { default as DzFixture } from './DzFixture.vue'
export type { DzFixtureProps } from './DzFixture.types.ts'
