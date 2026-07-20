import type { CanonicalTone } from '@dzup-ui/contracts'
import type { Component } from 'vue'
/**
 * File Manager — co-located sample data (docs/templates.md §6.4).
 *
 * A believable cloud-drive: a folder hierarchy for the DzTree sidebar
 * (`FOLDER_TREE`), the entries shown in the main DzDataView per folder
 * (`CONTENTS`), and a flat index (`FOLDER_INDEX`) the page walks to build the
 * breadcrumb path. Pure data — no clock reads, no component state — so the
 * template stays self-contained and copy-pasteable.
 */
import {
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
} from 'lucide-vue-next'

/** A folder node for the sidebar DzTree (structurally a `TreeNode`). */
export interface FolderNode {
  key: string
  label: string
  children?: FolderNode[]
}

/** One row in the main file area — a folder to open or a file to act on. */
export interface FileEntry {
  /** Unique within its folder — the DzDataView `data-key`. */
  id: string
  name: string
  kind: 'folder' | 'file'
  /** For folders: the FOLDER_TREE key to navigate into. */
  target?: string
  /** Display type, e.g. 'PDF', 'Image', 'Folder'. */
  type: string
  /** Lucide glyph for the entry's type. */
  icon: Component
  /** Decorative tone for the type badge. */
  tone: CanonicalTone
  /** Human size ('2.4 MB') for files, item count ('6 items') for folders. */
  size: string
  /** Last-modified label, e.g. 'Jun 22'. */
  modified: string
  /** Index signature so `FileEntry` satisfies DzDataView's `T extends Record<string, unknown>`. */
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Folder hierarchy (sidebar tree)
// ---------------------------------------------------------------------------

export const FOLDER_TREE: FolderNode[] = [
  {
    key: 'root',
    label: 'My Drive',
    children: [
      {
        key: 'documents',
        label: 'Documents',
        children: [
          { key: 'contracts', label: 'Contracts' },
          { key: 'invoices', label: 'Invoices' },
        ],
      },
      {
        key: 'projects',
        label: 'Projects',
        children: [
          { key: 'northwind', label: 'Northwind' },
          { key: 'atlas', label: 'Atlas' },
        ],
      },
      {
        key: 'media',
        label: 'Media',
        children: [
          { key: 'images', label: 'Images' },
          { key: 'video', label: 'Video' },
        ],
      },
      { key: 'shared', label: 'Shared with me' },
    ],
  },
]

/** A folder's resolved label and parent key (root folders have `parent: null`). */
export interface FolderInfo {
  label: string
  parent: string | null
}

/**
 * Flat lookup of every folder → its label + parent, built once by walking
 * `FOLDER_TREE`. The page reads this to resolve a breadcrumb path from any key
 * without re-walking the tree on every render.
 */
export const FOLDER_INDEX: Record<string, FolderInfo> = {}

function indexTree(nodes: FolderNode[], parent: string | null): void {
  for (const node of nodes) {
    FOLDER_INDEX[node.key] = { label: node.label, parent }
    if (node.children)
      indexTree(node.children, node.key)
  }
}
indexTree(FOLDER_TREE, null)

// ---------------------------------------------------------------------------
// File-type catalogue — maps a kind to its badge + glyph
// ---------------------------------------------------------------------------

const FILE_TYPES = {
  pdf: { type: 'PDF', icon: FileText, tone: 'danger' as const },
  doc: { type: 'Document', icon: FileText, tone: 'info' as const },
  sheet: { type: 'Spreadsheet', icon: FileSpreadsheet, tone: 'success' as const },
  image: { type: 'Image', icon: FileImage, tone: 'primary' as const },
  video: { type: 'Video', icon: FileVideo, tone: 'warning' as const },
  code: { type: 'Code', icon: FileCode, tone: 'info' as const },
  archive: { type: 'Archive', icon: FileArchive, tone: 'neutral' as const },
  text: { type: 'Text', icon: File, tone: 'neutral' as const },
} satisfies Record<string, { type: string, icon: Component, tone: CanonicalTone }>

/** Build a file entry from a known type. */
function file(name: string, kind: keyof typeof FILE_TYPES, size: string, modified: string): FileEntry {
  const meta = FILE_TYPES[kind]
  return { id: name, name, kind: 'file', type: meta.type, icon: meta.icon, tone: meta.tone, size, modified }
}

/** Build a folder entry that navigates into `target` when opened. */
function dir(name: string, target: string, count: number, modified: string): FileEntry {
  return {
    id: target,
    name,
    kind: 'folder',
    target,
    type: 'Folder',
    icon: Folder,
    tone: 'neutral',
    size: `${count} items`,
    modified,
  }
}

// ---------------------------------------------------------------------------
// Folder contents — keyed by FOLDER_TREE key
// ---------------------------------------------------------------------------

export const CONTENTS: Record<string, FileEntry[]> = {
  root: [
    dir('Documents', 'documents', 5, 'Jun 21'),
    dir('Projects', 'projects', 4, 'Jun 23'),
    dir('Media', 'media', 4, 'Jun 18'),
    dir('Shared with me', 'shared', 2, 'Jun 12'),
    file('Q3 Strategy.pdf', 'pdf', '2.4 MB', 'Jun 22'),
    file('Team Photo.jpg', 'image', '5.1 MB', 'Jun 20'),
    file('Roadmap.xlsx', 'sheet', '684 KB', 'Jun 19'),
    file('Intro.mp4', 'video', '58 MB', 'Jun 15'),
  ],
  documents: [
    dir('Contracts', 'contracts', 3, 'Jun 14'),
    dir('Invoices', 'invoices', 2, 'Jun 09'),
    file('NDA Template.docx', 'doc', '46 KB', 'Jun 17'),
    file('Meeting Notes.md', 'text', '12 KB', 'Jun 21'),
    file('Budget 2026.xlsx', 'sheet', '312 KB', 'Jun 11'),
  ],
  contracts: [
    file('Acme MSA.pdf', 'pdf', '1.1 MB', 'May 28'),
    file('Northwind SOW.pdf', 'pdf', '820 KB', 'Jun 03'),
    file('Vendor Agreement.pdf', 'pdf', '640 KB', 'Jun 14'),
  ],
  invoices: [
    file('INV-1043.pdf', 'pdf', '88 KB', 'Jun 01'),
    file('INV-1044.pdf', 'pdf', '92 KB', 'Jun 09'),
  ],
  projects: [
    dir('Northwind', 'northwind', 3, 'Jun 23'),
    dir('Atlas', 'atlas', 2, 'Jun 16'),
    file('Backlog.csv', 'sheet', '54 KB', 'Jun 22'),
    file('specs.zip', 'archive', '8.7 MB', 'Jun 10'),
  ],
  northwind: [
    file('design-system.fig', 'code', '14 MB', 'Jun 23'),
    file('api-client.ts', 'code', '36 KB', 'Jun 20'),
    file('README.md', 'text', '9 KB', 'Jun 18'),
  ],
  atlas: [
    file('wireframes.png', 'image', '3.3 MB', 'Jun 16'),
    file('research.pdf', 'pdf', '1.9 MB', 'Jun 05'),
  ],
  media: [
    dir('Images', 'images', 4, 'Jun 18'),
    dir('Video', 'video', 2, 'Jun 07'),
    file('cover.png', 'image', '2.1 MB', 'Jun 18'),
    file('promo.gif', 'image', '6.4 MB', 'Jun 02'),
  ],
  images: [
    file('hero.jpg', 'image', '4.2 MB', 'Jun 18'),
    file('logo.svg', 'image', '18 KB', 'Jun 04'),
    file('avatar-01.png', 'image', '240 KB', 'May 30'),
    file('avatar-02.png', 'image', '236 KB', 'May 30'),
  ],
  video: [
    file('demo.mp4', 'video', '124 MB', 'Jun 07'),
    file('tutorial.mov', 'video', '212 MB', 'May 22'),
  ],
  shared: [
    file('Shared Plan.pdf', 'pdf', '760 KB', 'Jun 12'),
    file('guests.csv', 'sheet', '28 KB', 'Jun 08'),
  ],
}

/** Keys the sidebar tree shows expanded on first paint. */
export const DEFAULT_EXPANDED = ['root', 'documents', 'projects', 'media']

/** Storage meter copy for the sidebar footer. */
export const STORAGE = { usedLabel: '68.4 GB', totalLabel: '100 GB', percent: 68 }

/** Right-click / row actions offered on an entry. */
export const FILE_ACTIONS = ['Open', 'Rename', 'Move to…', 'Download', 'Delete'] as const
