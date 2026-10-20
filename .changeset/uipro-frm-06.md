---
"@dzup-ui/core": patch
---

`DzFileUpload` no longer puts `aria-required` on its `role="button"` drop zone, and `DzRadioGroup` checks the radio an arrow key moves to

`aria-required` is not a supported attribute of `role="button"`, so assistive technology ignored it and axe reported `aria-allowed-attr` on every required file upload. The drop zone no longer renders it; the requirement stays on the file input's native `required`, on `data-required` on the root, and in an enclosing `DzFormField`'s description, which the drop zone's `aria-describedby` already names. In `DzRadioGroup`, an arrow key now always checks the radio it focuses, as the APG radio group pattern requires: before, the check depended on the key still being held when Reka's deferred check ran, so a quick tap or a scripted press moved focus and left the selection behind. A held key still checks exactly once. If you selected the drop zone with `[aria-required]`, use `[data-required]` on the root instead; nothing else changed.
