import { describe, expect, it } from 'vitest'
import { checkKeyboardContract, expectKeyboardContract } from './keyboard.ts'

/**
 * `checkKeyboardContract` / `expectKeyboardContract`, asserted on their own terms
 * (RESIDUAL-13).
 *
 * The helper had **no spec of its own** and was called by no component spec —
 * RESIDUAL-12 §4 `F11`, *"a helper written to check a claim found wired to
 * nothing"*, and the second instance of that shape in this programme. RESIDUAL-13
 * wired it into eight component specs and added two options, so it now needs the
 * thing it was written to provide: a check that fails when it should.
 *
 * Both new options are pinned in **both** directions, because an assertion helper
 * that cannot fail is worse than no helper: it puts a green check beside an
 * unverified claim, which is the failure this whole contract exists to remove.
 */

/** A minimal anatomy: the fields the check reads, and nothing else. */
function anatomyWith(keyboard: unknown, extra: Record<string, unknown> = {}) {
  return {
    parts: ['root', 'trigger'],
    states: ['open'],
    keyboard,
    ...extra,
  } as Parameters<typeof checkKeyboardContract>[1]
}

/** A detached element tree from HTML, usable as a `KeyboardTarget`. */
function tree(html: string): Element {
  const host = document.createElement('div')
  host.innerHTML = html
  return host.firstElementChild ?? host
}

describe('checkKeyboardContract — the coherence half', () => {
  it('accepts an explicit `none`, which is a claim and not an omission', () => {
    expect(checkKeyboardContract(tree('<div></div>'), anatomyWith('none'))).toEqual([])
  })

  it('reports an ABSENT contract, because absent and `none` are different facts', () => {
    const problems = checkKeyboardContract(tree('<div></div>'), anatomyWith(undefined))
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('No keyboard contract is declared')
  })

  it('reports a duplicate row, because two rows for one key read as two behaviours', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith([
        { key: 'Enter', action: 'Do it.' },
        { key: 'Enter', action: 'Do it again.' },
      ]),
    )
    expect(problems.some(p => p.includes('Duplicate binding'))).toBe(true)
  })

  it('reports a tree nothing can focus, because then no key can ever arrive', () => {
    const problems = checkKeyboardContract(
      tree('<div><span>text</span></div>'),
      anatomyWith([{ key: 'Enter', action: 'Do it.' }]),
    )
    expect(problems.some(p => p.includes('nothing in the rendered tree is focusable'))).toBe(true)
  })

  it('accepts `documentLevel` for a contract whose keys are bound on the document', () => {
    const problems = checkKeyboardContract(
      tree('<div><span>text</span></div>'),
      anatomyWith([{ key: 'Escape', action: 'Close it.' }]),
      { documentLevel: true },
    )
    expect(problems).toEqual([])
  })

  it('refuses a `rtl: mirrored` row on an anatomy that says its arrows do not swap', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith(
        [{ key: 'ArrowRight', action: 'Move on.', rtl: 'mirrored' }],
        { rtl: { mirrors: 'layout', keyboard: 'none' } },
      ),
    )
    expect(problems.some(p => p.includes('Either the arrow keys swap'))).toBe(true)
  })
})

describe('`conditions` — RESIDUAL-12 §4 `F14` settled: a `when` may name a prop', () => {
  const contract = [{ key: 'Enter', when: 'interactive', action: 'Activate the row.' }]

  it('flags a single-word `when` that is neither a part, a state nor an admitted condition', () => {
    const problems = checkKeyboardContract(tree('<button></button>'), anatomyWith(contract))
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('neither a declared part')
    // The message has to say how to resolve it, or the next reader deletes the row.
    expect(problems[0]).toContain('`conditions`')
  })

  it('accepts it once the caller names it as a condition', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith(contract),
      { conditions: ['interactive'] },
    )
    expect(problems).toEqual([])
  })

  it('still flags a DIFFERENT word, so admitting one prop does not admit every typo', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith([{ key: 'Enter', when: 'intractive', action: 'Activate the row.' }]),
      { conditions: ['interactive'] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('`intractive`')
  })

  it('needs no admission for a multi-word `when`, which is read as free text', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith([{ key: 'Home', when: 'list open', action: 'Move to the first option.' }]),
    )
    expect(problems).toEqual([])
  })

  it('needs no admission for a `when` that names a declared part', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith([{ key: 'Enter', when: 'trigger', action: 'Open it.' }]),
    )
    expect(problems).toEqual([])
  })
})

describe('`platform` — the runtime half a source scan cannot reach', () => {
  const contract = [{ key: ' ', action: 'Toggle the focused checkbox.' }]

  it('passes when the RENDERED tree contains a node that owns the key natively', () => {
    // The `DzCheckboxGroup` shape: the group is a `<div>` and a slot, and the
    // checkbox — a `<button role="checkbox">` in this library — is the consumer's.
    const problems = checkKeyboardContract(
      tree('<div role="group"><button role="checkbox">A</button></div>'),
      anatomyWith(contract),
      { platform: [' '] },
    )
    expect(problems).toEqual([])
  })

  it('fails when the tree has nothing that owns the key, which is the whole point', () => {
    const problems = checkKeyboardContract(
      tree('<div role="group"><span tabindex="0">A</span></div>'),
      anatomyWith(contract),
      { platform: [' '] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('contains no element whose documented HTML behaviour is that key')
  })

  it('credits an activation ROLE, because a consumer\'s own role="button" is a legitimate answer', () => {
    const problems = checkKeyboardContract(
      tree('<div><div role="button" tabindex="0">Go</div></div>'),
      anatomyWith([{ key: 'Enter', action: 'Go.' }]),
      { platform: ['Enter'] },
    )
    expect(problems).toEqual([])
  })

  it('does NOT credit Space to a link, because a link follows on Enter only', () => {
    const problems = checkKeyboardContract(
      tree('<nav><a href="#x">Go</a></nav>'),
      anatomyWith([
        { key: 'Enter', action: 'Follow the link.' },
        { key: ' ', action: 'Follow the link.' },
      ]),
      { platform: ['Enter', ' '] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('` `')
  })

  it('credits NO navigation key, because roving focus always takes code', () => {
    // The same refusal `anatomy-keyboard.ts`'s `NAVIGATION_KEYS` makes. A
    // `<button>` next to an arrow row is not the arrow row's owner.
    const problems = checkKeyboardContract(
      tree('<div><button>A</button><button>B</button></div>'),
      anatomyWith([{ key: 'ArrowRight', action: 'Move to the next control.' }]),
      { platform: ['ArrowRight'] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('never navigation')
  })

  it('rejects a key that is not in the declared contract at all', () => {
    const problems = checkKeyboardContract(
      tree('<button></button>'),
      anatomyWith([{ key: 'Enter', action: 'Go.' }]),
      { platform: ['Escape'] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('is not in the declared contract')
  })

  it('does not credit a DISABLED control, which answers no key at all', () => {
    const problems = checkKeyboardContract(
      tree('<div><button disabled>A</button></div>'),
      anatomyWith([{ key: 'Enter', action: 'Go.' }]),
      { platform: ['Enter'] },
    )
    expect(problems.some(p => p.includes('no element whose documented HTML behaviour'))).toBe(true)
  })
})

describe('`handled` — the other runtime half, and why it is not interchangeable', () => {
  it('passes when the component consumes the key', () => {
    const root = tree('<div><button>A</button></div>')
    root.addEventListener('keydown', (event) => {
      event.preventDefault()
    })
    const problems = checkKeyboardContract(
      root,
      anatomyWith([{ key: 'ArrowRight', action: 'Move on.' }]),
      { handled: ['ArrowRight'] },
    )
    expect(problems).toEqual([])
  })

  it('fails when nothing consumes it', () => {
    const problems = checkKeyboardContract(
      tree('<div><button>A</button></div>'),
      anatomyWith([{ key: 'ArrowRight', action: 'Move on.' }]),
      { handled: ['ArrowRight'] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('did not call `preventDefault()`')
  })

  it('is the WRONG assertion for a platform key, which is why `platform` exists', () => {
    // A native `<button>` activates on Space without preventing it — measured in
    // Reka's own dist for `CheckboxRoot` and `RadioGroupItem`, which prevent
    // `enter` only. `handled` therefore reports a false problem here and
    // `platform` reports none.
    const root = tree('<div role="group"><button role="checkbox">A</button></div>')
    const contract = anatomyWith([{ key: ' ', action: 'Toggle it.' }])
    expect(checkKeyboardContract(root, contract, { handled: [' '] })).toHaveLength(1)
    expect(checkKeyboardContract(root, contract, { platform: [' '] })).toEqual([])
  })
})

describe('expectKeyboardContract — throws with every problem at once', () => {
  it('is silent on a coherent, reachable contract', () => {
    expect(() => expectKeyboardContract(
      tree('<button></button>'),
      anatomyWith([{ key: 'Enter', action: 'Go.' }]),
    )).not.toThrow()
  })

  it('throws once, listing every problem, so a run does not reveal them one at a time', () => {
    let message = ''
    try {
      expectKeyboardContract(
        tree('<div><span>text</span></div>'),
        anatomyWith([
          { key: 'Enter', when: 'clickable', action: 'Go.' },
          { key: 'Enter', when: 'clickable', action: 'Go again.' },
        ]),
      )
    }
    catch (error) {
      message = (error as Error).message
    }
    // Four: the `when` is flagged once per row, the duplicate once, the
    // unfocusable tree once. Per-row rather than per-value on purpose — a reader
    // fixing a table needs to know which rows carry the problem.
    expect(message).toContain('4 problems')
    expect(message).toContain('Duplicate binding')
    expect(message).toContain('neither a declared part')
    expect(message).toContain('nothing in the rendered tree is focusable')
  })

  it('accepts a `@vue/test-utils`-shaped target, which is how every call site passes one', () => {
    const element = tree('<button></button>')
    expect(() => expectKeyboardContract(
      { element },
      anatomyWith([{ key: 'Enter', action: 'Go.' }]),
    )).not.toThrow()
  })
})

/**
 * `tabStops` — the `Tab` assertion (RESIDUAL-15).
 *
 * RESIDUAL-14 §6 scheduled the five remaining `undetermined` `Tab` rows as one
 * `expectKeyboardContract` call each "asserting `Tab` in its `platform` list…
 * scheduled work, not an owner judgement". The first case below is why that could
 * not work, and the rest pin the option that replaced it — in **both** directions,
 * because the two shapes a `Tab` row can claim are opposites and RESIDUAL-14 §2.2.4
 * caught one published as the other.
 */
describe('checkKeyboardContract — the tab-order half', () => {
  const tabRow = [{ key: 'Tab', action: 'Move to the next control.' }]

  it('refuses `Tab` as platform-owned, because no element\'s documented behaviour is Tab', () => {
    const problems = checkKeyboardContract(
      tree('<div><button></button><button></button></div>'),
      anatomyWith(tabRow),
      { platform: ['Tab'] },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('no element whose documented HTML behaviour is that key')
    expect(problems[0]).toContain('never navigation')
  })

  it('accepts "each is its own tab stop" when every node is in the order', () => {
    expect(checkKeyboardContract(
      tree('<div><button></button><button></button><button></button></div>'),
      anatomyWith(tabRow),
      { tabStops: { of: 'button', expect: 'each' } },
    )).toEqual([])
  })

  it('refuses "each" when a roving tabindex has taken the siblings OUT of the order', () => {
    // The inversion RESIDUAL-14 found published: `DzCheckboxGroup`'s "each box is
    // its own tab stop" was cited to `RovingFocusItem.js`, which is the mechanism
    // that makes a set ONE tab stop.
    const problems = checkKeyboardContract(
      tree('<div><button tabindex="0"></button><button tabindex="-1"></button><button tabindex="-1"></button></div>'),
      anatomyWith(tabRow),
      { tabStops: { of: 'button', expect: 'each' } },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('1 of 3 matched node(s) are in the tab order and the row says 3')
    expect(problems[0]).toContain('opposite of this row')
  })

  it('accepts "one tab stop" for that same tree, which is the other row', () => {
    expect(checkKeyboardContract(
      tree('<div><button tabindex="0"></button><button tabindex="-1"></button><button tabindex="-1"></button></div>'),
      anatomyWith(tabRow),
      { tabStops: { of: 'button', expect: 'one' } },
    )).toEqual([])
  })

  it('refuses "one" when every node is its own tab stop', () => {
    const problems = checkKeyboardContract(
      tree('<div><button></button><button></button></div>'),
      anatomyWith(tabRow),
      { tabStops: { of: 'button', expect: 'one' } },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('2 of 2 matched node(s) are in the tab order and the row says 1')
  })

  it('counts the ROOT when it matches, which is how Reka builds one tab stop', () => {
    // `RovingFocusGroup.js` puts `tabindex="0"` on the GROUP and `-1` on every
    // item. Measured on `DzRadioGroup`: `radiogroup=0 | radio=-1 | radio=-1`.
    // `querySelectorAll` searches descendants only, so without the root this read
    // `0 of 2` and called a correct implementation broken.
    expect(checkKeyboardContract(
      tree('<div role="radiogroup" tabindex="0"><button role="radio" tabindex="-1"></button><button role="radio" tabindex="-1"></button></div>'),
      anatomyWith(tabRow),
      { tabStops: { of: '[role="radiogroup"],[role="radio"]', expect: 'one' } },
    )).toEqual([])
  })

  it('refuses a set of fewer than two nodes, because that is not a claim about order', () => {
    const problems = checkKeyboardContract(
      tree('<div><button></button></div>'),
      anatomyWith(tabRow),
      { tabStops: { of: 'button', expect: 'each' } },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('matched 1 node(s)')
    expect(problems[0]).toContain('children a consumer would supply')
  })

  it('drives the key, and refuses a component that consumed it', () => {
    const root = tree('<div><button></button><button></button></div>')
    root.addEventListener('keydown', (event) => {
      if ((event as KeyboardEvent).key === 'Tab')
        event.preventDefault()
    })
    const problems = checkKeyboardContract(root, anatomyWith(tabRow), {
      tabStops: { of: 'button', expect: 'each' },
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('called `preventDefault()` on it')
    expect(problems[0]).toContain('trapped focus')
  })

  it('cannot be used to claim a row that is not published', () => {
    const problems = checkKeyboardContract(
      tree('<div><button></button><button></button></div>'),
      anatomyWith([{ key: 'Enter', action: 'Go.' }]),
      { tabStops: { of: 'button', expect: 'each' } },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('`Tab` is not in the declared contract')
    expect(problems[0]).toContain('not a way to claim one')
  })
})
