import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { FlatList, View } from 'react-native';
import * as api from '../gitea';
import { Bar, Failed, Panel, Refresh, Row, Text, Waiting, space, useBarInset } from '../ui';

/* Every repository the instance shows a guest. A list, not a scroll view: it is the one screen
   that can grow without limit. */

export default function Repos() {
  const q = useQuery({ queryKey: ['repos'], queryFn: api.repos });
  const rows = q.data ?? [];
  const top = useBarInset();

  return (
    <View style={{ flex: 1 }}>
      {q.isPending ? (
        <Waiting style={{ paddingTop: top }} />
      ) : q.isError ? (
        <Failed error={q.error} onRetry={q.refetch} style={{ paddingTop: top }} />
      ) : (
        <FlatList
      data={rows}
      keyExtractor={(repo) => String(repo.id)}
      contentContainerStyle={{ padding: space[16], paddingTop: top }}
      ListHeaderComponent={
        <Text kind="small" muted style={{ marginBottom: space[8] }}>
          {rows.length} public {rows.length === 1 ? 'repository' : 'repositories'}
        </Text>
      }
      renderItem={({ item, index }) => (
        <Panel
          style={{
            borderTopLeftRadius: index === 0 ? undefined : 0,
            borderTopRightRadius: index === 0 ? undefined : 0,
            borderBottomLeftRadius: index === rows.length - 1 ? undefined : 0,
            borderBottomRightRadius: index === rows.length - 1 ? undefined : 0,
            borderTopWidth: index === 0 ? undefined : 0,
          }}
        >
          <Link
            href={{
              pathname: '/repo/[owner]/[name]',
              params: { owner: item.full_name.split('/')[0], name: item.name },
            }}
            asChild
          >
            <Row
              title={item.full_name}
              note={item.description || item.language || undefined}
              meta={item.open_issues_count ? `${item.open_issues_count} open` : undefined}
              last
            />
          </Link>
        </Panel>
      )}
      ListEmptyComponent={
        <View style={{ padding: space[24] }}>
          <Text muted>Nothing public here.</Text>
        </View>
      }
    />
      )}
      <Bar title="Repositories" action={<Refresh busy={q.isRefetching} onPress={q.refetch} />} />
    </View>
  );
}
