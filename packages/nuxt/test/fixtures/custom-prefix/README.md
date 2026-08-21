# custom-prefix

`prefix: 'X'` must rename every registered tag and nothing else - the emitted
import still names the real export, from the package that really owns it.

Also covers the case the old `name.slice(2)` rule got wrong: a component whose
export name does not start with `Dz` is registered unchanged rather than
mangled into `XamMemberBadge`.
