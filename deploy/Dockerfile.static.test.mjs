import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const dockerfile = readFileSync(new URL('./Dockerfile.static', import.meta.url), 'utf8')

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
