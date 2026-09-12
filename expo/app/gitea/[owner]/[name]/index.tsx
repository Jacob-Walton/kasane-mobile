import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList } from 'react-native';
import * as api from '../../../../gitea';
import { RepoHead } from '../../../../repo-head';
import {
  Cluster,
  Empty,
  Fact,
  Failed,
  Head,
  Item,
  Meta,
  Status,
  Tray,
  Waiting,
  space,
  usePagePad,
} from '../../../../kasane';

/* One repository: its issues and its pulls, under the repository's own head. The head is the way
   back up, which is where the site puts it too.

   The instance keeps issues and pulls in one list, told apart by whether an entry carries a pull
   request, which is why the filter is here and not in the query. */

type Kind = 'issues' | 'pulls';
type State = 'open' | 'closed';

export default function Issues() {
  const {
    owner,
    name,
    kind: asked,
  } = useLocalSearchParams<{ owner: string; name: string; kind?: string }>();
  const full = `${owner}/${name}`;
  const router = useRouter();
  const [state, setState] = useState<State>('open');
  const pad = usePagePad();
  const kind: Kind = asked === 'pulls' ? 'pulls' : 'issues';

  const repo = useQuery({ queryKey: ['repo', full], queryFn: () => api.repo(full) });
  const q = useQuery({ queryKey: ['issues', full], queryFn: () => api.issues(full) });

  const all = q.data ?? [];
  const rows = all.filter(
    (i) => (kind === 'pulls' ? !!i.pull_request : !i.pull_request) && i.state === state,
  );
  const count = (st: State) =>
    all.filter((i) => (kind === 'pulls' ? !!i.pull_request : !i.pull_request) && i.state === st)
      .length;

  return (
    <FlatList
      data={rows}
      keyExtractor={(issue) => String(issue.id)}
      contentContainerStyle={{ ...pad, gap: space[16] }}
      ListHeaderComponent={
        <>
          <RepoHead repo={repo.data} tab={kind} />
          <Head
            title={kind === 'pulls' ? 'Pulls' : 'Issues'}
            aside={`${count('open') + count('closed')} in ${full}`}
          />
          <Tray
            label={kind === 'pulls' ? 'Pull state' : 'Issue state'}
            value={state}
            onChange={(v) => setState(v as State)}
            options={[
              { value: 'open', label: 'Open', count: count('open') },
              { value: 'closed', label: 'Closed', count: count('closed') },
            ]}
          />
        </>
      }
      ListHeaderComponentStyle={{ gap: space[16], marginBottom: space[8] }}
      ListEmptyComponent={
        q.isPending ? (
          <Waiting />
        ) : q.isError ? (
          <Failed error={q.error} onRetry={q.refetch} />
        ) : (
          <Empty>No results found.</Empty>
        )
      }
      renderItem={({ item }) => (
        <Item
          title={item.title}
          marks={
            <Cluster gap="tight">
              <Status kind={item.state === 'open' ? 'ok' : 'neutral'}>
                {item.state === 'open' ? 'Open' : 'Closed'}
              </Status>
            </Cluster>
          }
          aside={
            <Meta>
              <Fact num>#{item.number}</Fact>
              {item.comments ? (
                <Fact>
                  {item.comments} {item.comments === 1 ? 'comment' : 'comments'}
                </Fact>
              ) : null}
            </Meta>
          }
          text={`opened ${api.ago(item.created_at)} by ${item.user.login}`}
          onPress={() =>
            router.push({
              pathname: '/gitea/[owner]/[name]/[number]',
              params: { owner, name, number: item.number },
            })
          }
        />
      )}
    />
  );
}
