/* Every state Kasane's CSS declares, and whether the mobile part declares the same values.

     node scripts/states.mjs ../kurobeni           what is missing
     node scripts/states.mjs ../kurobeni --list    every state, one a line

   Reading the rules out of the CSS is the point: a state added to Kasane shows up here as missing
   rather than being forgotten. What a phone genuinely cannot carry is in DEAD below, with why.

   The check is on the values, not on a name: a rule that says background bg-raised has to find
   bg.raised in the part that implements it. That is what catches a press wearing the hover colour,
   which is the way this drifted the first time. */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kasane = resolve(process.argv[2] ?? join(here, '..', '..', 'kurobeni'));
const list = process.argv.includes('--list');

/* ---- every stateful rule in the CSS ------------------------------------------------------------ */

function cssFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const at = join(dir, name);
    if (statSync(at).isDirectory()) return cssFiles(at);
    return name.endsWith('.css') && !name.includes('.generated.') ? [at] : [];
  });
}

const STATE =
  /:hover|:active|:focus-visible|:checked|:indeterminate|::placeholder|\[disabled\]|\[aria-current\]|\[aria-selected='true'\]|\[aria-pressed='true'\]|\bkb-is-invalid\b/;

/** the mobile name for a CSS custom property: --kb-fg-on-fill is fg.onFill */
const GROUPS = ['fg', 'bg', 'border', 'accent', 'fill', 'status', 'series', 'focus'];
function tokenOf(name) {
  const bare = name.replace(/^--kb-/, '');
  const group = GROUPS.find((g) => bare === g || bare.startsWith(`${g}-`));
  if (!group) return null;
  const rest = bare.slice(group.length + 1) || 'default';
  return `${group}.${rest.replace(/-(\w)/g, (_, c) => c.toUpperCase())}`;
}

const rules = [];
for (const file of cssFiles(join(kasane, 'src', 'css'))) {
  const text = readFileSync(file, 'utf8');
  // one rule: everything up to the brace, then the block. Nested at-rules are skipped by the guard.
  for (const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    const body = m[2];
    if (!selector.startsWith('.kb-') && !selector.includes('.kb-')) continue;
    if (!STATE.test(selector)) continue;
    const base = /\.kb-[a-z0-9-]+/.exec(selector)?.[0];
    if (!base) continue;
    const tokens = [...body.matchAll(/var\((--kb-[a-z0-9-]+)/g)]
      .map((v) => tokenOf(v[1]))
      .filter(Boolean);
    rules.push({ file, selector: selector.replace(/\s+/g, ' '), base, tokens });
  }
}

/* ---- what a phone cannot carry, and why -------------------------------------------------------- */

const DEAD = [
  [/:hover/, 'there is no pointer to hover with. A finger arrives already pressing, so the press wears the :active rule'],
  [/\.kb-skip/, 'a skip link wants a keyboard and a document to skip inside'],
  [/\.kb-nav__item|\.kb-app|\.kb-toc/, 'a side nav and a table of contents are desktop shapes; a phone has one column'],
  [/\.kb-dd__trigger|\.kb-dd__list/, 'the custom dropdown is our Select, which is checked under .kb-select'],
  [/\.kb-log__line/, 'a log line is read, not pressed'],
  [/\.kb-footer__row|\.kb-source__gutter|\.kb-source__nums|\.kb-item__title|\.kb-listing__line/, 'a link inside running text: the whole row is the target here'],
  [/\.kb-toast button/, 'a toast here times out; it carries no dismiss'],
  [/\.kb-group >/, 'the group lifts the focused piece over its neighbour, which needs a z-index and one row'],
  [/\.kb-key\b|\.kb-kbd\b/, 'no keyboard to name a key on'],
  [/\.kb-menu__item/, 'the menu is a sheet here, and its rows are checked under .kb-drawer'],
];

/* ---- which mobile file carries which class ----------------------------------------------------- */

const OWNER = {
  '.kb-btn': 'kasane/controls.tsx',
  '.kb-btn-link': 'kasane/controls.tsx',
  '.kb-tray': 'kasane/controls.tsx',
  '.kb-pages': 'kasane/controls.tsx',
  '.kb-crumbs': 'kasane/controls.tsx',
  '.kb-input': 'kasane/form.tsx',
  '.kb-textarea': 'kasane/form.tsx',
  '.kb-select': 'kasane/form.tsx',
  '.kb-choice': 'kasane/form.tsx',
  '.kb-switch': 'kasane/form.tsx',
  '.kb-field': 'kasane/form.tsx',
  '.kb-listing__row': 'kasane/listing.tsx',
  '.kb-table': 'kasane/table.tsx',
  '.kb-tile': 'kasane/blocks.tsx',
  '.kb-stat': 'kasane/blocks.tsx',
  '.kb-btn--primary': 'kasane/controls.tsx',
  '.kb-btn--accent': 'kasane/controls.tsx',
  '.kb-btn--danger': 'kasane/controls.tsx',
  '.kb-tabs': 'kasane/controls.tsx',
  '.kb-bar': 'kasane/chrome.tsx',
  '.kb-bar__nav': 'kasane/chrome.tsx',
  '.kb-bar__brand': 'kasane/chrome.tsx',
  '.kb-disclosure__summary': 'kasane/feedback.tsx',
  '.kb-drawer': 'kasane/feedback.tsx',
};

const read = (rel) => readFileSync(join(here, '..', 'expo', rel), 'utf8');
const sources = new Map();
for (const rel of new Set(Object.values(OWNER))) sources.set(rel, read(rel));

/* ---- the check --------------------------------------------------------------------------------- */

const dead = [];
const missing = [];
const unowned = [];
let checked = 0;

for (const rule of rules) {
  const why = DEAD.find(([pattern]) => pattern.test(rule.selector));
  if (why) {
    dead.push({ ...rule, why: why[1] });
    continue;
  }
  const owner = OWNER[rule.base];
  if (!owner) {
    unowned.push(rule);
    continue;
  }
  const source = sources.get(owner);
  const absent = [...new Set(rule.tokens)].filter((token) => !source.includes(token));
  checked++;
  if (absent.length) missing.push({ ...rule, owner, absent });
}

if (list) {
  for (const rule of rules) {
    const why = DEAD.find(([pattern]) => pattern.test(rule.selector));
    const bad = missing.find((one) => one.selector === rule.selector);
    const mark = why ? 'dead' : bad ? 'MISS' : OWNER[rule.base] ? ' ok ' : ' ?  ';
    console.log(`${mark}  ${rule.selector}${rule.tokens.length ? `  [${rule.tokens.join(' ')}]` : ''}`);
  }
  console.log('');
}

console.log(`${rules.length} stateful rules in Kasane's CSS.`);
console.log(`  ${dead.length} a phone cannot carry, each with a reason in DEAD`);
console.log(`  ${checked} checked against the part that implements them`);
if (unowned.length) {
  const names = [...new Set(unowned.map((one) => one.base))].sort();
  console.log(`  ${unowned.length} on ${names.length} classes with no owner: ${names.join(' ')}`);
}
for (const one of missing) {
  console.log(`  MISSING  ${one.selector}`);
  console.log(`           ${one.owner} never names ${one.absent.join(', ')}`);
}
process.exit(missing.length ? 1 : 0);
