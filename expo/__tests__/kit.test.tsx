import { act, render, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { focus, light } from '../theme';
import {
  Bar,
  Choice,
  Empty,
  Failed,
  Input,
  Item,
  Switch,
  Tray,
  hairline,
  useFocusRing,
  usePagePad,
} from '../kasane';

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

/* The bar is the site's: the brand, and the links as .kb-bar__nav draws them. The current one is
   filled, so where you are is not carried by colour alone. */
test('the bar draws its links, with the current one filled', async () => {
  const onBrand = jest.fn();
  const go = jest.fn();
  const view = await render(
    <Bar
      onBrand={onBrand}
      items={[
        { label: 'Parts', current: true },
        { label: 'Repositories', onPress: go },
      ]}
    />,
    { wrapper: Framed },
  );

  await userEvent.press(view.getByLabelText('Home'));
  expect(onBrand).toHaveBeenCalledTimes(1);

  const links = view.getAllByRole('link').filter((one) => one.props.accessibilityLabel !== 'Home');
  expect(links).toHaveLength(2);
  expect(links[0].props.accessibilityState.selected).toBe(true);
  expect(links[1].props.accessibilityState.selected).toBe(false);

  await userEvent.press(links[1]);
  expect(go).toHaveBeenCalledTimes(1);
});

test('the bar draws no links when there are none', async () => {
  const view = await render(<Bar />, { wrapper: Framed });
  expect(view.queryAllByRole('link').filter((one) => one.props.accessibilityLabel !== 'Home'))
    .toHaveLength(0);
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

/* :focus-visible in root.css is one rule for the whole system. It is the same three values here,
   as real outline props, so a ring that stops matching the token shows up as a failure. */
test('the focus ring is the token, not a colour that looks like it', async () => {
  const seen: ReturnType<typeof useFocusRing>[] = [];
  const Probe = () => {
    seen.push(useFocusRing());
    return null;
  };
  await render(<Probe />);
  const at = seen[0];
  expect(at.ring).toBeNull();

  await act(async () => at.onFocus());
  const ring = seen[seen.length - 1].ring;
  expect(ring).toEqual({
    outlineWidth: focus.width,
    outlineColor: light.focus.color,
    outlineOffset: focus.offset,
    outlineStyle: 'solid',
  });
});

/* A field that cannot be typed in says so, and a field that is wrong says so in the error colour.
   Both are rules in form.css and neither can be seen in a screenshot of the happy path. */
test('an input carries its disabled and invalid states', async () => {
  const off = await render(<Input value="" onChange={() => {}} disabled placeholder="Name" />);
  expect(off.getByPlaceholderText('Name').props.editable).toBe(false);

  // the wrapper is a press so the field can show :active, not a button: it takes no role
  const bad = await render(<Input value="" onChange={() => {}} invalid />);
  const edges: { colour: unknown; width: unknown }[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const one = node as { props?: { style?: unknown }; children?: unknown[] };
    for (const style of [one.props?.style].flat(3)) {
      if (style && typeof style === 'object' && 'borderColor' in style) {
        const edge = style as { borderColor: unknown; borderWidth: unknown };
        edges.push({ colour: edge.borderColor, width: edge.borderWidth });
      }
    }
    one.children?.forEach(walk);
  };
  walk(bad.toJSON());
  // the CSS says a border and an inset ring of the same colour, which is two hairlines of it
  expect(edges).toContainEqual({ colour: light.status.err, width: hairline * 2 });
});
