import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import * as api from '../../../../gitea';
import {
  Bar,
  Failed,
  Panel,
  Refresh,
  Row,
  Text,
  Tray,
  Waiting,
  space,
  useBarInset,
} from '../../../../ui';

/* One repository's issues and pulls. The two are one list on the instance, told apart by whether
   an entry carries a pull request, which is why the filter is here and not in the query. */

type Kind = 'issues' | 'pulls';
type State = 'open' | 'closed';

export default function Issues() {
  const { owner, name } = useLocalSearchParams<{ owner: string; name: string }>();
  const full = `${owner}/${name}`;
  const router = useRouter();
  const [kind, setKind] = useState<Kind>('issues');
  const [state, setState] = useState<State>('open');
  const top = useBarInset();

  const q = useQuery({ queryKey: ['issues', full], queryFn: () => api.issues(full) });

  const all = q.data ?? [];
  const rows = all.filter(
    (i) => (kind === 'pulls' ? !!i.pull_request : !i.pull_request) && i.state === state,
  );
  const count = (k: Kind, s: State) =>
    all.filter((i) => (k === 'pulls' ? !!i.pull_request : !i.pull_request) && i.state === s).length;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: space[16], paddingTop: top, gap: space[8] }}>
          <Tray
            value={kind}
            onChange={(v) => setKind(v as Kind)}
            options={[
              { value: 'issues', label: `Issues ${count('issues', state)}` },
              { value: 'pulls', label: `Pulls ${count('pulls', state)}` },
            ]}
          />
          <Tray
            value={state}
            onChange={(v) => setState(v as State)}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </View>

        {q.isPending ? (
          <Waiting />
        ) : q.isError ? (
          <Failed error={q.error} onRetry={q.refetch} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(issue) => String(issue.id)}
            contentContainerStyle={{ paddingHorizontal: space[16], paddingBottom: space[48] }}
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
                    pathname: '/repo/[owner]/[name]/[number]',
                    params: { owner, name, number: item.number },
                  }}
                  asChild
                >
                  <Row
                    title={item.title}
                    note={`#${item.number} · ${item.user.login} · ${api.ago(item.created_at)}`}
                    meta={item.comments ? `${item.comments}` : undefined}
                    last
                  />
                </Link>
              </Panel>
            )}
            ListEmptyComponent={
              <View style={{ paddingVertical: space[24] }}>
                <Text muted>
                  No {state} {kind} here.
                </Text>
              </View>
            }
          />
        )}
      </View>
      <Bar
        title={name}
        onBack={router.back}
        action={<Refresh busy={q.isRefetching} onPress={q.refetch} />}
      />
    </View>
  );
}
