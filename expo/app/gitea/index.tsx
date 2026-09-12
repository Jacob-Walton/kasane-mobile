import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import * as api from '../../gitea';
import {
  Empty,
  Fact,
  Failed,
  Head,
  Item,
  Cluster,
  Meta,
  Status,
  Waiting,
  space,
  usePagePad,
} from '../../kasane';

/* Every repository the instance shows a guest. The same screen the web client draws at
   /explore/repos: a head with the total, then a collection of items, each one carrying the owner
   muted before the name, the marks that qualify it, and the facts at the end of the title row.

   A list, not a scroll view: it is the one screen that can grow without limit. The gap between
   items is the collection. */

export default function Repos() {
  const q = useQuery({ queryKey: ['repos'], queryFn: api.repos });
  const rows = q.data ?? [];
  const router = useRouter();
  const pad = usePagePad();

  return (
      <FlatList
        data={rows}
        keyExtractor={(repo) => String(repo.id)}
        contentContainerStyle={{ ...pad, gap: space[16] }}
        ListHeaderComponent={
          <Head
            title="Repositories"
            aside={`${rows.length} ${rows.length === 1 ? 'repository' : 'repositories'}`}
          />
        }
        ListEmptyComponent={
          q.isPending ? (
            <Waiting />
          ) : q.isError ? (
            <Failed error={q.error} onRetry={q.refetch} />
          ) : (
            <Empty>No results found.</Empty>
          )
        }
        renderItem={({ item }) => {
          const [owner] = item.full_name.split('/');
          return (
            <Item
              owner={`${owner}/`}
              title={item.name}
              text={item.description || undefined}
              marks={
                item.fork || item.archived || item.template || item.mirror ? (
                  <Cluster gap="tight">
                    {item.archived ? <Status>Archived</Status> : null}
                    {item.fork ? <Status>Fork</Status> : null}
                    {item.mirror ? <Status>Mirror</Status> : null}
                    {item.template ? <Status>Template</Status> : null}
                  </Cluster>
                ) : undefined
              }
              aside={
                <Meta>
                  {item.language ? <Fact>{item.language}</Fact> : null}
                  <Fact>{api.ago(item.updated_at)}</Fact>
                </Meta>
              }
              onPress={() =>
                router.push({
                  pathname: '/gitea/[owner]/[name]',
                  params: { owner, name: item.name },
                })
              }
            />
          );
        }}
      />
  );
}
