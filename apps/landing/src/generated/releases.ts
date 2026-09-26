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
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Counts pluralise by the locale's rules, the message catalog can finally be imported, and locale packs have a format and a gate.**",
    "body": "**Counts pluralise by the locale's rules, the message catalog can finally be imported, and locale packs have a format and a gate.**\n\n**Five components built their plurals by concatenation** —\n`` `${n} tag${n === 1 ? '' : 's'}` `` in `DzTagsInput`, and the same shape in\n`DzCountdown`, `DzDataView`, `DzMention` and `DzRating`. That is English's two\nforms and nobody else's: Bosnian has a `few` form, Arabic has six categories,\nFrench puts `0` in the singular. None of those strings was in the catalog either,\nso no application could translate them at all. They are now 13 catalog keys\nwritten in a documented subset of ICU MessageFormat and selected by\n`Intl.PluralRules`:\n\n```vue\n<DzProvider\n  locale=\"bs-BA\"\n  :messages=\"{ DzTagsInput: { count: '{count, plural, one {# oznaka} few {# oznake} other {# oznaka}}' } }\"\n>\n```\n\n**English output is unchanged, with two deliberate exceptions.** Numbers are\nformatted for the locale, so a count from 1,000 gains its grouping separator\n(`1,234 items`); and `DzDataView`'s paged announcement said *\"of 1 items\"* — it\nnow says *\"of 1 item\"*. A host translation that does not parse, or names an\nargument the component does not pass, renders the English default instead of\nbreaking the component, and warns once in development.\n\n**New: `useDzMessageFormat()`**, the same formatter for code outside Core's\ncomponents — a Pro component's own count-bearing keys, or an application's.\nArgument values are data: a value containing `{`, `#` or `<` is inserted as text,\nnever read as syntax, and never becomes markup.\n\n**New in `@dzup-ui/contracts`:** `DzMessage<Args>` (a typed catalog string —\nformatting `DzTagsInput.countOfMax` without a numeric `max` is a type error),\n`DzMessageArgsOf`, `DzMessageKey`, `DzLocalePack`, and `DzInstant` /\n`DzPlainDate` / `DzPlainTime`, which name the date semantics each component\nfollows.\n\n**The catalog is reachable from the package.** Until now `enMessages` and Core's\n`DzMessageCatalog` augmentation were unreachable by every path the package\nexposes: a translator could not obtain the strings, and a consumer's TypeScript\nsaw an empty catalog. Now:\n\n- `@dzup-ui/core/i18n` — `useDzMessageFormat` and the catalog types; the root\n  entry's declarations reference the augmentation too.\n- `@dzup-ui/core/i18n/locales/en.json` — the complete English catalog as a\n  locale pack, `import en from '@dzup-ui/core/i18n/locales/en.json' with { type: 'json' }`.\n\n**Locale packs are JSON data** (`{ locale, direction, fallback, messages }`), so\na translation tool can edit them and no pack can enter a JavaScript import graph\n— a consumer who never imports a language never ships it. `yarn\nvalidate:i18n-packs` requires every catalog key to be translated **or listed as an\nexplicit fallback**, every translation to parse and read the same arguments as\nEnglish, and a pack's declared direction to agree with the locale. A `de` pack is\n**scaffolded, not translated** — no machine translation is shipped — and is not\npublished until a translator fills it. `packages/core/docs/i18n.md` has the\nsyntax, the contribution path and the semantics table.\n\n**Fixed: `DzTimePicker` could display the wrong time.** A time of day is a plain\nvalue, but it was formatted through a local-zone `Date` merged with the host's\n`formats.date` defaults — so an application that set a `timeZone` default (the\nusual way to make server and browser agree) showed 09:05 as 22:05 to a user in\nSarajevo under `Pacific/Kiritimati`. A plain time is now formatted in UTC from a\nUTC value, so no host zone can move it. Nothing changes for an application that\nsets no zone.",
    "breaking": true,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**",
    "body": "**`aria-describedby` names only the sub-parts a field actually renders, `DzFormMessage` stops interrupting the user, `DzFileUpload` and `DzColorPicker` get an id a label can point at, `DzFieldArray` gives each row ids of its own, and the last five controls take `v-model`.**\n\nSlices three to five of `TASK-FORM-OSS-02`, which closes it: the readiness\nmatrix goes from 84 open gaps to 3, and all three are out of scope on purpose —\none is `TASK-FORM-OSS-03`'s work and two are owner decisions recorded below.\n\n**A field described its control with ids that were not there** (C4).\n`useFormField` pushed `descriptionId` into `aria-describedby` unconditionally,\nso every control inside a `DzFormField` with no `DzFormDescription` — most of\nthem — announced itself described by an element that did not exist. It failed in\nthe quietest way available: assistive technology ignores a dangling id, nothing\nwarned, and the `parts.length > 0` guard at the end could never be false.\n\nThe field now names only what is rendered. It decides that by **walking its\nslot before children render**, because registration alone cannot work on the\nserver: SSR renders children in order and never comes back, so a control\nserialised before the description's `setup` ran would omit the id and the client\nwould add it — a hydration mismatch on an accessibility attribute, which is\nworse than the dangling id it replaced. Registration is kept as the catch-all\nfor a description rendered by some intermediate component of the consumer's own.\n\n**`DzFormMessage` carried `role=\"alert\"` and `aria-live=\"polite\"` on the same\nnode** (C4). `alert` implies assertive and wins, so every standing field error\ninterrupted whatever the user was being told. A message already on screen when\nthe control is focused is read as part of its description; only one that\n*arrives* needs a live region. It is polite now, with no `role`.\n\n**Two controls computed an id and rendered it nowhere** (C2). `DzFileUpload`\nhad no `id` in the DOM at all — a `DzFormLabel`'s `for` named an id that\nappeared nowhere in the control, and clicking the label did nothing. It is on\nthe drop zone, not the hidden `<input>`, because the input is `aria-hidden` and\n`tabindex=\"-1\"`: a label pointing at it would name a node no user can reach.\n`DzColorPicker` skipped the field context in the same way.\n\n**`DzFieldArray` hands each row its own ids** (C2). Every row of a repeater\nsits inside one `DzFormField`, so every control in it resolved to the *same*\nid: a label for row 1 could activate row 3, and an `aria-describedby` could name\nanother item's error. The default slot now receives `fieldId`, `descriptionId`\nand `messageId` per row, derived from an `id` prop, the field context, or a\ngenerated base — which is spec 04 §8's \"collision-free control/help/error IDs\nper form instance and array item\".\n\n**The last five named models** (C1). `DzKnob`, `DzRating`, `DzTagsInput`,\n`DzMention` and `DzInplace` join `DzCascader` and `DzTreeSelect` in taking both\n`v-model` and `v-model:value`. Every Core control's value is now on the default\nmodel, and a spec ratchets that so the next one cannot ship without it.\n\n**States and SSR.** `data-required` on the six text inputs and on every date,\ntime, file, slider, knob, rating and colour control; `data-loading` and\n`aria-busy` on `DzKnob` and `DzRating`, whose `loading` prop was declared,\ndefaulted and read nowhere. `packages/core/tests/ssr/form-controls-ssr.spec.ts`\nnow renders all 39 controls with a value: the audit found 26 with no SSR spec at\nall, including all three pickers, where a server/client locale split is exactly\nthe defect `TASK-OSS-P4-03` found elsewhere.\n\n**Two owner decisions, recorded rather than made.** `DzFloatLabel` inherits\n`ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid` and honours\nnone; `DzInplace` inherits two of them. Binding them to a wrapper `<div>` would\nbe equally meaningless and merely harder to notice, so they are listed in\n`packages/tooling/src/forms/assessments.ts` as `inertProps` with a reason each,\nand their cells stay open. Removing them is a breaking type change.\n\n**One SSR behaviour is Reka's, not ours.** `DzSlider` renders its track and\nfilled range on the server and defers the thumb — `display:none`, at 0%, with no\n`aria-valuenow` until the collection registers on mount. Setting the attribute\nfrom Core does not work, because the primitive binds it itself and wins over a\nfallthrough. Asserted as-is so a future Reka that changes it is noticed.",
    "breaking": true,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
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
    "summary": "**A parent can take a control's value back after the user has edited it, a focus trap gives focus back when it releases, a disabled tree is disabled, and a menu's `aria-controls` points at something that exists.**",
    "body": "**A parent can take a control's value back after the user has edited it, a focus trap gives focus back when it releases, a disabled tree is disabled, and a menu's `aria-controls` points at something that exists.**\n\n`TASK-R2-O3` closes the defect register `TASK-N1-O1` reported and did not fix.\nEvery entry below has a regression spec that failed before the change and passes\nafter it; the spec title carries the defect id.\n\n**An external write after a user edit is honoured** (defect D8). `useDualModel`\nmerges a control's default `v-model` with its legacy `v-model:value` and wrote\nto **both**. On a consumer who bound only `v-model:value` — which is every\ntemplate written before the dual model — the default model is component-local\nstate, so the first user edit latched a value into it, and from that moment\nevery read preferred the latched copy and **every external write was silently\ndiscarded**. Resetting a form field did nothing at all. Seven public controls\nshared it: `DzCascader`, `DzInplace`, `DzKnob`, `DzMention`, `DzRating`,\n`DzTagsInput`, `DzTreeSelect`.\n\nThe composable now remembers the value it last wrote. A model that has moved\naway from it was moved by the parent, and the parent wins — whichever model\n(or both) the consumer bound. A consumer binding the default `v-model` sees no\nchange; a consumer binding `v-model:value` gets back the control of the value\nthey always had in every other control.\n\nThe whole suite was green through all of it, because every test mounted fresh\nand asserted, and on a fresh mount the composable was correct. The seven\nregression specs are written as traces — edit, *then* write — for that reason.\n\n**A focus trap returns focus when it releases** (defect D7). `useFocusTrap`'s\n`deactivate()` removed its keydown listener and nothing else, so dismissing a\n`DzTour` — Skip, Escape or Finish — left focus on `<body>` instead of the\ncontrol that opened it (WCAG 2.4.3 Focus Order). It now restores focus to\nwhatever held it when the trap was activated, and skips the restore when the\ntarget has left the document or when something outside deliberately took focus\nas the trap closed. `useFocusTrap` gains an options argument,\n`{ restoreFocus?: boolean }`, default `true`; `DzBlockUI` and `DzPopconfirm`\npass `false` because they already own the restore and know a better target.\n\n**`<DzTree disabled>` and `<DzResizable disabled>` do something** (defects D1,\nD2). Both stamped a `data-disabled` attribute on the root and stopped there,\nbecause the prop never reached the context their children inject: every tree row\nkept its roving `tabindex`, its click handler, its chevron and its selection,\nand every resize handle stayed focusable with Arrow keys still resizing.\nFreezing a layout required repeating `disabled` on every single handle.\n`DzTreeContext` and `DzResizableContext` each gain a `disabled: Ref<boolean>`\nmember, and a child is inert when its own `disabled` **or** the group's is set.\n\n**A disabled combobox has no live Clear button** (defect D9). `DzCombobox`'s\nclear control had no `:disabled` binding while its sibling trigger did, so a\ndisabled combobox holding a value still rendered a clickable Clear.\n`tabindex=\"-1\"` kept keyboard users out of it; pointer and AT users were not.\n\n**`aria-controls` points at an element that exists** (defect D11). Five overlay\ncontent components bound `:id=\"id\"` unconditionally, which handed an explicit\n`undefined` to the underlying Reka component and **overrode the content id Reka\ngenerates for itself**. The panel then carried no `id` at all while its trigger\nadvertised one — axe `aria-valid-attr-value`, and an AT user following the\nreference found nothing. `DzDropdownMenuContent`, `DzContextMenuContent`,\n`DzDialogContent`, `DzSheetContent` and `DzCommandPalette` now bind the\nattribute only when there is one; an explicit `id` still wins.\n\n**`DzMention`'s `loading` prop is no longer dead** (defect D3). It was declared\n(through `BaseBehaviorProps`), defaulted in the component, and read by nothing.\nThe host's answer is now ORed with the component's own resolver state, so a host\nthat knows it is fetching can say so before a trigger character has been typed.\n\n**An ARIA attribute that only works after hydration is now a test failure**\n(defect D5, finding E6). `DzOrderList` shipped `:ariaLabel` (camelCase), which\nreaches `aria-label` in a browser through ARIA reflection and is **absent from\nserver-rendered markup** — so every jsdom and Playwright assertion passed while\nthe list had no accessible name until hydration. The source is already correct;\n`packages/core/tests/ssr/aria-attribute-casing-ssr.spec.ts` now gates the class,\nfrom both ends: a scan of every component template for a camelCase ARIA\nattribute name, and a scan of real server output with a seeded component that\nmust be caught.\n\n**Story and tooling corrections.** Two stories asserted `role=\"alert\"` on a form\nfield's error message, which `DzFormMessage` deliberately stopped emitting in\n`e986952` — an `alert` implies `aria-live=\"assertive\"` and would interrupt\nwhatever the user was being told, so renderer contract C4 says polite. One story\nbound `:options` on a `DzSelect`, which takes `items`, and threw while\nrendering. And `validate:story-dod`'s state-prop scan read the whole `.types.ts`\nfile, so a same-named **slot** and *item-level* members counted as component\nprops; it now reads `*Props` interface bodies only (defect D6). The `states`\ndenominator moves 62 → 56 and every enforced check stays green.\n\n**Not fixed, recorded instead.** Defect D4 (a `role=\"button\"` span inside the\n`<button role=\"combobox\">` trigger of `DzCascader` and `DzTreeSelect`) and\ndefect D10 (`DzTreeSelect` declaring `aria-activedescendant` while DOM focus\nmoves into the tree) each need a decision the library's owner has to take, and\neach changes rendered output or a published part. Both are pinned by\nrecorded-defect assertions in their contract specs, so the count cannot drift\nand the eventual fix cannot land unnoticed.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**A grid child can now say how many columns it spans, and `DzStack` accepts `row` and `column`.**",
    "body": "**A grid child can now say how many columns it spans, and `DzStack` accepts `row` and `column`.**\n\n`TASK-R3-O3`, decision D67. Both changes are additive; nothing existing changes\nbehaviour.\n\n**`DzGridItem`** is a new compound part of `DzGrid` with a typed `span` — a\ncount from 1 to 12, `'full'`, or one per breakpoint:\n\n```vue\n<DzGrid :cols=\"{ sm: 1, md: 12 }\">\n  <DzGridItem :span=\"{ md: 6 }\"><DzInput /></DzGridItem>\n  <DzGridItem :span=\"{ md: 6 }\"><DzInput /></DzGridItem>\n  <DzGridItem span=\"full\"><DzTextarea /></DzGridItem>\n</DzGrid>\n```\n\nUntil now a spanning field was a raw `class=\"col-span-2\"` on the child — not an\nAPI, not typed, and easy to get wrong: a class assembled at runtime\n(`` `md:col-span-${n}` ``) is invisible to Tailwind's scanner and silently\ncompiles to nothing. The span classes come from a literal table, so every one is\nemitted. A span is writing-mode relative, so it mirrors under `dir=\"rtl\"`; the\nitem renders one element with no DOM reads, so server and client markup match.\nA numeric span outside 1–12 is clamped. New types: `DzGridItemProps`,\n`DzGridItemSlots`, `GridSpan`, `ResponsiveSpan`.\n\n**`DzStack` `direction`** now also accepts `row` (same as `horizontal`) and\n`column` (same as `vertical`) — the vocabulary a form renderer's layout node and\nCSS use. Before, `direction=\"row\"` silently fell back to vertical. Neither\nspelling is deprecated.",
    "breaking": false,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**The two credential inputs stop failing WCAG 2.2 SC 3.3.8 Accessible Authentication.**",
    "body": "**The two credential inputs stop failing WCAG 2.2 SC 3.3.8 Accessible Authentication.**\n\nSC 3.3.8 (AA) forbids a cognitive-function test in an authentication step unless\nthe step offers an alternative or a *mechanism* that removes it. Both of the\nlibrary's credential inputs shipped the mechanism switched off. Neither was a\nmissing feature — each was a flag that was never passed.\n\n**`DzOtpInput` now advertises platform autofill.** Reka's `PinInput` emits\n`autocomplete=\"one-time-code\"` on every cell only when its `otp` flag is set, and\n`DzOtpInput` never set it, so every cell rendered `autocomplete=\"false\"`. iOS,\nmacOS and Android therefore did not offer the code that had just arrived by SMS,\nand the user was left transcribing a code from another device — which is the\ncognitive-function test the criterion exists to remove. The new `otp` prop\ndefaults to `true`, which is what the component is named for; focus also lands on\nthe first empty cell rather than the cell that was tapped, which is Reka's own\nbehaviour behind the same flag.\n\n```vue\n<DzOtpInput v-model=\"code\" />                 <!-- autofillable one-time code -->\n<DzOtpInput v-model=\"pin\" :otp=\"false\" />     <!-- a local PIN; do not offer to fill it -->\n```\n\nPasting a code already worked and is unchanged: a paste into any cell is split\nacross the cells, on every engine.\n\n**`DzPasswordInput` can finally say which password step it is.** The field\nhard-coded `autocomplete=\"current-password\"`, and because the component sets\n`inheritAttrs: false` and spreads `$attrs` onto its wrapper `<div>`, writing\n`autocomplete=\"new-password\"` on the component put the token on an element no\nbrowser reads. A registration or change-password form could not steer a password\nmanager at all — silently. `autocomplete` is now a prop, still defaulting to\n`current-password`, and it lands on the `<input>`.\n\n```vue\n<DzPasswordInput v-model=\"pw\" autocomplete=\"new-password\" />\n```\n\n**The reveal control is reachable by keyboard.** The show/hide toggle carried\n`tabindex=\"-1\"`, so the only way to check what you had typed was a mouse. Reading\nback a password you cannot see is the other technique SC 3.3.8 recognises, and a\ncontrol with a function of its own that no key can reach is a plain SC 2.1.1\nfailure besides. The attribute is gone; the toggle is now an ordinary tab stop\nafter the field.\n\nIts label is also translatable for the first time — `DzPasswordInput.showPassword`\nand `DzPasswordInput.hidePassword` join the message catalog, replacing two English\nliterals that no application could change.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core",
      "@dzup-ui/mcp",
      "@dzup-ui/nuxt",
      "@dzup-ui/testing",
      "@dzup-ui/tokens"
    ],
    "level": "patch",
    "summary": "**A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**",
    "body": "**A pane and a column can now be resized with a single pointer and no dragging, and the packages say which browsers they are built for.**\n\n**WCAG 2.2 SC 2.5.7 Dragging Movements was measured as not met on three\nsurfaces** — `DzResizable`, `DzSplitter` and `DzTable`'s column resize. All\nthree were keyboard-operable, and a keyboard path satisfies SC 2.1.1, not this\none: the criterion is about pointer input and asks for a single pointer without\ndragging. `DzTable`'s handle was the worst of them, because `@click.stop` sat on\nit and discarded the one plain press that might have been a non-drag path.\n\nEach of the three now carries a **stepper pair** — one control that shrinks, one\nthat grows:\n\n- **Nothing moves until you reach for it.** The pair is absolutely positioned\n  over the gutter (or, for a column, over the header cell) and rests fully\n  transparent, so it occupies no layout and paints nothing: every splitter and\n  every table header looks exactly as it did, and no consuming layout shifts.\n  It is revealed by hovering the gutter, by focusing the separator, or by one\n  tap on a device that has no hover. The **DOM** does gain two buttons per\n  handle, so a consumer's own DOM snapshot of one of these three components will\n  need re-recording — that is the one thing this change asks of you.\n- **It is the same step as the keyboard.** On a splitter, a press dispatches the\n  very `keydown` the arrow keys already drive, so the step is `keyboardResizeBy`\n  and `Shift` is still the full sweep. On a column, both paths call one\n  function: 8 px, or 24 px with `Shift`.\n- **There is no prop to switch it off.** A conformance claim a consumer can\n  withdraw is not one worth publishing.\n- Each control is **24 × 24 CSS px**, the SC 2.5.8 floor, measured in chromium,\n  firefox and webkit.\n\nNew `data-part` names you can style and test against: `step-decrease` and\n`step-increase` on the resizable, splitter and table anatomies. `DzTable`'s\ncolumn-resize handle also gains `data-part=\"separator\"` — it has carried\n`role=\"separator\"` all along — plus `aria-valuenow` and `aria-valuemin`, so a\nscreen reader is told the width it is changing.\n\nFour catalog keys, so nothing is hard-coded English:\n`DzResizableHandle.shrinkPane`, `DzResizableHandle.growPane`,\n`DzTableCell.narrowColumn`, `DzTableCell.widenColumn`.\n\n**The packages now declare a supported-browser floor.** All six published\npackages carry a `browserslist` key naming the same range. It is not a\npreference: it is the lowest range the published CSS can be generated for, so a\ndeclaration below it would be a promise the build could not keep. The\nbrowser-support evidence page reads it out of the tree and prints, beside it,\nthe engines the matrix actually drives — a browser the floor admits and no lane\nmeasures is named as supported by declaration and nothing more.\n\nThis is a `patch` under `packages/contracts/VERSIONING.md`: every part, key and\nattribute above is **added**, none is removed, renamed or narrowed, and §3's\naccessibility carve-out puts a corrected rendered accessibility attribute in the\npatch position deliberately — we would rather ship the fix than hold it for a\nrange bump.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
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
    "level": "patch",
    "summary": "**An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**",
    "body": "**An application can now read locale, direction, messages, formats, portal target, motion, defaults, CSP nonce and test ids from one contract — and every component still works with none of them set.**\n\n`DzThemeProvider` has covered theme since ADR-09. Everything else a component\nneeds from its host was a prop on that component or a string in its template.\nMeasured on this checkout: **79 distinct user-visible literals** (50 static\n`aria-label` values no application can change, 29 prop defaults only a\nper-instance prop can change), **15\ncomponents** carrying their own `portalTo`, **5 `Intl` construction sites\nacross 4 files** each with their own locale or none, and no policy at all for motion,\ncomponent defaults, CSP nonce or test ids.\n\nADR-20 (`docs/adr/ADR-20-provider-contract.md`) fixes the keys, the shapes, the\ndefaults and the merge rules. This release lands the **read side**; the\n`DzProvider` component that writes them is the next packet.\n\n**New in `@dzup-ui/contracts`: nine injection keys and their shapes**\n\n`DZ_LOCALE_KEY`, `DZ_MESSAGES_KEY`, `DZ_FORMATS_KEY`, `DZ_DIRECTION_KEY`,\n`DZ_PORTAL_TARGET_KEY`, `DZ_MOTION_KEY`, `DZ_DEFAULTS_KEY`, `DZ_NONCE_KEY`,\n`DZ_TEST_IDS_KEY` — plus `DzLocale`, `DzMessages`, `DzDirection`,\n`DzDirectionPreference`, `DzFormats`, `DzMotion`, `DzMotionPreference`,\n`DzDefaults`, `DzTestIds` and the documented `DZ_PROVIDER_DEFAULTS`.\n\nThey live in the types package on purpose. An injection key is an identity: two\npackages that inject the same concern must inject the *same symbol*, or the\nchild silently receives the default and the bug is invisible. Declaring them\nhere is what lets `@dzup-ui-pro/*` read an application's locale **without\nimporting Core's runtime**. The package stays dependency-free and tree-shakeable.\n\n**New in `@dzup-ui/core`: ten composables, each with a typed default**\n\n| Composable | Answers |\n|---|---|\n| `useDzTheme` | the existing ADR-09 theme context, under the family's name — the one that still requires a provider |\n| `useDzLocale` | the active BCP-47 tag (`en-US` unset) |\n| `useDzDirection` | `'ltr' \\| 'rtl'` — **never `'auto'`**, resolved from the locale |\n| `useDzMessages` | `read(path, fallback)` over a deep-mergeable catalog |\n| `useDzFormats` | cached `Intl` number/date/relativeTime/list factories |\n| `useDzPortalTarget` | where overlays teleport to |\n| `useDzMotion` | `preference` and the resolved `reduced` |\n| `useDzDefaults` | `resolve(component, prop, chain)` — prop → context → provider → component |\n| `useDzNonce` | the CSP nonce for any style this library injects |\n| `useDzTestIds` | `testId(name)`, off until a host names the attribute |\n\n```ts\n// works with no provider mounted — this is the load-bearing property\nconst direction = useDzDirection()          // 'ltr'\nconst { read } = useDzMessages()\nread('select.noResults', 'No results found') // 'No results found'\n```\n\nNine of the ten resolve to a default and never throw. `useDzTheme` is the\nexception and is unchanged from ADR-09: it still requires a `DzThemeProvider`,\nbecause theme has no sensible default for an application that has not chosen\none.\n\n**Nothing changes for existing code.** No component consumes these yet, nothing\nis deprecated, and no default differs from what components hard-code today.\nThat is deliberate: it makes the follow-up migrations — the 79 literals, the 15\nportal props, the 9 `Intl` sites — mechanical and non-breaking, one component at\na time.\n\n**Three rules worth knowing before you nest a provider**\n\n- Every concern **overrides** per key, except `messages`, which **deep-merges** —\n  a host changing `select.noResults` must not restate the other 71 strings.\n- Direction resolves from a checked-in RTL subtag list, not\n  `Intl.Locale.prototype.getTextInfo()`, which is unavailable across the\n  supported Node range (ADR-18). The ADR records the delegation as intended once\n  the floor moves.\n- Under SSR, motion resolves to `reduced: false` — what the CSS media query\n  answers before the client knows better. The alternative hydrates\n  never-animating markup into animating markup, which is a visible jump.\n\nThe write half (`provideDz*`) is **not exported**. `DzProvider` is the one\nsanctioned writer; publishing the write half invites a second provider, and two\nproviders mean two locales and two merge rules.",
    "breaking": true,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/contracts"
    ],
    "level": "patch",
    "summary": "**A failed screen-reader run is no longer published as a pass, and risk tiers now say which AT pairings they owe.**",
    "body": "**A failed screen-reader run is no longer published as a pass, and risk tiers now say which AT pairings they owe.**\n\nThe manual assistive-technology matrix resolved a component's evidence cell by\ncounting run records whose `result` was not `unrun` and **never reading the\nvalue**. A component whose every AT/browser pairing a human had recorded as\n`fail` therefore published `state: 'pass'`. So did an all-`blocked` run, and so\ndid one pairing out of six. The defect was measured — not theorised — in\nTASK-N1-O4 §6.2, and it was latent only because 0 of 534 cells had ever been\nexecuted: the first honest screen-reader session in this repository's history\nwould have been published as a clean pass.\n\nIt is fixed at the source. The evidence vocabulary gained a `fail` state, and\nresolution moved into one pure function with a rule that never resolves upward:\nany recorded `fail` or `partial` makes the cell `fail`; a `blocked` run makes it\n`present`; `pass` requires every task to have passed on every pairing the\ncomponent's tier requires. A failure outranks staleness too — a failure that has\nnot been re-run against newer code is still a failure, and demoting it to the\nneutral-reading `stale` would launder it exactly as `pass` did.\n\n**New in `@dzup-ui/contracts`:** `TIER_AT_PAIR_INCREMENT` and\n`requiredAtPairs(tier)` — which AT/browser pairings a risk tier requires,\naccumulated from Tier A upward so that Tier D ⊇ Tier C ⊇ Tier B is a property of\nthe data rather than a rule to remember. Tier B owes NVDA + Firefox; Tier C adds\nJAWS + Chrome and VoiceOver + Safari; Tier D owes all six. Previously there was\nno differentiation at all, so the one component in the catalog whose primary job\nis a data boundary owed exactly what a badge owed.\n\n**This narrows nothing.** The scaffold still carries a row for all six pairings\non all 89 Tier B–D components — 534 cells, unchanged — because an unrun cell has\nto stay visible. The tier table only says which cells hold a component's evidence\nstate hostage, and both numbers are always reported together.\n\nRun records also gained a `task` column, so a result can finally say which of the\ncomponent's tasks it is evidence about; the scaffold had instructed testers to\n\"append one row per {task, pair}\" since the day it shipped, with no column to put\none in.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**`ariaInvalid` has left `BaseAccessibilityProps`. Sixty-six components stop declaring a validity claim they never rendered, and the prop now lives only where validity lives.**",
    "body": "**`ariaInvalid` has left `BaseAccessibilityProps`. Sixty-six components stop declaring a validity claim they never rendered, and the prop now lives only where validity lives.**\n\n`TASK-R0-O2`, closing `N5-02 D1` and the removal half recorded as `D10` in\n`docs/program-2026-09-04/reports/TASK-R5-O1-handoff.md`.\n\n**What changed in `@dzup-ui/contracts`.** `BaseAccessibilityProps` — the\n*labelling* base, the one a component extends when all it wants is an\naccessible name — no longer declares `ariaInvalid`. `BaseValidationProps`\ndeclares it, beside `invalid`, `error` and `required`, which is the same claim.\n`TASK-R5-O1` added it there on 2026-09-04 and deliberately left the old\ndeclaration in place so that step was additive; this is the other half.\n\n**Why.** Validity is a form-control concern. Declaring it on the labelling base\nhanded a validity claim to every component that wanted a name, and the library\nmeasured the result: **98 components declared `ariaInvalid` and 32 forwarded\nit.** The other 66 accepted the binding, type-checked it in your source, and\nrendered nothing — the same defect class as\n`.changeset/nine-aria-props-that-did-nothing-are-gone.md`, at eleven times the\nsize. Six points of use had already written\n`Omit<BaseAccessibilityProps, 'ariaInvalid'>` to take the prop back by hand.\n\n**The 66 components that lose `ariaInvalid`:**\n\n`DzAccordion`, `DzAffix`, `DzAlert`, `DzAnchor`, `DzAnimatedNumber`,\n`DzAvatar`, `DzBackTop`, `DzBlockUI`, `DzBreadcrumb`, `DzButton`, `DzCalendar`,\n`DzCarousel`, `DzChip`, `DzCollapse`, `DzColorModeToggle`, `DzCommandPalette`,\n`DzContainer`, `DzContextMenuContent`, `DzCountdown`, `DzDataGrid`,\n`DzDataView`, `DzDeferredContent`, `DzDescriptions`, `DzDialogContent`,\n`DzDivider`, `DzDropdownMenuContent`, `DzFab`, `DzFlex`, `DzImage`,\n`DzImageComparison`, `DzInfiniteScroll`, `DzLightbox`, `DzList`, `DzListItem`,\n`DzMasonry`, `DzMegaMenu`, `DzMenu`, `DzMeterGroup`, `DzNotification`,\n`DzOrderList`, `DzPagination`, `DzPanel`, `DzPopconfirm`, `DzProgress`,\n`DzQRCode`, `DzRelativeTime`, `DzResizable`, `DzScrollArea`, `DzScrollProgress`,\n`DzSegmented`, `DzSheetContent`, `DzSidebar`, `DzSidebarItem`, `DzSpeedDial`,\n`DzSplitButton`, `DzSplitter`, `DzTable`, `DzTag`, `DzTimeline`,\n`DzTimelineItem`, `DzToast`, `DzToggleButton`, `DzToolbar`, `DzTour`, `DzTree`,\n`DzWatermark`.\n\n**No component gains a prop**, and the 32 that forward `aria-invalid` keep it\nunchanged. Twenty-five of those reach it through `BaseValidationProps` or\n`BaseFormControlProps`. Seven forward the attribute without being validation\ncomponents and now declare the single prop on their own interface — `DzCard`,\n`DzCheckbox`, `DzCheckboxGroup`, `DzInputGroup`, `DzRadio`, `DzRadioGroup`,\n`DzSwitch`. They did **not** gain `BaseValidationProps`, because that base also\ncarries `invalid`, `error` and `required`, and those seven read none of the\nthree: they resolve invalidity from the enclosing `DzFormField`. Adding three\nprops nothing reads would have recreated the defect this change removes.\n\n**Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`\n§3: removing a declared prop is a type removal, and a prop that did nothing at\nruntime still type-checked in consumer source, so deleting it stops that source\ncompiling. Under the 0.x mapping in §1 a break goes in the minor position,\nwhere `^0.x` does not carry it into an unattended install.\n\n**What you will see if you were passing one.** The binding no longer resolves\nto a prop, so Vue routes it into `$attrs`, and these components spread `$attrs`\nonto their root — so `aria-invalid` now *renders*, on an element with no role to\ncarry it. That is a different wrong answer from the old silent swallow. **The\nsix components in the N5-02 removal emit a one-time dev-mode warning for this;\nthese 66 do not** — adding 66 warnings was judged out of proportion to the\nchange and is recorded as an open decision (`TASK-R0-O2` D190). Nothing warns\nyou; the migration table below is the whole story.\n\n**Migration.** Delete the binding, or move it to the element that owns the\nvalidity:\n\n| Was | Now |\n| --- | --- |\n| `<DzButton :aria-invalid=\"hasError\">` | the field is invalid, not the button that submits it |\n| `<DzPanel>` / `<DzContainer>` / `<DzFlex>` and the other layout boxes | put `aria-invalid` on the field inside |\n| `<DzTable>` / `<DzDataGrid>` / `<DzDataView>` | the editable cell's control carries it |\n| `<DzToast>` / `<DzAlert>` / `<DzNotification>` | a status message is not an invalid input; use `role=\"alert\"`, which these already set |\n| any of the 66 | bind `invalid` on the control, or wrap it in `DzFormField` |\n\nIf you genuinely need the attribute on one of these roots, it still reaches the\nDOM through `$attrs` — that is now an explicit escape hatch rather than an\naccident, and it is the only behaviour in this change that did not exist before.\n\n**`@dzup-ui/codemods` has no delivery path** for a `rename-props` transform\ncovering this removal, for the reason\n`.changeset/nine-aria-props-that-did-nothing-are-gone.md` already records: the\npackage is public and publishable but sits on the changesets `ignore` list\n(owner decision `N5-01 D2`, `packages/tooling/scripts/release-policy.json`).\nThe table above is the migration.\n\n**Regenerated with this change**, all four bound to the same sources:\n`packages/core/docs/component-meta.json`, `llms.txt`, `llms-full.txt` and the\n144 generated docs pages under `apps/docs/components/`.\n`yarn validate:form-readiness` stays green at 0 gaps.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Pressing Retry in `DzCombobox` or `DzMultiSelect` no longer closes the list.** The button disappears as soon as the reload starts, so a mouse press used to drop focus to the page and close the popover. The list the user had just asked to reload vanished. The error row now keeps focus in the input, as `DzMention` already did (async-options contract C9.4), and the list stays open through loading → ready.",
    "body": "**Pressing Retry in `DzCombobox` or `DzMultiSelect` no longer closes the list.** The button disappears as soon as the reload starts, so a mouse press used to drop focus to the page and close the popover. The list the user had just asked to reload vanished. The error row now keeps focus in the input, as `DzMention` already did (async-options contract C9.4), and the list stays open through loading → ready.",
    "breaking": false,
    "deprecated": false
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
    "level": "patch",
    "summary": "**Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**",
    "body": "**Components can now declare what a consumer may address, and five of them do: parts, states, and a typed per-part `ui` override.**\n\nUntil now the only sanctioned way to restyle a dzup-ui component was a design\ntoken or the `class` on its root. Anything else — a spinner inside a button, the\nerror message under an input, a dialog's backdrop, a select's portaled listbox —\nwas reachable only by writing a descendant selector against class names that\n`tailwind-variants` generates and is free to change. Those selectors worked\nuntil they didn't, and nothing told anyone when they stopped.\n\nADR-19 (`docs/adr/ADR-19-public-styling-contract.md`) makes that surface\nexplicit. This release lands the machinery and the first five components.\n\n**New in `@dzup-ui/contracts`**\n\n- `ComponentAnatomy` — a component's declared parts, states, component tokens,\n  recipe axes and risk tier.\n- `ANATOMY_PART_VOCABULARY` — the shared part names, so `content` means the same\n  thing on a dialog and on a popover.\n- `AnatomyPart<A>` and `UiOverrides<A>` — derived types that make a part name a\n  compile error rather than a class that lands nowhere.\n\n**New in `@dzup-ui/testing`**\n\n- `expectAnatomy(wrapper, anatomy)` — asserts the rendered DOM emits every\n  declared part exactly once (or is declared optional) and no undeclared one.\n  Runner-independent, and it takes the anatomy structurally, so the package\n  needs no dependency on `@dzup-ui/contracts`.\n\n**New in `@dzup-ui/core`: `data-part` and `ui` on five components**\n\n| Component | Parts you can now address |\n|---|---|\n| `DzButton` | `root`, `spinner` |\n| `DzInput` | `root`, `control`, `input`, `prefix`, `suffix`, `spinner`, `clear`, `error` |\n| `DzSelect` | `root`, `trigger`, `icon`, `content`, `viewport`, `input`, `item`, `item-indicator`, `item-label`, `empty`, `error` |\n| `DzDialogContent` | `overlay`, `content`, `header`, `viewport`, `footer` |\n| `DzTable` (family) | `root`, `content`, `title`, `header`, `body`, `row`, `cell`, `footer` |\n\n```vue\n<!-- before: a selector against a generated class, and a prayer -->\n<style>.my-form .inline-flex > svg { height: 24px !important; }</style>\n\n<!-- after -->\n<DzButton loading :ui=\"{ spinner: 'h-6 w-6' }\">Save</DzButton>\n<DzSelect :items=\"items\" :ui=\"{ content: 'max-h-40', item: 'py-3' }\" />\n<DzDialogContent :ui=\"{ overlay: 'backdrop-blur-sm' }\" />\n```\n\nOverrides merge through `cn()` (clsx + tailwind-merge), so a conflicting utility\nreplaces the component's own rather than fighting it. **No `!important` is\nneeded, and Playwright asserts that in a real browser** rather than the docs\nasserting it in prose.\n\n**`DzDialog` declares `parts: 'none'`** — it wraps Reka's `DialogRoot`, which is\na provider and renders no element. That is an answer, not an omission: the\ndialog's surface is declared on `DzDialogContent`, where the nodes are.\n\n**Nothing is removed, and every existing override keeps working.**\n\n- `class` lands exactly where it always did — the button root, the input's\n  visual field, the select trigger, the dialog panel, the table's scroll\n  container. `ui.root` is the new way to reach an outer node.\n- `data-dz-dialog-overlay`, `data-dz-search-input` and `data-dz-no-results` are\n  still emitted, now alongside `data-part` (dual-emit for one minor series;\n  removing them needs a major).\n- `DzDialogContent`'s `overlayClass` still applies. It is deprecated in favour\n  of `:ui=\"{ overlay: … }\"`; both work, and `ui` takes precedence.\n\n**Two things this release deliberately does not claim**\n\n`DzSelect` and `DzTable` declare `componentTokens: []`, because they own no\n`--dz-select-*` or `--dz-table-*` custom property — they style from global\nsemantic tokens. Declaring invented names would have documented override points\nthat do not exist. Per-instance restyling of those two goes through `ui`.\n\n`DzButton` mirrors `data-tone` but not `data-variant` or `data-size`, though it\ndeclares all three recipe axes. Its contract spec asserts that gap rather than\nhiding it, so closing it is a visible change rather than a silent one.\n\n**138 of 143 public components have not declared an anatomy yet.**\n`yarn validate:ownership` reports the number against a ceiling that only\nratchets down, and the Storybook docs say plainly, per component, when a\ncomponent has not declared one.",
    "breaking": false,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/testing",
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Components now declare what their keys do, and the documentation renders the table from that declaration instead of saying it has not been derived.**",
    "body": "**Components now declare what their keys do, and the documentation renders the table from that declaration instead of saying it has not been derived.**\n\nUntil this release the library had no machine-readable keyboard contract. The one\ngenerated keyboard signal was the capability matrix's `keyboard-spec` cell, and\nthat cell was a regular expression over the unit spec: it recorded *that* some\nkey was asserted, never *which* key did *what*. So every one of the 144 generated\ncomponent pages carried the sentence **\"Not yet derived\"** exactly where an\naccessibility reviewer looks first, and the only honest alternative would have\nbeen a hand-typed table that nothing could check and that would be wrong within\na release.\n\n**New in `@dzup-ui/contracts`**\n\n`ComponentAnatomy` gains an optional `keyboard` field:\n\n```ts\nexport const anatomy = {\n  parts: ['root', 'spinner'],\n  states: ['idle', 'loading', 'disabled'],\n  componentTokens: ['--dz-button-md-height'],\n  keyboard: [\n    { key: 'Enter', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },\n    { key: ' ', action: 'Activate the button.', wcag: ['2.1.1'], apg: 'button' },\n  ],\n  riskTier: 'B',\n} as const satisfies ComponentAnatomy\n```\n\nEach `KeyboardBinding` carries the key as `KeyboardEvent.key` spells it, any\nmodifiers, the part or state it applies in, what it does, the WCAG success\ncriteria it is the mechanism for, the APG pattern it implements, and whether it\nswaps meaning in a right-to-left document. `keyboard: 'none'` is an **explicit\nclaim** that the component has no keyboard behaviour of its own — deliberately a\ndifferent fact from the field being absent, and the two are never collapsed.\n\n**In `@dzup-ui/core`:** 104 components declare a contract — 393 bindings across\n85 components, plus 19 that declare `'none'`.\n\n**New in `@dzup-ui/testing`:** `expectKeyboardContract` / `checkKeyboardContract`\nhold a rendered component to its declaration — that every binding's context names\na part or state the component actually declares, that no key is declared twice,\nthat nothing contradicts the component's own RTL contract, and that something in\nthe tree can receive a key at all.\n\n**What you get as a consumer.** Every component page now publishes a real\nkeyboard table with WCAG and APG references per row, and the components that have\nnot declared one say *\"not declared\"* rather than implying they have no keyboard\nbehaviour. The same declaration is what the manual screen-reader scaffolds cite,\nso a tester drives the component's promises rather than the pattern's from\nmemory.\n\n**Two things this release makes visible rather than fixes.** `DzMenu` and\n`DzSidebar` are assigned the APG `menu` and `treeview` patterns but implement\nneither pattern's keyboard — their items are links and buttons in document order\nwith no roving index — and their declarations now say so. And because\n`keyboard-spec` is measured against the declared contract instead of against any\nkey at all, the number of components whose spec exercises everything they promise\nis **5**, not the 29 the old presence test reported.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core",
      "@dzup-ui/contracts"
    ],
    "level": "patch",
    "summary": "**Every form control declares its styling surface — and five of them stop pinning things to the wrong edge in Arabic.**",
    "body": "**Every form control declares its styling surface — and five of them stop pinning things to the wrong edge in Arabic.**\n\nThis finishes the ADR-19 rollout across the catalogue's risk-bearing components.\n`forms` was the last family and the largest: 24 more components now declare\ntheir parts, their states and a typed per-part `ui` override, so restyling a\ncombobox's option row, a slider's thumb, a date picker's month grid or a\ntransfer list's pane no longer means writing a descendant selector against a\nclass name `tailwind-variants` is free to change.\n\n**Every Tier B, C and D component in the library now declares an anatomy.**\n\n**New `data-part` and `ui` surfaces**\n\n| Group | Components | Parts you can now address |\n|---|---|---|\n| Selection controls | `DzCheckbox`, `DzCheckboxGroup`, `DzRadio`, `DzRadioGroup`, `DzSwitch` | `root`, `control`, `indicator`, `label` |\n| Value controls | `DzSlider`, `DzRangeSlider`, `DzKnob`, `DzRating`, `DzInplace` | `root`, `control`, `indicator`, `item`, `item-indicator`, `label`, `trigger`, `content`, `icon`, `error` |\n| Pickers | `DzColorPicker`, `DzDatePicker`, `DzDateRangePicker`, `DzTimePicker` | `root`, `control`, `trigger`, `label`, `icon`, `clear`, `content`, `panel`, `header`, `title`, `action`, `group`, `row`, `cell`, `item`, `input`, `list`, `separator`, `footer`, `indicator`, `error` |\n| Option controls | `DzCombobox`, `DzListbox`, `DzMultiSelect`, `DzCascader`, `DzTreeSelect`, `DzTransfer`, `DzPersonaSelector`, `DzMention`, `DzTagsInput` | `root`, `control`, `input`, `trigger`, `clear`, `icon`, `content`, `viewport`, `panel`, `list`, `group`, `group-label`, `item`, `item-label`, `item-indicator`, `body`, `header`, `hint`, `loader`, `empty`, `error`, `options-state`, `options-message`, `options-retry` |\n| Renderless | `DzFieldArray` | `parts: 'none'` — it renders no element of its own, and now says so |\n\n```vue\n<DzCheckbox v-model=\"agreed\" :ui=\"{ control: 'rounded-full', label: 'text-sm' }\">I agree</DzCheckbox>\n<DzSlider v-model=\"volume\" :ui=\"{ indicator: 'size-5 shadow-lg' }\" />\n<DzCombobox :items=\"items\" :ui=\"{ item: 'rounded-lg', 'item-indicator': 'opacity-60' }\" />\n<DzTransfer :source=\"items\" :ui=\"{ list: 'w-72', header: 'font-semibold' }\" />\n<DzDatePicker v-model=\"date\" :ui=\"{ item: 'rounded-full', title: 'uppercase tracking-wide' }\" />\n```\n\n**The async options row is part of the contract now.** The tri-state row a\nselection control shows while its options are loading, empty or failed emits\n`options-state`, `options-message` and `options-retry`, and every control that\nrenders it — `DzCascader`, `DzCombobox`, `DzListbox`, `DzMultiSelect`,\n`DzPersonaSelector`, `DzSelect`, `DzTransfer`, `DzTreeSelect` — now declares\nthose three names. They were emitted and undeclared in every one of them.\n\n**Eight real RTL fixes, found by declaring rather than by reading.**\n\n`validate:rtl` reads a component's declared `rtl.mirrors` and then checks its\nsource for physical utilities. Declaring these turned up geometry that promised\nto follow the reading direction and did not:\n\n- **`DzRating`**'s partial-star overlay was pinned to the screen's left edge and\n  clipped by width, so in an Arabic document it filled the wrong half of every\n  star. Now a logical inset.\n- **`DzTimePicker`**'s clear control was pinned to the screen's right edge rather\n  than to the end of the field. Now a logical inset.\n- **`DzCombobox`** and **`DzMultiSelect`** positioned the option check mark and\n  indented the option label physically. Now logical.\n- **`DzDatePicker`**, **`DzDateRangePicker`** and **`DzPersonaSelector`** used\n  physical `ml-`/`pl-` for the calendar trigger and the persona row. Now `ms-`/`ps-`.\n\n**In a left-to-right document nothing moves by a pixel.** The logical properties\ncompile to the same edges the physical ones did.\n\n**Nothing is removed and every existing override keeps working.** `ui` is a new\noptional prop on 21 components; `class` lands exactly where it always did; no\npart was renamed and no `data-state` value changed. In `@dzup-ui/contracts`, the\nthree `options-*` names move from `held` to `reviewed` in\n`ANATOMY_PART_EXTENSIONS`, which is a documentation change to an already-exported\nconstant.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Every user-visible string the library renders is now translatable from one place.**",
    "body": "**Every user-visible string the library renders is now translatable from one place.**\n\nBefore this release, `@dzup-ui/core` shipped **54 static `aria-label` values\nacross 27 components that no application could change at all** — not with a\nprop, not with a provider. An Arabic application shipped `aria-label=\"Clear\ninput\"` and had no way to do otherwise. A further **39 literal defaults on\n`*Text`/`*Label`/`*Placeholder` props across 24 components** could only be\nchanged one instance at a time, which is repetition rather than localisation.\n\nAll of them now resolve through one catalog:\n\n```vue\n<DzProvider\n  locale=\"fr-FR\"\n  :messages=\"{\n    DzInput: { clear: 'Effacer le champ' },\n    DzSelect: { noResults: 'Aucun résultat' },\n  }\"\n>\n  <App />\n</DzProvider>\n```\n\n**Nothing changes until you supply a catalog.** Every value in the shipped\nEnglish catalog is byte-identical to the literal it replaced — including one\ninconsistency that was deliberately *not* tidied: `DzCascader` uses `Search…`\n(U+2026) where `DzSelect` and `DzListbox` use `Search...`. Normalising them\nwould be a visible change to three components smuggled in under a refactor.\n\nOverrides apply **per key**, so translating `DzTimePicker.confirm` keeps the\nother ten strings that component renders.\n\n**New in `@dzup-ui/contracts`: `DzMessageCatalog`**, an empty interface that each\ntier augments from its own package:\n\n```ts\ndeclare module '@dzup-ui/contracts' {\n  interface DzMessageCatalog {\n    DzChart: { noData: string }\n  }\n}\n```\n\nCore contributes its ~38 components this way, which makes the extension\nmechanism ADR-20 §9 requires of Pro **the same one Core itself uses** rather\nthan a second-class hook. It also augments a package Pro already depends on:\nPro depends inward on Core *contracts* and must never import Core's runtime.\n\n**All `Intl` construction is cached, and one case was pathological.**\n`DzAnimatedNumber.tween.ts` built its `Intl.NumberFormat` *inside* the function\na running tween calls **once per frame** — and ECMA-402 requires locale data to\nbe resolved on construction. Formatting 1,000 rows now constructs at most one\nformatter per (locale, options) pair, which is asserted rather than claimed. The\ncache moved to a module that imports nothing, so the framework-free tween\nhelpers can reach it.\n\n**One behaviour change, and it fixes a hydration bug.** `DzAnimatedNumber`,\n`DzTimePicker` and `useRelativeTime` used to format with `Intl`'s *ambient*\nlocale when given no explicit one. That is not the same value on a Node server\nas in a visitor's browser, so a server-rendered figure or a \"2 minutes ago\"\ncould hydrate into a different language or a different group separator — a\nmismatch invisible to anyone developing in the locale their server runs in. They\nnow use the application's declared locale, falling back to `en-US`.\n\nThe pure exported helpers `formatNumber`, `formatRelativeTime` and\n`formatAbsoluteTime` keep their signatures **and** their semantics: an omitted\n`locale` still means the runtime's own. Only the composable and the components\nchanged.\n\n**New gate: `yarn validate:hardcoded-strings`.** Fails on a static `aria-label`\nin a template or a literal default on a user-visible prop. It reads the\n`<template>` block only, so JSDoc `@example` strings — 11 of them, which the\nfirst inventory pass wrongly swept up — are not flagged. A line may be exempted\nwith a `hardcoded-string-ok: <reason>` comment, and the reason lives next to the\nstring rather than in a list somewhere else.\n\n**New in Storybook: a Pseudo-locale toolbar.** Renders every string accented,\npadded +30% and framed in `[!!! … !!!]`, across every story rather than a chosen\nfew. Un-accented text is a string the catalog does not reach; a missing `!!!]`\nis a label that clipped. The pseudo catalog is generated from the English one,\nso a message added tomorrow is covered today.\n\n**Known gap, stated rather than fixed:** `DzOrderList`'s `dragHandleLabel` is\ndocumented as \"accessible label for each row's drag handle\" and **nothing\nrenders it** — the handle is `aria-hidden=\"true\"`. Its literal stays, with the\nreason in the source. Giving that handle an accessible name is an accessibility\ndecision, not a codemod.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**`DzMention` and `DzPersonaSelector` can be driven by a remote option source through the same contract as the seven selection controls.**",
    "body": "**`DzMention` and `DzPersonaSelector` can be driven by a remote option source through the same contract as the seven selection controls.**\n\n`TASK-R3-O3`, renderer contract C9. Additive: without `optionsState` both\ncomponents behave as before.\n\n**`DzMention`** now takes `optionsState`, `optionsError` and `optionsRetryable`\nand emits `loadOptions` / `retryOptions`. Pass `optionsState` and each trigger\ntoken asks the host — reason `open` for a new token, `search` as the query grows,\nwith an `AbortSignal` that the next request aborts — and the host writes its\nanswer into the trigger's `options`. The menu shows the shared loading, empty and\nerror rows (`options-state`, `options-message`, `options-retry`), and retry keeps\nfocus in the text field. The `search` event still fires first and carries the\ntrigger character.\n\nThe **async resolver** form (`options: (query) => Promise<…>`) keeps working and\nnow runs on the same seam: a newer query aborts the older request instead of a\nprivate counter, and **a rejected resolver shows the error row with a retry**\nwhere it used to leave an unhandled rejection and the previous list on screen.\nIts loading and no-results rows, and the `#loading` / `#empty` slots, are\nunchanged. `aria-controls` is now only set while the suggestion list is actually\nrendered.\n\n**`DzPersonaSelector`** declares the seam and forwards it to the `DzCombobox` it\nrenders. It was reachable before only through untyped attribute fallthrough.\n\n`@dzup-ui/contracts`: `ANATOMY_PART_EXTENSIONS` lists `DzMention` as an owner of\nthe three `options-*` part names.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Navigation and data components declare their styling surface, and a sidebar no longer opens on the wrong edge in Arabic.**",
    "body": "**Navigation and data components declare their styling surface, and a sidebar no longer opens on the wrong edge in Arabic.**\n\nThe ADR-19 styling contract — declared parts, declared states, a typed per-part\n`ui` override — reached two more families this release. **Every** public\ncomponent in `navigation` now declares one, and eleven more in `data` join\n`DzTable`, so restyling a menu, a pager, a tab set, a calendar or a grid no\nlonger means writing a descendant selector against a class name\n`tailwind-variants` is free to change.\n\n**New `data-part` and `ui` surfaces**\n\n| Family | Components | Parts you can now address |\n|---|---|---|\n| `navigation` | `DzAnchor`, `DzBackTop`, `DzBreadcrumb` (family), `DzColorModeToggle`, `DzMegaMenu`, `DzMenu` (family), `DzPagination`, `DzSegmented`, `DzSidebar` (family), `DzStepper`, `DzStepperItem`, `DzTabs` (family) | `root`, `list`, `item`, `item-label`, `separator`, `trigger`, `indicator`, `panel`, `group`, `group-label`, `action`, `content`, `close`, `header`, `footer`, `body`, `overlay`, `icon`, `suffix`, `title`, `description` |\n| `data` | `DzAccordion` (family), `DzCalendar`, `DzChip`, `DzDataGrid` (family), `DzDataView`, `DzInfiniteScroll`, `DzListItem`, `DzOrderList`, `DzTag`, `DzTree`, `DzTreeItem` | `root`, `item`, `trigger`, `indicator`, `content`, `header`, `title`, `group`, `action`, `row`, `cell`, `body`, `panel`, `list`, `item-label`, `control`, `loader`, `error`, `hint`, `empty`, `footer`, `close` |\n\n```vue\n<DzPagination :total=\"500\" :ui=\"{ action: 'rounded-full', separator: 'opacity-40' }\" />\n<DzSidebar :ui=\"{ overlay: 'backdrop-blur-sm', body: 'gap-1' }\" />\n<DzTabTrigger value=\"one\" closable :ui=\"{ close: 'opacity-100' }\">One</DzTabTrigger>\n<DzCalendar v-model=\"date\" :ui=\"{ item: 'rounded-lg', 'title': 'font-semibold' }\" />\n<DzTreeItem :node=\"node\" :ui=\"{ indicator: 'text-[var(--dz-primary)]' }\" />\n```\n\n**Two real fixes, not just declarations.**\n\n`validate:rtl` reads a component's declared `rtl.mirrors` and then checks its\nsource for physical utilities. Declaring these two turned up geometry that\npromised to follow the reading direction and did not:\n\n- **`DzSidebar`** pinned the rail and the mobile drawer with `left-0`, and the\n  drawer slid out with `-translate-x-full`. In a right-to-left document that put\n  the navigation on the edge the content reads away from, and would have slid\n  the drawer *into* the page instead of off it. Now `inset-s-0` plus an\n  `rtl:translate-x-full` companion.\n- **`DzBackTop`** pinned the scroll-to-top control with\n  `right-[var(--dz-back-top-offset)]`. Unlike `DzFab`, it takes no `position`\n  prop — the corner is \"out of the way of the text\", which is a statement about\n  the reading direction. Now `inset-e-`.\n\nTwo inline physical margins went with them: the sidebar item's badge\n(`ml-auto` → `ms-auto`) and the data view's paginator (`ml-auto` → `ms-auto`).\n\n**In a left-to-right document nothing moves by a pixel.** `inset-s-`, `inset-e-`\nand `ms-` compile to the same edge that `left-`, `right-` and `ml-` did.\n\n**Nothing is removed and every existing override keeps working.** `ui` is a new\noptional prop on 22 components; `class` lands exactly where it always did; no\npart was renamed and no `data-state` value changed.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/codemods",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**Nine ARIA props that were declared, type-checked in your source, and never rendered anything have been removed from six components.** `DzFloatLabel` loses `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`; `DzInplace`, `DzGrid`, `DzStack`, `DzStepper` and `DzTabs` lose `ariaInvalid`.",
    "body": "**Nine ARIA props that were declared, type-checked in your source, and never rendered anything have been removed from six components.** `DzFloatLabel` loses `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid`; `DzInplace`, `DzGrid`, `DzStack`, `DzStepper` and `DzTabs` lose `ariaInvalid`.\n\n`TASK-N5-02`. These are the six `⛔ gap` cells the C2 (identity) column of\n`docs/program-2026-08/form-controls-readiness-matrix.md` has carried since the\nform-controls audit. The matrix now reports **0 gaps**.\n\n**Why removal and not implementation.** Each of these props inherits from\n`BaseAccessibilityProps` and each landed on an element that cannot carry it:\n\n- `DzGrid` and `DzStack` render a generic `<div>`. A layout box is not invalid;\n  the fields inside it are.\n- `DzTabs` renders Reka's `TabsRoot`, which is not a widget with a validity\n  state. A field inside a panel is invalid, and `DzTabTrigger` is where an\n  invalid-panel affordance belongs.\n- `DzStepper`'s root is `role=\"group\"`, and ARIA 1.2 does not support\n  `aria-invalid` on `group`.\n- `DzInplace`'s display trigger is `role=\"button\"`, likewise unsupported.\n- `DzFloatLabel` is a `<div>` plus a `<label>`. It is not a labelable element and\n  computes no accessible name of its own, a generic element ignores\n  `aria-describedby` and `aria-invalid` entirely, and the control it wraps\n  already merges its own error id into `aria-describedby` — writing one from the\n  wrapper would clobber that merge.\n\nA declared prop that silently does nothing is worse than its absence, because a\nconsumer reasonably believes it has met its own accessibility obligation. The\nhonest fix is to stop declaring it.\n\n**Why this is a `minor` and not a `patch`.** `packages/contracts/VERSIONING.md`\n§3: removing a declared prop is a type removal, and a prop that did nothing at\nruntime still type-checked in consumer source, so deleting it stops that source\ncompiling. Under the 0.x mapping in §1 a break goes in the minor position, where\n`^0.x` does not carry it into an unattended install.\n\n**What you will see if you were passing one.** The binding no longer resolves to\na prop, so Vue routes it into `$attrs` and every one of these components spreads\n`$attrs` onto its root — which means the attribute now *renders*, on an element\nwith no role to carry it. That is a different wrong answer from the old silent\nswallow, so each component emits a one-time dev-mode warning naming the prop,\nwhat to do instead, and the fall-through. Production builds drop the check.\n\n**Migration.** Delete the binding, or move it to the element that owns it:\n\n| Was | Now |\n| --- | --- |\n| `<DzGrid :aria-invalid=\"hasError\">` | put `aria-invalid` on the field, or bind `invalid` on the control |\n| `<DzStack :aria-invalid=\"…\">` | same |\n| `<DzTabs :aria-invalid=\"…\">` | the field inside the panel carries it |\n| `<DzStepper :aria-invalid=\"…\">` | the field inside the step carries it |\n| `<DzInplace :aria-invalid=\"…\">` | set it on the editor you render into `#edit` |\n| `<DzFloatLabel :aria-label=\"…\">` etc. | put all four on the control you wrap, or use `DzFormField` |\n\n`@dzup-ui/codemods`' `rename-props` transform strips all nine, in every binding\nform a Vue template or JSX can write:\n\n```sh\nnpx @dzup-ui/codemods rename-props src/\n```\n\n`@dzup-ui/codemods` is released alongside this change (owner decision N5-01-D2,\n2026-09-26). The table above is the same migration, by hand.\n\n**Three sibling props were kept and implemented rather than removed** —\n`DzInplace.ariaLabelledby`, `DzStepper.ariaLabelledby` and\n`DzStepper.ariaDescribedby`. See the accompanying patch.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/nuxt"
    ],
    "level": "minor",
    "summary": "**`@dzup-ui/nuxt` now depends on `@nuxt/kit@4.5.2` instead of `3.14.0`.** If you install this module, `@nuxt/kit` 4 arrives in your dependency tree — including on a Nuxt 3 project.",
    "body": "**`@dzup-ui/nuxt` now depends on `@nuxt/kit@4.5.2` instead of `3.14.0`.** If you install this module, `@nuxt/kit` 4 arrives in your dependency tree — including on a Nuxt 3 project.\n\n`TASK-N5-03`. `minor`, which under `packages/contracts/VERSIONING.md` is the\n**breaking** position for a `0.x` package: a consumer on `^0.1.0` does not\nreceive this automatically, and that is the intent. A module quietly changing\nwhich major of `@nuxt/kit` it drags into somebody's project is not a patch.\n\n**What was verified, and on what.**\n\n| Check | Result |\n|---|---|\n| `tsc --noEmit` against `@nuxt/schema` 4.4.5 | passes |\n| `tsc --project tsconfig.json` (build) | passes |\n| 46 unit tests (`packages/nuxt/src`) | pass |\n| Consumer fixtures on `nuxt@4.4.5` | see below |\n| Consumer fixtures on `nuxt@3.19.0` | see below |\n\nNothing in `src/module.ts` needed changing. Every kit API this module uses —\n`defineNuxtModule`, `addComponent`, `useLogger`, `nuxt.options.css`,\n`nuxt.options.build.transpile`, `nuxt.options.app.head.script`,\n`nuxt.options.rootDir` — is unchanged between kit 3 and kit 4.\n\n**The declared floor did NOT move.** `peerDependencies.nuxt` is still\n`>=3.0.0`, and `meta.compatibility.nuxt` is still `>=3.0.0`. Narrowing them is\nan owner decision (`N5-03-D2` in\n`docs/program-2026-09/reports/N5-03-toolchain-currency-handoff.md`) and it should\nbe taken on evidence: the fixture lane now runs **both** majors\n(`.github/workflows/vue-next.yml`, job `nuxt-majors`), so \"does this still work\non Nuxt 3?\" is answered by a run rather than by an assumption.\n\n**A Node-floor fact that constrains the answer.** `nuxt` <= 4.4.5 declares\n`engines.node: ^20.19.0 || >=22.12.0`; `nuxt` >= 4.4.6 declares\n`^22.12.0 || ^24.11.0 || >=26.0.0`. This repository declares `^20.19.0 || >=22.13.0`\nand CI runs 20.19.0, so the fixtures pin `4.4.5` exactly rather than `^4`.\nMoving to a newer Nuxt 4 is an **ADR-18 amendment**, not a dependency bump.",
    "breaking": true,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/nuxt",
      "@dzup-ui/core"
    ],
    "level": "patch",
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
    "summary": "**An application can now install one HTML sanitizer for the whole library, and gets a safe one until it does.**",
    "body": "**An application can now install one HTML sanitizer for the whole library, and gets a safe one until it does.**\n\n`DzProvider` grows a tenth concern, `sanitizer` — the seam 08-11 doc 06 asked\nfor and `@dzup-ui-pro/pro` has been blocked on since its security packet\n(`docs/security.md` §10: *\"No shared sanitizer provider. Each component resolves\nDOMPurify itself; a consumer cannot supply one organisation-wide adapter.\"*).\nPro could not solve it on its own side: ADR-20 §9 forbids a second provider, and\nit is right to.\n\n```vue\n<DzProvider :sanitizer=\"{ sanitize: html => DOMPurify.sanitize(html) }\">\n```\n\n**The default escapes rather than passing through.** Set nothing and rich\ncontent renders as visible text. That is deliberate and it is the whole\nargument: a pass-through default is the vulnerability the seam exists to remove,\nand it fails in the direction where nothing looks wrong until it is. Bundling a\nsanitizer was the other option and would have put a parser and an allowlist into\nevery consumer's bundle for a library that renders no HTML of its own — Core has\n**zero** `v-html` and `innerHTML` sinks, and all fifteen of its\n`SecurityBoundary` declarers are URL or payload boundaries. Escaping is safe\nwith no dependency, identical on a server and in a browser, and *visibly* wrong\nwhen it is wrong, which is the only kind of wrong a security default should be.\n\n**The ceilings belong to the seam, not to your adapter.** The commonest\ninstallation is one line handing over `DOMPurify.sanitize`, so requiring every\nhost to re-derive an input bound is how the bound comes to be missing.\n`useDzSanitizer()` applies `maxLength` and `maxDepth` **before** anything parses\nand throws `DzSanitizeLimitError`. The numbers — 128 KiB and depth 64 — are\ncarried over from Pro's measurement rather than re-guessed: the cost is in the\nHTML parser, not in the sanitizer's walk, and depth and length multiply, so the\npair bounds the amplification an attacker can construct rather than the size of\na document. The depth guard is a scanner, never a parse, because the parse is\nthe cost being bounded.\n\n**Three states, not two.** Omitting the prop means \"nobody configured one\" and\nresolves to the escaping default. Passing `null` means \"the host will supply\none\", and if nothing then does, `useDzSanitizer()` throws in development — a\nconfiguration mistake should not turn into a rendering difference nobody looks\nfor. Production falls back to escaping either way.\n\n**Nesting works per field.** `<DzProvider :sanitizer=\"{ limits: { maxDepth: 8 } }\">`\ninside a provider that installed DOMPurify keeps DOMPurify and tightens only the\nceiling, and a provider mounted to change the locale leaves an application's\nsanitizer exactly as it found it.\n\n`DzSanitizerAdapter`, `DzSanitizeContext`, `DzSanitizeLimits`,\n`DzSanitizerOptions`, `DzSanitizeSink`, `DzObjectUrlSink`, `DZ_SANITIZER_KEY`\nand `DzSanitizeLimitError` are exported from `@dzup-ui/contracts`, so Pro and\nyour own components resolve the same policy through the same symbols without\nimporting Core's runtime. The sink vocabulary is Pro's registry vocabulary\nverbatim — `markdown`, `mermaid-svg`, `notebook-output`, `diff-highlight`,\n`rich-text-paste` — with the three object-URL contexts typed apart so\n`sanitize(html, { sink: 'download-blob' })` cannot be written by accident.\n\n`DZ_PROVIDER_DEFAULTS` gains a `sanitizer` key. It is the first field that\nobject has grown since ADR-20 published it, so it is called out rather than\nburied: code comparing against the whole object sees a new key. Recorded as\nADR-20 amendment A6.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "patch",
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
      "@dzup-ui/codemods",
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
      "@dzup-ui/contracts",
      "@dzup-ui/core"
    ],
    "level": "minor",
    "summary": "**Six navigation components stop rendering a hostile URL as a live link.**",
    "body": "**Six navigation components stop rendering a hostile URL as a live link.**\n\n`DzButton`, `DzAnchor`, `DzBreadcrumb`, `DzMenu`, `DzSidebar` and `DzMegaMenu`\nput whatever `href` they were given straight into the DOM. Measured, not\ninferred: all nine `url-scheme` fixtures in the security corpus reached the\nrendered `href` **verbatim** on all six components — 54 measurements, severity\nhigh, recorded as `S1`–`S12` in\n`packages/core/security/security-deviations.json`. A `javascript:` URL from\nwhatever populates a menu, breadcrumb, sidebar or anchor list — a CMS row, an\nAPI navigation tree, a user profile, a model response — executed **in your\norigin, with your cookies**, on an ordinary click.\n\nThere is now one URL policy, and it is on by default.\n\n```vue\n<!-- renders a <button>, not a link; `href` is not in the DOM -->\n<DzButton href=\"javascript:void(0)\" @click=\"save\">Save</DzButton>\n```\n\n**This is a breaking change, and it is the point.** `javascript:void(0)` is a\nwidespread legacy idiom in exactly these item-list props. It renders today and\nit does not after this release. Under `packages/contracts/VERSIONING.md` (0.x:\nminor = breaking) that is a `minor`.\n\n**Migration.** Every component keeps the non-link branch it already had, so a\nrefused URL degrades rather than disappears: `DzButton`, `DzMenuItem` and\n`DzSidebarItem` render their `<button>` and still emit `click`;\n`DzBreadcrumbItem` renders its `<span role=\"link\">`; `DzAnchor` renders the same\n`<a>` with no `href`, which is not a link. So the common case —\n`href=\"javascript:void(0)\"` beside a `@click` handler — keeps working as a\nbutton. If you were relying on the URL itself running, move the code into the\nclick handler. If a scheme you legitimately need is refused, widen the policy\nonce at the provider (below) rather than per call site.\n\n**The allowlist.** `http`, `https`, `mailto`, `tel`, `sms`, plus every relative,\nquery and fragment URL, which carry no scheme and resolve against the document\nyou already served. Everything else is refused — `javascript:`, `vbscript:`,\n`data:`, `file:`, `blob:`, and every scheme nobody has thought of yet. An\nallowlist is wrong in the safe direction; a denylist is a list of the attacks\nsomebody remembered.\n\n**A refused URL is refused, never rewritten.** The attribute is omitted and the\nelement carries `data-state=\"url-rejected\"`, which you can style and a test can\nsee. Rewriting to `#` would produce a control that looks operable and is not,\nwhich is a worse failure than refusing to draw a link, and is invisible to\neverything except a click. Development builds warn once per component, prop and\nscheme — once, because a hostile menu is a *list* of them and a warning per row\nis a warning nobody reads.\n\n**The decision is made after WHATWG normalization**, not on the raw string: the\nURL parser strips leading and trailing C0 controls and spaces, removes tab, LF\nand CR from anywhere in the input, and compares schemes case-insensitively. A\ncheck written as `startsWith('javascript:')` closes one of the four evasions the\ncorpus carries and admits the other three.\n\n**One escape hatch, at the provider.**\n\n```vue\n<DzProvider :url-policy=\"{ allow: (url, ctx) => ctx.allowedByDefault || url.startsWith('slack:') }\">\n<DzProvider :url-policy=\"{ allowedSchemes: ['https'] }\">\n```\n\n`allow` sees the library's own verdict, so widening is one line that cannot\naccidentally disable the base policy, and narrowing is the same line inverted.\nThere is deliberately **no per-component opt-out prop**: it would re-open the\nhole for exactly the consumers most likely to reach for it, one call site at a\ntime and with no central record. Nesting folds per field — a nested provider\nnarrowing `allowedSchemes` keeps an ancestor's `allow`.\n\n**Forgetting the provider gives you the strict policy, not an open one.** The\nkey has no `null` arm, unlike the sanitizer: a policy whose absent value is the\nsafe value cannot be switched off by forgetting something.\n\n`DzUrlPolicy`, `DzUrlPolicyOptions`, `DzUrlPolicyContext`, `DzUrlSink`,\n`DZ_URL_POLICY_KEY` and `DZ_ALLOWED_URL_SCHEMES` are exported from\n`@dzup-ui/contracts`, and `useDzUrlPolicy()` from `@dzup-ui/core`, so Pro and\nyour own components resolve one policy through the same symbols.\n`DZ_PROVIDER_DEFAULTS` gains a `urlPolicy` key. Recorded as ADR-20 amendment A7.\n\n**Also in this release: `securityBoundary` is a set.** A component can cross two\nboundaries and one does — `DzQRCode` encodes an arbitrary `value` into a\nmachine-readable code *and* renders a host-supplied `icon` as an `<img src>`.\nWith a single value it declared `payload` and its URL sink was invisible to the\ncapability matrix while being asserted in the corpus. `ComponentQuality\n.securityBoundary` and the `securityBoundary` field of `quality-matrix.json`,\n`capability-matrix.json` and `component-meta.json` are now arrays\n(`[\"url\",\"payload\"]`, `[\"none\"]`). If you read those artifacts, that is a shape\nchange.",
    "breaking": true,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
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
    "level": "patch",
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
  },
  {
    "packages": [
      "@dzup-ui/contracts"
    ],
    "level": "patch",
    "summary": "**The published `@dzup-ui/contracts` could not be loaded by Node's ESM resolver at all. It can now.** Any consumer whose bundler externalised it — every Nuxt app, on Nuxt 3 and Nuxt 4 alike — got a 500 on the first render.",
    "body": "**The published `@dzup-ui/contracts` could not be loaded by Node's ESM resolver at all. It can now.** Any consumer whose bundler externalised it — every Nuxt app, on Nuxt 3 and Nuxt 4 alike — got a 500 on the first render.\n\n`TASK-N5-03`. Five re-exports in the emitted `dist/index.js` were **extensionless**:\n\n```js\nexport { ANATOMY_PART_VOCABULARY } from './anatomy.types'   // ← Node: ERR_MODULE_NOT_FOUND\n```\n\n`anatomy.types.js` is right there next to it. Node's ESM resolver does not care:\nrelative specifiers in ESM must carry their extension, and `tsc` emits the\nspecifier the source wrote. `packages/contracts/src` wrote extensionless ones,\nso `tsc` emitted extensionless ones, and the file describes an import that\ncannot resolve.\n\nThe failure a consumer saw:\n\n```\nCannot find module '…/node_modules/@dzup-ui/contracts/dist/anatomy.types'\n  imported from '…/node_modules/@dzup-ui/contracts/dist/index.js'\n[nitro]  ├─ / (60ms)\n  │ └── [500] Server Error\nERROR  Exiting due to prerender errors.\n```\n\n**Why nothing caught it.** Every gate that loads this package resolves modules\nthe way a *bundler* does, not the way Node does: Vitest and Vite both resolve\nextensionless relative specifiers, and `tsconfig.base.json` sets\n`moduleResolution: \"bundler\"`, which tells TypeScript to assume the same. Two\nthousand unit tests, `typecheck:all`, `validate:exports`, `validate:dts` and\n`validate:externals` all pass against a file Node cannot open. The Nuxt consumer\nfixtures are the one lane in this repository that runs the published tarball\nthrough Node — and they were red, on both Nuxt majors, for exactly this reason.\n\nThe fix is the convention `@dzup-ui/testing`, `@dzup-ui/mcp` and\n`@dzup-ui/codemods` already use: relative specifiers carry `.js`, which\n`moduleResolution: \"bundler\"` resolves to the `.ts` source at compile time and\nNode resolves to the emitted `.js` at runtime. 27 specifiers across 7 files;\nno type, no export and no runtime value changed.\n\nA `patch` under `packages/contracts/VERSIONING.md`: nothing that worked stops\nworking, and something that never worked starts.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/mcp"
    ],
    "level": "minor",
    "summary": "**The MCP server checks its input, answers component questions from generated metadata, and lists the whole catalog.** Three behaviour changes, each recorded in its own handoff and released together (owner decision D186).",
    "body": "**The MCP server checks its input, answers component questions from generated metadata, and lists the whole catalog.** Three behaviour changes, each recorded in its own handoff and released together (owner decision D186).\n\n**It checks its input (TASK-N2-A1).**\n\n- `get_block`, `get_template` and `get_install_command` validate the item name as a registry id at the protocol boundary. Before, an unvalidated name was interpolated into the `shadcn add` command these tools print.\n- `get_install_command` checks that the item exists in the generated registry before printing a command. An unknown item returns `isError` instead of a command that cannot work.\n- Every tool enforces the `additionalProperties: false` its published JSON Schema already advertised. Unknown arguments are rejected instead of dropped.\n- The server reports the version from `package.json`. Before, it reported a `0.1.0` literal that predates the 0.2.0 release; `server.json` agrees with it.\n- New on `@dzup-ui/mcp/registry`: `isRegistryId`, `REGISTRY_ID_RE`, `REGISTRY_ID_MAX_LENGTH`. `docs/mcp-tool-surface.json` ships in the tarball.\n\nEach of these narrows a wrong-input path. A call that worked before still works.\n\n**It answers component questions from generated metadata (TASK-N2-A2).**\n\n- New tools `search_components`, `get_component_metadata` and `get_component_example` read `/r/component-meta.json`. It carries every component's props, events, slots and exposed members, extracted from source, joined to its family, risk tier, anatomy parts and evidence state.\n- `get_component_example` returns real Storybook story source, verbatim. A component with no story returns an explicit absence; the server never makes up example markup.\n- New: `COMPONENT_META_PATH`, `RegistryClient#componentMeta()` and `RegistryClient#componentMetaFor()` on `@dzup-ui/mcp/registry`; `searchComponents`, `getComponentMetadata` and `getComponentExample` on the root entry point.\n\n**It lists the whole catalog (TASK-N2-A3).** `list_components` and `get_component` return 43 components they used to omit. The `llms.txt` parser accepts component names that do not start with `Dz`. If you point the server at your own `llms.txt`, component names are matched by `[A-Z][A-Za-z0-9]*`.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/mcp"
    ],
    "level": "patch",
    "summary": "**A registry outage is no longer reported as a missing block or template.** `get_block` and `get_template` caught every error and answered `Block \"…\" not found`, so a DNS failure, a refused connection or a timeout told the client the item did not exist. They now return the not-found result only for a 404, a \"not found\" or a \"no such file\" error and re-throw anything else, so the server's error guard reports the real failure.",
    "body": "**A registry outage is no longer reported as a missing block or template.** `get_block` and `get_template` caught every error and answered `Block \"…\" not found`, so a DNS failure, a refused connection or a timeout told the client the item did not exist. They now return the not-found result only for a 404, a \"not found\" or a \"no such file\" error and re-throw anything else, so the server's error guard reports the real failure.\n\nA registry request that never answers no longer holds the MCP session forever: every HTTP read is aborted after 15 seconds.\n\n`search_components` no longer throws when a component in the metadata has no `props`, `slots`, `events` or `stories`; it counts the missing lists as empty.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/mcp"
    ],
    "level": "patch",
    "summary": "**The installed MCP server starts when a client runs it.** `npx -y @dzup-ui/mcp` — the config the README gives for Cursor, Claude Code, Windsurf and VS Code — exited 0 without serving anything, and every client reported the server as unavailable.",
    "body": "**The installed MCP server starts when a client runs it.** `npx -y @dzup-ui/mcp` — the config the README gives for Cursor, Claude Code, Windsurf and VS Code — exited 0 without serving anything, and every client reported the server as unavailable.\n\nThe guard that decides whether to start the stdio server compared the invoked file's **name** against `index.js`. `node_modules/.bin/dzup-ui-mcp` is a symlink, Node reports the path it was invoked through in `process.argv[1]`, and that path ends in `dzup-ui-mcp`, so the test was false for every invocation npm actually creates. `main()` never ran and the process exited in silence.\n\nThe entry check now resolves the invoked path with `realpathSync` and compares it against this module's own directory, so it is true for the installed bin, for `yarn dev`'s `tsx src/index.ts`, and for `dist/index.js` spawned directly, while remaining false for imports and for the test runner. `packages/mcp/src/direct-invocation.spec.ts` reproduces the `node_modules/.bin/<name>` layout on disk and fails against the old rule.\n\nNothing in the repo could see this: the package's own specs import the module, `scripts/e2e-smoke.mjs` spawned `dist/index.js` directly, and `yarn validate:mcp` only compared the `bin` entry against the `files` list. Both gaps are closed — the smoke lane now spawns the declared `bin` through the symlink npm installs, and `validate:mcp` gains an entry-point clause that runs that same invocation and requires an `initialize` answer.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/testing"
    ],
    "level": "minor",
    "summary": "**The security fixture corpus is now a published format, not just TypeScript to read: JSON Schema, a stricter checker, and a fixture for peers installed at the wrong version.**",
    "body": "**The security fixture corpus is now a published format, not just TypeScript to read: JSON Schema, a stricter checker, and a fixture for peers installed at the wrong version.**\n\n`@dzup-ui/testing/security-corpus` moves to **schema 1.1.0**. Until now the only\nway to learn the format was to read the source. A second repository had no schema\nto validate its fixture files against, so \"shared format\" was a promise nothing\nchecked.\n\n**New: JSON Schemas shipped beside the data.** `security-corpus/security-corpus.schema.json`\nand `security-corpus/peer-compatibility.schema.json` (draft-07) are in the tarball.\nTheir paths are exported as `SECURITY_CORPUS_SCHEMA_FILE` and\n`PEER_COMPATIBILITY_SCHEMA_FILE`. Point a fixture file's `$schema` at one and your\neditor validates it as you type.\n\n**Vocabulary additions:**\n\n- sinks `markdown` and `mermaid-svg`. They use the same spelling as the sanitizer\n  seam's `DzSanitizeSink` contexts, so Markdown or Mermaid source is never sent to\n  a raw-HTML sink, where it would prove nothing.\n- outcome `admitted`: the value reaches the sink live because a named policy\n  deliberately allows it (an internationalized hostname, a document under the size\n  ceiling). It is not a neutralization, and like `inert` it requires a rationale\n  longer than 80 characters.\n- `extensions[\"<reverse-dns namespace>\"]` on files and fixtures, for data that\n  only one consumer understands.\n\n**New: peer-compatibility fixtures.** `PeerCompatibilityFixture` describes a\ndeclared peer that is `absent`, `installed` or **`incompatible`**, and the\ndiagnostic a consumer must then see (`install` · `validate` · `build` · `runtime`,\nnaming the peer). Load them with `loadPeerCompatibilityFixtures()`; validate your\nown with `checkPeerCompatibilityFile()`. The first incompatible record is Vue 2.7\ninstalled against `vue ^3.5.0`.\n\n**Breaking (minor, under `packages/contracts/VERSIONING.md`):** `checkCorpusFile()`\nnow refuses some files it used to accept:\n\n- **Keys the format does not define.** Move consumer-specific data under\n  `extensions`.\n- **Ids that are not `{category}.{family}.{case}` in lowercase kebab segments.**\n- **An `inert` claim with a rationale of 80 characters or fewer.** The README\n  already stated this rule, but only this package's own spec enforced it.\n\n`SecuritySink` and `NeutralizationOutcome` also gain values, so an exhaustive\n`switch` over `fixture.required` needs the new cases. No existing fixture id,\npayload or required outcome changed. The 34 fixtures only gained `$schema` and\nthe new `schemaVersion`.",
    "breaking": true,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core",
      "@dzup-ui/tokens"
    ],
    "level": "minor",
    "summary": "**All six cascade layers are declared, so a consumer override wins by contract instead of by accident.**",
    "body": "**All six cascade layers are declared, so a consumer override wins by contract instead of by accident.**\n\nADR-19 §2 decided six layers — `@layer dz-reset, dz-tokens, dz-base,\ndz-components, dz-utilities, dz-overrides;` — and its Consequences promised that\n*\"consumers gain `dz-overrides` immediately as a documented place to write, with\nno library change required\"*. Three of the six existed nowhere. `dz-reset`,\n`dz-utilities` and `dz-overrides` were named by the ADR and emitted by nothing.\n\nThe promise still appeared to hold, which is the part worth explaining. An\n**unregistered** layer sorts after every registered one, so a consumer writing\n`@layer dz-overrides { … }` did win — not because the library said so, but\nbecause nothing had claimed the name. That would have stopped being true the\nfirst time the library registered any layer after `dz-components`, silently, in a\nconsumer's build, with no error anywhere.\n\n```css\n/* your stylesheet, imported after the dzup ones */\n@layer dz-overrides {\n  .dz-tab-close-btn { opacity: 0.5 }   /* wins. no !important. */\n}\n```\n\n**The statement ships in both stylesheets, and it has to.** CSS registers a layer\nat its *first* appearance. `tokens.css` used to open `@layer dz-tokens` without\ndeclaring the order, so if a bundler emitted it before `core.css`, `dz-tokens`\nregistered ahead of `dz-reset` and the shipped order depended on emit order.\nBoth sheets now carry the same six-slot statement; `base.css` remains the single\nstatement the docs evidence layer reads.\n\n**Box-model and document normalisation moved from `dz-base` into `dz-reset`,**\nwhich is where ADR-19's own table always put them. Nothing else in the library\nsets `box-sizing`, `margin` on `body`, or `scroll-behavior`, so no shipped\nselector changed weight — but a consumer now has the layer the ADR promised for\nresetting the reset.\n\n**One limit, measured and asserted rather than smoothed over.** A consumer sheet\nthat opens `@layer dz-overrides { … }` *before* the dzup stylesheets are\nevaluated registers that layer first; the library's statement then appends\n`dz-reset … dz-components` after it, `dz-components` wins, and the override\nsilently does nothing. Repeating the statement in both sheets does not fix it and\nnothing the library ships can — it cannot make a declaration appear before a\nsheet that loads earlier. Import the dzup stylesheets first, or use unlayered\nCSS, which beats every library layer in either order. `yarn test:e2e:layer-order`\nasserts all of this in chromium, firefox and webkit **against the packed\ntarballs**, because what a consumer receives is the built artifact and every step\nbetween source and artifact can drop a layer statement.\n\n**What can break, and what to do.** This is a `minor` because two placements\nof consumer CSS that used to win now lose. Both were measured in Chromium and\nFirefox against the packed tarballs of this release and of the one before it,\nin both stylesheet emit orders (`docs/qa/changeset-audit-2026-09-26/REPORT.md`):\n\n- **Rules you wrote inside `@layer dz-reset`.** The library used to leave that\n  name unregistered, so your `dz-reset` layer was appended last and beat\n  `dz-components` and `dz-tokens`. It is now the first, lowest layer, as ADR-19\n  §2 decided, and those rules lose. Move them to `@layer dz-overrides`, or make\n  them unlayered.\n- **Reset overrides inside `@layer dz-base`, in a sheet loaded before the\n  dzup stylesheets.** `box-sizing`, `body` margin and font, and\n  `scroll-behavior` moved from `dz-base` to `dz-reset`. A `dz-base` rule that\n  loads first now loses to them. Load the dzup stylesheets first, or move the\n  rule to `dz-overrides`.\n\nUnlayered CSS, `@layer dz-overrides`, `dz-components`, `dz-utilities` and a\nlayer of your own name behave exactly as before, in every position.\n\n**`data-state` is no longer typed by a union a shipped component violated.**\n`DataAttributes['data-state']` was typed `DataState`, a closed eight-value list;\n`DzButton` has emitted `idle | loading | disabled` — none of the three — since it\nshipped. ADR-19 §4 decided the widening and it had not been performed. It is now:\nthe attribute is `string`, and `DataState` stays as the *named vocabulary* to\ndraw from where it fits. If you were assigning `DataAttributes['data-state']`\ninto a `DataState`-typed variable, that no longer narrows on its own — read the\ncomponent's own `states` array, which is where the constraint moved.\n\nThe constraint is real rather than nominal because the check moved with it:\n`yarn validate:anatomy-parts` now reads every `data-state` literal a template can\nproduce and fails when the component's anatomy does not declare it. Measured at\nthe widening: zero violations across all 32 components that declare an anatomy.\n\n**Seven part names joined the shared vocabulary and seven were kept deliberately\noutside it.** `validate:anatomy-parts` had been reporting 14 shipped names beyond\nthe original 30 — the mechanism ADR-19 §3 specified, working. `clear`, `toggle`,\n`filename`, `language`, `body`, `row` and `cell` name jobs that recur and are now\nvocabulary. `copy-button`, `line-number`, `decrement`, `increment` and the three\n`options-*` names are recorded in the new `ANATOMY_PART_EXTENSIONS` export with a\nreason each, so a reviewed extension is distinguishable from a name nobody has\nlooked at. **Nothing was renamed** — renaming a shipped part name is breaking,\nwhich is exactly why the review happened now.\n\n**`ariaInvalid` gains its correct home on `BaseValidationProps`,** beside\n`invalid`, `error` and `required`. It is still declared on\n`BaseAccessibilityProps`, deprecated, so this release changes no component's prop\nsurface; removing it there is the breaking half and ships on its own.\n\n**A vendor sublayer registry, empty on purpose.** ADR-19 §3 keeps Reka internals\nout of the parts contract; nothing said the same about a `[data-reka-*]`\n*selector* inside `@layer dz-components`, which is the same bet on somebody\nelse's markup with none of the visibility.\n`packages/core/src/styles/vendor-registry.json` records selector, owner, reason\nand exit condition, and `yarn validate:vendor-sublayers` fails on an incomplete\nentry, on an entry whose rule was deleted, and on a vendor-shaped selector with\nno entry. It ships with **zero** entries, measured rather than assumed — the only\ncontact with Reka is a custom property the library reads — which is precisely why\nthe third rule is there.",
    "breaking": true,
    "deprecated": true
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**`DzStepper` now honours `ariaLabelledby` and `ariaDescribedby`, `DzInplace` now honours `ariaLabelledby`, and `DzOrderList`'s `dragHandleLabel` finally reaches the DOM.**",
    "body": "**`DzStepper` now honours `ariaLabelledby` and `ariaDescribedby`, `DzInplace` now honours `ariaLabelledby`, and `DzOrderList`'s `dragHandleLabel` finally reaches the DOM.**\n\n`TASK-N5-02`, the other half of the six C2 gaps in\n`docs/program-2026-08/form-controls-readiness-matrix.md`. Where the accompanying\n`minor` removes a prop that no element could carry, this ships the three that\ncould — plus one documented label that nothing rendered.\n\n**`DzStepper.ariaLabelledby` and `DzStepper.ariaDescribedby`** (C2). The root is\n`role=\"group\"`, which supports both, and `aria-describedby` is global to every\nrole. The root already carried `aria-label`, so accepting one form of a name\nwhile dropping the id-reference form of the same name *on the same element* was\nincoherent rather than principled. A wizard can now be named by its own visible\nheading instead of by a duplicated string.\n\nThe built-in `aria-label=\"Progress steps\"` fallback yields when `ariaLabelledby`\nis supplied. Two names on one element is not an error — `aria-labelledby` wins —\nbut shipping a fallback the browser is guaranteed to discard is noise in the DOM\nand in every snapshot of it. An explicit `ariaLabel` is still honoured alongside\n`ariaLabelledby`; only the default steps aside.\n\n**`DzInplace.ariaLabelledby`** (C2). The display trigger is a real `<button>`\nalready carrying `aria-label` and `aria-describedby`. Same argument, same\nelement, one line.\n\n**`DzOrderList.dragHandleLabel` renders.** It was documented as \"accessible label\nfor each row's drag handle\" and **no element carried it** — a gap this repository\nstated openly rather than fixed when the i18n work went in. It now reaches the\nDOM as the handle's `title`, and its default moved into the message catalog as\n`DzOrderList.dragHandle`, so it is translatable like every other string. The\nrendered default is byte-identical: `Drag to reorder`.\n\nIt is deliberately **not** an accessible name, and the prop's documentation now\nsays so. The handle stays `aria-hidden=\"true\"`: it is a pointer-only affordance\nwhose function is already reachable from the keyboard through the Move controls\nand the row's own space-to-grab, and naming it would fold \"Drag to reorder\" into\nthe accessible name of *every* row under `selectable`, where each row is\n`role=\"option\"` — a name-from-content role. Trading a dead prop for four polluted\nrow names is not an accessibility improvement. Correcting the prop's\ndocumentation to describe a tooltip is the honest end of it.\n\n**Why these are `patch` and the removals are `minor`.**\n`packages/contracts/VERSIONING.md` §3: correcting a rendered accessibility\nattribute ships as a patch even though it changes what the browser sees and can\nbreak a consumer's DOM snapshot — we would rather change an attribute than keep\na known accessibility failure until a range bump. Nothing here narrows a type.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/core"
    ],
    "level": "patch",
    "summary": "**Twenty-five more components declare their styling surface, and the dialog's close button stops sitting on the wrong side in Arabic.**",
    "body": "**Twenty-five more components declare their styling surface, and the dialog's close button stops sitting on the wrong side in Arabic.**\n\nThe ADR-19 styling contract — declared parts, declared states, a typed per-part\n`ui` override — reached five families this release. Every Tier B and above\ncomponent in `cards`, `feedback`, `layout`, `media` and `overlays` now says what\na consumer may address, so restyling those components no longer means writing a\ndescendant selector against a class name `tailwind-variants` is free to change.\n\n**New `data-part` and `ui` surfaces**\n\n| Family | Components | Parts you can now address |\n|---|---|---|\n| `cards` | `DzCard` (family), `DzImageCard`, `DzStatCard` | `root`, `header`, `body`, `footer`, `action`, `overlay`, `title`, `icon`, `description` |\n| `feedback` | `DzBlockUI`, `DzNotification`, `DzToast`, `DzSpinner` | `root`, `content`, `overlay`, `icon`, `title`, `description`, `action`, `close`, `indicator` |\n| `layout` | `DzPanel`, `DzToolbar`, `DzScrollArea`, `DzSplitter`/`DzResizable` (families), `DzCollapse` | `root`, `header`, `trigger`, `title`, `indicator`, `action`, `content`, `group`, `viewport`, `panel`, `separator` |\n| `media` | `DzCarousel` (family), `DzImageComparison`, `DzLightbox` | `root`, `viewport`, `content`, `item`, `list`, `item-indicator`, `action`, `panel`, `label`, `separator`, `control`, `overlay`, `close`, `description` |\n| `overlays` | `DzDropdownMenu`, `DzContextMenu`, `DzPopover`, `DzTooltip`, `DzSheet` (families), `DzConfirmDialog`, `DzPopconfirm`, `DzCommandPalette`, `DzTour` | `content`, `item`, `prefix`, `suffix`, `separator`, `indicator`, `overlay`, `title`, `description`, `close`, `icon`, `action`, `panel`, `header`, `body`, `footer`, `input`, `control`, `list`, `group`, `group-label`, `item-label`, `empty` |\n\n```vue\n<DzToast :toast=\"toast\" :ui=\"{ indicator: 'w-2', close: 'opacity-100' }\" />\n<DzPanel collapsible header=\"Filters\" :ui=\"{ indicator: 'text-[var(--dz-primary)]' }\" />\n<DzCarousel :ui=\"{ viewport: 'rounded-xl' }\" />\n<DzDropdownMenuItem :ui=\"{ suffix: 'opacity-60' }\">Rename</DzDropdownMenuItem>\n```\n\n**One real fix, not just a declaration: RTL insets.**\n\n`validate:rtl` could not see a physical `left-…` or `right-…` inset at all — the\none clause meant to catch them named `inset-l-` / `inset-r-`, which Tailwind 4\ndoes not generate. With the gate widened, five components turned out to pin a\ncontrol to a physical edge while declaring that they mirror with the document:\n\n- `DzDialog`'s close button and `DzToast`'s close button and tone stripe,\n- `DzNotification`'s dismiss button,\n- `DzLightbox`'s previous / next buttons, close button and counter.\n\nAll are now logical (`inset-s-` / `inset-e-`). **In a left-to-right document\nnothing moves by a pixel.** In a right-to-left one, the close control is finally\non the edge the reader finishes at.\n\nWhere a physical side is the point — `DzFab`'s and `DzSpeedDial`'s\n`position=\"bottom-right\"`, `DzToast`'s viewport corners, `DzSheet`'s `side` —\nthe geometry is unchanged and now carries the `rtl-physical-ok` marker with the\nreason written at the line.\n\n**Nothing is removed and every existing override keeps working.** `ui` is a new\noptional prop; `class` lands exactly where it always did; no part was renamed.",
    "breaking": false,
    "deprecated": false
  },
  {
    "packages": [
      "@dzup-ui/contracts",
      "@dzup-ui/core",
      "@dzup-ui/testing"
    ],
    "level": "patch",
    "summary": "**Your `class` beats `ui`, `asChild` has a published allowlist, and every component that puts your attributes somewhere unexpected now says so.**",
    "body": "**Your `class` beats `ui`, `asChild` has a published allowlist, and every component that puts your attributes somewhere unexpected now says so.**\n\nThree composition rules existed only as prose. Nothing checked them, and one of\nthe three had shipped in two contradictory versions at once.\n\n**The `ui` merge order is now decided and published.** ADR-19 §5 said `class`\nand `ui` \"merge through the same `cn()`\" but never said in which order — and\n`cn()` is tailwind-merge, so the order *is* the answer to which one takes\neffect. Measured across the catalogue, 5 components passed `ui` first and 74\nmerge sites passed `class` first: the same two props produced opposite results\non `DzButton` and `DzCard`, and nothing said which was right.\n\nThe ratified order is **recipe → `ui` → your `class`**, exported as\n`UI_MERGE_ORDER`. Your `class` is merged last and wins a conflict. That is what\nADR-19 §5 promises (\"`class` keeps its meaning … nothing about existing usage\nchanges\") and it is the rule that survives composition: when an application\nwraps `DzButton` in its own `AppButton` and sets `ui` for a house style,\n`<AppButton class=\"w-full\">` still works instead of sending that author to\n`!important`. Every component documentation page now states the order.\n\nThe components that merge the other way are recorded with a downward-only\nceiling rather than quietly fixed — re-ordering a merge changes rendered output,\nso it is sequenced separately. A **new** component that merges the wrong way\nfails the contract lane immediately.\n\n**`asChild` has an allowlist.** `asChild` makes *your* element the rendered\nnode, so every promise about a root — the `data-part`, the recipe class, the\nfocus ring — stops applying there. `AS_CHILD_ALLOWLIST` now records the eight\ncomponents that do it, which element kinds each accepts, what each guarantees\n(semantics, attributes, ref, disabled, keyboard) and why it is allowed. A\ncomponent cannot add itself: the list lives in `@dzup-ui/contracts`, and source\nand list are checked against each other in both directions.\n\nIt also records one defect rather than hiding it: **`DzButton`'s `asChild` prop\nis declared and does nothing.** The template never reads it. Use `as`, `href` or\n`to` for polymorphism — those work. The prop is now marked `unimplemented` so\nthe gap is counted rather than discovered by a reader of the types.\n\n**Anatomies can declare where your attributes land.** The new optional\n`fallthrough` field answers \"where does my `class` actually go?\" for the two\nshapes where the answer is not \"the one root\":\n\n- **Multi-root components** — Vue cannot choose a target for a fragment, so the\n  component does. `DzKnob`, `DzSidebar`, `DzLightbox`, `DzPopconfirm`,\n  `DzTableRow`, `DzToastViewport` and `DzFieldArray` now each say which node\n  they chose. `DzFieldArray` declares `target: 'none'`: it renders no element of\n  its own, so a `class` you pass reaches nothing — a fact worth learning from\n  the contract rather than from an empty DOM.\n- **Controls that re-point `class` inward** — on `DzSlider`, `DzRangeSlider`,\n  `DzRating`, `DzDatePicker`, `DzDateRangePicker` and `DzMention` your `class`\n  lands on an inner part, so a width you pass applies there rather than to the\n  whole component. Nothing moved; the behaviour is unchanged and now documented.\n\n`DzPersonaSelector` additionally declares `delegatesTo: 'DzCombobox'` — it\nrenders no element of its own, and its root *is* a combobox.\n\n**New testing helpers.** `@dzup-ui/testing` gains `expectUiMergeOrder`,\n`expectFallthrough`, `expectAsChild`, `expectHandlerComposition` and\n`expectExternalWrite`, alongside `expectAnatomy` and `expectKeyboardContract`.\n\n`expectExternalWrite` is deliberately shaped as a *trace* rather than a\nsnapshot: it requires a reading taken after a user edit, because the defect it\nexists to catch only appears after one.",
    "breaking": false,
    "deprecated": false
  }
]

export const HIGHLIGHTS: Highlight[] = [
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "breaking",
    "section": "@dzup-ui/contracts, @dzup-ui/core",
    "text": "**Counts pluralise by the locale's rules, the message catalog can finally be imported, and locale packs have a format and a gate.**"
  },
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
    "kind": "breaking",
    "section": "@dzup-ui/nuxt",
    "text": "**`@dzup-ui/nuxt` now depends on `@nuxt/kit@4.5.2` instead of `3.14.0`.** If you install this module, `@nuxt/kit` 4 arrives in your dependency tree — including on a Nuxt 3 project."
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "breaking",
    "section": "@dzup-ui/contracts, @dzup-ui/core",
    "text": "**Six navigation components stop rendering a hostile URL as a live link.**"
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "breaking",
    "section": "@dzup-ui/testing",
    "text": "**The security fixture corpus is now a published format, not just TypeScript to read: JSON Schema, a stricter checker, and a fixture for peers installed at the wrong version.**"
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "breaking",
    "section": "@dzup-ui/contracts, @dzup-ui/core, @dzup-ui/tokens",
    "text": "**All six cascade layers are declared, so a consumer override wins by contract instead of by accident.**"
  },
  {
    "source": "changeset",
    "date": "Unreleased",
    "kind": "deprecated",
    "section": "@dzup-ui/core",
    "text": "**A grid child can now say how many columns it spans, and `DzStack` accepts `row` and `column`.**"
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
