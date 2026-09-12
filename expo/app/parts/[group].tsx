import { useLocalSearchParams, useRouter } from 'expo-router';
import { DEMOS } from '../../gallery/demos';
import { GROUPS } from '../../gallery/groups';
import { Band, Crumbs, Empty, Head, Lede, Stack, space } from '../../kasane';

/* One group of the kit, every part in it, on content that could be real.

   The way back is the crumbs, which is how the web says it. There is no platform back control here
   for the same reason there is none on the site. */

export default function PartsGroup() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const router = useRouter();
  const what = GROUPS.find((one) => one.id === group);
  const Demo = DEMOS[group ?? ''];

  return (
    <Band gap={space[24]}>
      <Stack gap={space[8]}>
        <Crumbs
          trail={[{ label: 'Kasane', href: '/' }, { label: what?.title ?? 'Parts' }]}
          onPress={(href) => router.navigate(href)}
        />
        <Head title={what?.title ?? 'Parts'} aside={`${what?.parts.length ?? 0} parts`} />
        {what ? <Lede>{what.note}</Lede> : null}
      </Stack>
      {Demo ? <Demo /> : <Empty>No such group.</Empty>}
    </Band>
  );
}
