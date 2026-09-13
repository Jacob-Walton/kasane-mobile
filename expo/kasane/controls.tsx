import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Animated, Easing, Image, Pressable, View } from 'react-native';
import { IconArrowDown, IconArrowUp } from '../icons';
import {
  Press,
  control,
  face,
  hairline,
  motion,
  radius,
  space,
  useEased,
  useTheme,
} from './theme';
import { Cluster } from './layout';
import { Text } from './text';

/* The things a finger presses. Every one of them crosses to its pressed ground over the motion
   tokens: the CSS has a transition on all three of background, border and colour, and a control
   that jumps between them does not read as the same system.

   There is no hover rule here. A finger arrives already pressing, which is the one deviation every
   control in this file shares. */

export type ButtonVariant = 'default' | 'primary' | 'accent' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const HEIGHT = { sm: control.sm, md: control.md, lg: control.lg } as const;

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'md',
  disabled,
  full,
  icon,
}: {
  children?: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** fills the row it is in, which is what a phone wants for a form action */
  full?: boolean;
  icon?: ReactNode;
}) {
  const { t, size: step } = useTheme();
  const [down, setDown] = useState(false);

  /* button.css, variant by variant. Each :active names a ground and a border, and danger names an
     ink as well: pressed, it fills with the accent and its words go to the ink that reads on it. */
  const grounds: Record<
    ButtonVariant,
    { rest: string; down: string; ink: string; inkDown: string; edge: string; edgeDown: string }
  > = {
    default: {
      rest: t.bg.surface,
      down: t.bg.pressed,
      ink: t.fg.default,
      inkDown: t.fg.default,
      edge: t.border.control,
      edgeDown: t.border.strong,
    },
    primary: {
      rest: t.fill.default,
      down: t.fill.active,
      ink: t.fg.onFill,
      inkDown: t.fg.onFill,
      edge: t.fill.default,
      edgeDown: t.fill.active,
    },
    accent: {
      rest: t.accent.default,
      down: t.accent.active,
      ink: t.fg.onAccent,
      inkDown: t.fg.onAccent,
      edge: t.accent.default,
      edgeDown: t.accent.active,
    },
    quiet: {
      rest: 'transparent',
      down: t.bg.pressed,
      ink: t.fg.default,
      inkDown: t.fg.default,
      edge: 'transparent',
      edgeDown: t.border.strong,
    },
    danger: {
      rest: t.bg.surface,
      down: t.accent.active,
      ink: t.status.err,
      inkDown: t.fg.onAccent,
      edge: t.status.err,
      edgeDown: t.accent.active,
    },
  };
  const g = grounds[variant];

  return (
    <Press
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      rest={g.rest}
      down={g.down}
      edge={g.edge}
      edgeDown={g.edgeDown}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[8],
        height: HEIGHT[size],
        paddingHorizontal: space[16],
        borderRadius: radius,
        borderWidth: hairline,
        // .kb-btn[disabled] is half opacity and takes no presses
        opacity: disabled ? 0.5 : 1,
        alignSelf: full ? 'stretch' : 'flex-start',
      }}
    >
      {icon}
      {children === undefined ? null : (
        <Text
          kind="small"
          style={{ color: down ? g.inkDown : g.ink, fontFamily: face.medium, fontSize: step('14') }}
        >
          {children}
        </Text>
      )}
    </Press>
  );
}

/** .kb-btn-link: a button that reads as a link, for a destructive or minor action in a row */
export function LinkButton({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const { t } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} unstable_pressDelay={0}>
      {({ pressed }) => (
        <Text
          kind="small"
          style={{
            color: pressed ? t.accent.active : t.accent.default,
            fontFamily: face.medium,
            textDecorationLine: 'underline',
          }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

/* .kb-tray: a pill holding a segmented set, on the deepest ground step so it reads on the page and
   on a panel alike. An unselected item is full ink on a transparent ground and lifts to the surface
   under a finger; the selected one is filled and settles to fill.active.

   Selection itself is instant: the CSS sets transition none on the item, because a background
   cross-fade takes the label through grey. */
export type TrayItem = { value: string; label: string; count?: number };

export function Tray({
  value,
  options,
  onChange,
  label,
  size = 'sm',
}: {
  value: string;
  options: TrayItem[];
  onChange: (value: string) => void;
  label?: string;
  size?: ButtonSize;
}) {
  const { t, size: step } = useTheme();
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
          <Press
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            rest={on ? t.fill.default : 'transparent'}
            down={on ? t.fill.active : t.bg.raised}
            edge="transparent"
            edgeDown={on ? 'transparent' : t.border.strong}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[8],
              height: HEIGHT[size],
              paddingHorizontal: space[16],
              borderRadius: radius,
              // the tray item carries a transparent edge until it is pressed, then the strong one
              borderWidth: hairline,
            }}
          >
            <Text
              kind="small"
              style={{
                color: on ? t.fg.onFill : t.fg.default,
                fontFamily: face.medium,
                fontSize: step('14'),
              }}
            >
              {option.label}
            </Text>
            {option.count === undefined ? null : (
              <Text
                kind="small"
                num
                style={{ color: on ? t.fg.onFill : t.fg.secondary, opacity: on ? 0.8 : 1 }}
              >
                {option.count}
              </Text>
            )}
          </Press>
        );
      })}
    </View>
  );
}

/** .kb-tabs: the same set, drawn as a strip of links rather than a pill */
export type TabItem = { value: string; label: string; count?: number };

export function Tabs({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: TabItem[];
  onChange: (value: string) => void;
  label?: string;
}) {
  return <Tray value={value} options={options} onChange={onChange} label={label} />;
}

/* .kb-avatar: a square with the one radius, the fill ground, and initials when there is no image.
   Not a circle: the radius rule holds unless a thing is genuinely flush. */
export function Avatar({
  initials,
  src,
  size = 'md',
}: {
  initials: string;
  src?: string;
  size?: 'md' | 'lg' | 'xl';
}) {
  const { t, size: step } = useTheme();
  const edge = size === 'xl' ? space[96] : size === 'lg' ? space[48] : space[32];
  return (
    <View
      style={{
        width: edge,
        height: edge,
        borderRadius: radius,
        backgroundColor: t.fill.default,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: edge, height: edge }} resizeMode="cover" />
      ) : (
        <Text
          style={{
            color: t.fg.onFill,
            fontFamily: face.medium,
            fontSize: size === 'xl' ? step('32') : size === 'lg' ? step('16') : step('12'),
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

/** .kb-avatar-stack: overlapped by a rung, each ringed in the surface it sits on */
export function AvatarStack({ people }: { people: { initials: string; src?: string }[] }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {people.map((who, i) => (
        <View
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -space[8],
            borderWidth: 2,
            borderColor: t.bg.surface,
            borderRadius: radius,
          }}
        >
          <Avatar initials={who.initials} src={who.src} />
        </View>
      ))}
    </View>
  );
}

/** .kb-crumbs: where this page sits, slashes between, the last one current */
export function Crumbs({
  trail,
  onPress,
}: {
  trail: { label: string; href?: string }[];
  onPress?: (href: string) => void;
}) {
  const { t } = useTheme();
  return (
    <Cluster gap="tight">
      {trail.map((step, i) => (
        <Cluster key={i} gap="tight">
          {i > 0 ? (
            <Text kind="small" style={{ color: t.fg.muted }}>
              /
            </Text>
          ) : null}
          {step.href && onPress ? (
            <Press
              accessibilityRole="link"
              onPress={() => onPress(step.href!)}
              rest="transparent"
              down={t.bg.pressed}
              style={{
                height: control.sm,
                justifyContent: 'center',
                paddingHorizontal: space[8],
                borderRadius: radius,
              }}
            >
              <Text kind="small" muted style={{ fontFamily: face.medium }}>
                {step.label}
              </Text>
            </Press>
          ) : (
            <Text kind="small" muted style={{ fontFamily: face.medium, paddingHorizontal: space[8] }}>
              {step.label}
            </Text>
          )}
        </Cluster>
      ))}
    </Cluster>
  );
}

/** .kb-pages: one target a page, the current one filled */
export function Pages({
  page,
  pages,
  onGo,
}: {
  page: number;
  pages: number;
  onGo: (page: number) => void;
}) {
  const { t } = useTheme();
  if (pages <= 1) return null;
  // a phone cannot hold ten targets in a row: the ends, the neighbours, and the current one
  const shown = [...new Set([1, page - 1, page, page + 1, pages])].filter(
    (n) => n >= 1 && n <= pages,
  );
  return (
    <Cluster gap="tight">
      {shown.map((n, i) => (
        <Cluster key={n} gap="tight">
          {i > 0 && n - shown[i - 1] > 1 ? (
            <Text kind="small" style={{ color: t.fg.muted }}>
              ...
            </Text>
          ) : null}
          <Press
            accessibilityRole="link"
            accessibilityState={{ selected: n === page }}
            onPress={() => onGo(n)}
            rest={n === page ? t.fill.default : 'transparent'}
            down={n === page ? t.fill.active : t.bg.pressed}
            style={{
              minWidth: control.sm,
              height: control.sm,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: space[8],
              borderRadius: radius,
            }}
          >
            <Text
              kind="small"
              num
              style={{
                color: n === page ? t.fg.onFill : t.fg.secondary,
                fontFamily: face.medium,
              }}
            >
              {n}
            </Text>
          </Press>
        </Cluster>
      ))}
    </Cluster>
  );
}

/** .kb-progress: a bar that eases to its value over the motion tokens */
export function Progress({ value, label }: { value: number; label?: string }) {
  const { t } = useTheme();
  const at = useEased(Math.min(Math.max(value, 0), 1));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ now: Math.round(value * 100), min: 0, max: 100 }}
      style={{
        height: space[8],
        backgroundColor: t.bg.pressed,
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: radius,
          backgroundColor: t.accent.default,
          width: at.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

/** .kb-skeleton: the shape of what is coming, with the shimmer the CSS animates */
export function Skeleton({ height, width }: { height?: number; width?: number | `${number}%` }) {
  const { t } = useTheme();
  const at = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    const run = Animated.loop(
      Animated.timing(at, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
    );
    run.start();
    return () => run.stop();
  }, [at]);
  return (
    <View
      style={{
        height: height ?? space[16],
        width: width ?? '100%',
        backgroundColor: t.bg.raised,
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          width: '40%',
          height: '100%',
          backgroundColor: t.bg.pressed,
          transform: [
            { translateX: at.interpolate({ inputRange: [0, 1], outputRange: [-120, 400] }) },
          ],
        }}
      />
    </View>
  );
}

/* .kb-spin: a 2px ring in the current ink with its top edge cleared, turning in 700ms. Not
   ActivityIndicator, which brings the platform's look with it. */
export function Spinner({ step = '18', colour }: { step?: Parameters<ReturnType<typeof useTheme>['size']>[0]; colour?: string }) {
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
        borderColor: colour ?? t.fg.secondary,
        borderTopColor: 'transparent',
        transform: [
          { rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
        ],
      }}
    />
  );
}

/** a delta beside a figure: the arrow carries the direction, the colour agrees with it */
export function Delta({ value }: { value: number }) {
  const { t } = useTheme();
  const up = value >= 0;
  const ink = up ? t.status.ok : t.status.err;
  return (
    <Cluster gap="tight">
      {up ? <IconArrowUp size={14} colour={ink} /> : <IconArrowDown size={14} colour={ink} />}
      <Text kind="small" num style={{ color: ink }}>
        {Math.abs(value)}%
      </Text>
    </Cluster>
  );
}

export { motion };
