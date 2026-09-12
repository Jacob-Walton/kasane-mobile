/* What Kasane react exports, and whether the mobile halves have it.

     node scripts/parity.mjs ../kurobeni          what is left
     node scripts/parity.mjs ../kurobeni --list   every export, one a line

   The list of exports is read from Kasane itself, so this cannot drift by being forgotten. What is
   deliberately not ported is named in SKIP below with the reason. */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kasane = resolve(process.argv[2] ?? join(here, '..', '..', 'kurobeni'));
const list = process.argv.includes('--list');

/* ---- what Kasane exports --------------------------------------------------------------------- */

const index = readFileSync(join(kasane, 'src', 'react', 'index.ts'), 'utf8');

// export { A, B as C } from './x'  and  export { A };  Types are not parts, so they are dropped.
const exported = new Set();
for (const block of index.matchAll(/export\s+(?:\*\s+as\s+(\w+)|\{([^}]*)\})/g)) {
  if (block[1]) {
    exported.add(block[1]);
    continue;
  }
  for (const piece of block[2].split(',')) {
    const name = piece.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop();
    if (!name || /^type$/.test(name)) continue;
    if (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name)) exported.add(name);
  }
}
// a type-only export reads as a part here; the ones that are only types are dropped by name
for (const t of ['Tone', 'Theme', 'ScaleRun', 'ScalePart', 'LogKind', 'DiffKind', 'ButtonVariant',
  'ButtonSize', 'StatusKind', 'ControlWiring', 'SelectOption', 'Priority', 'TabItem', 'ToastKind',
  'NavSection', 'TextSize', 'ColumnSeries', 'MenuItem', 'LinkComponent', 'Anchor', 'NavItem',
  'HeadingLevel', 'SitemapType', 'ErrorBoundaryProps']) {
  exported.delete(t);
}

/* ---- what a phone has no use for ------------------------------------------------------------- */

const SKIP = {
  SkipLink: 'a phone has no keyboard to skip with',
  ThemeSwitch: 'the OS owns the theme; useColorScheme reads it',
  useTheme: 'ours reads the OS scheme instead of a stored choice',
  THEME_KEY: 'nothing is stored: the OS is asked',
  themeScript: 'there is no document head to run it in',
  Toc: 'a phone scrolls one column; there is nowhere to put a rail of links',
  Rail: 'the same, and a phone has one column',
  Split: 'one column',
  Columns: 'one column',
  App: 'an application shell with a side nav is a desktop shape',
  AppSide: 'the same',
  AppMain: 'the same',
  AppTop: 'the same',
  Nav: 'a side nav is a desktop shape; a phone navigates by pushing',
  NavGroup: 'the same',
  Kbd: 'no keyboard to name a key on',
  Key: 'the same',
  Menu: 'the platform sheet is the right shape for this, and it is next',
  Combobox: 'wants a hardware keyboard to be worth its complexity',
  Invert: 'a CSS filter trick with no native equivalent',
  VisuallyHidden: 'accessibilityElementsHidden and accessibilityLabel do this',
  HiddenLabel: 'the same',
  Kasane: 'the document wrapper; Expo has no document',
  COPY: 'the default strings; every part here takes its words from the screen',
  Auth: 'a signed-in or signed-out slot in a desktop shell',
  useTypedConfirm: 'confirming by typing a name wants a keyboard; a phone asks in a Dialog',
  ExpoRoot: 'not a Kasane export',
};

/* ---- what the mobile halves have ------------------------------------------------------------- */

const kit = join(here, '..', 'expo', 'kasane');
const ts = readdirSync(kit)
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => readFileSync(join(kit, f), 'utf8'))
  .join('\n')
  + readFileSync(join(here, '..', 'expo', 'markdown.tsx'), 'utf8')
  + readFileSync(join(here, '..', 'expo', 'icons.tsx'), 'utf8');
const swift = readFileSync(join(here, '..', 'swift', 'Sources', 'KasaneUI', 'Parts.swift'), 'utf8')
  + readFileSync(join(here, '..', 'swift', 'Sources', 'KasaneUI', 'Theme.swift'), 'utf8');

/* a name can arrive under a different one: Kasane's Text is ours, its Tabs is our Tray, and so on.
   The right-hand side is what to look for in the mobile source. */
const ALIAS = {
  Tabs: 'Tabs',
  Prose: 'Markdown',
  Article: 'Markdown',
  Pre: 'Markdown',
  Code: 'Markdown',
  // a band, a col and a main are the screen padding here: a phone has one column
  Band: 'Collection',
  Col: 'Collection',
  Main: 'Collection',
  // the cells are the Table's own business: it takes columns and a cell function
  Th: 'Table',
  Td: 'Table',
  ListingTable: 'Listing',
  // a link is a press with a route: there is no anchor to be
  ButtonLink: 'Button',
  LinkButton: 'LinkButton',
  // the mark inside a field is the field's icon prop
  InputIcon: 'Input',
};

const has = (where, name) => {
  const look = ALIAS[name] ?? name;
  return new RegExp(`\\b(?:function|struct|const|let)\\s+${look}\\b`).test(where);
};

const rows = [...exported].sort().map((name) => ({
  name,
  skip: SKIP[name],
  ts: has(ts, name),
  swift: has(swift, name),
}));

const live = rows.filter((r) => !r.skip);
const done = live.filter((r) => r.ts && r.swift);
const part = live.filter((r) => (r.ts || r.swift) && !(r.ts && r.swift));
const todo = live.filter((r) => !r.ts && !r.swift);

if (list) {
  for (const r of rows) {
    const mark = r.skip ? 'skip' : r.ts && r.swift ? 'both' : r.ts ? 'expo' : r.swift ? 'swft' : '  . ';
    console.log(`${mark}  ${r.name}${r.skip ? `  (${r.skip})` : ''}`);
  }
  console.log('');
}

console.log(`Kasane react exports ${rows.length} parts.`);
console.log(`  ${rows.length - live.length} have no use on a phone, each named in SKIP`);
console.log(`  ${done.length} of ${live.length} are in both halves`);
if (part.length) {
  console.log(`  ${part.length} in one half only: ${part.map((r) => `${r.name} (${r.ts ? 'expo' : 'swift'})`).join(', ')}`);
}
if (todo.length) console.log(`  ${todo.length} left: ${todo.map((r) => r.name).join(', ')}`);
