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
  useRouter,
  useSegments,
  type Theme,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Bar, ToastProvider, useTheme } from '../kasane';

/* The router gives routes, deep links and the back gesture. It gives no chrome: headerShown is off
   everywhere.

   The bar is here and not on a screen, which is what makes this behave like the site: the web has
   one fixed bar and the page changes under it. A bar drawn per screen slides away with the card.

   The faces are bundled, not asked of the OS, so a string reads in Kasane's face on both platforms
   and neither one substitutes its own.

   What is still the platform's, deliberately: the push and pop motion, the back swipe, the status
   bar and the safe area it measures. Those are behaviour, not appearance, and a hand-rolled stack
   loses the back gesture along with them. */

const SECTIONS = [
  { at: '/', label: 'Parts' },
  { at: '/gitea', label: 'Repositories' },
];

export default function Layout() {
  const { t, dark } = useTheme();
  const router = useRouter();
  const segments = useSegments();
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

  const first = segments[0] ?? '';
  const here = first === 'gitea' ? '/gitea' : '/';

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
                  contentStyle: { backgroundColor: t.bg.page },
                }}
              />
              <Bar
                onBrand={() => router.navigate('/')}
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
