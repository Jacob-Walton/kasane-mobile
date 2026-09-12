/* Reads Kasane's DTCG source and writes the mobile token files.

   Source: a Kasane checkout. The CDN does not serve the token JSON, so the path is given:
     node tokens/generate.mjs ../kurobeni

   Output:
     tokens/KasaneTokens.swift
     tokens/theme.ts

   What differs from the web, and why, is written in deviations.json next to this file. */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kasane = resolve(process.argv[2] ?? join(here, '..', '..', 'kurobeni'));

const read = (file) => JSON.parse(readFileSync(join(kasane, 'tokens', file), 'utf8'));
const light = read('kasane.tokens.json');
const dark = read('kasane.dark.tokens.json');

/* ---- resolving ------------------------------------------------------------------------------- */

const leaf = (node) => node?.$value ?? node?.value;

/** every token as a dotted path, so an alias can be looked up */
function flatten(tree, prefix = [], out = new Map()) {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    if (node && typeof node === 'object' && leaf(node) === undefined) {
      flatten(node, [...prefix, key], out);
    } else if (node && typeof node === 'object') {
      out.set([...prefix, key].join('.'), leaf(node));
    }
  }
  return out;
}

const base = flatten(light);
const over = flatten(dark);

/** {color.paper.300} follows the chain until it reaches a value */
function value(raw, scope, seen = 0) {
  if (typeof raw !== 'string' || seen > 8) return raw;
  const alias = /^\{([^}]+)\}$/.exec(raw);
  if (!alias) return raw;
  const key = alias[1];
  const next = scope.has(key) ? scope.get(key) : base.get(key);
  return value(next, scope, seen + 1);
}

/** one group, resolved, for a theme */
function group(name, scope) {
  const out = {};
  for (const [key, raw] of base) {
    if (!key.startsWith(`${name}.`)) continue;
    const short = key.slice(name.length + 1);
    const raw2 = scope.has(key) ? scope.get(key) : raw;
    out[short] = value(raw2, scope);
  }
  return out;
}

const COLOURS = ['fg', 'bg', 'border', 'accent', 'fill', 'status', 'series', 'focus'];

const themes = {
  light: Object.fromEntries(COLOURS.map((g) => [g, group(g, new Map())])),
  dark: Object.fromEntries(COLOURS.map((g) => [g, group(g, over)])),
};

/* ---- the numbers ----------------------------------------------------------------------------- */

const px = (v) => Number(String(v).replace('px', ''));
const rem = (v) => (String(v).endsWith('rem') ? Number(String(v).replace('rem', '')) * 16 : px(v));

const space = Object.fromEntries(
  [...base].filter(([k]) => k.startsWith('space.')).map(([k, v]) => [k.slice(6), px(v)]),
);

/* data-kb-density=compact, which the web turns on itself under 768. A phone is never the other
   case, so it is the ladder the app spends. Every value is an existing rung. */
const REMAP = { 16: 12, 24: 16, 32: 24, 48: 32, 64: 48, 96: 64 };
const compact = Object.fromEntries(
  Object.entries(space).map(([k, v]) => [k, REMAP[k] ?? v]),
);

/* the same three heights as the web. Kasane's rule is that density never reaches the controls,
   and 32 already clears WCAG 2.5.8, so a phone has no reason to grow them. */
const control = { sm: 32, md: 40, lg: 48 };

const radius = px(base.get('radius.block'));

/* the ladder as base sizes. The platform multiplies these by the user's text scale, so the app
   never asserts a final pixel size. */
const type = {};
for (const [key, raw] of base) {
  const match = /^type\.(\d+)\.(size|leading|tracking)$/.exec(key);
  if (!match) continue;
  const [, step, part] = match;
  type[step] ??= {};
  type[step][part] = part === 'size' ? rem(raw) : Number(String(raw).replace('em', '')) || 0;
}

/* motion: one duration and one curve, the same two the CSS transitions name. A press that snaps
   back instantly is the difference between a control and a picture of one. */
const motion = {
  duration: Number(String(base.get('motion.duration') ?? '120ms').replace('ms', '')),
  ease: String(base.get('motion.ease') ?? 'cubic-bezier(0.2, 0, 0, 1)'),
};
const bezier = /cubic-bezier\(([^)]+)\)/.exec(motion.ease);
motion.curve = bezier ? bezier[1].split(',').map((n) => Number(n.trim())) : [0.2, 0, 0, 1];

/* a CSS box-shadow does not port: both platforms take the parts separately. The colour carries the
   alpha, so it is split out of the rgba and handed over as an opacity. */
const shadow = {};
for (const [key, raw] of base) {
  const match = /^shadow\.(\w+)$/.exec(key);
  if (!match) continue;
  const n = String.raw`(-?[\d.]+)(?:px)?`;
  const parts = new RegExp(`^${n}\\s+${n}\\s+${n}\\s+rgba\\(([^)]+)\\)$`).exec(String(raw));
  if (!parts) throw new Error(`shadow ${key} is not x y blur rgba(): ${raw}`);
  const [r, g, b, a] = parts[4].split(',').map((n) => Number(n.trim()));
  shadow[match[1]] = {
    x: Number(parts[1]),
    y: Number(parts[2]),
    blur: Number(parts[3]),
    colour: `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`,
    opacity: a,
  };
}

/* ---- Swift ----------------------------------------------------------------------------------- */

const swiftName = (s) => s.replace(/[-.](\w)/g, (_, c) => c.toUpperCase());
const hex = (v) => String(v).trim();

function swiftColours(theme) {
  const lines = [];
  for (const [groupName, entries] of Object.entries(theme)) {
    for (const [key, v] of Object.entries(entries)) {
      if (!/^#|^rgb/.test(String(v))) continue;
      lines.push(`      ${swiftName(groupName)}${swiftName(key).replace(/^./, (c) => c.toUpperCase())}: "${hex(v)}",`);
    }
  }
  return lines;
}

function swift() {
  const colour = (theme) =>
    Object.entries(theme)
      .flatMap(([g, entries]) =>
        Object.entries(entries)
          .filter(([, v]) => /^#|^rgb/.test(String(v)))
          .map(([k, v]) => `    "${g}.${k}": "${hex(v)}",`),
      )
      .join('\n');

  return `// Generated by tokens/generate.mjs from Kasane's DTCG source. Do not edit.

import Foundation

public enum Kasane {
  /// Control heights. The same three as the web.
  public enum Control {
    public static let sm: Double = ${control.sm}
    public static let md: Double = ${control.md}
    public static let lg: Double = ${control.lg}
  }

  /// The one radius. A control at any of the three heights becomes a pill.
  public static let radius: Double = ${radius}

  /// One duration and one curve, the same two every CSS transition in Kasane names.
  public enum Motion {
    public static let duration: Double = ${motion.duration / 1000}
    public static let curve: (Double, Double, Double, Double) = (${motion.curve.join(', ')})
  }

  /// A shadow, in the parts a platform takes. The web writes these as one box-shadow string.
  public struct Shadow: Sendable {
    public let x: Double
    public let y: Double
    public let blur: Double
    public let colour: String
    public let opacity: Double
  }

  public enum Shadows {
${Object.entries(shadow)
  .map(
    ([k, v]) =>
      `    public static let ${k} = Shadow(x: ${v.x}, y: ${v.y}, blur: ${v.blur}, colour: "${v.colour}", opacity: ${v.opacity})`,
  )
  .join('\n')}
  }

  /// The space ladder, in points, remapped the way data-kb-density=compact remaps it. A phone is
  /// always the compact case.
  public enum Space {
${Object.entries(compact)
  .map(([k, v]) => `    public static let s${k}: Double = ${v}`)
  .join('\n')}
  }

  /// The ladder as the web writes it, for anything that has to match a desktop measurement.
  public enum Room {
${Object.entries(space)
  .map(([k, v]) => `    public static let s${k}: Double = ${v}`)
  .join('\n')}
  }

  /// Type sizes before the user's text scale is applied. Not named Type: Swift reserves that
  /// as a member name, since it collides with the foo.Type expression.
  public struct TypeStep: Sendable {
    public let size: Double
    public let leading: Double
    public let tracking: Double
  }

  public enum TypeScale {
${Object.entries(type)
  .map(
    ([step, t]) =>
      `    public static let t${step} = TypeStep(size: ${t.size}, leading: ${t.leading ?? 1.5}, tracking: ${t.tracking ?? 0})`,
  )
  .join('\n')}
  }

  /// Colours by dotted name, per theme. Hex as authored.
  public static let light: [String: String] = [
${colour(themes.light)}
  ]

  public static let dark: [String: String] = [
${colour(themes.dark)}
  ]
}
`;
}

/* ---- TypeScript ------------------------------------------------------------------------------ */

function ts() {
  const colour = (theme) =>
    Object.entries(theme)
      .map(
        ([g, entries]) =>
          `  ${g}: {\n${Object.entries(entries)
            .filter(([, v]) => /^#|^rgb/.test(String(v)))
            .map(([k, v]) => `    ${JSON.stringify(k)}: '${hex(v)}',`)
            .join('\n')}\n  },`,
      )
      .join('\n');

  return `// Generated by tokens/generate.mjs from Kasane's DTCG source. Do not edit.

/** Control heights. The same three as the web. */
export const control = { sm: ${control.sm}, md: ${control.md}, lg: ${control.lg} } as const;

/** The one radius. */
export const radius = ${radius};

/** Shadows in the parts React Native takes. The web writes these as one box-shadow string. */
export const shadow = ${JSON.stringify(shadow, null, 2)} as const;

/** One duration and one curve, the same two every CSS transition in Kasane names. */
export const motion = {
  duration: ${motion.duration},
  curve: ${JSON.stringify(motion.curve)} as [number, number, number, number],
} as const;

/** The ladder remapped the way data-kb-density=compact remaps it: a phone is always compact. */
export const space = ${JSON.stringify(compact, null, 2).replace(/"/g, '')} as const;

/** The ladder as the web writes it, for anything that has to match a desktop measurement. */
export const room = ${JSON.stringify(space, null, 2).replace(/"/g, '')} as const;

/** Sizes before the OS text scale is applied. Multiply by PixelRatio.getFontScale(). */
export const type = ${JSON.stringify(type, null, 2)} as const;

export const light = {
${colour(themes.light)}
} as const;

export const dark = {
${colour(themes.dark)}
} as const;

export type Theme = typeof light;
`;
}

/* ---- write ----------------------------------------------------------------------------------- */

mkdirSync(here, { recursive: true });
writeFileSync(join(here, 'KasaneTokens.swift'), swift(), 'utf8');
writeFileSync(join(here, 'theme.ts'), ts(), 'utf8');

const count = (theme) =>
  Object.values(theme).reduce(
    (n, entries) => n + Object.values(entries).filter((v) => /^#|^rgb/.test(String(v))).length,
    0,
  );

console.log(
  `from ${kasane}: ${count(themes.light)} light colours, ${count(themes.dark)} dark, ` +
    `${Object.keys(space).length} space rungs (${Object.keys(REMAP).length} remapped), ` +
    `${Object.keys(type).length} type steps, ` +
    `${Object.keys(shadow).length} shadows`,
);
console.log('wrote tokens/KasaneTokens.swift and tokens/theme.ts');
