import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  PixelRatio,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  useColorScheme,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { control, dark, light, radius, shadow, space, type as ladder } from './theme';

/* The pieces every screen is built from. Every one of them is a Kasane rule, named above it, and
   nothing here holds a colour or a number: they all come from theme.ts, generated from Kasane.

   Where a part has to differ on a phone it is written in deviations.json, next to the token
   generator, with what it is and why. Two of those apply to everything here: a type size is always
   multiplied by the reader's text scale, and a control is 44, 48 or 56 instead of the web's 32, 40
   and 48. */

export type Step = keyof typeof ladder;

/* Kasane's face, carried onto the phone. Left alone, every string renders in San Francisco, which
   is the one piece of Apple in the app nobody chose.

   A weight is a family here, not a number: a static font file has no weight axis, so asking for 600
   on the regular file gets a smeared fake. The files are loaded in app/_layout.tsx. */
export const face = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  italic: 'IBMPlexSans_400Regular_Italic',
  mono: 'IBMPlexMono_400Regular',
} as const;

export function useTheme() {
  const scheme = useColorScheme();
  const scale = PixelRatio.getFontScale();
  return useMemo(() => {
    const t = scheme === 'dark' ? dark : light;
    return {
      t,
      dark: scheme === 'dark',
      size: (step: Step) => ladder[step].size * scale,
      line: (step: Step) => ladder[step].size * scale * ladder[step].leading,
    };
  }, [scheme, scale]);
}

type TextKind = 'title' | 'heading' | 'body' | 'small' | 'caps';

const STEP: Record<TextKind, Step> = {
  title: '32',
  heading: '20',
  body: '16',
  small: '14',
  caps: '12',
};

export function Text({
  kind = 'body',
  muted,
  strong,
  style,
  ...rest
}: TextProps & { kind?: TextKind; muted?: boolean; strong?: boolean }) {
  const { t, size, line } = useTheme();
  return (
    <RNText
      style={[
        {
          color: muted ? t.fg.secondary : t.fg.default,
          fontSize: size(STEP[kind]),
          lineHeight: line(STEP[kind]),
          fontFamily: strong || kind === 'title' || kind === 'heading' ? face.semibold : face.regular,
          letterSpacing: kind === 'title' ? -0.5 : kind === 'caps' ? 1 : 0,
          textTransform: kind === 'caps' ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...rest}
    />
  );
}

/* A chevron, drawn and not typed: a glyph renders at whatever size the font gives it, which on a
   phone is far smaller than the target it sits in.

   The square is rotated, so what shows is its diagonal. Sizing the square by the type step made it
   1.41 times too big, so the wanted height is divided by root two to get the side. The result is
   clamped: it follows the reader's text scale, but a chevron should never dominate a bar or
   disappear from one. */
export function Chevron({
  facing = 'left',
  step = '20',
}: {
  facing?: 'left' | 'right';
  step?: Step;
}) {
  const { t, size } = useTheme();
  // about three fifths of the type step reads level with the text beside it
  const wanted = Math.min(Math.max(size(step) * 0.6, 9), 20);
  const edge = wanted / Math.SQRT2;
  return (
    <View
      style={{
        width: edge,
        height: edge,
        borderLeftWidth: Math.max(1.5, edge / 5),
        borderBottomWidth: Math.max(1.5, edge / 5),
        borderColor: t.fg.default,
        transform: [{ rotate: facing === 'left' ? '45deg' : '-135deg' }],
      }}
    />
  );
}

/* .kb-panel: a surface and the one radius. No border: a panel is told from the page by its
   ground, and its head is told from its body the same way. */
export function Panel({ style, children, ...rest }: ViewProps) {
  const { t } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/** .kb-panel__head: a title line above the content */
export function PanelHead({ children }: { children: ReactNode }) {
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
      {children}
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

/* .kb-collection and .kb-item: the item is the unit and the page is its container. No panel wraps
   the list, no rule separates the items, and the gap is the only separator. This is what the web
   client uses for a list of repositories and a list of issues.

   .kb-listing, the one with a rule between its rows, is for a table. */
export function Collection({ children, gap = space[16] }: { children: ReactNode; gap?: number }) {
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
  /** shown muted before the title, as the web does with owner/name */
  owner?: string;
  /** the figures at the far end of the title row */
  aside?: ReactNode;
  /** the words that qualify the title, on their own line */
  marks?: ReactNode;
  text?: string;
  onPress?: () => void;
}) {
  const { t, size, line } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        gap: space[8],
        padding: space[16],
        backgroundColor: pressed ? t.bg.raised : t.bg.tile,
        borderRadius: radius,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: space[8],
        }}
      >
        <RNText
          numberOfLines={2}
          style={{
            flexShrink: 1,
            color: t.fg.default,
            fontSize: size('18'),
            lineHeight: line('18'),
            fontFamily: face.semibold,
            letterSpacing: size('18') * -0.01,
          }}
        >
          {owner ? <RNText style={{ color: t.fg.secondary }}>{owner}</RNText> : null}
          {title}
        </RNText>
        {aside}
      </View>
      {marks}
      {text ? <ItemText>{text}</ItemText> : null}
    </Pressable>
  );
}

/** .kb-item__text: the description under an item, secondary and one step down */
export function ItemText({ children }: { children: string }) {
  const { t, size, line } = useTheme();
  return (
    <RNText
      numberOfLines={3}
      style={{
        color: t.fg.secondary,
        fontSize: size('14'),
        lineHeight: line('14'),
        fontFamily: face.regular,
      }}
    >
      {children}
    </RNText>
  );
}

/** the muted line of facts at the end of an item title row. .kb-cluster--wide holds them apart. */
export function Meta({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[24] }}>{children}</View>
  );
}

/** .kb-cluster: the words that qualify a title, on their own line */
export function Marks({ children, tight }: { children: ReactNode; tight?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: tight ? space[4] : space[8],
      }}
    >
      {children}
    </View>
  );
}

/* .kb-empty: a dashed box where a list would be, since an empty list and a list that failed to
   load are not the same thing and should not look the same. */
export function Empty({ children }: { children: string }) {
  const { t, size } = useTheme();
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
      <RNText
        style={{
          color: t.fg.secondary,
          fontSize: size('14'),
          fontFamily: face.regular,
          textAlign: 'center',
        }}
      >
        {children}
      </RNText>
    </View>
  );
}

/* .kb-head: what the page is, and one fact about it. 40 on the web; a phone takes the compact
   remap, which is 24. */
export function Head({ title, aside }: { title: string; aside?: string }) {
  const { t, size, line } = useTheme();
  return (
    <View style={{ gap: space[4], marginBottom: space[8] }}>
      <RNText
        style={{
          color: t.fg.default,
          fontSize: size('24'),
          lineHeight: line('24'),
          fontFamily: face.semibold,
          letterSpacing: size('24') * -0.02,
        }}
      >
        {title}
      </RNText>
      {aside ? (
        <RNText
          style={{ color: t.fg.secondary, fontSize: size('16'), fontFamily: face.regular }}
        >
          {aside}
        </RNText>
      ) : null}
    </View>
  );
}

/* .kb-tray: a pill holding a segmented set, on the deepest ground step so it reads on the page and
   on a panel alike. An unselected item is full ink on a transparent ground, and lifts to the
   surface under the finger; the selected one is filled. Selection is instant, since a background
   cross-fade takes the label through grey. */
export function Tray({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (value: string) => void;
  label?: string;
}) {
  const { t, size } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        gap: space[4],
        padding: space[4],
        backgroundColor: t.bg.pressed,
        borderRadius: radius,
        alignSelf: 'flex-start',
      }}
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              height: control.sm,
              justifyContent: 'center',
              paddingHorizontal: space[16],
              borderRadius: radius,
              backgroundColor: on
                ? pressed
                  ? t.fill.active
                  : t.fill.default
                : pressed
                  ? t.bg.surface
                  : 'transparent',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8] }}>
              <RNText
                style={{
                  color: on ? t.fg.onFill : t.fg.default,
                  fontSize: size('14'),
                  fontFamily: face.medium,
                }}
              >
                {option.label}
              </RNText>
              {option.count === undefined ? null : (
                <RNText
                  style={{
                    color: on ? t.fg.onFill : t.fg.secondary,
                    opacity: on ? 0.8 : 1,
                    fontSize: size('14'),
                    fontFamily: face.regular,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {option.count}
                </RNText>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/* .kb-spin: a 2px ring in the current ink with its top edge cleared, turning in 700ms. Not
   ActivityIndicator, which brings the platform's look with it. */
export function Spinner({ step = '20' }: { step?: Step }) {
  const { t, size } = useTheme();
  // useMemo, not useRef: the value is read while the style is built, which is render
  const turn = useMemo(() => new Animated.Value(0), []);
  const edge = size(step);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spin.start();
    return () => spin.stop();
  }, [turn]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={{
        width: edge,
        height: edge,
        borderRadius: edge / 2,
        borderWidth: 2,
        borderColor: t.fg.secondary,
        borderTopColor: 'transparent',
        transform: [
          { rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
        ],
      }}
    />
  );
}

export function Waiting({ style }: { style?: ViewProps['style'] }) {
  return (
    <View style={[{ padding: space[48], alignItems: 'center' }, style]}>
      <Spinner />
    </View>
  );
}

/* .kb-bar: a pill that floats over the page, not a strip across the top of it. Surface ground, a
   hairline all round, the one radius, the bar shadow, and 8 of padding. The web pins it 16 below
   the top and centres it; here the 16 is measured from the safe area the OS reports.

   What it carries is .kb-bar__brand: the instance, at 16 and semibold. Not the page title. The web
   keeps one bar across every page and lets each page say what it is in its own Head; a phone that
   writes the page name twice reads as a navigation bar. */
export function Bar({
  title = 'Kurobeni',
  onBack,
  action,
}: {
  title?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  const { t, size } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + space[16],
        left: space[16],
        right: space[16],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[8],
          padding: space[8],
          backgroundColor: t.bg.surface,
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border.hairline,
          shadowColor: shadow.bar.colour,
          shadowOffset: { width: shadow.bar.x, height: shadow.bar.y },
          shadowRadius: shadow.bar.blur / 2,
          shadowOpacity: shadow.bar.opacity,
          elevation: 8,
        }}
      >
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={({ pressed }) => ({
              width: control.md,
              height: control.md,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius,
              backgroundColor: pressed ? t.bg.pressed : 'transparent',
            })}
          >
            <Chevron />
          </Pressable>
        ) : null}
        <RNText
          numberOfLines={1}
          style={{
            flex: 1,
            paddingLeft: onBack ? 0 : space[16],
            color: t.fg.default,
            fontSize: size('16'),
            fontFamily: face.semibold,
          }}
        >
          {title}
        </RNText>
        {action}
      </View>
    </View>
  );
}

/* What a screen's own content has to clear to sit under the floating bar: the safe area, the 16
   above the bar, the bar itself, and one more 16 under it. */
export function useBarInset() {
  const insets = useSafeAreaInsets();
  return insets.top + space[16] + (control.md + space[8] * 2) + space[16];
}

export function Failed({
  error,
  onRetry,
  style,
}: {
  error: unknown;
  onRetry?: () => void;
  style?: ViewProps['style'];
}) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <View style={[{ padding: space[24], gap: space[12], alignItems: 'flex-start' }, style]}>
      <Text strong>Could not load</Text>
      <Text kind="small" muted>
        {message}
      </Text>
      {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

/* .kb-status: a state is coloured text at 14 and medium, with no chip around it. An outlined badge
   is not in Kasane. */
export function Status({ label, kind = 'neutral' }: { label: string; kind?: 'neutral' | 'ok' | 'warn' | 'err' }) {
  const { t, size } = useTheme();
  const ink =
    kind === 'ok'
      ? t.status.ok
      : kind === 'warn'
        ? t.status.warn
        : kind === 'err'
          ? t.status.err
          : t.fg.secondary;
  return (
    <RNText style={{ color: ink, fontSize: size('14'), fontFamily: face.medium }}>{label}</RNText>
  );
}

/* .kb-count: a number beside a label, secondary and tabular so a column of them lines up. */
export function Count({ children }: { children: string | number }) {
  const { t, size } = useTheme();
  return (
    <RNText
      style={{
        color: t.fg.secondary,
        fontSize: size('14'),
        fontFamily: face.regular,
        fontVariant: ['tabular-nums'],
      }}
    >
      {children}
    </RNText>
  );
}

/** one of the facts in a Meta line: small, secondary, and tabular when it is a number */
export function Fact({ children, num }: { children: ReactNode; num?: boolean }) {
  const { t, size } = useTheme();
  return (
    <RNText
      style={{
        color: t.fg.secondary,
        fontSize: size('14'),
        fontFamily: face.regular,
        fontVariant: num ? ['tabular-nums'] : undefined,
      }}
    >
      {children}
    </RNText>
  );
}

export function Button({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress?: () => void;
  primary?: boolean;
}) {
  const { t, size } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        height: control.md,
        justifyContent: 'center',
        paddingHorizontal: space[16],
        borderRadius: radius,
        backgroundColor: primary
          ? pressed
            ? t.fill.active
            : t.fill.default
          : pressed
            ? t.bg.pressed
            : t.bg.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: primary ? t.fill.default : pressed ? t.border.strong : t.border.control,
      })}
    >
      <RNText
        style={{
          color: primary ? t.fg.onFill : t.fg.default,
          fontSize: size('14'),
          fontFamily: face.medium,
        }}
      >
        {label}
      </RNText>
    </Pressable>
  );
}

export { control, radius, space };
