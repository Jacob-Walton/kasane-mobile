import { useRouter } from 'expo-router';
import type { Repo } from './gitea';
import { Cluster, Crumbs, Stack, Text, Tray, space } from './kasane';

/* The web client's RepoHead, which is what every page inside a repository wears: one crumb for the
   owner, the name as the page heading, what it is, and the tray of its sections.

   This is also the way back up. The site does it this way and a phone has no reason to differ: the
   tray is a row of control-height targets, and the crumb is one link, not a trail. */

export type RepoTab = 'code' | 'issues' | 'pulls' | 'releases' | 'activity';

export function RepoHead({ repo, tab }: { repo?: Repo; tab: RepoTab }) {
  const router = useRouter();
  if (!repo) return null;
  const [owner] = repo.full_name.split('/');
  const at = `/gitea/${owner}/${repo.name}`;

  const tabs = [
    { value: 'issues', label: 'Issues', count: repo.open_issues_count || undefined },
    { value: 'pulls', label: 'Pulls' },
  ];

  return (
    <Stack gap={space[8]}>
      <Crumbs trail={[{ label: owner, href: '/gitea' }]} onPress={(href) => router.navigate(href)} />
      <Text kind="heading">{repo.name}</Text>
      {repo.description ? (
        <Text kind="small" muted>
          {repo.description}
        </Text>
      ) : null}
      {repo.language || repo.fork || repo.archived ? (
        <Cluster gap="tight">
          {repo.language ? (
            <Text kind="small" muted>
              {repo.language}
            </Text>
          ) : null}
        </Cluster>
      ) : null}
      <Tray
        label="Repository sections"
        value={tab}
        onChange={(next) => router.navigate(next === 'pulls' ? `${at}?kind=pulls` : at)}
        options={tabs}
      />
    </Stack>
  );
}
