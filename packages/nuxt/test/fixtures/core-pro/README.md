# core-pro

Both tiers installed from tarballs, `includePro: true`.

**Unrun without `DZUP_PRO_TARBALL`.** Core does not build Pro, and no Pro
ownership manifest or tarball is reachable from this checkout, so the fixture
has no `package.json` rendered and its spec reports `unrun`. It is not skipped
silently: an unrun cell is visible, a skipped one looks like a pass.
