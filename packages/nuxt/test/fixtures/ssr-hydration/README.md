# ssr-hydration

Server-renders a component inside `DzThemeProvider`, then hydrates.

Asserts the component root is present in the server HTML (so it really rendered
server-side) and that hydration produces no mismatch warning. A hydration
mismatch is invisible in production builds and corrupts event handlers, so it
has to be asserted rather than eyeballed.
