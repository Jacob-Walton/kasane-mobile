import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Press, face, hairline, radius, space, useTheme } from './theme';
import { Text } from './text';

/* A listing: one box carrying a header strip and the rows it belongs to, drawn as one surface and
   not two stacked ones.

   Rows are flush, so a rule is the only thing left to tell them apart: this is the table's
   treatment, and a listing's body can be a table. Where items should be told apart by room instead,
   that is a collection, which is in layout.tsx. */

export function Listing({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.bg.surface,
        borderRadius: radius,
        borderWidth: hairline,
        borderColor: t.border.hairline,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

export function ListingHead({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        paddingHorizontal: space[16],
        paddingVertical: space[12],
        borderBottomWidth: hairline,
        borderBottomColor: t.border.hairline,
      }}
    >
      {typeof children === 'string' ? (
        <Text kind="small" style={{ fontFamily: face.medium }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

/** .kb-listing__group: a day, a year, a directory. What the run of rows under it has in common. */
export function ListingGroup({ children }: { children: string }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: space[16],
        paddingVertical: space[8],
        backgroundColor: t.bg.page,
      }}
    >
      <Text kind="caps" muted>
        {children}
      </Text>
    </View>
  );
}

export function ListingRow({
  title,
  note,
  meta,
  figure,
  action,
  first,
  onPress,
}: {
  title: ReactNode;
  note?: string;
  meta?: ReactNode;
  /** .kb-listing__figure: the icon or avatar at the leading edge */
  figure?: ReactNode;
  action?: ReactNode;
  /** the first row after a head or a group draws no line of its own */
  first?: boolean;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  const body = (
    <>
      {figure}
      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        {typeof title === 'string' ? (
          <Text kind="small" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
        {note ? (
          <Text kind="caps" muted numberOfLines={1} style={{ textTransform: 'none' }}>
            {note}
          </Text>
        ) : null}
      </View>
      {meta}
      {action}
    </>
  );
  const shape = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: space[12],
    paddingHorizontal: space[16],
    paddingVertical: space[12],
    borderTopWidth: first ? 0 : hairline,
    borderTopColor: t.border.hairline,
  };
  if (!onPress) return <View style={shape}>{body}</View>;
  return (
    <Press
      accessibilityRole="button"
      onPress={onPress}
      rest={t.bg.surface}
      down={t.bg.raised}
      style={shape}
    >
      {body}
    </Press>
  );
}
