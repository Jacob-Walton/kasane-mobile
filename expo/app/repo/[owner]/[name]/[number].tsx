import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import * as api from '../../../../gitea';
import { Markdown } from '../../../../markdown';
import {
  Bar,
  Button,
  Failed,
  Marks,
  Panel,
  PanelBody,
  PanelHead,
  Status,
  Text,
  Waiting,
  space,
  useBarInset,
} from '../../../../ui';

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
  const router = useRouter();
  const top = useBarInset();

  const q = useQuery({
    queryKey: ['issue', full, n],
    queryFn: async () => ({
      issue: await api.issue(full, n),
      said: await api.comments(full, n).catch(() => []),
    }),
  });

  return (
    <>
      {q.isPending ? (
        <Waiting style={{ paddingTop: top }} />
      ) : q.isError ? (
        <Failed error={q.error} onRetry={q.refetch} style={{ paddingTop: top }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: space[16],
            paddingTop: top,
            gap: space[16],
            paddingBottom: space[64],
          }}
        >
          <View style={{ gap: space[8] }}>
            <Text kind="heading">
              {q.data.issue.title}{' '}
              <Text kind="heading" muted>
                #{number}
              </Text>
            </Text>
            <Marks tight>
              <Status
                label={q.data.issue.state === 'open' ? 'Open' : 'Closed'}
                kind={q.data.issue.state === 'open' ? 'ok' : 'neutral'}
              />
              {q.data.issue.pull_request ? <Status label="Pull request" /> : null}
            </Marks>
          </View>

          <Panel>
            <PanelHead>
              <Text kind="small" muted>
                {q.data.issue.user.login} opened this {api.ago(q.data.issue.created_at)}
              </Text>
            </PanelHead>
            <PanelBody>
              <Markdown source={q.data.issue.body} empty="No description." />
            </PanelBody>
          </Panel>

          {q.data.said.map((comment) => (
            <Panel key={comment.id}>
              <PanelHead>
                <Text kind="small" muted>
                  {comment.user.login} said {api.ago(comment.created_at)}
                </Text>
              </PanelHead>
              <PanelBody>
                <Markdown source={comment.body} />
              </PanelBody>
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
      <Bar onBack={router.back} />
    </>
  );
}
