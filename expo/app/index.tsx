import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import * as api from '../gitea';
import {
  Bar,
  Empty,
  Fact,
  Failed,
  Head,
  Item,
  Marks,
  Meta,
  Status,
  Waiting,
  space,
  useBarInset,
} from '../ui';

/* Every repository the instance shows a guest. The same screen the web client draws at
   /explore/repos: a head with the total, then a collection of items, each one carrying the owner
   muted before the name, the marks that qualify it, and the facts at the end of the title row.

   A list, not a scroll view: it is the one screen that can grow without limit. The gap between
   items is the collection. */

export default function Repos() {
  const q = useQuery({ queryKey: ['repos'], queryFn: api.repos });
  const rows = q.data ?? [];
  const router = useRouter();
  const top = useBarInset();

  return (
    <>
      <FlatList
        data={rows}
        keyExtractor={(repo) => String(repo.id)}
        contentContainerStyle={{
          padding: space[16],
          paddingTop: top,
          paddingBottom: space[48],
          gap: space[16],
        }}
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
                  <Marks tight>
                    {item.archived ? <Status label="Archived" /> : null}
                    {item.fork ? <Status label="Fork" /> : null}
                    {item.mirror ? <Status label="Mirror" /> : null}
                    {item.template ? <Status label="Template" /> : null}
                  </Marks>
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
                  pathname: '/repo/[owner]/[name]',
                  params: { owner, name: item.name },
                })
              }
            />
          );
        }}
      />
      <Bar />
    </>
  );
}
