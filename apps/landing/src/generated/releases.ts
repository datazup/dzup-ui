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
      "@dzup-ui/landing"
    ],
    "level": "minor",
    "summary": "Ship the **Blocks** ecosystem surface in the landing app (`apps/landing`).",
    "body": "Ship the **Blocks** ecosystem surface in the landing app (`apps/landing`).\n\nThis activates the previously \"Planned\" Blocks tile into a live `/blocks` catalog:\n\n- **Display infrastructure (Phase A):** new `/blocks` route + `BlocksIndexPage`, a typed\n  block registry (`src/blocks/registry.ts`) that pairs each block's lazily-loaded component\n  with its exact `?raw` source (zero preview/code drift), the `BlockPreview` shell\n  (Preview/Code tabs, viewport resizer, copy), `BlockCard` + `BlockCategoryNav`, \"Built from\"\n  component chips, and per-route SEO/meta. The Ecosystem tile is now `status: 'available'`\n  linking to `/blocks`, with matching nav + footer links.\n- **Quality gates (Phase C):** a Vitest registry guard (`registry.spec.ts`) that fails loudly\n  if a block advertises a `@dzup-ui/core` component that does not exist, plus the a11y /\n  responsive / reduced-motion audit.\n- **Catalog (Phase B, in progress):** one reference block live — `hero-centered` (Marketing) —\n  composed purely from free `@dzup-ui/core` components and `--dz-*` tokens, validating the\n  end-to-end pipeline. The remaining MVP and full catalog blocks are fast-follows.\n\nNo published `@dzup-ui/*` library package changes — this is a private app and is versioned for\nchangelog purposes only (it is never published to npm).",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "Fix `DzCodeBlock`'s language chip failing WCAG AA.",
    "body": "Fix `DzCodeBlock`'s language chip failing WCAG AA.\n\nThe chip (`bash`, `vue`, …) inherited the header's `--dz-muted-foreground` and sat\non a 10%-opacity `--dz-foreground` fill, measuring **3.64:1** — below the 4.5:1\nrequired for text. It carries real information, so it now takes the full\n`--dz-foreground` colour, and the pair passes.\n\nFound with an axe pass over the landing hero, which renders two code blocks above\nthe fold. `yarn validate:tokens` does not catch this: the `intent-text-contrast`\ngate is scoped to `--dz-{intent}` text on `{intent}-muted` fills, and this pair is\nneither.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "Fix `DzDropdownMenu`'s `defaultOpen` prop, which was declared but had no effect.",
    "body": "Fix `DzDropdownMenu`'s `defaultOpen` prop, which was declared but had no effect.\n\nTwo defects, both required for an uncontrolled menu to open on mount:\n\n- `defaultOpen` was never forwarded to Reka's `DropdownMenuRoot`.\n- `defineModel<boolean | undefined>('open')` declared `open` as a **Boolean** prop\n  with no default, so Vue boolean-cast the unbound value to `false`. Reka read that\n  as \"controlled, and closed\", which pinned the menu shut and made `defaultOpen`\n  unreachable even once forwarded. The model now declares `default: undefined`, so\n  `open` stays undefined until a consumer binds `v-model:open`.\n\nClick-to-open was unaffected (the local `defineModel` fed the new value back), so\nthis only changes menus that relied on `defaultOpen`, which previously could not\nopen at all. `DzDropdownMenuProps` doc comments were also corrected — `modal` was\ndescribed as \"controlled open state\".",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "Add `DzEmoji` — an accessible emoji primitive in the **media** family.",
    "body": "Add `DzEmoji` — an accessible emoji primitive in the **media** family.\n\nRenders an emoji glyph with a consistent type-scale (`xs`–`xl`) and correct\nscreen-reader semantics: decorative by default (`aria-hidden=\"true\"`), or\nmeaningful (`role=\"img\"` + `aria-label`) when a `label` is provided. Solves the\ninconsistent announcement of raw emoji characters across assistive tech.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/mcp",
      "@dzup-ui/landing"
    ],
    "level": "minor",
    "summary": "Ship `@dzup-ui/mcp` — a free, open-source Model Context Protocol server for the dzup-ui ecosystem (Task G5).",
    "body": "Ship `@dzup-ui/mcp` — a free, open-source Model Context Protocol server for the dzup-ui ecosystem (Task G5).\n\nConnect it in Cursor, Claude Code, Windsurf or VS Code with a single `npx -y @dzup-ui/mcp` and an assistant can browse every component, block, template and design token, then fetch the **real `.vue` source** and the `shadcn add` install command on request — \"add a dzup-ui pricing block\" now resolves to actual code.\n\n- **New package `packages/mcp`** — a thin, read-only, stdio MCP server over the STATIC catalog artifacts the landing site already generates (`/r/*.json`, `/r/tokens.json`, `/storybook/llms.txt`), so there is one source of truth and zero drift. Tools: `list_components`, `get_component`, `list_blocks`, `get_block`, `list_templates`, `get_template`, `list_tokens`, `get_install_command`, `search`. Configurable origin via `DZUP_UI_REGISTRY_URL` (defaults to the public site; accepts a local checkout for dev). Ships parser/registry unit tests plus an end-to-end JSON-RPC smoke test, and a `server.json` manifest for the public MCP registry.\n- **Landing `/ai` page** — \"Use dzup-ui with your AI IDE\": copy-paste MCP configs per client, the tool list and example prompts, wired into the top nav. New `dzupMcpConfig()` / `dzupMcpVscodeConfig()` / `dzupMcpClaudeCliCommand()` helpers in `blocks/config.ts` keep the page's snippets in lockstep with the shipped server.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "Fix export targets that the build never emitted.",
    "body": "Fix export targets that the build never emitted.\n\n`package.json` declared `\"./styles\": \"./dist/core.css\"`, and the README told consumers to\n`@import \"@dzup-ui/core/styles\"` — but no build step ever produced a CSS file, so the import\nfailed to resolve for anyone installing the package. `src/index.ts` now side-effect-imports\n`./styles/base.css` and the Vite lib build pins the extracted asset to `dist/core.css`\n(`build.lib.cssFileName`). The JS entry itself stays CSS-free, so `./styles` remains opt-in and\nsafe to import under SSR.\n\nThe same class of bug hit every per-family subpath: `./buttons`, `./cards`, `./data`,\n`./feedback`, `./forms`, `./inputs`, `./layout`, `./media`, `./navigation`, `./overlays`,\n`./typography` and `./providers` all shipped an `index.d.ts` with no `index.js` beside it —\nRollup inlines re-export-only barrels under `preserveModules`, so no chunk was emitted and the\nsubpath resolved to nothing. Each barrel is now an explicit build entry.\n\n`yarn validate:exports` now asserts that **every** target in an `exports` map exists on disk,\nincluding plain-string and non-JS (`.css`/`.json`) targets, which it previously never walked.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/landing"
    ],
    "level": "minor",
    "summary": "Hero v2 (TASK-DS-11) and the regrouped TopNav + trust scaffold (TASK-DS-12).",
    "body": "Hero v2 (TASK-DS-11) and the regrouped TopNav + trust scaffold (TASK-DS-12).\n\n**Hero v2 — lead with the product, not the gradient.**\n\n- A compact, *live* `ShowcaseFrame` (real `@dzup-ui/core` components, no screenshot)\n  now sits above the fold, alongside a new `HeroCodePanel` — a two-step\n  \"install → import → use\" panel that reuses `PmCommandTabs` and `DzCodeBlock`.\n  At 1280×800 the page previously showed **zero** product visuals and **zero** code.\n- Full-bleed decorative layers cut from **four to one**. Measured individually\n  (Playwright, 1280×800, medians): the aurora cost ~52ms of first paint, the\n  spotlight ~48ms, the grid + grain ~4ms. The spotlight survives — cheapest of the\n  three that do real work, and the only one with no `filter` or `mix-blend-mode`.\n- The headline no longer runs through `lp-gradient-text`, and the seven-child\n  staggered `opacity: 0` entrance is gone — it promoted seven compositing layers\n  and gated the LCP element on an animation. Only the visual column animates.\n- `ShowcaseDashboard`'s two below-the-fold frames now mount through the existing\n  `useLazyMount`, a screen ahead of the scroll.\n- The hero's duplicate stat row is removed; `SocialProof` already renders it.\n- Net, interleaved A/B against the previous build on the same machine: **median LCP\n  1092ms → 948ms (−13%)**, CLS 0 → 0, compositing layers 35 → 17.\n\n**Accessibility, measured with axe (WCAG 2.x A/AA, serious + critical):**\ndesktop **11 → 6** violations, mobile **10 → 7**.\n\n- `ShowcaseFrame`'s window declared `role=\"img\"` while containing a segmented\n  control, a search input, a switch and buttons — an `axe` `nested-interactive`\n  violation and simply wrong. It is now `role=\"group\"`.\n- The hero's \"Built with\" list dimmed `--dz-foreground` to `opacity: 0.62`, which\n  measures **4.41:1**. axe never reported it: the aurora and grain layers made the\n  backdrop uncomputable, so the rule returned *incomplete* rather than *fail*.\n  Removing those layers surfaced it; it now uses `--dz-muted-foreground`. The same\n  layers were also causing a real **4.1:1** failure on the re-theme button's mode\n  pill. Nodes axe could not evaluate at all dropped from 38 to 22.\n\n**TopNav — nine flat items regrouped into five.**\n\n- `Components` and `Docs` both resolved into Storybook; they are now distinct\n  menus. `Ecosystem` duplicated its own children (Blocks / Templates / Animations /\n  Themes, three of which were its siblings) and is gone — the home-page section\n  stays. `/templates` reaches the nav for the first time.\n- Menus are Reka-backed `DzDropdownMenu`, non-modal, opening onto real anchors\n  (middle-click and open-in-new-tab work). `aria-current=\"page\"` marks the active\n  route and `aria-current=\"true\"` the group containing it. Menu items get a\n  `--dz-ring` focus ring. The mobile drawer mirrors the grouping, closes on Escape\n  with focus returned to its toggle, and closes on navigation.\n- `src/nav.ts` is the single source for both surfaces; `nav.spec.ts` gates the two\n  invariants the review found broken: ≤5 top-level entries, and no destination\n  reachable from two entries.\n\n**Trust section — shipped empty, on purpose.**\n\n`HomeTestimonials` is built from `DzCard` / `DzAvatar` / `DzText` and renders\nnothing while `TESTIMONIALS` in `config.ts` is `[]`. dzup-ui has no public users\nyet (the GitHub repo and the npm package are both unpublished — the same reason\n`useLiveStats` degrades its tiles), so there is no real quote to print and no logo\nwe have permission to show. A fabricated testimonial would be worse than none.\n`HomeTestimonials.spec.ts` asserts the list stays empty and that the section\nrenders correctly once real, permission-cleared entries are added.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core",
      "@dzup-ui/tokens"
    ],
    "level": "minor",
    "summary": "New `DzPageHero` layout component + `.dz-prose` rich-content styles.",
    "body": "New `DzPageHero` layout component + `.dz-prose` rich-content styles.\n\n**DzPageHero** — dark gradient hero band for top-level views (eyebrow,\ngradient h1, description, meta row, glass-treated actions cluster), extracted\nfrom docs-app's `DocsPageHero` so every app on the neural-indigo preset can\nshare the band. Styling keys off the new `PAGE_HERO_TOKENS`\n(`--dz-page-hero-*`) in `@dzup-ui/tokens`, with `--dz-auth-brand-*` fallbacks.\n\n**.dz-prose** — typography for rendered rich content (markdown → sanitized\nHTML), ported from docs-app's `.docs-prose` and shipped unlayered in\n`dist/core.css` via base.css.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "Fix `DzPageHero` title gradient rendering as a solid bar: use `background-image`",
    "body": "Fix `DzPageHero` title gradient rendering as a solid bar: use `background-image`\ninstead of the `background` shorthand, which reset `background-clip` to\n`border-box` and defeated `bg-clip-text` in consumer builds.",
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
    "summary": "Add a shared portal-placement contract and expose it on `DzDialogContent`,",
    "body": "Add a shared portal-placement contract and expose it on `DzDialogContent`,\n`DzConfirmDialog`, `DzSheetContent`, `DzPopoverContent`, `DzTooltipContent`,\n`DzDropdownMenuContent`, `DzContextMenuContent`, `DzSelect`, `DzMultiSelect`,\n`DzCombobox`, `DzCommandPalette`, and `DzLightbox`. Dialog content now identifies and\nsupports customizing its single owned overlay, while production portal defaults\nremain unchanged.\n\nPublish `@dzup-ui/testing` with guarded DOM test-environment support so\nconsumers can mount real Reka-backed components instead of replacing portals or\ndesign-system components with stubs.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/tokens",
      "@dzup-ui/core",
      "@dzup-ui/tooling",
      "@dzup-ui/codemods"
    ],
    "level": "minor",
    "summary": "Normalize the `warning` intent: every intent now exposes the same solid-fill state set (TASK-DS-10).",
    "body": "Normalize the `warning` intent: every intent now exposes the same solid-fill state set (TASK-DS-10).\n\n`warning` was the only intent that shipped `-solid` / `-solid-hover`, so every\nconsumer — `tv()` variants, the contrast gate, the story codemod — carried a\n`tone === 'warning'` branch, and each branch was a place to forget warning exists.\n\n**New tokens (additive; nothing was renamed or removed):**\n\n- `--dz-{intent}-solid` and `--dz-{intent}-solid-hover` for `primary`, `secondary`,\n  `success`, `danger`, `info`. These resolve to the same primitive shades as\n  `--dz-{intent}` / `--dz-{intent}-hover` (500/600 light, 400/300 dark), so **no\n  published token changed color** and the swap is a visual no-op for those five.\n- `--dz-warning-hover`, which the intent was missing entirely.\n\n`--dz-warning-solid` / `--dz-warning-solid-hover` keep their exact values. They are\nno longer a bespoke pair — they are warning's members of a uniform family.\n\n**Why warning is shaped this way, and why the fill set has two states.** Near-black\n`--dz-warning-foreground` on `--dz-warning` (shade 500) measures **3.51:1** — below\nWCAG AA. A warning button therefore fills with shade 300 (8.44:1) and hovers to 400\n(5.87:1). The ramp affords no shade between 400 and 500, so a third, darker pressed\nstep is not available at AA. The uniform fill set is `-solid` + `-solid-hover`; there\nis no `-solid-active` for any intent.\n\n**Behavior change.** `DzButton`, `DzToast` and `DzTabs` previously hovered solid\n`success` / `danger` / `info` fills with a `/90` alpha shortcut while `primary` used\nits designed `-hover` shade. All tones now hover to `--dz-{tone}-solid-hover` (the\nshade-600 step). This aligns them with `primary` and puts every hover fill under the\ncontrast gate, which the alpha shortcut escaped.\n\n**`-active` reclassified.** `--dz-{intent}-active` is documented as a pressed *surface*\ncolor, not a text-bearing fill: no component puts `{intent}-foreground` on it, and\n`--dz-warning-active` could not carry it legibly. The contrast gate no longer asserts\nthat pair (94 → 84 pairs), because it was gating a combination nothing renders.\n\n**Special cases removed:** `buildContrastPairs()` in `@dzup-ui/tooling`, the solid and\noutline compound variants across 15 `*.variants.ts` / `*.tokens.ts` files, and the\n`story-color-tokens` codemod all now loop over intents with no branch.",
    "breaking": false,
    "deprecated": false
  }
]

export const HIGHLIGHTS: Highlight[] = [
  {
    "source": "package",
    "date": "@dzup-ui/core@0.1.0 (2026-05-03)",
    "kind": "deprecated",
    "section": "Minor Changes",
    "text": "--dz-sidebar-text and --dz-sidebar-text-hover are kept as deprecated aliases that resolve to the canonical names. They will be removed in the next major."
  }
]
