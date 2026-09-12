/* The instance's API, read anonymously. No token: a phone has nowhere safe to keep one, so this
   reads what is public and signing in is a later job. */

const BASE =
  process.env.EXPO_PUBLIC_GITEA_API ?? 'https://git.konpeki.co.uk/api/v1';

export type Repo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars_count: number;
  open_issues_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  mirror: boolean;
  template: boolean;
};

export type Issue = {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  comments: number;
  created_at: string;
  user: { login: string; avatar_url: string };
  pull_request: unknown | null;
};

export type Comment = {
  id: number;
  body: string;
  created_at: string;
  user: { login: string; avatar_url: string };
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return (await res.json()) as T;
}

export const repos = async () => {
  const body = await get<{ data: Repo[] } | Repo[]>('/repos/search?limit=30&sort=updated');
  return Array.isArray(body) ? body : body.data;
};

export const issues = (full: string) =>
  get<Issue[]>(`/repos/${full}/issues?state=all&limit=30`);

export const issue = (full: string, number: number) =>
  get<Issue>(`/repos/${full}/issues/${number}`);

export const comments = (full: string, number: number) =>
  get<Comment[]>(`/repos/${full}/issues/${number}/comments`);

/** "3 days ago", without pulling in a date library for four lines */
export function ago(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, (Date.now() - then) / 1000);
  const steps: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [30, 'day'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let n = seconds;
  for (const [size, unit] of steps) {
    if (n < size) {
      const whole = Math.floor(n);
      return `${whole} ${unit}${whole === 1 ? '' : 's'} ago`;
    }
    n /= size;
  }
  return iso;
}
