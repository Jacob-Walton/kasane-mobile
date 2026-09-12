import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { GROUPS } from '../gallery/groups';
import { Fact, Head, Item, Meta, space, usePagePad } from '../kasane';

/* What is in the kit, by the module it lives in. Every group is one screen showing every part in
   it against real content, so the whole system can be read on a phone instead of described. */

export default function Parts() {
  const router = useRouter();
  const pad = usePagePad();
  const total = GROUPS.reduce((n, group) => n + group.parts.length, 0);

  return (
    <FlatList
      data={GROUPS}
      keyExtractor={(group) => group.id}
      contentContainerStyle={{ ...pad, gap: space[16] }}
      ListHeaderComponent={
        <Head title="Kasane" aside={`${total} parts in ${GROUPS.length} groups`} />
      }
      renderItem={({ item: group }) => (
        <Item
          title={group.title}
          text={group.parts.join(', ')}
          aside={
            <Meta>
              <Fact num>{group.parts.length}</Fact>
            </Meta>
          }
          onPress={() => router.push({ pathname: '/parts/[group]', params: { group: group.id } })}
        />
      )}
    />
  );
}
