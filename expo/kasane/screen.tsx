import { View, type ViewProps } from 'react-native';
import { space } from './theme';
import { Text } from './text';
import { Button, Spinner } from './controls';

/* The two states a screen has that the web does not: a page arrives rendered, so there is nothing
   to wait for and nothing to retry. These live apart from layout.tsx so that file never has to
   reach back into controls. */

/** a screen with nothing on it yet */
export function Waiting({ style }: { style?: ViewProps['style'] }) {
  return (
    <View style={[{ padding: space[48], alignItems: 'center' }, style]}>
      <Spinner />
    </View>
  );
}

/** and a screen whose request did not arrive. Not the same thing as an empty one. */
export function Failed({
  error,
  onRetry,
  style,
}: {
  error: unknown;
  onRetry?: () => void;
  style?: ViewProps['style'];
}) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <View style={[{ gap: space[12], padding: space[24], alignItems: 'flex-start' }, style]}>
      <Text strong>Could not load</Text>
      <Text kind="small" muted>
        {message}
      </Text>
      {onRetry ? <Button onPress={onRetry}>Try again</Button> : null}
    </View>
  );
}
