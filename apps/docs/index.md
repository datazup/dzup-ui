---
layout: home
title: dzup-ui
titleTemplate: Contract-first Vue 3 components

hero:
  name: dzup-ui
  text: Components documented from source, not from memory
  tagline: Every prop, event, slot and exposed member on this site is extracted from the shipped code by vue-component-meta. Nothing here is hand-typed, so nothing here can quietly stop being true.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Browse components
      link: /components/
    - theme: alt
      text: How this site is built
      link: /guide/how-this-site-is-built

features:
  - title: Generated API tables
    details: Prop, event, slot and expose tables come from one extraction pipeline shared with llms.txt and the MCP server. A docs page cannot disagree with the library, because it is not a separate description of it.
  - title: Fidelity is published
    details: Where source carries no description, the cell says so. Where a default is declared undefined because a provider supplies the value, the column says "declared". Where an extraction gap exists, the page warns instead of rendering an empty table.
  - title: Restyleable by contract
    details: Components are styled only through --dz-* custom properties, with stable data-part and data-state hooks and a typed ui override prop. Library CSS always loses to consumer CSS.
  - title: Built for agents too
    details: The same metadata drives llms.txt, llms-full.txt and the @dzup-ui/mcp server, so a coding assistant and a human reading this site are told the same thing.
---
