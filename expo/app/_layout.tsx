import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_400Regular_Italic,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DefaultTheme,
  Stack,
  ThemeProvider,
  usePathname,
  useRouter,
  type Theme,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GROUPS } from '../gallery/groups';
import { Bar, ToastProvider, useTheme, type MenuItem } from '../kasane';

/* The router gives routes and deep links. It gives no chrome: headerShown is off everywhere.

   The bar is here and not on a screen, which is what makes this behave like the site: the web has
   one fixed bar and the page changes under it. A bar drawn per screen slides away with the card.

   The faces are bundled, not asked of the OS, so a string reads in Kasane's face on both platforms
   and neither one substitutes its own.

   Nothing about a screen change is the platform's either. A link on the web swaps the page: there
   is no card sliding in from the right and no edge to swipe. animation none and gestureEnabled
   false give that.

   What is still the OS's, because only the OS knows it: the status bar, and the safe area it
   reports. Every screen spends that through usePagePad. */

const SECTIONS = [
  { at: '/', label: 'Parts' },
  { at: '/gitea', label: 'Repositories' },
];

/* Where you are, as the rows the bar's menu opens with. The web puts this on the page as crumbs;
   a phone has no room for a trail of small targets, so it goes in the menu, where every step is a
   row you can hit with a thumb. */
function trailOf(path: string, go: (to: string) => void): { label: string; items: MenuItem[] } {
  const parts = path.split('/').filter(Boolean);
  const trail: { label: string; at: string }[] = [];

  if (parts[0] === 'parts') {
    trail.push({ label: 'Kasane', at: '/' });
    const group = GROUPS.find((one) => one.id === parts[1]);
    if (group) trail.push({ label: group.title, at: `/parts/${group.id}` });
  } else if (parts[0] === 'gitea') {
    trail.push({ label: 'Repositories', at: '/gitea' });
    if (parts[1] && parts[2]) {
      trail.push({ label: `${parts[1]}/${parts[2]}`, at: `/gitea/${parts[1]}/${parts[2]}` });
      if (parts[3]) {
        trail.push({
          label: `#${parts[3]}`,
          at: `/gitea/${parts[1]}/${parts[2]}/${parts[3]}`,
        });
      }
    }
  } else {
    trail.push({ label: 'Kasane', at: '/' });
  }

  return {
    label: trail[trail.length - 1].label,
    items: trail.map((step, i) => ({
      label: step.label,
      onPress: () => go(step.at),
      checked: i === trail.length - 1,
      group: i === 0 ? 'Where you are' : undefined,
    })),
  };
}

export default function Layout() {
  const { t, dark } = useTheme();
  const router = useRouter();
  const path = usePathname() ?? '/';
  const [ready] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_400Regular_Italic,
    IBMPlexMono_400Regular,
  });
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 2, refetchOnReconnect: true },
        },
      }),
    [],
  );

  /* The navigator paints its own ground behind and between the cards, and the colour it reaches for
     is the navigation default, which is near white. That is the white at the edges while a screen
     pushes in. Every one of these is a Kasane colour instead. */
  const ground: Theme = useMemo(
    () => ({
      ...DefaultTheme,
      dark,
      colors: {
        ...DefaultTheme.colors,
        background: t.bg.page,
        card: t.bg.page,
        border: t.border.hairline,
        text: t.fg.default,
        primary: t.accent.default,
        notification: t.accent.default,
      },
    }),
    [dark, t],
  );

  // nothing is drawn in a face we did not choose, so nothing is drawn until the faces are in
  if (!ready) return null;

  const here = path.startsWith('/gitea') ? '/gitea' : '/';
  const where = trailOf(path, (to) => router.navigate(to));

  return (
    <SafeAreaProvider style={{ backgroundColor: t.bg.page }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg.page }}>
        <QueryClientProvider client={client}>
          <ThemeProvider value={ground}>
            <ToastProvider>
              <StatusBar style={dark ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'none',
                  gestureEnabled: false,
                  contentStyle: { backgroundColor: t.bg.page },
                }}
              />
              <Bar
                onBrand={() => router.navigate('/')}
                where={where}
                items={SECTIONS.map((one) => ({
                  label: one.label,
                  current: one.at === here,
                  onPress: () => router.navigate(one.at),
                }))}
              />
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
