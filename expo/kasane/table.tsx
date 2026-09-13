import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { Press, face, hairline, radius, space, useTheme } from './theme';
import { Text } from './text';

/* A table, and the one place a rule between repeating rows belongs. Everything else told apart by
   rules is a listing, which is the same treatment for the same reason.

   A phone cannot widen, so the table scrolls sideways inside its own box and the page does not. The
   web wraps it the same way for the same reason. */

export type Priority = 'always' | 'wide';

export type Column = {
  name: string;
  /** wide drops out below 768, the way the CSS hides a low-priority column */
  priority?: Priority;
  num?: boolean;
  width?: number;
};

/** .kb-table-wrap: the box that scrolls, so the page never does */
export function TableWrap({ children, foot }: { children: ReactNode; foot?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ minWidth: '100%' }}>
        <View>{children}</View>
      </ScrollView>
      {foot}
    </View>
  );
}

export function Table<T>({
  columns,
  rows,
  keyOf,
  cell,
  onPressRow,
}: {
  columns: Column[];
  rows: T[];
  keyOf: (row: T) => string;
  cell: (row: T, column: Column) => ReactNode;
  onPressRow?: (row: T) => void;
}) {
  const { t } = useTheme();
  const shown = columns.filter((c) => c.priority !== 'wide');

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          gap: space[12],
          paddingHorizontal: space[16],
          paddingVertical: space[8],
          borderBottomWidth: hairline,
          borderBottomColor: t.border.hairline,
        }}
      >
        {shown.map((c) => (
          <View key={c.name} style={{ width: c.width, flex: c.width ? undefined : 1 }}>
            <Text kind="caps" muted style={{ textAlign: c.num ? 'right' : 'left' }}>
              {c.name}
            </Text>
          </View>
        ))}
      </View>

      {rows.map((row, i) => {
        const body = shown.map((c) => (
          <View key={c.name} style={{ width: c.width, flex: c.width ? undefined : 1 }}>
            {typeof cell(row, c) === 'string' ? (
              <Text kind="small" num={c.num} style={{ textAlign: c.num ? 'right' : 'left' }}>
                {cell(row, c)}
              </Text>
            ) : (
              cell(row, c)
            )}
          </View>
        ));
        const shape = {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: space[12],
          paddingHorizontal: space[16],
          paddingVertical: space[12],
          borderBottomWidth: i === rows.length - 1 ? 0 : hairline,
          borderBottomColor: t.border.hairline,
        };
        return onPressRow ? (
          <Press
            key={keyOf(row)}
            accessibilityRole="button"
            onPress={() => onPressRow(row)}
            rest={t.bg.surface}
            down={t.bg.pressed}
            style={shape}
          >
            {body}
          </Press>
        ) : (
          <View key={keyOf(row)} style={shape}>
            {body}
          </View>
        );
      })}
    </View>
  );
}

/** .kb-row-title: the cell that names the row, at full ink */
export function RowTitle({ children }: { children: ReactNode }) {
  return (
    <Text kind="small" style={{ fontFamily: face.medium }} numberOfLines={1}>
      {children}
    </Text>
  );
}

/** .kb-table-foot: what the table adds up to, and the pages */
export function TableFoot({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space[8],
        paddingHorizontal: space[16],
        paddingVertical: space[12],
        backgroundColor: t.bg.page,
      }}
    >
      {children}
    </View>
  );
}
