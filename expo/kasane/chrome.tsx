import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Seal } from '../seal';
import { Press, control, face, hairline, radius, shadow, space, useTheme } from './theme';
import { useBarInsets } from './page';
import { Text } from './text';

/* .kb-bar: a pill that floats over the page. Surface ground, a hairline all round, the one radius,
   the bar shadow, 8 of padding, and 16 from the edge. Under 768 the CSS moves it to the bottom, so
   that is where it is here.

   The links sit in the bar, as .kb-bar__nav draws them: control height, 16 of padding inside, 4
   between, secondary ink until the current one, which is filled. The web collapses them into a
   menu only because it carries four of them and an account beside; a bar with two has room. */

export type NavItem = { label: string; current?: boolean; onPress?: () => void };

export function Bar({
  items = [],
  actions,
  onBrand,
  label = 'Primary',
}: {
  items?: NavItem[];
  /** sign in, an account menu */
  actions?: ReactNode;
  onBrand?: () => void;
  label?: string;
}) {
  const { t } = useTheme();
  const edge = useBarInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: edge.left, right: edge.right, bottom: edge.bottom }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[8],
          padding: space[8],
          backgroundColor: t.bg.surface,
          borderRadius: radius,
          borderWidth: hairline,
          borderColor: t.border.hairline,
          shadowColor: shadow.bar.colour,
          shadowOffset: { width: shadow.bar.x, height: shadow.bar.y },
          shadowRadius: shadow.bar.blur / 2,
          shadowOpacity: shadow.bar.opacity,
          elevation: 8,
        }}
      >
        <Press
          accessibilityRole="link"
          accessibilityLabel="Home"
          onPress={onBrand}
          rest="transparent"
          down={t.bg.pressed}
          style={{
            width: control.md,
            height: control.md,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius,
          }}
        >
          <Seal size={space[24]} decorative />
        </Press>

        <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', gap: space[4] }}>
          {items.map((item) => (
            <Press
              key={item.label}
              accessibilityRole="link"
              accessibilityState={{ selected: !!item.current }}
              onPress={item.onPress}
              rest={item.current ? t.fill.default : 'transparent'}
              down={item.current ? t.fill.active : t.bg.pressed}
              style={{
                height: control.md,
                justifyContent: 'center',
                paddingHorizontal: space[16],
                borderRadius: radius,
              }}
            >
              <Text
                kind="small"
                numberOfLines={1}
                style={{
                  color: item.current ? t.fg.onFill : t.fg.secondary,
                  fontFamily: face.medium,
                }}
              >
                {item.label}
              </Text>
            </Press>
          ))}
        </View>

        {actions ? <View style={{ marginLeft: 'auto' }}>{actions}</View> : null}
      </View>
    </View>
  );
}

/** .kb-footer: the closing band. On a phone it is the end of the page, not a fixed strip. */
export function Footer({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: space[8],
        padding: space[16],
        backgroundColor: t.bg.raised,
        borderRadius: radius,
      }}
    >
      {children}
    </View>
  );
}

export { Seal };
