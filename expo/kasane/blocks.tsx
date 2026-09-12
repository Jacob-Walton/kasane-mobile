import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Press, radius, space, useTheme } from './theme';
import { Cluster, Row, Stack } from './layout';
import { Text } from './text';
import { Delta, Progress } from './controls';

/* The blocks a page is built out of. A band is the page itself here: a phone has one column, so
   what the web does with a band and a col is done by the screen padding. */

/** .kb-hero: the opening block, a title and a line under it */
export function Hero({
  title,
  lede,
  actions,
}: {
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <View style={{ gap: space[12], paddingVertical: space[24] }}>
      <Text kind="title">{title}</Text>
      {lede ? (
        <Text kind="sub" muted>
          {lede}
        </Text>
      ) : null}
      {actions ? <Cluster>{actions}</Cluster> : null}
    </View>
  );
}

/** .kb-tiles: two abreast on the web, one under the other under 768 */
export function Tiles({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

/** .kb-tile: a titled block on the tile ground */
export function Tile({
  title,
  children,
  onPress,
}: {
  title: string;
  children?: ReactNode;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  const body = (
    <>
      <Text kind="sub">{title}</Text>
      {children}
    </>
  );
  const shape = { gap: space[8], padding: space[24], borderRadius: radius } as const;
  if (!onPress) {
    return <View style={[shape, { backgroundColor: t.bg.tile }]}>{body}</View>;
  }
  return (
    <Press
      accessibilityRole="button"
      onPress={onPress}
      rest={t.bg.tile}
      down={t.bg.raised}
      style={shape}
    >
      {body}
    </Press>
  );
}

/* .kb-stats: four abreast on the web, one column under 480 and two in the compact scope. A phone is
   always compact, so two. */
export function Stats({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[16] }}>{children}</View>
  );
}

/* .kb-stat: a figure, its unit, what it counts, and how it moved. 32 on the web; a phone takes the
   compact remap, which is 24. */
export function Stat({
  value,
  unit,
  label,
  delta,
  bar,
}: {
  value: string;
  unit?: string;
  label: string;
  delta?: number;
  /** .kb-stat__bar: the figure as a share of its whole */
  bar?: number;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '40%',
        gap: space[4],
        padding: space[16],
        backgroundColor: t.bg.page,
        borderRadius: radius,
      }}
    >
      <Cluster gap="tight" style={{ alignItems: 'baseline' }}>
        <Text kind="heading" num>
          {value}
        </Text>
        {unit ? (
          <Text kind="body" muted>
            {unit}
          </Text>
        ) : null}
      </Cluster>
      <Text kind="small" muted>
        {label}
      </Text>
      {delta === undefined ? null : <Delta value={delta} />}
      {bar === undefined ? null : <Progress value={bar} label={label} />}
    </View>
  );
}

/** .kb-cta: the closing block, one thing to do */
export function Cta({
  title,
  text,
  actions,
}: {
  title: string;
  text?: string;
  actions?: ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        gap: space[12],
        padding: space[24],
        backgroundColor: t.bg.surface,
        borderRadius: radius,
      }}
    >
      <Text kind="heading">{title}</Text>
      {text ? <Text muted>{text}</Text> : null}
      {actions ? <Cluster>{actions}</Cluster> : null}
    </View>
  );
}

/* .kb-callout: a block the page raises out of its own text. The kind is a label over the body, not
   a bold word inside it, and it is the only thing the kind colours. */
export function Callout({
  kind = 'note',
  children,
}: {
  kind?: 'note' | 'tip' | 'important' | 'warning' | 'caution';
  children: ReactNode;
}) {
  const { t } = useTheme();
  const ink =
    kind === 'tip'
      ? t.status.ok
      : kind === 'warning'
        ? t.status.warn
        : kind === 'caution'
          ? t.status.err
          : t.accent.default;
  return (
    <View
      style={{
        gap: space[8],
        padding: space[16],
        backgroundColor: t.bg.raised,
        borderRadius: radius,
      }}
    >
      <Text kind="caps" style={{ color: ink }}>
        {kind}
      </Text>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </View>
  );
}

/** .kb-sheet: label and value down a panel, one row a fact */
export function Sheet({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

export function SheetRow({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Row style={{ paddingHorizontal: space[16], paddingVertical: space[12], alignItems: 'center' }}>
      <Text kind="small" muted>
        {name}
      </Text>
      {typeof children === 'string' ? <Text kind="small">{children}</Text> : children}
    </Row>
  );
}

/** .kb-facts: groups of name and value, for the side of a page */
export function Facts({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

export function FactGroup({ children }: { children: ReactNode }) {
  return <Stack gap={space[4]}>{children}</Stack>;
}

export function NamedFact({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Row>
      <Text kind="small" muted>
        {name}
      </Text>
      {typeof children === 'string' ? <Text kind="small">{children}</Text> : children}
    </Row>
  );
}

/** .kb-prose__title: the title of a document, above its own measure */
export function ProseTitle({ children }: { children: ReactNode }) {
  return <Text kind="title">{children}</Text>;
}
