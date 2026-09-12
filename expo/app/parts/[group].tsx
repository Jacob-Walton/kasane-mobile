import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { DEMOS } from '../../gallery/demos';
import { GROUPS } from '../../gallery/groups';
import { Empty, Head, Lede, Stack, space, useBarClearance } from '../../kasane';

/* One group of the kit, every part in it, on content that could be real. */

export default function PartsGroup() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const bottom = useBarClearance();
  const what = GROUPS.find((one) => one.id === group);
  const Demo = DEMOS[group ?? ''];

  return (
    <ScrollView
      contentContainerStyle={{ padding: space[16], paddingBottom: bottom, gap: space[24] }}
    >
      <Stack gap={space[4]}>
        <Head title={what?.title ?? 'Parts'} aside={`${what?.parts.length ?? 0} parts`} />
        {what ? <Lede>{what.note}</Lede> : null}
      </Stack>
      {Demo ? <Demo /> : <Empty>No such group.</Empty>}
    </ScrollView>
  );
}
