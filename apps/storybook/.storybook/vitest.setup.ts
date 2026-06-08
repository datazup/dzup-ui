import { setProjectAnnotations } from '@storybook/vue3-vite'
import { beforeAll } from 'vitest'
import preview from './preview.ts'

// TASK-0.9 — applies the project-level decorators/parameters (theme, a11y, global
// padding) to every story when run under the Vitest addon, so browser test runs
// match what you see in `storybook dev`.
const project = setProjectAnnotations([preview])

beforeAll(project.beforeAll)
