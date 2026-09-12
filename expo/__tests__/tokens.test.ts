import { control, dark, light, radius, type as ladder } from '../theme';

/* The same rules the Swift package asserts, on the same generated values. A token file that drifts
   from the platform floors is the failure this catches. */

/* The same three heights as the web. Density never reaches a control, on either platform, and 32
   already clears the WCAG 2.5.8 floor of 24. */
test('a control is one of the three heights', () => {
  expect([control.sm, control.md, control.lg]).toEqual([32, 40, 48]);
  expect(control.sm).toBeGreaterThanOrEqual(24);
});

test('one radius', () => {
  expect(radius).toBe(24);
});

test('both themes carry the same names', () => {
  expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort());
  for (const group of Object.keys(light) as (keyof typeof light)[]) {
    expect(Object.keys(light[group]).sort()).toEqual(Object.keys(dark[group]).sort());
  }
});

test('the themes are not the same values', () => {
  expect(light.fg.default).not.toBe(dark.fg.default);
  expect(light.bg.page).not.toBe(dark.bg.page);
});

test('every colour is a colour', () => {
  for (const theme of [light, dark]) {
    for (const group of Object.values(theme)) {
      for (const [name, value] of Object.entries(group)) {
        expect(value).toMatch(/^(#[0-9a-fA-F]{3,8}|rgba?\()/);
        expect(name).not.toBe('');
      }
    }
  }
});

test('the type ladder climbs', () => {
  const steps = Object.keys(ladder)
    .map(Number)
    .sort((a, b) => a - b);
  for (const [a, b] of steps.map((s, i) => [s, steps[i + 1]]).filter(([, b]) => b)) {
    expect(ladder[String(b) as keyof typeof ladder].size).toBeGreaterThan(
      ladder[String(a) as keyof typeof ladder].size,
    );
  }
});
