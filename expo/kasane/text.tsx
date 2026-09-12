import type { ReactNode } from 'react';
import { Text as RNText, View, type TextProps } from 'react-native';
import { face, space, useTheme, type Step } from './theme';

/* Words. Every size is a rung of Kasane's ladder and every rung is multiplied by the reader's text
   scale, so no size here is final. */

export type TextKind = 'title' | 'heading' | 'sub' | 'body' | 'small' | 'caps';

const STEP: Record<TextKind, Step> = {
  title: '32',
  heading: '24',
  sub: '18',
  body: '16',
  small: '14',
  caps: '12',
};

export function Text({
  kind = 'body',
  muted,
  strong,
  num,
  mono,
  style,
  ...rest
}: TextProps & {
  kind?: TextKind;
  muted?: boolean;
  strong?: boolean;
  /** tabular figures, so a column of numbers lines up */
  num?: boolean;
  mono?: boolean;
}) {
  const { t, size, line, track } = useTheme();
  const step = STEP[kind];
  const heavy = strong || kind === 'title' || kind === 'heading' || kind === 'sub';
  return (
    <RNText
      style={[
        {
          color: muted ? t.fg.secondary : t.fg.default,
          fontSize: size(step),
          lineHeight: line(step),
          letterSpacing: track(step),
          fontFamily: mono ? face.mono : heavy ? face.semibold : face.regular,
          textTransform: kind === 'caps' ? 'uppercase' : 'none',
        },
        kind === 'caps' ? { letterSpacing: size('12') * 0.08, fontFamily: face.medium } : null,
        num ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
      {...rest}
    />
  );
}

/* .kb-status: a state is coloured text at 14 and medium, with no chip around it. An outlined badge
   is not in Kasane. */
export function Status({
  children,
  kind = 'neutral',
}: {
  children: ReactNode;
  kind?: 'neutral' | 'ok' | 'warn' | 'err';
}) {
  const { t, size } = useTheme();
  const ink =
    kind === 'ok'
      ? t.status.ok
      : kind === 'warn'
        ? t.status.warn
        : kind === 'err'
          ? t.status.err
          : t.fg.secondary;
  return (
    <RNText style={{ color: ink, fontSize: size('14'), fontFamily: face.medium }}>
      {children}
    </RNText>
  );
}

/** .kb-count: a number beside a label, secondary and tabular so a column of them lines up */
export function Count({ children }: { children: ReactNode }) {
  const { t, size } = useTheme();
  return (
    <RNText
      style={{
        color: t.fg.secondary,
        fontSize: size('14'),
        fontFamily: face.regular,
        fontVariant: ['tabular-nums'],
      }}
    >
      {children}
    </RNText>
  );
}

/** .kb-lede: the line under a title, one step up and secondary */
export function Lede({ children }: { children: ReactNode }) {
  return (
    <Text kind="sub" muted style={{ fontFamily: face.regular }}>
      {children}
    </Text>
  );
}

/** .kb-figure: a swatch or a drawing with its caption under it */
export function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <View style={{ gap: space[8] }}>
      {children}
      <Text kind="caps" muted>
        {caption}
      </Text>
    </View>
  );
}

/** .kb-figure-swatch: a block of one colour, named */
export function FigureSwatch({ colour, name }: { colour: string; name: string }) {
  const { t } = useTheme();
  return (
    <Figure caption={name}>
      <View
        style={{
          height: space[48],
          borderRadius: 24,
          backgroundColor: colour,
          borderWidth: 0.5,
          borderColor: t.border.hairline,
        }}
      />
    </Figure>
  );
}
