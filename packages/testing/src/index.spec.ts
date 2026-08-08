import { describe, expect, it } from 'vitest'
import { installDzupUiDomTestEnvironment } from './index.ts'

describe('installDzupUiDomTestEnvironment', () => {
  it('installs and cleans up the DOM methods used by Reka UI', () => {
    const targets: Array<[object, PropertyKey]> = [
      [globalThis, 'ResizeObserver'],
      [Element.prototype, 'scrollIntoView'],
      [Element.prototype, 'hasPointerCapture'],
      [Element.prototype, 'setPointerCapture'],
      [Element.prototype, 'releasePointerCapture'],
    ]
    const originalDescriptors = targets.map(([target, key]) =>
      Object.getOwnPropertyDescriptor(target, key))

    try {
      for (const [target, key] of targets)
        Reflect.deleteProperty(target, key)

      const cleanup = installDzupUiDomTestEnvironment()
      expect(globalThis.ResizeObserver).toBeTypeOf('function')
      expect(Element.prototype.scrollIntoView).toBeTypeOf('function')
      expect(Element.prototype.hasPointerCapture).toBeTypeOf('function')
      expect(Element.prototype.setPointerCapture).toBeTypeOf('function')
      expect(Element.prototype.releasePointerCapture).toBeTypeOf('function')

      cleanup()
      cleanup()
      for (const [target, key] of targets)
        expect(Object.getOwnPropertyDescriptor(target, key)).toBeUndefined()
    }
    finally {
      targets.forEach(([target, key], index) => {
        const descriptor = originalDescriptors[index]
        if (descriptor !== undefined)
          Object.defineProperty(target, key, descriptor)
      })
    }
  })

  it('does not replace an existing browser implementation', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView')
    const nativeLikeImplementation = (): void => {}
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: nativeLikeImplementation,
    })

    try {
      const cleanup = installDzupUiDomTestEnvironment()
      expect(Element.prototype.scrollIntoView).toBe(nativeLikeImplementation)
      cleanup()
      expect(Element.prototype.scrollIntoView).toBe(nativeLikeImplementation)
    }
    finally {
      if (descriptor !== undefined)
        Object.defineProperty(Element.prototype, 'scrollIntoView', descriptor)
      else
        Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })
})
