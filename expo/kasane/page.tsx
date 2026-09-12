import type { ReactNode } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { control, space } from './theme';

/* .kb-band and .kb-col: the page's own padding, and the only place a screen should get it from.

   The web spends 16 a side and lets the viewport start at the top of the window. A phone has a
   status bar, a notch and a home indicator in that space, and the OS is the only thing that knows
   how much: every screen adds what it reports to the rung, so the content starts under the notch
   and ends above the bar without any screen having to remember. */

export function usePagePad() {
  const insets = useSafeAreaInsets();
  return {
    paddingTop: insets.top + space[16],
    // the safe area, the 16 under the bar, the bar itself, and one more 16 above it
    paddingBottom: insets.bottom + space[16] + (control.md + space[8] * 2) + space[16],
    paddingLeft: insets.left + space[16],
    paddingRight: insets.right + space[16],
  };
}

/** what the bar itself has to clear on every edge it touches */
export function useBarInsets() {
  const insets = useSafeAreaInsets();
  return {
    bottom: insets.bottom + space[16],
    left: insets.left + space[16],
    right: insets.right + space[16],
  };
}

/** a page that scrolls. The padding is the band's; the gap is the column's. */
export function Band({
  children,
  gap = space[16],
  style,
}: {
  children: ReactNode;
  gap?: number;
  style?: ViewProps['style'];
}) {
  const pad = usePagePad();
  return (
    <ScrollView contentContainerStyle={[{ ...pad, gap }, style]}>{children}</ScrollView>
  );
}

/** a page that does not scroll, for a screen that holds one thing */
export function Col({ children, gap = space[16] }: { children: ReactNode; gap?: number }) {
  const pad = usePagePad();
  return <View style={{ flex: 1, ...pad, gap }}>{children}</View>;
}
