import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { face, radius, space, useTheme } from './theme';
import { Cluster, Row, Stack } from './layout';
import { Text } from './text';

/* Readings. Nothing here takes a colour of its own: the scale carries the verdict, the severity
   carries the log line, and the series carry the chart. */

/* .kb-log: a tail read at density. Time and severity sit in a fixed gutter, everything else is one
   wrapping line, and the severity is the only colour in the pane. */
export type LogKind = 'info' | 'warn' | 'err' | 'ok';

export function Log({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.page, borderRadius: radius, paddingVertical: space[8] }}>
      {children}
    </View>
  );
}

export function LogDay({ children }: { children: string }) {
  return (
    <Text kind="caps" muted style={{ paddingHorizontal: space[12], paddingTop: space[8] }}>
      {children}
    </Text>
  );
}

export function LogLine({
  at,
  kind = 'info',
  children,
}: {
  at: string;
  kind?: LogKind;
  children: string;
}) {
  const { t, size } = useTheme();
  const ink =
    kind === 'ok'
      ? t.status.ok
      : kind === 'warn'
        ? t.status.warn
        : kind === 'err'
          ? t.status.err
          : t.fg.secondary;
  const tag = { info: 'INF', warn: 'WRN', err: 'ERR', ok: 'OK' }[kind];
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space[12],
        paddingHorizontal: space[12],
        paddingVertical: 1,
      }}
    >
      <Text kind="caps" mono muted style={{ textTransform: 'none' }}>
        {at}
      </Text>
      <Text
        kind="caps"
        mono
        style={{ color: ink, width: size('12') * 3.5, textTransform: 'none' }}
      >
        {tag}
      </Text>
      <Text kind="caps" mono style={{ flex: 1, textTransform: 'none' }}>
        {children}
      </Text>
    </View>
  );
}

/** the severity a line reads as, from what it says */
export function logKind(line: string): LogKind {
  if (/\b(error|fail|fatal|panic)\b/i.test(line)) return 'err';
  if (/\b(warn|deprecat)/i.test(line)) return 'warn';
  if (/\b(ok|done|ready|passed)\b/i.test(line)) return 'ok';
  return 'info';
}

/* .kb-diff: a unified diff, one surface a file. The added and removed grounds are the status
   colours mixed into the surface, which is what color-mix does on the web. */
export function Diff({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

export function DiffFile({
  path,
  added,
  removed,
  children,
}: {
  path: string;
  added?: number;
  removed?: number;
  children: ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' }}>
      <Row
        style={{
          alignItems: 'center',
          paddingHorizontal: space[16],
          paddingVertical: space[12],
        }}
      >
        <Text kind="caps" mono style={{ flex: 1, textTransform: 'none' }}>
          {path}
        </Text>
        <Cluster gap="tight">
          {added ? (
            <Text kind="caps" mono num style={{ color: t.status.ok, textTransform: 'none' }}>
              +{added}
            </Text>
          ) : null}
          {removed ? (
            <Text kind="caps" mono num style={{ color: t.status.err, textTransform: 'none' }}>
              -{removed}
            </Text>
          ) : null}
        </Cluster>
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: '100%' }}>{children}</View>
      </ScrollView>
    </View>
  );
}

export type DiffKind = 'add' | 'del' | 'same' | 'hunk';

export function DiffRow({
  kind,
  old: oldNo,
  now,
  children,
}: {
  kind: DiffKind;
  old?: number;
  now?: number;
  children: string;
}) {
  const { t, size } = useTheme();
  // the status colour at a fifth over the surface, which is what color-mix gives the web
  const ground =
    kind === 'add' ? mix(t.status.ok, t.bg.surface, 0.2)
    : kind === 'del' ? mix(t.status.err, t.bg.surface, 0.2)
    : kind === 'hunk' ? t.bg.raised
    : 'transparent';
  const gutter = size('12') * 4;
  return (
    <View style={{ flexDirection: 'row', backgroundColor: ground }}>
      <Text kind="caps" mono muted style={{ width: gutter, textAlign: 'right', textTransform: 'none' }}>
        {oldNo ?? ''}
      </Text>
      <Text kind="caps" mono muted style={{ width: gutter, textAlign: 'right', textTransform: 'none' }}>
        {now ?? ''}
      </Text>
      <Text kind="caps" mono style={{ flex: 1, paddingLeft: space[12], textTransform: 'none' }}>
        {kind === 'add' ? '+' : kind === 'del' ? '-' : ' '}
        {children}
      </Text>
    </View>
  );
}

/** a hex colour a share of the way towards another, since neither platform has color-mix */
function mix(a: string, b: string, at: number) {
  const read = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  };
  if (!a.startsWith('#') || !b.startsWith('#')) return b;
  const [ar, ag, ab] = read(a);
  const [br, bg, bb] = read(b);
  const one = (x: number, y: number) => Math.round(x * at + y * (1 - at));
  return `rgb(${one(ar, br)}, ${one(ag, bg)}, ${one(ab, bb)})`;
}

/* .kb-source: a file read line by line, a gutter of numbers and the code beside it. Two a line, so
   a number in the gutter clears the tap-target floor. */
export function Source({ lines, from = 1 }: { lines: string[]; from?: number }) {
  const { t, size } = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.page, borderRadius: radius, overflow: 'hidden' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: '100%', paddingVertical: space[8] }}>
          {lines.map((line, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              <Text
                kind="caps"
                mono
                muted
                num
                style={{
                  width: size('12') * 5,
                  textAlign: 'right',
                  paddingRight: space[12],
                  lineHeight: size('12') * 2,
                  textTransform: 'none',
                }}
              >
                {from + i}
              </Text>
              <Text
                kind="caps"
                mono
                style={{ lineHeight: size('12') * 2, textTransform: 'none' }}
              >
                {line}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* .kb-scale: a value on a named range. A stat says what a reading is, a scale says whether that is
   good, so the range carries the verdict and the marker needs no colour. */
export type ScalePart = { label: string; at: number };

export function Scale({
  value,
  min = 0,
  max = 100,
  unit,
  label,
  zones,
  parts,
}: {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label: string;
  /** the track carries good to bad across its width */
  zones?: boolean;
  parts?: ScalePart[];
}) {
  const { t } = useTheme();
  const at = Math.min(Math.max((value - min) / (max - min), 0), 1);
  return (
    <View style={{ gap: space[8] }}>
      <Row>
        <Text kind="small" muted>
          {label}
        </Text>
        <Cluster gap="tight" style={{ alignItems: 'baseline' }}>
          <Text kind="sub" num>
            {value}
          </Text>
          {unit ? (
            <Text kind="small" muted>
              {unit}
            </Text>
          ) : null}
        </Cluster>
      </Row>
      <View style={{ height: space[8], borderRadius: radius, backgroundColor: t.bg.pressed }}>
        {zones ? (
          <Svg width="100%" height={space[8]} style={{ borderRadius: radius, position: 'absolute' }}>
            <Path d={`M0 0 H1000 V${space[8]} H0 Z`} fill={t.status.warn} />
          </Svg>
        ) : null}
        <View
          style={{
            width: `${at * 100}%`,
            height: '100%',
            borderRadius: radius,
            backgroundColor: zones ? 'transparent' : t.accent.default,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: `${at * 100}%`,
            width: 2,
            height: space[8],
            marginLeft: -1,
            backgroundColor: t.border.strong,
          }}
        />
      </View>
      {parts?.length ? (
        <Row>
          {parts.map((part) => (
            <Text key={part.label} kind="caps" muted>
              {part.label}
            </Text>
          ))}
        </Row>
      ) : null}
    </View>
  );
}

/* .kb-calendar: a year of days, inked by value. The grid runs in weeks, a column a week and a row a
   weekday, and fifty three columns do not fit a phone: the year scrolls, it never wraps.

   A day is flush against its neighbours, so it is the one place the radius rule gives way. */
export function Calendar({
  days,
  label = 'Activity',
}: {
  days: { day: string; value: number }[];
  label?: string;
}) {
  const { t } = useTheme();
  const most = Math.max(1, ...days.map((d) => d.value));
  const cell = space[12];

  // the ink ladder read the other way round: an empty day is the quietest
  const ink = (value: number) => {
    if (!value) return t.bg.raised;
    const share = value / most;
    if (share > 0.75) return t.accent.active;
    if (share > 0.5) return t.accent.default;
    if (share > 0.25) return t.series[1];
    return t.bg.pressed;
  };

  const weeks: { day: string; value: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <View style={{ gap: space[8] }}>
      <Text kind="small" muted>
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {weeks.map((week, w) => (
            <View key={w} style={{ gap: 2 }}>
              {week.map((d) => (
                <View
                  key={d.day}
                  accessibilityLabel={`${d.day}: ${d.value}`}
                  style={{ width: cell, height: cell, backgroundColor: ink(d.value) }}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <Cluster gap="tight">
        <Text kind="caps" muted>
          Less
        </Text>
        {[0, 0.25, 0.5, 0.75, 1].map((share) => (
          <View
            key={share}
            style={{ width: cell, height: cell, backgroundColor: ink(share * most) }}
          />
        ))}
        <Text kind="caps" muted>
          More
        </Text>
      </Cluster>
    </View>
  );
}

/** .kb-sparkline: the shape of a series, no axis and no labels */
export function Sparkline({
  values,
  width = 160,
  height = 40,
  colour,
}: {
  values: number[];
  width?: number;
  height?: number;
  colour?: string;
}) {
  const { t } = useTheme();
  if (values.length < 2) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - low) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={colour ?? t.accent.default}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** .kb-columns: a series as bars, one a reading */
export function Columns({
  series,
  height = 80,
}: {
  series: { label: string; value: number }[];
  height?: number;
}) {
  const { t } = useTheme();
  const most = Math.max(1, ...series.map((s) => s.value));
  return (
    <View style={{ gap: space[8] }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[4], height }}>
        {series.map((s) => (
          <View
            key={s.label}
            accessibilityLabel={`${s.label}: ${s.value}`}
            style={{
              flex: 1,
              height: Math.max(2, (s.value / most) * height),
              backgroundColor: t.accent.default,
              borderTopLeftRadius: space[4],
              borderTopRightRadius: space[4],
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space[4] }}>
        {series.map((s) => (
          <Text
            key={s.label}
            kind="caps"
            muted
            numberOfLines={1}
            style={{ flex: 1, textAlign: 'center', fontFamily: face.regular }}
          >
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
