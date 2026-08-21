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
    "level": "patch",
    "summary": "**`DzCommandPalette`: search the whole `label`, not just what the row happens to render.**",
    "body": "**`DzCommandPalette`: search the whole `label`, not just what the row happens to render.**\n\nThe palette documented `label` as its search key and filtered `props.items` on it — but Reka's\n`ComboboxItem` also registers each row's *rendered text* (`textValue || textContent`) with\n`ComboboxRoot` and hides any row its own filter scores zero. That second filter sat downstream\nof, and invisible to, the first, so it silently won.\n\nThe effect only shows up in the pattern `label` exists for: a consumer that puts a full search\nhaystack in `label` (ids, tags, keywords) and renders a shorter caption through the `#item`\nslot. Those rows were then filtered by the caption. On this repo's own site that made every\nblock unfindable by its id, its tags, or the `Dz*` components it is built from — all three\nindexed and weighted — while the visible title still matched, and nothing in the DOM showed why.\n\n`ComboboxRoot` now gets `ignore-filter`, leaving this component's filter the only one. Matching\nis unchanged in kind: it uses the same `Intl.Collator`-backed comparison Reka's filter used, so\nit stays case- and accent-insensitive (`resume` still finds `Résumé`).\n\nAlso removes a `:filter-function` binding that had quietly stopped doing anything — it is not a\n`ComboboxRoot` prop in Reka 2.x, so it fell through to `$attrs` and onto the listbox element.\n\nNo API change: same props, same emits, same slots. Rows that were being filtered out despite a\nmatching `label` now appear, which is the documented behaviour.",
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
