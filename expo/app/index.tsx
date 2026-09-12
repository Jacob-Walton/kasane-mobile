import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { GROUPS } from '../gallery/groups';
import {
  Collection,
  Fact,
  Head,
  Item,
  Meta,
  space,
  useBarClearance,
} from '../kasane';

/* What is in the kit, by the module it lives in. Every group is one screen showing every part in
   it against real content, so the whole system can be read on a phone instead of described. */

export default function Parts() {
  const router = useRouter();
  const bottom = useBarClearance();
  const total = GROUPS.reduce((n, group) => n + group.parts.length, 0);

  return (
    <ScrollView contentContainerStyle={{ padding: space[16], paddingBottom: bottom, gap: space[16] }}>
      <Head title="Kasane" aside={`${total} parts in ${GROUPS.length} groups`} />
      <Collection>
        {GROUPS.map((group) => (
          <Item
            key={group.id}
            title={group.title}
            text={group.parts.join(', ')}
            aside={
              <Meta>
                <Fact num>{group.parts.length}</Fact>
              </Meta>
            }
            onPress={() => router.push({ pathname: '/parts/[group]', params: { group: group.id } })}
          />
        ))}
      </Collection>
    </ScrollView>
  );
}
