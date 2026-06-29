# DzKnob Contract

## Purpose

`DzKnob` is a rotary numeric input rendered as an SVG dial. It is a form
control with slider semantics for dense numeric settings such as volume, gain,
thresholds, or percentage controls.

## API Surface

- Source: `packages/core/src/components/forms/DzKnob.vue`
- Types: `DzKnobProps`, `DzKnobEmits`, `DzKnobSlots`
- Public export: `packages/core/src/components/forms/index.ts`
- Model: `v-model:value` as `number`
- Key props: `min`, `max`, `step`, `valueTemplate`, `strokeWidth`,
  `showValue`
- Events: `ChangeEvents<number>`
- Slots: `value`

## Usage

```vue
<DzKnob
  v-model:value="gain"
  :min="0"
  :max="100"
  :step="5"
  value-template="{value}%"
  aria-label="Gain"
/>
```

## Visual And Test References

- Contract tests: `packages/core/src/components/forms/DzKnob.contract.spec.ts`
- Unit tests: `packages/core/src/components/forms/DzKnob.spec.ts`
- Storybook/VRT reference: `packages/core/stories/forms/DzKnob.stories.ts`
  (`Default`, `Stepped`, `Tone Gallery`, `Read Only`, `Size Matrix`,
  `In DzFormField`, dark-mode and interactive stories)
