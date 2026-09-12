import type { ReactNode } from 'react';
import { View } from 'react-native';
import { IconMore } from '../icons';
import { Seal } from '../seal';
import { Press, control, face, radius, shadow, space, useTheme } from './theme';
import { useBarInsets } from './page';
import { Text } from './text';
import { Menu, type MenuItem } from './feedback';

/* .kb-bar: a pill that floats over the page. Surface ground, a hairline all round, the one radius,
   the bar shadow, 8 of padding, and 16 from the edge.

   Under 768 the CSS moves it to the bottom, so that is where it is here. The brand is a mark, the
   links collapse into a menu, and the actions follow them. There is no page title in it and no back
   control: the page says what it is in its own Head, and the OS owns going back. */

export type NavItem = { label: string; current?: boolean; onPress?: () => void };

export function Bar({
  items = [],
  actions,
  onBrand,
  label = 'Sections',
  menuLabel = 'Menu',
}: {
  items?: NavItem[];
  /** sign in, an account menu */
  actions?: ReactNode;
  onBrand?: () => void;
  label?: string;
  menuLabel?: string;
}) {
  const { t } = useTheme();
  const edge = useBarInsets();
  const here = items.find((item) => item.current);

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

        {/* where you are, since the links themselves are in the menu */}
        {here ? (
          <Text kind="small" style={{ flex: 1, fontFamily: face.medium }} numberOfLines={1}>
            {here.label}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {actions}

        {items.length ? (
          <Menu
            label={menuLabel}
            items={items.map<MenuItem>((item) => ({ label: item.label, onPress: item.onPress }))}
            trigger={(open) => (
              <Press
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={open}
                rest="transparent"
                down={t.bg.pressed}
                style={{
                  width: control.md,
                  height: control.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius,
                  borderWidth: 0.5,
                  borderColor: t.border.control,
                }}
              >
                <IconMore size={18} />
              </Press>
            )}
          />
        ) : null}
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
