import { useMemo } from 'react';
import { View } from 'react-native';
import { Text, face, radius, space, useTheme } from './kasane';

/* Markdown, as much of it as an issue body actually uses. Not a parser: a block splitter and one
   pass of inline marks, which covers headings, lists, quotes, fences, rules and the three inline
   forms. Anything it does not know reads as the text it was, which is the behaviour to want from
   something this small.

   The web client renders markdown with remark and a sanitiser. That pipeline does not port: this
   draws native views, so there is no HTML to sanitise and nothing to inject. */

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullet'; items: string[] }
  | { kind: 'number'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'code'; text: string; lang?: string }
  | { kind: 'rule' };

export function parse(source: string): Block[] {
  const lines = (source ?? '').replace(/\r\n?/g, '\n').split('\n');
  const out: Block[] = [];
  let i = 0;

  const flush = (buffer: string[]) => {
    if (buffer.length) out.push({ kind: 'paragraph', text: buffer.join(' ').trim() });
    buffer.length = 0;
  };

  const para: string[] = [];
  while (i < lines.length) {
    const line = lines[i];

    // a fence runs until it closes, or until the end
    const fence = /^```(\w+)?\s*$/.exec(line);
    if (fence) {
      flush(para);
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      out.push({ kind: 'code', text: body.join('\n'), lang: fence[1] });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flush(para);
      out.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() });
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flush(para);
      out.push({ kind: 'rule' });
      i++;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      flush(para);
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push({ kind: 'quote', text: body.join(' ').trim() });
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      flush(para);
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, '').trim());
        i++;
      }
      out.push({ kind: 'bullet', items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      flush(para);
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '').trim());
        i++;
      }
      out.push({ kind: 'number', items });
      continue;
    }

    if (!line.trim()) {
      flush(para);
      i++;
      continue;
    }

    para.push(line.trim());
    i++;
  }
  flush(para);
  return out;
}

type Mark = { text: string; code?: boolean; strong?: boolean; italic?: boolean; link?: boolean };

/** `code`, **strong**, *italic*, and a bare or bracketed link, in one pass */
export function marks(text: string): Mark[] {
  const out: Mark[] = [];
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/\S+)/g;
  let at = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > at) out.push({ text: text.slice(at, m.index) });
    const piece = m[0];
    if (piece.startsWith('`')) out.push({ text: piece.slice(1, -1), code: true });
    else if (piece.startsWith('**') || piece.startsWith('__'))
      out.push({ text: piece.slice(2, -2), strong: true });
    else if (piece.startsWith('*')) out.push({ text: piece.slice(1, -1), italic: true });
    else if (piece.startsWith('[')) out.push({ text: /\[([^\]]+)\]/.exec(piece)![1], link: true });
    else out.push({ text: piece, link: true });
    at = m.index + piece.length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

function Inline({ text, kind }: { text: string; kind?: 'body' | 'small' }) {
  const { t } = useTheme();
  return (
    <Text kind={kind}>
      {marks(text).map((piece, i) => (
        <Text
          key={i}
          kind={kind}
          style={{
            // a weight and a slant are both families: there is no axis in a static font file
            fontFamily: piece.code
              ? face.mono
              : piece.strong
                ? face.semibold
                : piece.italic
                  ? face.italic
                  : face.regular,
            color: piece.link ? t.accent.default : piece.code ? t.fg.secondary : undefined,
          }}
        >
          {piece.text}
        </Text>
      ))}
    </Text>
  );
}

export function Markdown({ source, empty }: { source?: string | null; empty?: string }) {
  const { t } = useTheme();
  const blocks = useMemo(() => parse(source ?? ''), [source]);

  if (!blocks.length)
    return empty ? (
      <Text muted kind="small">
        {empty}
      </Text>
    ) : null;

  return (
    <View style={{ gap: space[12] }}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'heading':
            return (
              <Text key={i} kind={block.level <= 2 ? 'heading' : 'body'} strong>
                {block.text}
              </Text>
            );
          // .kb-prose hr: a short 2px bar in the strong ink, not a hairline across the column
          case 'rule':
            return (
              <View
                key={i}
                style={{
                  height: 2,
                  width: space[64],
                  borderRadius: radius,
                  backgroundColor: t.border.strong,
                  marginVertical: space[24],
                }}
              />
            );
          // .kb-prose blockquote: a filled block on the page ground. The left rule is a markdown
          // convention, not one of ours.
          case 'quote':
            return (
              <View
                key={i}
                style={{
                  padding: space[16],
                  backgroundColor: t.bg.page,
                  borderRadius: radius,
                }}
              >
                <Inline text={block.text} />
              </View>
            );
          // .kb-prose pre: the page ground, the one radius, 14 in the mono face
          case 'code':
            return (
              <View
                key={i}
                style={{
                  backgroundColor: t.bg.page,
                  borderRadius: radius,
                  padding: space[16],
                }}
              >
                <Text kind="small" style={{ fontFamily: face.mono }}>
                  {block.text}
                </Text>
              </View>
            );
          case 'bullet':
          case 'number':
            return (
              <View key={i} style={{ gap: space[4] }}>
                {block.items.map((item, j) => (
                  <View key={j} style={{ flexDirection: 'row', gap: space[8] }}>
                    <Text muted>{block.kind === 'bullet' ? '•' : `${j + 1}.`}</Text>
                    <View style={{ flex: 1 }}>
                      <Inline text={item} />
                    </View>
                  </View>
                ))}
              </View>
            );
          default:
            return <Inline key={i} text={block.text} />;
        }
      })}
    </View>
  );
}
