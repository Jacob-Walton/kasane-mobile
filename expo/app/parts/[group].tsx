import { useLocalSearchParams } from 'expo-router';
import { DEMOS } from '../../gallery/demos';
import { GROUPS } from '../../gallery/groups';
import { Band, Empty, Head, Lede, Stack, space } from '../../kasane';

/* One group of the kit, every part in it, on content that could be real. The way back is the bar,
   which carries where you are and every step above it. */

export default function PartsGroup() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const what = GROUPS.find((one) => one.id === group);
  const Demo = DEMOS[group ?? ''];

  return (
    <Band gap={space[24]}>
      <Stack gap={space[8]}>
        <Head title={what?.title ?? 'Parts'} aside={`${what?.parts.length ?? 0} parts`} />
        {what ? <Lede>{what.note}</Lede> : null}
      </Stack>
      {Demo ? <Demo /> : <Empty>No such group.</Empty>}
    </Band>
  );
}
