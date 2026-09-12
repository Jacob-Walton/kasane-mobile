import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_400Regular_Italic,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../ui';

/* The router gives routes, deep links and the back gesture. It gives no chrome: headerShown is off
   everywhere, and each screen draws its own bar from the tokens.

   The faces are bundled, not asked of the OS, so a string reads in Kasane's face on both platforms
   and neither one substitutes its own.

   What is still the platform's, deliberately: the push and pop motion, the back swipe, the status
   bar and the safe area it measures. Those are behaviour, not appearance, and a hand-rolled stack
   loses the back gesture along with them. */

export default function Layout() {
  const { t, dark } = useTheme();
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

  // nothing is drawn in a face we did not choose, so nothing is drawn until the faces are in
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={client}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: t.bg.page },
            }}
          />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
