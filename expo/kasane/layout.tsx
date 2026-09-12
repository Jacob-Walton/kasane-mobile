import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { Press, face, radius, space, useTheme } from './theme';
import { Text } from './text';

/* How things sit next to each other, and the surfaces they sit on. */

/** .kb-stack: one column, a rung apart */
export function Stack({
  children,
  gap = space[16],
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: ViewProps['style'];
}) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

/** .kb-cluster: a row that wraps, 8 apart. tight is 4, wide is 24. */
export function Cluster({
  children,
  gap = 'normal',
  style,
}: {
  children: ReactNode;
  gap?: 'tight' | 'normal' | 'wide';
  style?: ViewProps['style'];
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: gap === 'tight' ? space[4] : gap === 'wide' ? space[24] : space[8],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** .kb-cluster with the figures pushed to the far end */
export function Row({ children, style }: { children: ReactNode; style?: ViewProps['style'] }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: space[8],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** the muted line of facts at the end of a title row */
export function Meta({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[24] }}>{children}</View>
  );
}

/** one fact in a Meta line */
export function Fact({ children, num }: { children: ReactNode; num?: boolean }) {
  return (
    <Text kind="small" muted num={num}>
      {children}
    </Text>
  );
}

/** .kb-divider: a hairline between two runs of content, and the only place one belongs */
export function Divider() {
  const { t } = useTheme();
  return (
    <View
      style={{ height: 0.5, backgroundColor: t.border.hairline, marginVertical: space[8] }}
    />
  );
}

/* .kb-head: what the page is, and one fact about it. 40 on the web; a phone takes the compact
   remap, which is 24. */
export function Head({
  title,
  aside,
  note,
}: {
  title: string;
  aside?: string;
  note?: ReactNode;
}) {
  return (
    <View style={{ gap: space[4], marginBottom: space[8] }}>
      <Text kind="heading">{title}</Text>
      {aside ? (
        <Text kind="body" muted>
          {aside}
        </Text>
      ) : null}
      {note}
    </View>
  );
}

/* .kb-panel: a surface and the one radius. No border: a panel is told from the page by its ground,
   and its head is told from its body the same way. */
export function Panel({ style, children, ...rest }: ViewProps) {
  const { t } = useTheme();
  return (
    <View
      style={[{ backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

/** .kb-panel__head: a title line above the content */
export function PanelHead({ title, aside }: { title?: ReactNode; aside?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: space[8],
        paddingHorizontal: space[16],
        paddingTop: space[16],
        paddingBottom: space[8],
      }}
    >
      {typeof title === 'string' ? <Text kind="sub">{title}</Text> : title}
      {aside ? <View style={{ marginLeft: 'auto' }}>{aside}</View> : null}
    </View>
  );
}

/** .kb-panel__body: the short top padding assumes a head above it */
export function PanelBody({ children, lone }: { children: ReactNode; lone?: boolean }) {
  return (
    <View
      style={{
        gap: space[16],
        paddingHorizontal: space[16],
        paddingTop: lone ? space[16] : 0,
        paddingBottom: space[16],
      }}
    >
      {children}
    </View>
  );
}

/** .kb-panel__foot: the actions, on the page ground so the panel ends on a step */
export function PanelFoot({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: space[8],
        padding: space[16],
        backgroundColor: t.bg.page,
      }}
    >
      {children}
    </View>
  );
}

/** .kb-section: a titled run of content inside a page */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: space[8] }}>
      <Text kind="caps" muted>
        {title}
      </Text>
      {children}
    </View>
  );
}

/* .kb-collection and .kb-item: the item is the unit and the page is its container. No panel wraps
   the list, no rule separates the items, and the gap is the only separator.

   .kb-listing, the one with a rule between its rows, is for a table. */
export function Collection({
  children,
  gap = space[16],
}: {
  children: ReactNode;
  gap?: number;
}) {
  return <View style={{ gap }}>{children}</View>;
}

export function Item({
  title,
  owner,
  aside,
  marks,
  text,
  onPress,
}: {
  title: string;
  /** shown muted before the title, the way the web writes owner/name */
  owner?: string;
  /** the figures at the far end of the title row */
  aside?: ReactNode;
  /** the words that qualify the title, on their own line */
  marks?: ReactNode;
  text?: string;
  onPress?: () => void;
}) {
  const { t, size, line } = useTheme();
  const body = (
    <>
      <Row>
        <Text
          kind="sub"
          numberOfLines={2}
          style={{ flexShrink: 1, fontSize: size('18'), lineHeight: line('18') }}
        >
          {owner ? <Text kind="sub" muted style={{ fontFamily: face.semibold }}>{owner}</Text> : null}
          {title}
        </Text>
        {aside}
      </Row>
      {marks}
      {text ? <ItemText>{text}</ItemText> : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={{ gap: space[8], padding: space[16], backgroundColor: t.bg.tile, borderRadius: radius }}>
        {body}
      </View>
    );
  }
  return (
    <Press
      accessibilityRole="button"
      onPress={onPress}
      rest={t.bg.tile}
      down={t.bg.raised}
      style={{ gap: space[8], padding: space[16], borderRadius: radius }}
    >
      {body}
    </Press>
  );
}

/** .kb-item__text: the description under an item, secondary and one step down */
export function ItemText({ children }: { children: ReactNode }) {
  return (
    <Text kind="small" muted numberOfLines={3}>
      {children}
    </Text>
  );
}

/* .kb-empty: a dashed box where a list would be, since an empty list and a list that failed to load
   are not the same thing and should not look the same. */
export function Empty({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        gap: space[8],
        paddingVertical: space[48],
        paddingHorizontal: space[24],
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: t.border.control,
        borderRadius: radius,
      }}
    >
      <Text kind="small" muted style={{ textAlign: 'center' }}>
        {children}
      </Text>
    </View>
  );
}
