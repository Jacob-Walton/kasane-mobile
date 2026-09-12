import { render, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Bar, Choice, Empty, Failed, Item, Switch, Tray, usePagePad } from '../kasane';

/* These render. A token that stops reaching a part, or an item that stops being one target, shows
   up here and not on a phone.

   render is async in this version of the library, so every one of these awaits it. */

/* A phone tells the app its insets. Off a phone nothing does, so anything pinned to an edge names
   a frame. */
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

  // the owner is part of the title line, muted, the way the web writes owner/name
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

  // anywhere in the item, not just its outermost view: the press ground is a view of its own
  const borders: unknown[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const one = node as { props?: { style?: unknown }; children?: unknown[] };
    for (const style of [one.props?.style].flat(3)) {
      if (!style || typeof style !== 'object') continue;
      for (const [key, value] of Object.entries(style)) {
        if (key.startsWith('border') && key.endsWith('Width') && value) borders.push([key, value]);
      }
    }
    one.children?.forEach(walk);
  };
  walk(view.toJSON());
  expect(borders).toEqual([]);
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

/* The bar is the site's, not a navigation bar: a brand, one labelled button that says where you
   are, and no page title. The trail and the sections are both inside that button. */
test('the bar says where you are and opens the trail', async () => {
  const onBrand = jest.fn();
  const view = await render(
    <Bar
      onBrand={onBrand}
      where={{
        label: 'Controls',
        items: [
          { label: 'Kasane', group: 'Where you are' },
          { label: 'Controls', checked: true },
        ],
      }}
      items={[{ label: 'Parts', current: true }, { label: 'Repositories' }]}
    />,
    { wrapper: Framed },
  );

  await userEvent.press(view.getByLabelText('Home'));
  expect(onBrand).toHaveBeenCalledTimes(1);

  // the button carries the last step of the trail, never an icon standing in for it
  expect(view.getByText('Controls')).toBeTruthy();
  expect(view.getByLabelText('Menu: Controls')).toBeTruthy();
});

test('the bar has no menu when there is nowhere to go', async () => {
  const view = await render(<Bar />, { wrapper: Framed });
  expect(view.queryByLabelText('Menu')).toBeNull();
});

/* A choice and a switch are our own marks, so they carry the state a platform control would have
   carried for them. */
test('a choice and a switch say their state', async () => {
  const onChange = jest.fn();
  const choice = await render(<Choice label="Public" checked={false} onChange={onChange} many />);
  const box = choice.getByRole('checkbox');
  expect(box.props.accessibilityState.checked).toBe(false);
  await userEvent.press(box);
  expect(onChange).toHaveBeenCalledWith(true);

  const flip = jest.fn();
  const toggle = await render(<Switch label="Issues" value onChange={flip} />);
  const sw = toggle.getByRole('switch');
  expect(sw.props.accessibilityState.checked).toBe(true);
  await userEvent.press(sw);
  expect(flip).toHaveBeenCalledWith(false);
});

/* The safe area is the one number the app cannot know and must not guess. A screen that does not
   spend it puts its first line under the notch and its last one under the bar. */
test('a page spends the insets the OS reports, on every edge', async () => {
  const seen: ReturnType<typeof usePagePad>[] = [];
  const Probe = () => {
    seen.push(usePagePad());
    return null;
  };
  await render(<Probe />, { wrapper: Framed });
  const pad = seen[0];

  // 47 of notch plus the 16 rung, which compact remaps to 12
  expect(pad.paddingTop).toBe(47 + 12);
  // 34 of home indicator, the 12 under the bar, the bar, and the 12 above it
  expect(pad.paddingBottom).toBe(34 + 12 + (40 + 8 * 2) + 12);
  expect(pad.paddingLeft).toBe(12);
  expect(pad.paddingRight).toBe(12);
});
