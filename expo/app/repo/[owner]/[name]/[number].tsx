import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import * as api from '../../../../gitea';
import { Markdown } from '../../../../markdown';
import { Bar, Button, Failed, Panel, Pill, Refresh, Text, Waiting, space } from '../../../../ui';

/* One issue: what it says, then what was said about it. */

export default function One() {
  const { owner, name, number } = useLocalSearchParams<{
    owner: string;
    name: string;
    number: string;
  }>();
  const full = `${owner}/${name}`;
  const n = Number(number);
  const router = useRouter();

  const q = useQuery({
    queryKey: ['issue', full, n],
    queryFn: async () => ({
      issue: await api.issue(full, n),
      said: await api.comments(full, n).catch(() => []),
    }),
  });

  return (
    <>
      <Bar
        title={`#${number}`}
        onBack={router.back}
        action={<Refresh busy={q.isRefetching} onPress={q.refetch} />}
      />
      {q.isPending ? (
        <Waiting />
      ) : q.isError ? (
        <Failed error={q.error} onRetry={q.refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[16], gap: space[16], paddingBottom: space[64] }}
        >
          <View style={{ gap: space[8] }}>
            <Text kind="title">{q.data.issue.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8] }}>
              <Pill
                label={q.data.issue.state === 'open' ? 'Open' : 'Closed'}
                kind={q.data.issue.state === 'open' ? 'ok' : 'neutral'}
              />
              {q.data.issue.pull_request ? <Pill label="Pull request" /> : null}
              <Text kind="small" muted>
                {q.data.issue.user.login} opened this {api.ago(q.data.issue.created_at)}
              </Text>
            </View>
          </View>

          <Panel style={{ padding: space[16] }}>
            <Markdown source={q.data.issue.body} empty="No description." />
          </Panel>

          {q.data.said.length ? (
            <Text kind="caps" muted>
              {q.data.said.length} {q.data.said.length === 1 ? 'comment' : 'comments'}
            </Text>
          ) : null}

          {q.data.said.map((comment) => (
            <Panel key={comment.id} style={{ padding: space[16], gap: space[8] }}>
              <Text kind="small" muted>
                {comment.user.login} · {api.ago(comment.created_at)}
              </Text>
              <Markdown source={comment.body} />
            </Panel>
          ))}

          <View style={{ flexDirection: 'row', gap: space[8] }}>
            <Button label="Comment" primary />
            <Button label={q.data.issue.state === 'open' ? 'Close' : 'Reopen'} />
          </View>
          <Text kind="small" muted>
            Reading only: signing in is not built yet.
          </Text>
        </ScrollView>
      )}
    </>
  );
}
