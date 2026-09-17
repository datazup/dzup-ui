---
"@dzup-ui/contracts": patch
"@dzup-ui/core": patch
"@dzup-ui/tokens": patch
---

**All six cascade layers are declared, so a consumer override wins by contract instead of by accident.**

ADR-19 §2 decided six layers — `@layer dz-reset, dz-tokens, dz-base,
dz-components, dz-utilities, dz-overrides;` — and its Consequences promised that
*"consumers gain `dz-overrides` immediately as a documented place to write, with
no library change required"*. Three of the six existed nowhere. `dz-reset`,
`dz-utilities` and `dz-overrides` were named by the ADR and emitted by nothing.

The promise still appeared to hold, which is the part worth explaining. An
**unregistered** layer sorts after every registered one, so a consumer writing
`@layer dz-overrides { … }` did win — not because the library said so, but
because nothing had claimed the name. That would have stopped being true the
first time the library registered any layer after `dz-components`, silently, in a
consumer's build, with no error anywhere.

```css
/* your stylesheet, imported after the dzup ones */
@layer dz-overrides {
  .dz-tab-close-btn { opacity: 0.5 }   /* wins. no !important. */
}
```

**The statement ships in both stylesheets, and it has to.** CSS registers a layer
at its *first* appearance. `tokens.css` used to open `@layer dz-tokens` without
declaring the order, so if a bundler emitted it before `core.css`, `dz-tokens`
registered ahead of `dz-reset` and the shipped order depended on emit order.
Both sheets now carry the same six-slot statement; `base.css` remains the single
statement the docs evidence layer reads.

**Box-model and document normalisation moved from `dz-base` into `dz-reset`,**
which is where ADR-19's own table always put them. Nothing else in the library
sets `box-sizing`, `margin` on `body`, or `scroll-behavior`, so no shipped
selector changed weight — but a consumer now has the layer the ADR promised for
resetting the reset.

**One limit, measured and asserted rather than smoothed over.** A consumer sheet
that opens `@layer dz-overrides { … }` *before* the dzup stylesheets are
evaluated registers that layer first; the library's statement then appends
`dz-reset … dz-components` after it, `dz-components` wins, and the override
silently does nothing. Repeating the statement in both sheets does not fix it and
nothing the library ships can — it cannot make a declaration appear before a
sheet that loads earlier. Import the dzup stylesheets first, or use unlayered
CSS, which beats every library layer in either order. `yarn test:e2e:layer-order`
asserts all of this in chromium, firefox and webkit **against the packed
tarballs**, because what a consumer receives is the built artifact and every step
between source and artifact can drop a layer statement.

**`data-state` is no longer typed by a union a shipped component violated.**
`DataAttributes['data-state']` was typed `DataState`, a closed eight-value list;
`DzButton` has emitted `idle | loading | disabled` — none of the three — since it
shipped. ADR-19 §4 decided the widening and it had not been performed. It is now:
the attribute is `string`, and `DataState` stays as the *named vocabulary* to
draw from where it fits. If you were assigning `DataAttributes['data-state']`
into a `DataState`-typed variable, that no longer narrows on its own — read the
component's own `states` array, which is where the constraint moved.

The constraint is real rather than nominal because the check moved with it:
`yarn validate:anatomy-parts` now reads every `data-state` literal a template can
produce and fails when the component's anatomy does not declare it. Measured at
the widening: zero violations across all 32 components that declare an anatomy.

**Seven part names joined the shared vocabulary and seven were kept deliberately
outside it.** `validate:anatomy-parts` had been reporting 14 shipped names beyond
the original 30 — the mechanism ADR-19 §3 specified, working. `clear`, `toggle`,
`filename`, `language`, `body`, `row` and `cell` name jobs that recur and are now
vocabulary. `copy-button`, `line-number`, `decrement`, `increment` and the three
`options-*` names are recorded in the new `ANATOMY_PART_EXTENSIONS` export with a
reason each, so a reviewed extension is distinguishable from a name nobody has
looked at. **Nothing was renamed** — renaming a shipped part name is breaking,
which is exactly why the review happened now.

**`ariaInvalid` gains its correct home on `BaseValidationProps`,** beside
`invalid`, `error` and `required`. It is still declared on
`BaseAccessibilityProps`, deprecated, so this release changes no component's prop
surface; removing it there is the breaking half and ships on its own.

**A vendor sublayer registry, empty on purpose.** ADR-19 §3 keeps Reka internals
out of the parts contract; nothing said the same about a `[data-reka-*]`
*selector* inside `@layer dz-components`, which is the same bet on somebody
else's markup with none of the visibility.
`packages/core/src/styles/vendor-registry.json` records selector, owner, reason
and exit condition, and `yarn validate:vendor-sublayers` fails on an incomplete
entry, on an entry whose rule was deleted, and on a vendor-shaped selector with
no entry. It ships with **zero** entries, measured rather than assumed — the only
contact with Reka is a custom property the library reads — which is precisely why
the third rule is there.
