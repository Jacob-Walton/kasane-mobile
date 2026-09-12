import { marks, parse } from '../markdown';

/* The renderer is a block splitter, so these check the blocks it splits and the marks it finds.
   Anything it does not know has to come back as the text it was. */

test('a heading is its level and its words', () => {
  expect(parse('## Purpose')).toEqual([{ kind: 'heading', level: 2, text: 'Purpose' }]);
});

test('a fence keeps its lines and its language', () => {
  const [block] = parse('```ts\nconst a = 1;\nconst b = 2;\n```');
  expect(block).toEqual({ kind: 'code', text: 'const a = 1;\nconst b = 2;', lang: 'ts' });
});

test('an unclosed fence still ends', () => {
  const [block] = parse('```\nleft open');
  expect(block).toEqual({ kind: 'code', text: 'left open', lang: undefined });
});

test('a list gathers its items and stops at the blank line', () => {
  expect(parse('- one\n- two\n\nafter')).toEqual([
    { kind: 'bullet', items: ['one', 'two'] },
    { kind: 'paragraph', text: 'after' },
  ]);
});

test('a numbered list counts as one block', () => {
  expect(parse('1. first\n2. second')).toEqual([
    { kind: 'number', items: ['first', 'second'] },
  ]);
});

test('a quote joins its lines', () => {
  expect(parse('> one\n> two')).toEqual([{ kind: 'quote', text: 'one two' }]);
});

test('a rule is a rule, not a list', () => {
  expect(parse('---')).toEqual([{ kind: 'rule' }]);
  expect(parse('- item')).toEqual([{ kind: 'bullet', items: ['item'] }]);
});

test('paragraph lines join, blank lines separate', () => {
  expect(parse('one\ntwo\n\nthree')).toEqual([
    { kind: 'paragraph', text: 'one two' },
    { kind: 'paragraph', text: 'three' },
  ]);
});

test('marks find code, strong, italic and links', () => {
  expect(marks('a `b` c')).toEqual([
    { text: 'a ' },
    { text: 'b', code: true },
    { text: ' c' },
  ]);
  expect(marks('**bold**')).toEqual([{ text: 'bold', strong: true }]);
  expect(marks('*thin*')).toEqual([{ text: 'thin', italic: true }]);
  expect(marks('[docs](https://x.dev)')).toEqual([{ text: 'docs', link: true }]);
  expect(marks('see https://x.dev now')).toEqual([
    { text: 'see ' },
    { text: 'https://x.dev', link: true },
    { text: ' now' },
  ]);
});

test('text with no marks comes back whole', () => {
  expect(marks('plain words')).toEqual([{ text: 'plain words' }]);
});

test('an empty body is no blocks, so a caller can say so', () => {
  expect(parse('')).toEqual([]);
  expect(parse('   \n  \n')).toEqual([]);
});
