// Fixture: a root barrel that star-exports a family and re-exports an external
// package symbol, which the scanner must attribute to that package.
export * from './family.ts'
export type { Orientation } from '@dzup-ui/contracts'
export * from './missing.ts'
