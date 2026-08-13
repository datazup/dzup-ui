import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const dockerfile = readFileSync(new URL('./Dockerfile.static', import.meta.url), 'utf8')
const landingManifests = [
  './landing/coolify.json',
  './landing/coolify.staging.json',
].map((relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8')))

test('static image caches repository install and package build before app selection', () => {
  const commonLayer = dockerfile.indexOf('RUN yarn install --immutable \\\n  && yarn build')
  const appArguments = dockerfile.indexOf('ARG UI_WORKSPACE')
  const appBuild = dockerfile.indexOf('yarn workspace "$UI_WORKSPACE" build')

  assert.ok(commonLayer >= 0, 'common install/package build layer is missing')
  assert.ok(commonLayer < appArguments, 'app arguments must not invalidate the common layer')
  assert.ok(appArguments < appBuild, 'app build must remain selected by validated arguments')
  assert.equal(dockerfile.match(/yarn install --immutable/g)?.length, 1)
  assert.equal(dockerfile.match(/\n  && yarn build/g)?.length, 1)
})

test('landing images build the Storybook mounted at /storybook before the landing bundle', () => {
  const appArguments = dockerfile.indexOf('ARG UI_WORKSPACE')
  const storybookArgument = dockerfile.indexOf('ARG UI_BUILD_STORYBOOK=0')
  const storybookBuild = dockerfile.indexOf('1) yarn storybook:build ;;')
  const appBuild = dockerfile.indexOf('yarn workspace "$UI_WORKSPACE" build')

  assert.ok(appArguments < storybookArgument, 'Storybook selection must stay in the app-specific layer')
  assert.ok(storybookArgument < storybookBuild, 'Storybook build must be gated by the validated build argument')
  assert.ok(storybookBuild < appBuild, 'Storybook must exist before the landing Vite closeBundle gate')
  assert.match(dockerfile, /UI_BUILD_STORYBOOK must be 0 or 1/)
  for (const manifest of landingManifests) {
    assert.equal(manifest.services.web.remoteWorkspaceBuild.args.UI_BUILD_STORYBOOK, '1')
  }
})
