import { render, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Bar, Empty, Failed, Item, Tray } from '../ui';

/* These render. A token that stops reaching a part, or an item that stops being one target, shows
   up here and not on a phone.

   render is async in this version of the library, so every one of these awaits it. */

/* A phone tells the app its insets. Off a phone nothing does, so the bar tests name a frame. */
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

test('an item is one target and reads its title, owner and text', async () => {
  const onPress = jest.fn();
  const view = await render(
    <Item owner="jacob/" title="kurobeni" text="Kasane, the design system" onPress={onPress} />,
  );

  // the owner is part of the title line, muted, the way the web client writes owner/name
  expect(view.getByText('jacob/kurobeni')).toBeTruthy();
  expect(view.getByText('Kasane, the design system')).toBeTruthy();

  // the whole item, not the title: a thumb is aimed at the item
  await userEvent.press(view.getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

/* The one thing a collection must not grow: a rule between its items. Kasane keeps those for a
   listing, which is a table. */
test('an item carries no border', async () => {
  const view = await render(<Item title="anything" onPress={() => {}} />);
  const style = view.getByRole('button').props.style;
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  expect(flat.borderBottomWidth).toBeUndefined();
  expect(flat.borderWidth).toBeUndefined();
});

test('a tray item says whether it is the selected one, and carries its count apart', async () => {
  const onChange = jest.fn();
  const view = await render(
    <Tray
      value="open"
      onChange={onChange}
      label="Issue state"
      options={[
        { value: 'open', label: 'Open', count: 3 },
        { value: 'closed', label: 'Closed', count: 0 },
      ]}
    />,
  );
  const tabs = view.getAllByRole('tab');
  expect(tabs).toHaveLength(2);
  // not by colour alone
  expect(tabs[0].props.accessibilityState.selected).toBe(true);
  expect(tabs[1].props.accessibilityState.selected).toBe(false);

  // the count is its own text, never written into the label
  expect(view.getByText('Open')).toBeTruthy();
  expect(view.getByText('3')).toBeTruthy();

  await userEvent.press(tabs[1]);
  expect(onChange).toHaveBeenCalledWith('closed');
});

/* An empty list and a list that failed are not the same thing and do not look the same. */
test('an empty collection says so, and a failure says what went wrong', async () => {
  const empty = await render(<Empty>No results found.</Empty>);
  expect(empty.getByText('No results found.')).toBeTruthy();

  const onRetry = jest.fn();
  const bad = await render(<Failed error={new Error('502 upstream')} onRetry={onRetry} />);
  expect(bad.getByText('Could not load')).toBeTruthy();
  expect(bad.getByText('502 upstream')).toBeTruthy();
  await userEvent.press(bad.getByText('Try again'));
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
