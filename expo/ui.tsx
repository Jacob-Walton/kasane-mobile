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
  type PressableProps,
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

export function Panel({ style, children, ...rest }: ViewProps) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.bg.surface,
          borderRadius: radius,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.border.hairline,
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

/* A row in a list. The whole row is the target, which is why it is at least a control tall: a
   phone is aimed at with a thumb. */
export function Row({
  title,
  note,
  meta,
  onPress,
  last,
  ...rest
}: {
  title: string;
  note?: string;
  meta?: string;
  onPress?: () => void;
  last?: boolean;
} & Omit<PressableProps, 'style' | 'children'>) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      {...rest}
      style={({ pressed }) => ({
        minHeight: control.md,
        paddingVertical: space[12],
        paddingHorizontal: space[16],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        backgroundColor: pressed ? t.bg.raised : 'transparent',
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.border.hairline,
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={2}>{title}</Text>
        {note ? (
          <Text kind="small" muted numberOfLines={1}>
            {note}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text kind="small" muted>
          {meta}
        </Text>
      ) : null}
    </Pressable>
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
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const { t, size } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
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
            <RNText
              style={{
                color: on ? t.fg.onFill : t.fg.default,
                fontSize: size('14'),
                fontFamily: face.medium,
              }}
            >
              {option.label}
            </RNText>
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

   The title is .kb-bar__name: 16 and semibold. A 20 heading is a navigation bar's size, not ours. */
export function Bar({
  title,
  onBack,
  action,
}: {
  title: string;
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

/* A refresh the bar can hold, since pull to refresh is the platform's control and its spinner. */
export function Refresh({ busy, onPress }: { busy: boolean; onPress: () => void }) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Refresh"
      accessibilityState={{ busy }}
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => ({
        width: control.md,
        height: control.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius,
        backgroundColor: pressed ? t.bg.pressed : 'transparent',
      })}
    >
      {busy ? <Spinner step="16" /> : <Arrows />}
    </Pressable>
  );
}

/* The same ring as .kb-spin, standing still. Kasane has no refresh glyph, and a ring with a gap in
   it is the shape the system already uses for work in progress. */
function Arrows() {
  const { t, size } = useTheme();
  const edge = size('18');
  return (
    <View
      style={{
        width: edge,
        height: edge,
        borderRadius: edge / 2,
        borderWidth: 2,
        borderColor: t.fg.default,
        borderTopColor: 'transparent',
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
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
