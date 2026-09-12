import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import * as api from '../../../../gitea';
import { Markdown } from '../../../../markdown';
import {
  Button,
  Cluster,
  Failed,
  Panel,
  PanelBody,
  PanelHead,
  Status,
  Text,
  Waiting,
  space,
  usePagePad,
} from '../../../../kasane';

/* One issue: what it says, then what was said about it. The web client draws the title as a
   heading with the number muted after it, the state and the byline as marks under it, and every
   comment as a panel whose head is the byline and whose body is the markdown. */

export default function One() {
  const { owner, name, number } = useLocalSearchParams<{
    owner: string;
    name: string;
    number: string;
  }>();
  const full = `${owner}/${name}`;
  const n = Number(number);
  const pad = usePagePad();

  const q = useQuery({
    queryKey: ['issue', full, n],
    queryFn: async () => ({
      issue: await api.issue(full, n),
      said: await api.comments(full, n).catch(() => []),
    }),
  });

  if (q.isPending) return <Waiting style={pad} />;
  if (q.isError) return <Failed error={q.error} onRetry={q.refetch} style={pad} />;

  const { issue, said } = q.data;

  return (
    <ScrollView contentContainerStyle={{ ...pad, gap: space[16] }}>
      <View style={{ gap: space[8] }}>
        <Text kind="heading">
          {issue.title}{' '}
          <Text kind="heading" muted num>
            #{number}
          </Text>
        </Text>
        <Cluster gap="tight">
          <Status kind={issue.state === 'open' ? 'ok' : 'neutral'}>
            {issue.state === 'open' ? 'Open' : 'Closed'}
          </Status>
          {issue.pull_request ? <Status>Pull request</Status> : null}
        </Cluster>
      </View>

      <Panel>
        <PanelHead
          title={
            <Text kind="small" muted>
              {issue.user.login} opened this {api.ago(issue.created_at)}
            </Text>
          }
        />
        <PanelBody>
          <Markdown source={issue.body} empty="No description." />
        </PanelBody>
      </Panel>

      {said.map((comment) => (
        <Panel key={comment.id}>
          <PanelHead
            title={
              <Text kind="small" muted>
                {comment.user.login} said {api.ago(comment.created_at)}
              </Text>
            }
          />
          <PanelBody>
            <Markdown source={comment.body} />
          </PanelBody>
        </Panel>
      ))}

      <Cluster>
        <Button variant="primary">Comment</Button>
        <Button>{issue.state === 'open' ? 'Close' : 'Reopen'}</Button>
      </Cluster>
      <Text kind="small" muted>
        Reading only: signing in is not built yet.
      </Text>
    </ScrollView>
  );
}
