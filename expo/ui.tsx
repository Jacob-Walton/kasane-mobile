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
import { control, dark, light, radius, space, type as ladder } from './theme';

/* The pieces every screen is built from. Nothing here holds a colour or a number: they all come
   from theme.ts, which is generated from Kasane.

   Two rules this file exists to keep. A type size is always multiplied by the reader's text scale,
   so no size is final. A control is always one of the three heights, which here are 44, 48 and 56
   rather than the web's 32, 40 and 48. */

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

/* A row of choices. Kasane calls this a tray: one named group, the chosen one filled, so where you
   are is not carried by colour alone. */
export function Tabs({
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
              backgroundColor: on ? t.fill.default : pressed ? t.bg.raised : 'transparent',
            })}
          >
            <RNText
              style={{
                color: on ? t.fg.onFill : t.fg.secondary,
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

/* Our own spinner. ActivityIndicator is the platform's, and it brings the platform's look with it:
   a ring with one lit quarter, turning, is the same information and ours. */
export function Spinner({ step = '20' }: { step?: Step }) {
  const { t, size } = useTheme();
  // useMemo, not useRef: the value is read while the style is built, which is render
  const turn = useMemo(() => new Animated.Value(0), []);
  const edge = size(step);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: 900,
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
        borderWidth: Math.max(2, edge / 8),
        borderColor: t.border.hairline,
        borderTopColor: t.fg.secondary,
        transform: [
          { rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
        ],
      }}
    />
  );
}

export function Waiting() {
  return (
    <View style={{ padding: space[48], alignItems: 'center' }}>
      <Spinner />
    </View>
  );
}

/* The bar. Not the platform's: a stack header brings its own type, its own chevron and its own
   ground, none of which are ours. The inset is the only thing the OS supplies. */
export function Bar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + space[8],
        paddingBottom: space[8],
        paddingHorizontal: space[8],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[4],
        backgroundColor: t.bg.page,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: t.border.hairline,
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
      ) : (
        <View style={{ width: space[8] }} />
      )}
      <Text kind="heading" numberOfLines={1} style={{ flex: 1 }}>
        {title}
      </Text>
      {action}
    </View>
  );
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

/* Two arcs and two heads would be a drawing. One ring with a gap, and a mark on it, is enough to
   read as refresh and needs no asset. */
function Arrows() {
  const { t, size } = useTheme();
  const edge = size('18');
  return (
    <View
      style={{
        width: edge,
        height: edge,
        borderRadius: edge / 2,
        borderWidth: Math.max(2, edge / 8),
        borderColor: t.fg.default,
        borderRightColor: 'transparent',
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

export function Failed({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <View style={{ padding: space[24], gap: space[12], alignItems: 'flex-start' }}>
      <Text strong>Could not load</Text>
      <Text kind="small" muted>
        {message}
      </Text>
      {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

export function Pill({ label, kind = 'neutral' }: { label: string; kind?: 'neutral' | 'ok' | 'warn' }) {
  const { t, size } = useTheme();
  const ground =
    kind === 'ok' ? t.status.ok : kind === 'warn' ? t.status.warn : t.border.control;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: space[12],
        paddingVertical: space[4],
        borderRadius: radius,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ground,
      }}
    >
      <RNText style={{ color: ground, fontSize: size('12'), fontFamily: face.medium }}>
        {label}
      </RNText>
    </View>
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
        paddingHorizontal: space[24],
        borderRadius: radius,
        backgroundColor: primary
          ? pressed
            ? t.fill.active
            : t.fill.default
          : pressed
            ? t.bg.pressed
            : t.bg.surface,
        borderWidth: primary ? 0 : StyleSheet.hairlineWidth,
        borderColor: t.border.control,
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
