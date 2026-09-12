import { render, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Bar, Failed, Refresh, Row, Tabs } from '../ui';
import { control } from '../theme';

/* A phone tells the app its insets. Off a phone nothing does, so the bar's tests name a frame. */
const Framed = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 47, left: 0, right: 0, bottom: 34 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

/* These render. A token that stops reaching a control, or a row that stops being one target, shows
   up here and not on a phone.

   render is async in this version of the library, so every one of these awaits it. */

test('a row is one target and reads its title and note', async () => {
  const onPress = jest.fn();
  const view = await render(<Row title="feat: mvcc" note="#4 · jacob" meta="2" onPress={onPress} />);

  expect(view.getByText('feat: mvcc')).toBeTruthy();
  expect(view.getByText('#4 · jacob')).toBeTruthy();

  // the whole row, not the title: a thumb is aimed at the row
  const target = view.getByRole('button');
  await userEvent.press(target);
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('a row is at least a control tall', async () => {
  const view = await render(<Row title="anything" onPress={() => {}} />);
  const style = view.getByRole('button').props.style;
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  expect(flat.minHeight).toBeGreaterThanOrEqual(control.md);
});

test('a tab says whether it is the selected one', async () => {
  const onChange = jest.fn();
  const view = await render(
    <Tabs
      value="open"
      onChange={onChange}
      options={[
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
      ]}
    />,
  );
  const tabs = view.getAllByRole('tab');
  expect(tabs).toHaveLength(2);
  // not by colour alone
  expect(tabs[0].props.accessibilityState.selected).toBe(true);
  expect(tabs[1].props.accessibilityState.selected).toBe(false);

  await userEvent.press(tabs[1]);
  expect(onChange).toHaveBeenCalledWith('closed');
});

test('a failure says what went wrong and offers another go', async () => {
  const onRetry = jest.fn();
  const view = await render(<Failed error={new Error('502 upstream')} onRetry={onRetry} />);
  expect(view.getByText('Could not load')).toBeTruthy();
  expect(view.getByText('502 upstream')).toBeTruthy();
  await userEvent.press(view.getByText('Try again'));
  expect(onRetry).toHaveBeenCalled();
});

/* Our bar, not a stack header: the back control has to be a real labelled target and the title has
   to be our own text. */
test('the bar draws its own back control and title', async () => {
  const onBack = jest.fn();
  const view = await render(<Bar title="#4" onBack={onBack} />, { wrapper: Framed });
  expect(view.getByText('#4')).toBeTruthy();
  await userEvent.press(view.getByLabelText('Back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('the bar has no back control on the first screen', async () => {
  const view = await render(<Bar title="Repositories" />, { wrapper: Framed });
  expect(view.queryByLabelText('Back')).toBeNull();
});

/* Refresh replaces pull to refresh, so it has to say it is busy and stop taking presses. */
test('a busy refresh takes no presses', async () => {
  const onPress = jest.fn();
  const view = await render(<Refresh busy onPress={onPress} />);
  const target = view.getByLabelText('Refresh');
  expect(target.props.accessibilityState.busy).toBe(true);
  await userEvent.press(target);
  expect(onPress).not.toHaveBeenCalled();
});
