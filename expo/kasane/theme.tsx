import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  PixelRatio,
  Pressable,
  useColorScheme,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { control, dark, light, motion, radius, room, shadow, space, type as ladder } from '../theme';

/* The ground every part stands on: the theme the OS is in, the ladder a size comes from, and the
   one thing a phone has to add, which is how a press feels.

   Nothing in this folder holds a colour or a number. They come from theme.ts, generated from
   Kasane's DTCG source, and what differs from the web is written in tokens/deviations.json. */

export type Step = keyof typeof ladder;

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
      track: (step: Step) => ladder[step].size * scale * ladder[step].tracking,
    };
  }, [scheme, scale]);
}

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

/* Every transition in Kasane's CSS names one duration and one curve. A control that snaps between
   grounds instead of crossing to them is the difference between a control and a picture of one, so
   a press here is a timing on the same two values.

   The colour cannot go on the native driver, which is why this one animation runs in JS. It is one
   interpolation over 120ms. */
export function usePressGround(rest: string, down: string) {
  // useMemo, not useRef: the value is read while the style is built, which is render
  const at = useMemo(() => new Animated.Value(0), []);
  const cross = useMemo(
    () => Easing.bezier(motion.curve[0], motion.curve[1], motion.curve[2], motion.curve[3]),
    [],
  );

  const to = (value: number) =>
    Animated.timing(at, {
      toValue: value,
      duration: motion.duration,
      easing: cross,
      useNativeDriver: false,
    }).start();

  return {
    ground: at.interpolate({ inputRange: [0, 1], outputRange: [rest, down] }),
    onPressIn: () => to(1),
    onPressOut: () => to(0),
  };
}

/** a press that crosses to its pressed ground over the motion tokens, the way the CSS does */
export function Press({
  rest,
  down,
  style,
  children,
  ...props
}: {
  /** the ground at rest */
  rest: string;
  /** the ground under a finger */
  down: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
} & Omit<PressableProps, 'style' | 'children'>) {
  const { ground, onPressIn, onPressOut } = usePressGround(rest, down);
  return (
    <Pressable
      // a target inside a list waits to see whether the touch was a scroll. Nothing should wait.
      unstable_pressDelay={0}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...props}
    >
      <Animated.View style={[{ backgroundColor: ground }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

/** a value that eases to its next one over the motion tokens: a bar, a width, an angle */
export function useEased(value: number) {
  // the first value is where it starts, not what it follows: the effect below does the following
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const at = useMemo(() => new Animated.Value(value), []);
  useEffect(() => {
    Animated.timing(at, {
      toValue: value,
      duration: motion.duration,
      easing: Easing.bezier(motion.curve[0], motion.curve[1], motion.curve[2], motion.curve[3]),
      useNativeDriver: false,
    }).start();
  }, [at, value]);
  return at;
}

export { control, motion, radius, room, shadow, space };
export type Ink = ReturnType<typeof useTheme>['t'];
