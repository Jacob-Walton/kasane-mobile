import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Seal } from '../seal';
import { Press, control, face, radius, shadow, space, useTheme } from './theme';
import { useBarInsets } from './page';
import { Text } from './text';
import { Menu, type MenuItem } from './feedback';

/* .kb-bar: a pill that floats over the page. Surface ground, a hairline all round, the one radius,
   the bar shadow, 8 of padding, and 16 from the edge. Under 768 the CSS moves it to the bottom, so
   that is where it is here.

   The web collapses its links into a small button labelled Menu and lets each page carry its own
   crumbs. A phone has no room for a crumb trail and no pointer to aim at one, so the trail goes in
   the menu instead and the button that opens it says where you are. That is the one thing this bar
   carries that the web's does not, and it is why the button is the width of the bar: it is the
   whole of the navigation, at the end a thumb reaches. */

export type NavItem = { label: string; current?: boolean; onPress?: () => void };

export function Bar({
  where,
  items = [],
  actions,
  onBrand,
  menuLabel = 'Menu',
}: {
  /** what the menu button says, and the rows the menu opens with */
  where?: { label: string; items?: MenuItem[] };
  /** the sections, as the web's nav holds them */
  items?: NavItem[];
  /** sign in, an account menu */
  actions?: ReactNode;
  onBrand?: () => void;
  menuLabel?: string;
}) {
  const { t } = useTheme();
  const edge = useBarInsets();

  const rows: MenuItem[] = [
    ...(where?.items ?? []),
    ...items.map<MenuItem>((item, i) => ({
      label: item.label,
      onPress: item.onPress,
      checked: item.current,
      group: i === 0 ? 'Sections' : undefined,
    })),
  ];

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
          borderWidth: 0.5,
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

        {rows.length ? (
          <Menu
            label={menuLabel}
            items={rows}
            trigger={(open) => (
              <Press
                accessibilityRole="button"
                accessibilityLabel={`${menuLabel}: ${where?.label ?? ''}`.trim()}
                onPress={open}
                rest="transparent"
                down={t.bg.pressed}
                grow
                style={{
                  height: control.md,
                  justifyContent: 'center',
                  paddingHorizontal: space[16],
                  borderRadius: radius,
                  borderWidth: 0.5,
                  borderColor: t.border.control,
                }}
              >
                <Text kind="small" numberOfLines={1} style={{ fontFamily: face.medium }}>
                  {where?.label ?? menuLabel}
                </Text>
              </Press>
            )}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {actions}
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
