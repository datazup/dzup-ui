/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `apps/landing/scripts/build-releases.ts` from the source-of-truth
 * changelog (CHANGELOG.md + .changeset + per-package changelogs) via the
 * shared `@dzup-ui/tooling` release parser — the SAME parser the Storybook
 * Releases page uses, so the two can never disagree.
 *
 * Consumed by `src/pages/ChangelogPage.vue` and the Atom feed at
 * `public/feed.xml`. Committed and drift-guarded (CI regenerates and diffs);
 * regenerate with `yarn build:releases`. Deterministic — no build timestamp —
 * so an unchanged changelog produces a byte-identical file.
 */

export interface ReleaseEntry {
  text: string
  author?: string
  deprecated: boolean
  breaking: boolean
}

export interface ReleaseSection {
  name: string
  entries: ReleaseEntry[]
}

export interface Release {
  /** The `## ` heading from CHANGELOG.md — an ISO date (`2026-06-27`). */
  date: string
  sections: ReleaseSection[]
  entryCount: number
}

export interface PendingChange {
  packages: string[]
  level: 'major' | 'minor' | 'patch'
  summary: string
  body: string
  breaking: boolean
  deprecated: boolean
}

export interface Highlight {
  source: 'changeset' | 'package' | 'changelog'
  date: string
  kind: 'breaking' | 'deprecated'
  section: string
  text: string
  author?: string
}

export const SECTION_ORDER: string[] = [
  "Breaking",
  "Deprecated",
  "Removed",
  "Security",
  "Added",
  "Changed",
  "Fixed"
]

export const TOTAL_RELEASES: number = 43

export const FEED_UPDATED: string = "2026-06-27T00:00:00Z"

export const RELEASES: Release[] = [
  {
    "date": "2026-06-27",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix use avatar fallback as accessible label.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-26",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add play assertions across component stories.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Enable Vitest addon.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add make table variant gallery hoverable.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix storybook test assertions for remaining 16 story files.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix remaining 17 storybook test assertion failures.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix 9 remaining storybook test failures.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix use canvaselement.ownerdocument.body for portalled calendar queries.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix simplify datepicker/daterangepicker play functions.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix resolve vitest browser test setup.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix expose menu and resize handle aria states.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix resolve 28 residual lint errors + restore typecheck.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 11
  },
  {
    "date": "2026-06-25",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add graduate governancebadge and teammemberbadge from stubs to full components.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add Storybook stories for GovernanceBadge and TeamMemberBadge.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add compound-parts and standalone stories for 7 component families.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add play() assertions to DzDropdownMenu and DzContextMenu.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add play() assertions to Parts, form-input, and overlay stories.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add input accessibility play assertions.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add contract specs for DzAccordionItem, DzListItem, DzTreeItem; bump packages to 0.1.0.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add play() for tagsinput/listbox/segmented/colormodetoggle/inplace; toast contract specs.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add play() assertions to Notification, ToastParts, SpeedDial, Chip, Tag, Calendar, List, DataView.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add form and panel play assertions.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add navigation play assertions.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Add blocks, templates, and animation showcase.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Harden FormField/Panel play selectors.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix use baseformcontrolprops<never> for variant-less form controls.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix centralise orientation type; component aliases re-export from contracts.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix commit formatter-normalised dzknob/dzpanel files from review session.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix remove extra dzknob wrapper.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix remove redundant toolbarvariant/panelvariant re-exports from component files.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix alias orientation union in 6 remaining components.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix alias orientation in dztimeline + usetabs; document scrollorientation.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix replace incorrect contain:layout assertions with real component invariants.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix add icon size variant to governancebadge and teammemberbadge.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 22
  },
  {
    "date": "2026-06-24",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Add specification and task-backlog docs for the three landing-page ecosystem offerings (apps/landing), each covering the investigation, display design, free-tier (@dzup-ui/core) catalog.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-23",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix expose password visibility toggle state.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-22",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Address all findings from docs/bugs.md and docs/bugs-1.md, surfaced by.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix annotate dzmasonry item ref param to avoid excessive stack depth.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix make dzmasonry item ref portable across consumer vue copies.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 3
  },
  {
    "date": "2026-06-19",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix align masonry slot typing with vue.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-18",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Fix.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Implement the 14 free-tier components from docs/new-features.md, each with the.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-06-17",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix align component props and type imports.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix wrap function refs for vue type compatibility.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-06-16",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix simplify collapse content ref typing.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix use tsc for contracts typecheck.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-06-12",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Added new features and components.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-10",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Fix bugs.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-09",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Fixed components with list.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-06-08",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add neutralize password autofill background.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Fix bugs and added new component.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix value for date picker.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 3
  },
  {
    "date": "2026-06-03",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add update packages.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add update apps.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-05-31",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Support date type in DzInput props.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix make compat typecheck use workspace vue-tsc.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-05-30",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add align sidebar section padding for collapsed state.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-29",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add deepen light and dark shadow token scales.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add refine light theme contrast and radius scale.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add strengthen component emphasis and focus styling.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add refine badge/tag sizing and dzup gallery layout.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add enrich dzup gallery dashboard, table, and form.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add datazup brand variants to visual refresh galleries.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add stabilize dzup dashboard chart and goal ring.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add polish dzup gallery table density and avatar alignment.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add improve dzup table tab count spacing.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add refine dzup form and dashboard layout spacing.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add apply kpi card spacing polish and dztext margin wrapper.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add Detail, Settings, and States gallery story files with dzup fixtures.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add align dashboard card stories with updated props.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add stories source glob to Tailwind CSS scan.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add freestyle reference stories for visual refresh.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 15
  },
  {
    "date": "2026-05-28",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add freestyle dashboard gallery story.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add free-styled reference screens (visual target).",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add a/b gallery stories (freestyle vs dzup-ui).",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix keep canonical fouc theme preload script.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix preserve accordion model type in model-value binding.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 5
  },
  {
    "date": "2026-05-27",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix resolve merge conflicts in dzaccordion, dzsidebar, dzdialogclose, dzstepperitem, feedback/index.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix resolve merge conflict markers in app.vue — take esmir side (dztoastprovider + devdrawer + sandboxroutes).",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-05-26",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add theme provider utilities and exports.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Fixed bugs and new components on navigation and overlays.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fixed bugs and added new components for inputs, forms, overlays, editors.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Standardize inheritAttrs via defineOptions.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 4
  },
  {
    "date": "2026-05-25",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "New components for buttons, cards, feedback, forms.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-20",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add run token scripts via node --import tsx.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-18",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add allow number input type in dzinput props.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-14",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Added new component on routes navigation, media, forms, typography.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-11",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add design-to-dzup-ui planning command.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add harden design plan cli arg parsing.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add expand design plan scanning and migration signals.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Support package-scoped design plan scanning.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add pass package filters to design plan generator.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 5
  },
  {
    "date": "2026-05-09",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add inline nuxt theme bootstrap and tighten package build.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-08",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add DzSlider single-value range input component.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-05-07",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add share vite lib config and expand core exports.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add canonical icon size across component variants.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add align data grid header filters with form components.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 3
  },
  {
    "date": "2026-05-06",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add sandbox theme toggling and Storybook docs support.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add standardize scripts and theme/provider integration.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-05-05",
    "sections": [
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Yarn install.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Commit.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Implemented /layout.",
            "author": "Esmir Isić",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 3
  },
  {
    "date": "2026-05-03",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add canonicalize app shell sidebar tokens.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-04-28",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add standardize focus states and improve accessibility.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-04-20",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add GovernanceBadge and TeamMemberBadge; update input token variants.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-04-18",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add DzRunStatusBadge, DzTokenProgressBar, DzPersonaSelector; export useSidebar.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix remove inner native focus outline from dzinput.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix add ring-offset-1 to dzinput focus ring for visible outer indicator.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 3
  },
  {
    "date": "2026-04-14",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix represent empty select values with an internal sentinel.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-04-13",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add refine shell/sidebar/input variants and regenerate tokens.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-04-10",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add DzCopyButton, DzCodeBlock, DzAppShell, DzSidebar, DzConfirmDialog components.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 1
  },
  {
    "date": "2026-04-07",
    "sections": [
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Apply sessions 5–7 hardening — validators, CI parity, governance.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Rename package scope and repo from dzip-ui → dzup-ui.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  },
  {
    "date": "2026-04-05",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add expand public-api manifest — composables + providers section.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Unify useTheme — provider-based is canonical.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix upgrade storybook config to v10 api.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Correct relative import paths in composition stories.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 4
  },
  {
    "date": "2026-04-04",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add storybook config updates and expanded story coverage.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add sandbox app — expanded cards and forms pages, improved navigation.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add transition tokens, dzworkflowdesigner improvements, pro deps.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add contain: layout style to 13 interactive components.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add expand useid() to all form/input components for unique id generation.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Changed",
        "entries": [
          {
            "text": "Extract DzDataGridHeader logic into useDataGridHeader composable.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix data-state/data-tone attributes for buttons, inputs, feedback, media components.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix data component types/variants, dzdatagrid inject safety, dzbadge cleanup.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Fix forms/navigation/overlays variant and token consistency cleanups.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 9
  },
  {
    "date": "2026-04-03",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add phase 4+5 — release infrastructure, compat, codemods, docs.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add phase 6 — file extractions, keyboard nav, a11y tests, contributing guide.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add phase 7 — compat expansion, codemods, e2e setup, perf benchmarks.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add phase 8 — a11y data tables, bundle budgets, consumer test, compat expansion.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add phase 10 — full a11y test coverage, component a11y fixes.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add phase 11 — css @layer architecture, auto-import resolver, data-state polish.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add phase 12 — nuxt module, component size report, license audit, story expansion.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      },
      {
        "name": "Fixed",
        "entries": [
          {
            "text": "Fix phase 9 — data-state contract compliance, composable exports, readme.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 8
  },
  {
    "date": "2026-04-02",
    "sections": [
      {
        "name": "Added",
        "entries": [
          {
            "text": "Add initial commit — dzip-ui vnext alpha (v0.1.0-alpha.0).",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          },
          {
            "text": "Add w2 feature gaps — searchable select, dialog animations, closable tabs, grid filtering, polymorphic button.",
            "author": "ninel.hodzic",
            "deprecated": false,
            "breaking": false
          }
        ]
      }
    ],
    "entryCount": 2
  }
]

export const PENDING: PendingChange[] = [
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**",
    "body": "**`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**\n\nSlices three to five of `TASK-FORM-OSS-02`, which closes it: the readiness\nmatrix goes from 84 open gaps to 3, and all three are out of scope on purpose —\none is `TASK-FORM-OSS-03`'s work and two are owner decisions recorded below.\n\n**A field described its control with ids that were not there** (C4).\n`useFormField` pushed `descriptionId` into `aria-describedby` unconditionally,\nso every control inside a `DzFormField` with no `DzFormDescription` — most of\nthem — announced itself described by an element that did not exist. It failed in\nthe quietest way available: assistive technology ignores a dangling id, nothing\nwarned, and the `parts.length > 0` guard at the end could never be false.\n\nThe field now names only what is rendered. It decides that by **walking its\nslot before children render**, because registration alone cannot work on the\nserver: SSR renders children in order and never comes back, so a control\nserialised before the description's `setup` ran would omit the id and the client\nwould add it — a hydration mismatch on an accessibility attribute, which is\nworse than the dangling id it replaced. Registration is kept as the catch-all\nfor a description rendered by some intermediate component of the consumer's own.\n\n**`DzFormMessage` carried `role=\"alert\"` and `aria-live=\"polite\"` on the same\nnode** (C4). `alert` implies assertive and wins, so every standing field error\ninterrupted whatever the user was being told. A message already on screen when\nthe control is focused is read as part of its description; only one that\n*arrives* needs a live region. It is polite now, with no `role`.\n\n**Two controls computed an id and rendered it nowhere** (C2). `DzFileUpload`\nhad no `id` in the DOM at all — a `DzFormLabel`'s `for` named an id that\nappeared nowhere in the control, and clicking the label did nothing. It is on\nthe drop zone, not the hidden `<input>`, because the input is `aria-hidden` and\n`tabindex=\"-1\"`: a label pointing at it would name a node no user can reach.\n`DzColorPicker` skipped the field context in the same way.\n\n**`DzFieldArray` hands each row its own ids** (C2). Every row of a repeater\nsits inside one `DzFormField`, so every control in it resolved to the *same*\nid: a label for row 1 could activate row 3, and an `aria-describedby` could name\nanother item's error. The default slot now receives `fieldId`, `descriptionId`\nand `messageId` per row, derived from an `id` prop, the field context, or a\ngenerated base — which is spec 04 §8's \"collision-free control/help/error IDs\nper form instance and array item\".\n\n**The last five named models** (C1). `DzKnob`, `DzRating`, `DzTagsInput`,\n`DzMention` and `DzInplace` join `DzCascader` and `DzTreeSelect` in taking both\n`v-model` and `v-model:value`. Every Core control's value is now on the default\nmodel, and a spec ratchets that so the next one cannot ship without it.\n\n**States and SSR.** `data-required` on the six text inputs and on every date,\ntime, file, slider, knob, rating and colour control; `data-loading` and\n`aria-busy` on `DzKnob` and `DzRating`, whose `loading` prop was declared,\ndefaulted and read nowhere. `packages/core/tests/ssr/form-controls-ssr.spec.ts`\nnow renders all 39 controls with a value: the audit found 26 with no SSR spec at\nall, including all three pickers, where a server/client locale split is exactly\nthe defect `TASK-OSS-P4-03` found elsewhere.\n\n**Two owner decisions, recorded rather than made.** `DzFloatLabel` inherits\n`ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid` and honours\nnone; `DzInplace` inherits two of them. Binding them to a wrapper `<div>` would\nbe equally meaningless and merely harder to notice, so they are listed in\n`packages/tooling/src/forms/assessments.ts` as `inertProps` with a reason each,\nand their cells stay open. Removing them is a breaking type change.\n\n**One SSR behaviour is Reka's, not ours.** `DzSlider` renders its track and\nfilled range on the server and defers the thumb — `display:none`, at 0%, with no\n`aria-valuenow` until the collection registers on mount. Setting the attribute\nfrom Core does not work, because the primitive binds it itself and wins over a\nfallthrough. Asserted as-is so a future Reka that changes it is noticed.",
    "breaking": true,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`DzCascader` and `DzTreeSelect` now take `v-model` as well as `v-model:value`, thirteen selection controls reflect the states their types promise, `DzRadio` and `DzRadioGroup` read the field context they were ignoring, and `DzSelect` stops rendering an empty field on the server.**",
    "body": "**`DzCascader` and `DzTreeSelect` now take `v-model` as well as `v-model:value`, thirteen selection controls reflect the states their types promise, `DzRadio` and `DzRadioGroup` read the field context they were ignoring, and `DzSelect` stops rendering an empty field on the server.**\n\nThe second slice of `TASK-FORM-OSS-02`. Clause references are to\n`docs/program-2026-08/form-control-renderer-contract.md`; the per-control status\nis `docs/program-2026-08/form-controls-readiness-matrix.md`.\n\n**Both model names, one value** (C1). Seven Core controls bind their value to\n`v-model:value` and every other control binds `v-model`. That is invisible until\nsomething binds a control whose name it does not know — a schema-driven\nrenderer, for instance, which holds a component and a codec and binds `v-model`\nto whatever the registry names. On those seven it bound *nothing*: no error, no\nwarning, a control that renders and never reports a value.\n\n`DzCascader` and `DzTreeSelect` now accept both. `v-model:value` is unchanged\nand every existing template keeps working; `v-model` reaches the same value.\nWhichever a consumer binds is the one that carries it, and binding both keeps\nthem in step. The merge is one composable, `useDualModel`, exported from\n`@dzup-ui/core` — the remaining five controls follow in the next slices.\n\n**States that were only in the type** (C3). Six props were declared, defaulted,\nand read nowhere: `DzCascader.loading`, `DzListbox.loading` and `.readonly`,\n`DzTreeSelect.loading` and `.required`, `DzCombobox.required`,\n`DzMultiSelect.required`. All now reach the DOM.\n\nAlongside them, `data-required` on `DzSelect`, `DzSwitch`, `DzCheckbox`,\n`DzRadioGroup`, `DzListbox` and `DzTransfer`. Those six already rendered\n`aria-required` — Reka supplies it — but not the presence-only attribute ADR-19\n§4 names, so a stylesheet had no way to show a required field as required.\n\n**Identity the field context was already offering** (C2). `DzRadioGroup` merged\nrequired, describedby and invalid from `DzFormField` and not `disabled`, so\nevery radio inside a disabled field stayed live. `DzRadio` read no context at\nall and declared an `ariaInvalid` prop that did nothing.\n\n**`DzSelect` renders its value on the server** (C5). `SelectValue` resolves a\nlabel from Reka's item registry, and that registry fills when the *content*\nmounts — which never happens during SSR. A select with a value therefore\nserver-rendered an empty placeholder and filled itself in after hydration: a\nfield that looks unset until JavaScript arrives. The label is now computed from\n`items`, which is already on the component. Unset selects are untouched — the\nfirst attempt supplied slot content unconditionally, which replaced the\nplaceholder too and emptied the accessible name of every empty select.\n\n**`DzSwitch` honours `prefers-reduced-motion`** (C7). The thumb is the one part\nthat moves, and it slid regardless.\n\n**`DzPersonaSelector` was never broken.** It renders a `DzCombobox`, and\ninjection walks the component tree, so the field context reaches the delegate\ndirectly. The readiness matrix now records the delegation instead of reporting\nthree gaps against a wrapper that correctly does nothing.\n\n**Tests.** `packages/core/tests/ssr/form-controls-ssr.spec.ts` grew the\nselection controls — each rendered with a value, `DzCascader` and `DzTreeSelect`\nthrough *both* model names. `useDualModel` has its own unit suite, and the\ncontract specs gained the dual-model and state assertions. Nothing existing was\nedited: all 4,317 core tests pass, including the 69 that already covered these\ntwo components.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`DzTabs`, `DzAccordion` and `DzStepper` can reveal a hidden panel and say when it is rendered, `DzStepper` can refuse a step change, and `useRevealAndFocus` reports whether focus actually landed.**",
    "body": "**`DzTabs`, `DzAccordion` and `DzStepper` can reveal a hidden panel and say when it is rendered, `DzStepper` can refuse a step change, and `useRevealAndFocus` reports whether focus actually landed.**\n\n`TASK-FORM-OSS-04`, which closes the FORM-OSS program.\n\n**The defect this exists to stop** is one of the quietest in a form. A wizard or\ntabbed form validates on submit, finds its first invalid field inside a panel\nthat is not currently shown, and calls `focus()` on it. The element is not in\nthe document — or it is `display: none` — so `focus()` does nothing, raises\nnothing, and returns nothing. The user is told \"please fix the errors\" and given\nno way to reach them.\n\nClosing it takes both halves. **`revealItem(id)`** on all three disclosure\nprimitives opens or activates the panel holding `id` and emits `revealed`\n*after* it has rendered, which is the moment focus becomes possible. It fires\neven when the item was already open, so a caller never has to special-case that\nbranch — which is exactly where the missing focus comes back.\n**`useRevealAndFocus`** waits for `nextTick`, then for the reveal transition,\nthen focuses — and returns **the element that actually holds focus, or `null`**.\nA form that gets `null` can fall back to its error summary instead of stranding\nthe user.\n\nThe transition wait is bounded and skipped under `prefers-reduced-motion`. A\n`transitionend` that never fires must not leave the user with no focus at all:\nslightly early focus is recoverable, never focusing is not.\n\n**`DzStepper` gains `beforeChange` and `linear`.** A wizard cannot advance past\na step whose fields are invalid, and the stepper is the only thing that knows a\nchange is being attempted. The guard is a **boolean and nothing more** — the\nstepper is never told what validation is, only whether the host permits this\nmove. It is awaited even when synchronous, so an async validator does not cause\nthe next step to flash and roll back. A refusal emits `blocked` with a reason,\nbecause a Next button that silently does nothing is indistinguishable from a\nbroken one.\n\n`linear` tracks the furthest step reached rather than the current one, so a user\ncan return to step 1 from step 3 and jump straight back — which is what \"you\ncannot skip ahead\" means to a person filling in a form.\n\n**`revealItem` deliberately bypasses the guard.** It is how a form takes the\nuser *to* an error; a guard that blocked it would trap them on a step whose\nproblems are somewhere else.\n\n**`DzAccordion` honours `prefers-reduced-motion`.** Its panel height animation\nand its chevron rotation both ran regardless.\n\n**What was audited and found sound.** `DzGrid`'s responsive `cols` work per\nbreakpoint, and neither it nor `DzStack` has a physical direction: CSS grid and\n`flex-direction: row` are writing-mode relative, so `dir=\"rtl\"` orders them\ncorrectly with nothing to configure. Both now have specs saying so.\n\n**Two things are recorded rather than fixed.** `DzGrid` has **no span API** — a\nrenderer's \"this field takes two of three columns\" is a raw `class` on the\nchild today, and adding a `DzGridItem` or a `span` prop is an owner decision.\nAnd `DzStack` calls its axis `horizontal`/`vertical` where a renderer's layout\nnode says `row`/`column`; a `direction=\"row\"` silently falls back to vertical,\nwhich reads as a styling bug for a week. Both are asserted by tests so the\nabsence cannot be mistaken for an oversight.\n\nThe readiness matrix now carries a **Layouts** section, so these five are\ntracked beside the 39 controls rather than in prose.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**",
    "body": "**An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**\n\n`DzThemeProvider` has covered theme since ADR-09. Everything else a component\nneeds from its host was a prop on that component or a string in its template.\nMeasured on this checkout: **79 distinct user-visible literals** (50 static\n`aria-label` values no application can change, 29 prop defaults only a\nper-instance prop can change), **15\ncomponents** carrying their own `portalTo`, **5 `Intl` construction sites\nacross 4 files** each with their own locale or none, and no policy at all for motion,\ncomponent defaults, CSP nonce or test ids.\n\nADR-20 (`docs/adr/ADR-20-provider-contract.md`) fixes the keys, the shapes, the\ndefaults and the merge rules. This release lands the **read side**; the\n`DzProvider` component that writes them is the next packet.\n\n**New in `@dzup-ui/contracts`: nine injection keys and their shapes**\n\n`DZ_LOCALE_KEY`, `DZ_MESSAGES_KEY`, `DZ_FORMATS_KEY`, `DZ_DIRECTION_KEY`,\n`DZ_PORTAL_TARGET_KEY`, `DZ_MOTION_KEY`, `DZ_DEFAULTS_KEY`, `DZ_NONCE_KEY`,\n`DZ_TEST_IDS_KEY` — plus `DzLocale`, `DzMessages`, `DzDirection`,\n`DzDirectionPreference`, `DzFormats`, `DzMotion`, `DzMotionPreference`,\n`DzDefaults`, `DzTestIds` and the documented `DZ_PROVIDER_DEFAULTS`.\n\nThey live in the types package on purpose. An injection key is an identity: two\npackages that inject the same concern must inject the *same symbol*, or the\nchild silently receives the default and the bug is invisible. Declaring them\nhere is what lets `@dzup-ui-pro/*` read an application's locale **without\nimporting Core's runtime**. The package stays dependency-free and tree-shakeable.\n\n**New in `@dzup-ui/core`: ten composables, each with a typed default**\n\n| Composable | Answers |\n|---|---|\n| `useDzTheme` | the existing ADR-09 theme context, under the family's name — the one that still requires a provider |\n| `useDzLocale` | the active BCP-47 tag (`en-US` unset) |\n| `useDzDirection` | `'ltr' \\| 'rtl'` — **never `'auto'`**, resolved from the locale |\n| `useDzMessages` | `read(path, fallback)` over a deep-mergeable catalog |\n| `useDzFormats` | cached `Intl` number/date/relativeTime/list factories |\n| `useDzPortalTarget` | where overlays teleport to |\n| `useDzMotion` | `preference` and the resolved `reduced` |\n| `useDzDefaults` | `resolve(component, prop, chain)` — prop → context → provider → component |\n| `useDzNonce` | the CSP nonce for any style this library injects |\n| `useDzTestIds` | `testId(name)`, off until a host names the attribute |\n\n```ts\n// works with no provider mounted — this is the load-bearing property\nconst direction = useDzDirection()          // 'ltr'\nconst { read } = useDzMessages()\nread('select.noResults', 'No results found') // 'No results found'\n```\n\nNine of the ten resolve to a default and never throw. `useDzTheme` is the\nexception and is unchanged from ADR-09: it still requires a `DzThemeProvider`,\nbecause theme has no sensible default for an application that has not chosen\none.\n\n**Nothing changes for existing code.** No component consumes these yet, nothing\nis deprecated, and no default differs from what components hard-code today.\nThat is deliberate: it makes the follow-up migrations — the 79 literals, the 15\nportal props, the 9 `Intl` sites — mechanical and non-breaking, one component at\na time.\n\n**Three rules worth knowing before you nest a provider**\n\n- Every concern **overrides** per key, except `messages`, which **deep-merges** —\n  a host changing `select.noResults` must not restate the other 71 strings.\n- Direction resolves from a checked-in RTL subtag list, not\n  `Intl.Locale.prototype.getTextInfo()`, which is unavailable across the\n  supported Node range (ADR-18). The ADR records the delegation as intended once\n  the floor moves.\n- Under SSR, motion resolves to `reduced: false` — what the CSS media query\n  answers before the client knows better. The alternative hydrates\n  never-animating markup into animating markup, which is a visible jump.\n\nThe write half (`provideDz*`) is **not exported**. `DzProvider` is the one\nsanctioned writer; publishing the write half invites a second provider, and two\nproviders mean two locales and two merge rules.",
    "breaking": true,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**`DzCommandPalette`: search the whole `label`, not just what the row happens to render.**",
    "body": "**`DzCommandPalette`: search the whole `label`, not just what the row happens to render.**\n\nThe palette documented `label` as its search key and filtered `props.items` on it — but Reka's\n`ComboboxItem` also registers each row's *rendered text* (`textValue || textContent`) with\n`ComboboxRoot` and hides any row its own filter scores zero. That second filter sat downstream\nof, and invisible to, the first, so it silently won.\n\nThe effect only shows up in the pattern `label` exists for: a consumer that puts a full search\nhaystack in `label` (ids, tags, keywords) and renders a shorter caption through the `#item`\nslot. Those rows were then filtered by the caption. On this repo's own site that made every\nblock unfindable by its id, its tags, or the `Dz*` components it is built from — all three\nindexed and weighted — while the visible title still matched, and nothing in the DOM showed why.\n\n`ComboboxRoot` now gets `ignore-filter`, leaving this component's filter the only one. Matching\nis unchanged in kind: it uses the same `Intl.Collator`-backed comparison Reka's filter used, so\nit stays case- and accent-insensitive (`resume` still finds `Résumé`).\n\nAlso removes a `:filter-function` binding that had quietly stopped doing anything — it is not a\n`ComboboxRoot` prop in Reka 2.x, so it fell through to `$attrs` and onto the listbox element.\n\nNo API change: same props, same emits, same slots. Rows that were being filtered out despite a\nmatching `label` now appear, which is the documented behaviour.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/testing",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**",
    "body": "**Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**\n\nUntil now the only sanctioned way to restyle a dzup-ui component was a design\ntoken or the `class` on its root. Anything else — a spinner inside a button, the\nerror message under an input, a dialog's backdrop, a select's portaled listbox —\nwas reachable only by writing a descendant selector against class names that\n`tailwind-variants` generates and is free to change. Those selectors worked\nuntil they didn't, and nothing told anyone when they stopped.\n\nADR-19 (`docs/adr/ADR-19-public-styling-contract.md`) makes that surface\nexplicit. This release lands the machinery and the first five components.\n\n**New in `@dzup-ui/contracts`**\n\n- `ComponentAnatomy` — a component's declared parts, states, component tokens,\n  recipe axes and risk tier.\n- `ANATOMY_PART_VOCABULARY` — the shared part names, so `content` means the same\n  thing on a dialog and on a popover.\n- `AnatomyPart<A>` and `UiOverrides<A>` — derived types that make a part name a\n  compile error rather than a class that lands nowhere.\n\n**New in `@dzup-ui/testing`**\n\n- `expectAnatomy(wrapper, anatomy)` — asserts the rendered DOM emits every\n  declared part exactly once (or is declared optional) and no undeclared one.\n  Runner-independent, and it takes the anatomy structurally, so the package\n  needs no dependency on `@dzup-ui/contracts`.\n\n**New in `@dzup-ui/core`: `data-part` and `ui` on five components**\n\n| Component | Parts you can now address |\n|---|---|\n| `DzButton` | `root`, `spinner` |\n| `DzInput` | `root`, `control`, `input`, `prefix`, `suffix`, `spinner`, `clear`, `error` |\n| `DzSelect` | `root`, `trigger`, `icon`, `content`, `viewport`, `input`, `item`, `item-indicator`, `item-label`, `empty`, `error` |\n| `DzDialogContent` | `overlay`, `content`, `header`, `viewport`, `footer` |\n| `DzTable` (family) | `root`, `content`, `title`, `header`, `body`, `row`, `cell`, `footer` |\n\n```vue\n<!-- before: a selector against a generated class, and a prayer -->\n<style>.my-form .inline-flex > svg { height: 24px !important; }</style>\n\n<!-- after -->\n<DzButton loading :ui=\"{ spinner: 'h-6 w-6' }\">Save</DzButton>\n<DzSelect :items=\"items\" :ui=\"{ content: 'max-h-40', item: 'py-3' }\" />\n<DzDialogContent :ui=\"{ overlay: 'backdrop-blur-sm' }\" />\n```\n\nOverrides merge through `cn()` (clsx + tailwind-merge), so a conflicting utility\nreplaces the component's own rather than fighting it. **No `!important` is\nneeded, and Playwright asserts that in a real browser** rather than the docs\nasserting it in prose.\n\n**`DzDialog` declares `parts: 'none'`** — it wraps Reka's `DialogRoot`, which is\na provider and renders no element. That is an answer, not an omission: the\ndialog's surface is declared on `DzDialogContent`, where the nodes are.\n\n**Nothing is removed, and every existing override keeps working.**\n\n- `class` lands exactly where it always did — the button root, the input's\n  visual field, the select trigger, the dialog panel, the table's scroll\n  container. `ui.root` is the new way to reach an outer node.\n- `data-dz-dialog-overlay`, `data-dz-search-input` and `data-dz-no-results` are\n  still emitted, now alongside `data-part` (dual-emit for one minor series;\n  removing them needs a major).\n- `DzDialogContent`'s `overlayClass` still applies. It is deprecated in favour\n  of `:ui=\"{ overlay: … }\"`; both work, and `ui` takes precedence.\n\n**Two things this release deliberately does not claim**\n\n`DzSelect` and `DzTable` declare `componentTokens: []`, because they own no\n`--dz-select-*` or `--dz-table-*` custom property — they style from global\nsemantic tokens. Declaring invented names would have documented override points\nthat do not exist. Per-instance restyling of those two goes through `ui`.\n\n`DzButton` mirrors `data-tone` but not `data-variant` or `data-size`, though it\ndeclares all three recipe axes. Its contract spec asserts that gap rather than\nhiding it, so closing it is a visible change rather than a silent one.\n\n**138 of 143 public components have not declared an anatomy yet.**\n`yarn validate:ownership` reports the number against a ceiling that only\nratchets down, and the Storybook docs say plainly, per component, when a\ncomponent has not declared one.",
    "breaking": false,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**Every user-visible string the library renders is now translatable from one place.**",
    "body": "**Every user-visible string the library renders is now translatable from one place.**\n\nBefore this release, `@dzup-ui/core` shipped **54 static `aria-label` values\nacross 27 components that no application could change at all** — not with a\nprop, not with a provider. An Arabic application shipped `aria-label=\"Clear\ninput\"` and had no way to do otherwise. A further **39 literal defaults on\n`*Text`/`*Label`/`*Placeholder` props across 24 components** could only be\nchanged one instance at a time, which is repetition rather than localisation.\n\nAll of them now resolve through one catalog:\n\n```vue\n<DzProvider\n  locale=\"fr-FR\"\n  :messages=\"{\n    DzInput: { clear: 'Effacer le champ' },\n    DzSelect: { noResults: 'Aucun résultat' },\n  }\"\n>\n  <App />\n</DzProvider>\n```\n\n**Nothing changes until you supply a catalog.** Every value in the shipped\nEnglish catalog is byte-identical to the literal it replaced — including one\ninconsistency that was deliberately *not* tidied: `DzCascader` uses `Search…`\n(U+2026) where `DzSelect` and `DzListbox` use `Search...`. Normalising them\nwould be a visible change to three components smuggled in under a refactor.\n\nOverrides apply **per key**, so translating `DzTimePicker.confirm` keeps the\nother ten strings that component renders.\n\n**New in `@dzup-ui/contracts`: `DzMessageCatalog`**, an empty interface that each\ntier augments from its own package:\n\n```ts\ndeclare module '@dzup-ui/contracts' {\n  interface DzMessageCatalog {\n    DzChart: { noData: string }\n  }\n}\n```\n\nCore contributes its ~38 components this way, which makes the extension\nmechanism ADR-20 §9 requires of Pro **the same one Core itself uses** rather\nthan a second-class hook. It also augments a package Pro already depends on:\nPro depends inward on Core *contracts* and must never import Core's runtime.\n\n**All `Intl` construction is cached, and one case was pathological.**\n`DzAnimatedNumber.tween.ts` built its `Intl.NumberFormat` *inside* the function\na running tween calls **once per frame** — and ECMA-402 requires locale data to\nbe resolved on construction. Formatting 1,000 rows now constructs at most one\nformatter per (locale, options) pair, which is asserted rather than claimed. The\ncache moved to a module that imports nothing, so the framework-free tween\nhelpers can reach it.\n\n**One behaviour change, and it fixes a hydration bug.** `DzAnimatedNumber`,\n`DzTimePicker` and `useRelativeTime` used to format with `Intl`'s *ambient*\nlocale when given no explicit one. That is not the same value on a Node server\nas in a visitor's browser, so a server-rendered figure or a \"2 minutes ago\"\ncould hydrate into a different language or a different group separator — a\nmismatch invisible to anyone developing in the locale their server runs in. They\nnow use the application's declared locale, falling back to `en-US`.\n\nThe pure exported helpers `formatNumber`, `formatRelativeTime` and\n`formatAbsoluteTime` keep their signatures **and** their semantics: an omitted\n`locale` still means the runtime's own. Only the composable and the components\nchanged.\n\n**New gate: `yarn validate:hardcoded-strings`.** Fails on a static `aria-label`\nin a template or a literal default on a user-visible prop. It reads the\n`<template>` block only, so JSDoc `@example` strings — 11 of them, which the\nfirst inventory pass wrongly swept up — are not flagged. A line may be exempted\nwith a `hardcoded-string-ok: <reason>` comment, and the reason lives next to the\nstring rather than in a list somewhere else.\n\n**New in Storybook: a Pseudo-locale toolbar.** Renders every string accented,\npadded +30% and framed in `[!!! … !!!]`, across every story rather than a chosen\nfew. Un-accented text is a string the catalog does not reach; a missing `!!!]`\nis a label that clipped. The pseudo catalog is generated from the English one,\nso a message added tomorrow is covered today.\n\n**Known gap, stated rather than fixed:** `DzOrderList`'s `dragHandleLabel` is\ndocumented as \"accessible label for each row's drag handle\" and **nothing\nrenders it** — the handle is `aria-hidden=\"true\"`. Its literal stays, with the\nreason in the source. Giving that handle an accessible name is an accessibility\ndecision, not a codemod.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/nuxt",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`@dzup-ui/nuxt` pushed a stylesheet path the tokens package does not export, so every consumer install failed.**",
    "body": "**`@dzup-ui/nuxt` pushed a stylesheet path the tokens package does not export, so every consumer install failed.**\n\nThe module added `@dzup-ui/tokens/dist/tokens.css` to `nuxt.options.css`. That\ndeep path is not in the tokens package's `exports` map — the declared specifier\nis `@dzup-ui/tokens/css` — so a real install died at build time with:\n\n```\nMissing \"./dist/tokens.css\" specifier in \"@dzup-ui/tokens\" package\n```\n\nIt resolved in this repository only because the workspace's `node_modules` are\nsymlinks into the source tree, which is precisely the class of defect a\nworkspace-alias test cannot see. It was found by installing the packed tarball\ninto a Nuxt app.\n\nAlso in this release:\n\n- **Registration comes from generated ownership data.** The module carried a\n  second handwritten Pro list beside the resolver's, and the two had drifted\n  from each other and from both packages: it classified the Core components\n  `DzAppShell` and `DzCalendar` as Pro, and named Pro components\n  (`DzScheduler`, `DzComment`, `DzVirtualTable`) that Pro does not export. Both\n  lists are gone; the module reads `@dzup-ui/core/ownership`.\n- **`includePro: true` with Pro absent now explains itself.** The build no\n  longer fails on an unresolvable import — it logs which package is missing,\n  which option asked for it, and the command that installs it, then continues\n  with Core.\n- **`prefix` stops mangling un-prefixed names.** The old rule was\n  `name.slice(2)` unconditionally, which turned `TeamMemberBadge` into\n  `AcmeamMemberBadge`. Names without the `Dz` prefix are now registered\n  unchanged.\n- **`@dzup-ui/core` gains an `./ownership` subpath** exposing the generated\n  ownership table, so integrations can read component ownership without\n  importing the component library.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`DzProvider`: one component configures theme, locale, direction, messages, formats, portals, motion, component defaults, CSP nonce and test ids.**",
    "body": "**`DzProvider`: one component configures theme, locale, direction, messages, formats, portals, motion, component defaults, CSP nonce and test ids.**\n\nThe previous release shipped the *read* half of ADR-20 — ten composables with\ntyped defaults that nothing could write to. This is the writer.\n\n```vue\n<DzProvider\n  :theme=\"{ default: 'system', persist: true }\"\n  locale=\"ar-EG\"\n  direction=\"auto\"\n  :messages=\"{ DzPagination: { next: 'التالي' } }\"\n  :formats=\"{ currency: 'EGP' }\"\n  portal=\"#dz-portal\"\n  motion=\"system\"\n  :defaults=\"{ DzButton: { size: 'sm' } }\"\n  :nonce=\"cspNonce\"\n  test-id-prefix=\"e2e\"\n>\n  <App />\n</DzProvider>\n```\n\n**A prop it does not set, it does not provide.** This is the rule that makes\nnesting composable rather than destructive. An inner provider naming only the\nlocale leaves the theme, the portal target and the defaults exactly as the outer\none left them — nothing silently resets to a default because a child forgot to\nrestate it. `messages` is the single exception and deep-merges, so changing one\nstring does not mean restating the catalog.\n\n**It renders no element.** Its anatomy declares `parts: 'none'`, so it can sit\nbetween a flex container and its children, or inside a shadow root, without\nchanging anything. The consequence is documented rather than hidden: only the\n**root** provider reflects `dir` onto `<html>`. A nested provider changes what\n`useDzDirection()` answers for its subtree and writes no attribute, because it\nhas no element to write it on — scope a subtree with your own `<div :dir=\"…\">`.\n\n**`DzThemeProvider` is unchanged**, and is now a thin wrapper over `DzProvider`\nwith theme props only. Same four props, same ADR-09 context, same ADR-15\npersistence and `data-theme` reflection; its test suite passes untouched, which\nis the evidence. Mounting one inside the other is safe — `DzProvider` takes\nownership of the theme only when asked to, or when nothing above it already has.\n\n**`getThemeScript` now writes `dir` as well as `data-theme`.**\n\n```ts\ngetThemeScript({ locale: 'ar-EG' })   // also sets dir=\"rtl\" before first paint\n```\n\nDirection is resolved where the string is generated rather than at runtime: it\ncomes from the application's own configuration, not from `localStorage`, so\nbaking it in keeps the inline script small and keeps the RTL subtag list in one\nplace. With no `locale` or `direction` given the emitted script is byte-identical\nto before, so a host that has declared neither gets no opinion imposed on its\nmarkup.\n\n**`DzButton` is the first component to honour a provider default.** Precedence is\nfixed by ADR-20 §6 and is the same for every component that follows: **explicit\nprop → compound context (`DzButtonGroup`) → provider → the component's own\ndefault.** With no provider mounted, every one of those lines resolves exactly as\nit did before. Which components honour which axes is declared, not promised:\n`DzButton.anatomy.ts` lists `globalDefaults: ['size', 'variant', 'tone']`.\n\n**Also in this release**\n\n- The CSP nonce now reaches the transition-suppression `<style>` the theme\n  injects on a switch. Without it a strict policy drops the tag silently, and the\n  symptom is a colour sweep on theme change that nobody can reproduce locally.\n- `useDzTestIds().testId()` honours an optional `prefix`, so one page embedding\n  two instances of an application can namespace each without every component\n  learning about namespaces. `DzTestIds.prefix` is optional, so\n  `DZ_PROVIDER_DEFAULTS.testIds` is unchanged.\n- New in `@dzup-ui/contracts`: `DzFormatDefaults` — the `Intl` option defaults a\n  host declares (`{ currency: 'EGP' }`), as distinct from the formatters a\n  component asks for. A caller's own options always win.\n- `DzProvider` and `DzThemeProvider` both declare an anatomy, and\n  `validate:contract-parity` now looks inside `packages/core/src/providers`. It\n  never did, which is why `DzThemeProvider` — a public component two story files\n  import — had no contract spec. Both have one now.\n\n**Nothing existing breaks.** No component's default changed, nothing is\ndeprecated, and every concern still resolves without a provider mounted.",
    "breaking": false,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Every overlay now teleports where your application says, including the four that never asked.**",
    "body": "**Every overlay now teleports where your application says, including the four that never asked.**\n\nNineteen components portal part of themselves out of the DOM — dialogs, sheets,\npopovers, tooltips, menus, select and combobox panels, the command palette, the\nlightbox, the tour, the sidebar's mobile overlay and the blocking layer. Each one\ndecided its own destination. Fifteen took a `portalTo` prop you had to pass to\nevery instance; **four teleported to a hard-coded `body` with no way to redirect\nthem at all**: `DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour`.\n\nNow they all follow one rule:\n\n```\ninstance `portalTo`  →  DzProvider `portal`  →  document.body\n```\n\n```vue\n<DzProvider portal=\"#app-overlays\">\n  <App />\n</DzProvider>\n```\n\n**Nothing changes without a provider.** With no `portal` set and no `portalTo`\nprop, every component teleports exactly where it did before — which is what let\nnineteen components migrate in one change instead of nineteen.\n\n**This closes the shadow-DOM limitation the Styling Cookbook documented twice as\nunsolvable.** Custom properties inherit through a shadow boundary and\nstylesheets do not, so an overlay that escaped to `document.body` lost the\nadopted sheet and rendered unstyled. Point `portal` at a container inside the\nroot and it stays within the boundary:\n\n```vue\n<DzProvider :portal=\"shadowOverlayContainer\">\n  <App />\n</DzProvider>\n```\n\n**New:** `portalTo` on `DzBlockUI`, `DzSidebar`, `DzPopconfirm` and `DzTour`, so\nthe per-instance escape hatch is uniform across all nineteen.\n\n`portalDisabled` and `portalDefer` are unchanged and stay per-instance — they\nare about whether *this* overlay teleports, not about where overlays go.\n\nNew guide: **Portals & Embedding**, covering the shadow-root recipe (both halves\n— adopted stylesheets *and* the portal container), the end-to-end testing recipe\n(`portal` plus `test-id-prefix`), and the CSP nonce note.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core",
      "@dzup-ui/nuxt"
    ],
    "level": "patch",
    "summary": "**The Pro package is `@dzup-ui-pro/pro`. The resolver and the Nuxt module named a package that has never existed.**",
    "body": "**The Pro package is `@dzup-ui-pro/pro`. The resolver and the Nuxt module named a package that has never existed.**\n\n`DzResolver({ includePro: true })` emitted `from: '@dzup-ui/pro'`, and\n`@dzup-ui/nuxt` transpiled and registered components from the same string. No\nsuch package is published under any plan — the commercial tier is\n`@dzup-ui-pro/pro` — so every consumer who followed the documented `includePro`\npath got an unresolvable import for the one feature the option exists to enable.\n\nThe reason it survived is the part worth recording: `resolver.spec.ts` asserted\nthe *same wrong name* at all three of its Pro sites. The suite was green, the\nfeature was broken, and the gate certified it. A green test that copies the\nimplementation's mistake is not evidence.\n\nWhat changed:\n\n- The resolver emits `@dzup-ui-pro/pro` for Pro components. Its two package\n  names are module-local constants, and the spec states the two real names\n  independently rather than importing them — asserting an implementation\n  against its own constant is what hid this defect.\n- `@dzup-ui/nuxt` transpiles and registers Pro components from `@dzup-ui-pro/pro`.\n  The `includePro` option name is unchanged.\n- `@dzup-ui/codemods`' `rename-imports` now rewrites `dzup-ui/pro` and\n  `@dzup-ui/pro-components` to `@dzup-ui-pro/pro`, so a migrated codebase no\n  longer lands on the dead name.\n- A new repository gate, `yarn validate:package-names`, fails if a retired\n  package name reappears outside changelogs, changesets, ADRs, and audit\n  records. It is in `yarn validate:all`.\n\nThis is a patch: the previous behaviour could not work for anybody. If you set\n`includePro: true` against a local `@dzup-ui/pro` alias, repoint it at\n`@dzup-ui-pro/pro`.\n\n`includePro: true` still requires the Pro package to be installed, and Pro is\nnot published yet — the option remains `false` by default.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`DzResolver` resolves by exact name from generated ownership data. Unknown names no longer resolve to Core.**",
    "body": "**`DzResolver` resolves by exact name from generated ownership data. Unknown names no longer resolve to Core.**\n\nThe resolver classified components with `name.startsWith('Dz')` and a\nhand-maintained prefix list. A prefix cannot separate two packages that both use\n`Dz`, and the list had drifted in both directions:\n\n- `DzAppShell` and `DzCalendar` are **Core** components, and the list sent them\n  to Pro. Pro exports no `DzAppShell` at all.\n- The list named `DzScheduler`, `DzComment`, `DzVirtualTable`, `DzWorkflow` and\n  `DzReactionPicker` as Pro. Pro exports none of them under those names.\n- Everything else starting with `Dz` fell through to Core, so a typo\n  (`DzButtonn`) resolved to an import of a component that does not exist, and\n  the error surfaced as a bundler resolution failure rather than as a typo.\n\nOwnership now comes from `packages/core/src/generated/component-ownership.ts`,\nwritten by `yarn generate:ownership` from the ownership manifests and\nfreshness-checked by `yarn validate:ownership`. The resolver is a lookup:\n\n- **Unknown name → `undefined`.** unplugin-vue-components reads that as \"not\n  mine\" and leaves the name alone, which is the correct answer for a typo, for\n  your own component, and for a Pro component in a project without Pro.\n- **Only mountable symbols resolve.** `DzButtonProps` (a type), `useTheme` (a\n  composable), `buttonVariants` (a recipe) and `DZ_TABS_KEY` are public exports\n  but are not components, and the resolver no longer offers to import them as\n  one.\n- **Compound parts resolve to their parent's package**, by data rather than by\n  sharing a prefix.\n\n**New: `prefix`.** `DzResolver({ prefix: 'X' })` lets templates write\n`<XButton>`; the emitted import still names the real export (`DzButton`) from\nthe package that owns it. It renames the tag, never the ownership, and it does\nnot keep the `Dz` tag as an alias.\n\n**Minor, not patch** — an unknown `Dz*` name that used to resolve to Core now\nresolves to nothing. If you relied on that fallthrough, the name was either a\ntypo or a component this library does not export.\n\n`includePro: true` still resolves nothing today: no Pro ownership manifest is\npublished yet, so the generated table covers the Core tier only. The resolver\nnow says so once, at construction, naming the environment variable that fixes\nit — instead of silently resolving Pro names to a package nobody can install.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**All seven selection controls can now be driven by a remote option source through one contract, `DzFileUpload` can hold file references instead of binaries, and ten value codecs define the seam a form renderer binds through.**",
    "body": "**All seven selection controls can now be driven by a remote option source through one contract, `DzFileUpload` can hold file references instead of binaries, and ten value codecs define the seam a form renderer binds through.**\n\n`TASK-FORM-OSS-03`. Clause references are to\n`docs/program-2026-08/form-control-renderer-contract.md`.\n\n**One async-options seam, not seven** (C9). `DzSelect`, `DzMultiSelect`,\n`DzCombobox`, `DzListbox`, `DzCascader`, `DzTreeSelect` and `DzTransfer` each\ntook a static array and had nowhere to say \"loading\", \"that failed\", or \"there\nis nothing to show\" — so a renderer whose options come from a data source had to\ngrow one adapter per control.\n\nThey now share `AsyncOptionsProps` (`optionsState`, `optionsError`,\n`optionsRetryable`), `AsyncOptionsEmits` (`loadOptions`, `retryOptions`), one\n`useAsyncOptions` composable, and one `options-state` slot. Five states rather\nthan a boolean `loading`, because a failed load and a successful one that\nreturned nothing are not the same thing and a boolean cannot tell you which\nhappened.\n\n**Core never performs the request.** No URL, no credential, no `fetch`. The\ncontrol emits `loadOptions` with a query, a reason, and an `AbortSignal`, and\nthe host owns execution, fencing and caching (form spec 04 §5, spec 06). Every\nrequest supersedes the last and aborts its signal *before* emitting, so a host\nthat fences on the signal never has two in flight. All of this is inert unless\n`optionsState` is passed: a control with a plain array behaves exactly as it did.\n\n**`DzFileUpload` gains `model-mode=\"ref\"`** (C1). The default stays `File[]`.\nIn reference mode `v-model` holds `DzFileRef[]` — `{ id, name, size, type,\nstatus, error? }`, all JSON — and the binary reaches the host through\n`uploadRequest` instead. A form document is persisted JSON, so a `File` in the\nmodel is lost on reload and leaks a live handle into a builder preview.\nRemoving a row that is still uploading aborts it.\n\nThis one widens a type: `v-model` is `File[] | DzFileRef[]`, so a consumer who\nannotated their ref as `File[]` widens it to `DzFileUploadValue`. Runtime\nbehaviour in the default mode is unchanged.\n\n**Ten value codecs**, in `@dzup-ui/contracts`: `emptyValueFor`, `isEmptyValue`,\n`toNumberValue`, `toIsoDate`/`fromIsoDate`, `toIsoTime`/`fromIsoTime`,\n`toFileRef`, `isFileRef`, `isJsonSerializable`. Pure — no Vue, no DOM, no clock,\nno locale — so they run on a server, in a test, and inside a builder preview.\n\nTwo of them are worth reading before use. `isEmptyValue(false)` is **false**:\nan unchecked box has answered, and conflating that with absence is how a\nmandatory checkbox comes to be satisfied by never being touched.\n`toIsoDate` takes date *parts*, not a `Date`: `new Date('2026-08-24')` is\nmidnight UTC and formats as the 23rd in any negative offset.\n\n**Where the codecs live, and why.** In `@dzup-ui/contracts`, which is types-only\nwith a stated exception for `assertNever` — these are the same kind of thing.\nThey also could not go in `@dzup-ui/core`: its public surface is generated from\n`public-api.manifest.json`, the ownership schema has no `utility` kind, and the\n`unclassified` ceiling of 29 only ratchets down. Ten more functions of the class\n`cn` and `themeScript` already occupy would have taken it to 39. Raising that is\na maintainer decision, so the ledger asks for it rather than taking it.\n\n**Events are camelCase.** `loadOptions`, `retryOptions`, `uploadRequest` — the\nrepository lints custom event names and had no kebab-cased ones before these.\nNothing changes for a consumer: `@load-options=\"…\"` in a template still resolves.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**Every text input now reflects `readonly` in the DOM, `DzOtpInput` finally does something with `required`, `DzInputGroup` honours the three ARIA props it was ignoring, `DzInputMask` can hold the unmasked value, and `DzNumberInput` stops announcing `0` for a field the user cleared.**",
    "body": "**Every text input now reflects `readonly` in the DOM, `DzOtpInput` finally does something with `required`, `DzInputGroup` honours the three ARIA props it was ignoring, `DzInputMask` can hold the unmasked value, and `DzNumberInput` stops announcing `0` for a field the user cleared.**\n\nThe first slice of `TASK-FORM-OSS-02`, closing the `inputs/` gaps that\n`docs/program-2026-08/form-controls-readiness-matrix.md` reports. Clause\nreferences are to\n`docs/program-2026-08/form-control-renderer-contract.md`.\n\n**`data-readonly` on five controls** (C3). `DzTextarea`, `DzSearchInput`,\n`DzPasswordInput`, `DzNumberInput` and `DzInputMask` all pass `readonly` to the\nnative element and none of them said so on the root, so no stylesheet and no\ntest could distinguish a read-only field from an editable one. `DzInput` has\nalways emitted it; the other five now match. Presence-only, absent when false,\nper ADR-19 §4.\n\n**`DzOtpInput` implements `required`** (C3). The prop was declared, defaulted to\n`false`, and read nowhere — the type told a consumer it worked. It now resolves\nagainst `DzFormField` the way the other states do and emits `data-required` plus\n`aria-required`.\n\n**`DzInputGroup` honours `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`**\n(C2). All three are inherited from `BaseAccessibilityProps` and all three were\ndropped on the floor. While wiring them: binding `:aria-invalid=\"ariaInvalid\"`\ndirectly emits `aria-invalid=\"false\"` on every group, because an unset prop in\nthat position renders as the string. It is `ariaInvalid || undefined`, and a\ncontract assertion holds the line.\n\n**`DzInputMask` gains `modelMode`** (C1), defaulting to `'masked'` — today's\nbehaviour, byte for byte. `model-mode=\"unmasked\"` puts the stripped value in\n`v-model` instead, which is what a form document should persist: with the\ndefault, changing a mask from `\"(999) 999-9999\"` to `\"999-999-9999\"` leaves\nevery stored value formatted for a mask that no longer exists.\n`update:unmasked` has always emitted the raw value, but a consumer binding\n`v-model` generically — a schema-driven renderer, for instance — has no way to\nreach a one-way emit. The displayed value is derived, not stored, so the field\nrenders correctly on the server in both modes.\n\n**`DzNumberInput.change` carries `number | undefined`** (C1). Clearing the field\nsets the model to `undefined` and used to announce `0` — indistinguishable from\nthe user typing zero, and only the event was wrong. The event now carries what\nthe model holds.\n\n**This one is a behaviour change**: a handler typed `(value: number) => void`\nmust widen to `number | undefined`, and code that treated the cleared field as\n`0` will now see `undefined`. That is the point — `0` is a legitimate value and\nnothing downstream could tell the two apart.\n\n**Tests.** A new `packages/core/tests/ssr/form-controls-ssr.spec.ts` renders\nevery input *with a value* and checks the server output contains it — the audit\nfound 26 of 39 controls with no SSR spec at all, and \"renders without throwing\"\ndoes not catch a field that hydrates into a different value. Contract specs\ngained the clause assertions for each fix, and\n`forms/aria-invalid-casting.spec.ts` pins the `??` resolution chain that every\ncontrol shares.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core",
      "@dzup-ui/testing"
    ],
    "level": "minor",
    "summary": "**Components lay out, navigate and point the right way in a right-to-left document — and say so in a form something can check.**",
    "body": "**Components lay out, navigate and point the right way in a right-to-left document — and say so in a form something can check.**\n\n`DzProvider` has resolved `dir` since the previous release. What it could not fix\nis CSS: **55 lines across 26 variants files used physical `left`/`right`\nutilities**, so an Arabic application got a mirrored document with borders,\npadding and text alignment still pinned to the physical left. They are logical\nnow — `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`, `rounded-s`, `text-start`.\n\n**`DzTable` is the clearest case:** its header and body cells were `text-left`,\nso every cell in an Arabic table aligned against the wrong edge while the table\nitself mirrored.\n\n**Tab keyboard navigation followed the keycap, not the reading order.** APG's\ntabs pattern is written as *previous* and *next*; `useTabs` hard-coded\nArrowRight as next. In Arabic the next tab is to the **left**, so a user\npressing the key that points at the next tab got the previous one. The\nhorizontal keys now follow the direction. The vertical keys deliberately do not:\n`dir` is about the inline axis, and ArrowUp is ArrowUp in every language.\n\n**New: an `rtl` field on component anatomy** (`@dzup-ui/contracts`), with three\naxes because they fail independently:\n\n```ts\nrtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] }\n```\n\n- `mirrors` — `layout` or a deliberate `none`\n- `keyboard` — whether ArrowLeft/ArrowRight exchange meaning\n- `icons` — parts whose icon carries direction and mirrors with the layout\n\n**New: `yarn validate:rtl`.** A component declaring `mirrors: 'layout'` may not\nuse a physical utility in its variants. Genuinely physical cases say so in the\nfile with a `rtl-physical-ok` comment and a reason — source code (a gutter that\nstays left because code reads left-to-right), `align=\"left\"` on `DzHeading` and\n`DzText` (an author naming a side, not asking for the start edge), and\n`DzSheet`'s `side` (whether a sheet mirrors is a product decision, recorded\nrather than taken).\n\n**New: `packages/core/docs/rtl-matrix.md`**, generated from the declarations by\n`yarn generate:rtl-matrix` so the table cannot drift from them.\n\n**New in `@dzup-ui/testing`:** `expectRtl`, `checkRtl`, `expectRtlComputed` and\n`forwardArrow`. `expectRtlComputed` **throws under jsdom rather than passing** —\njsdom does no layout, so it cannot resolve a class-driven `margin-inline-start`,\nand a test that cannot check its claim should say so instead of going green.\n\n**New in Storybook: a Direction toolbar** that renders every story right-to-left\nunder an Arabic locale, alongside the pseudo-locale toggle.\n\n**Coverage, stated plainly:** 7 components declare an RTL contract, because the\nfield lives in the anatomy and only 7 declare an anatomy. The logical-property\nmigration covered the whole catalog regardless. The two rollouts are the same\nrollout.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "Evidence by risk tier: every public component now says what it owes, and one page says what it has (TASK-OSS-P5-01…06).",
    "body": "Evidence by risk tier: every public component now says what it owes, and one page says what it has (TASK-OSS-P5-01…06).\n\n**`@dzup-ui/contracts`** gains `quality-tiers`: the tier→evidence rules, the WCAG\n2.2 catalog a component library can actually fail, the APG pattern vocabulary,\nand `SecurityBoundary` — a second axis so a `DzButton` with an `href` owes a URL\npolicy without owing a data grid's performance baseline.\n\n**`RiskTier` was inverted and is now corrected.** TASK-OSS-P3-02 introduced the\nfield with `A` as the highest risk and `D` as structural layout, which is the\nopposite of the 2026-08-11 reassessment it was implementing and of every P5\npacket that consumes it. The scale is now ascending — `A` presentational, `B`\ninteractive primitive, `C` composite, `D` security or data boundary — and the\neight declarations written against the old reading were migrated. Read any\n`riskTier` predating this change as the mirror of the current scale.\n\n**`DzFileUpload` now enforces `accept` and `multiple` on the drop path.**\n`:accept` and `:multiple` on `<input type=\"file\">` constrain the operating\nsystem's picker and have no effect on a drop — `DataTransfer.files` arrives\nunfiltered. A control rendering \"Accepted: image/\\*\" beneath its drop zone would\ntake a dropped `.exe` into `v-model` and emit `upload` with no `error` event.\nBoth are now checked in `processFiles`, where the picker and the drop zone meet.\nAn application relying on the old behaviour will start receiving `error` events\nit previously did not.\n\nAlso adds: a component anatomy for `DzFileUpload`, its threat model and\nhostile-input corpus under `packages/core/security/`, and its SSR sample.",
    "breaking": false,
    "deprecated": false
  }
]

export const HIGHLIGHTS: Highlight[] = [
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "breaking",
    "section": "@dzup-ui/core",
    "text": "**`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**"
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "breaking",
    "section": "@dzup-ui/contracts, @dzup-ui/core",
    "text": "**An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**"
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "deprecated",
    "section": "@dzup-ui/contracts, @dzup-ui/testing, @dzup-ui/core",
    "text": "**Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**"
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "deprecated",
    "section": "@dzup-ui/contracts, @dzup-ui/core",
    "text": "**`DzProvider`: one component configures theme, locale, direction, messages, formats, portals, motion, component defaults, CSP nonce and test ids.**"
  },
  {
    "source": "package",
    "date": "@dzup-ui/core@0.1.0 (2026-05-03)",
    "kind": "deprecated",
    "section": "Minor Changes",
    "text": "--dz-sidebar-text and --dz-sidebar-text-hover are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major."
  }
]
