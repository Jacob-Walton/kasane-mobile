import { useState } from 'react';
import { View } from 'react-native';
import { Markdown } from '../markdown';
import * as Icons from '../icons';
import {
  Accordion,
  Avatar,
  AvatarStack,
  Button,
  Calendar,
  Callout,
  Choice,
  Cluster,
  Collection,
  Columns,
  Count,
  Crumbs,
  Cta,
  Delta,
  Dialog,
  Diff,
  DiffFile,
  DiffRow,
  Disclosure,
  Divider,
  Drawer,
  Empty,
  Fact,
  FactGroup,
  Facts,
  Failed,
  Field,
  Fieldset,
  Figure,
  FigureSwatch,
  Footer,
  Form,
  FormActions,
  Group,
  Head,
  Hero,
  Input,
  Item,
  Lede,
  LinkButton,
  Listing,
  ListingGroup,
  ListingHead,
  ListingRow,
  Log,
  LogDay,
  LogLine,
  Menu,
  Meta,
  NamedFact,
  Pages,
  Panel,
  PanelBody,
  PanelFoot,
  PanelHead,
  Progress,
  ProseTitle,
  Row,
  Scale,
  Seal,
  Section,
  Select,
  Sheet,
  SheetRow,
  Skeleton,
  Source,
  Sparkline,
  Spinner,
  Stack,
  Stat,
  Stats,
  Status,
  Switch,
  Table,
  TableFoot,
  TableWrap,
  Text,
  Textarea,
  Tile,
  Tiles,
  Toolbar,
  Tray,
  Waiting,
  space,
  useTheme,
  useToast,
} from '../kasane';

/* One demo a part, on content that could be real. A gallery on lorem shows the type and hides
   everything else: whether a title wraps, whether a figure lines up, whether a long name pushes
   past its tile. */

function Shown({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space[8] }}>
      <Text kind="caps" muted>
        {name}
      </Text>
      {children}
    </View>
  );
}

/* ---- text ------------------------------------------------------------------------------------ */

function TextDemo() {
  const { t } = useTheme();
  return (
    <Stack gap={space[24]}>
      <Shown name="Text">
        <Stack gap={space[8]}>
          <Text kind="title">Title, thirty two</Text>
          <Text kind="heading">Heading, twenty four</Text>
          <Text kind="sub">Sub, eighteen</Text>
          <Text>Body, sixteen, the size a screen is read at.</Text>
          <Text kind="small" muted>
            Small, fourteen, secondary
          </Text>
          <Text kind="caps" muted>
            Caps, twelve
          </Text>
          <Text mono>Mono, for a path or a hash</Text>
          <Text num>1,048,576 in tabular figures</Text>
        </Stack>
      </Shown>
      <Shown name="Status and Count">
        <Cluster gap="wide">
          <Status>Draft</Status>
          <Status kind="ok">Open</Status>
          <Status kind="warn">Stale</Status>
          <Status kind="err">Failed</Status>
          <Cluster gap="tight">
            <Text kind="small">Issues</Text>
            <Count>42</Count>
          </Cluster>
        </Cluster>
      </Shown>
      <Shown name="Lede">
        <Lede>One line under a title, saying what the page is for.</Lede>
      </Shown>
      <Shown name="Figure and FigureSwatch">
        <Cluster gap="wide">
          <View style={{ width: 120 }}>
            <FigureSwatch colour={t.accent.default} name="accent.default" />
          </View>
          <View style={{ width: 120 }}>
            <FigureSwatch colour={t.fill.default} name="fill.default" />
          </View>
        </Cluster>
        <Figure caption="the seal, at 48">
          <Seal size={48} />
        </Figure>
      </Shown>
    </Stack>
  );
}

/* ---- layout ---------------------------------------------------------------------------------- */

function LayoutDemo() {
  return (
    <Stack gap={space[24]}>
      <Shown name="Head">
        <Head title="Repositories" aside="17 repositories" />
      </Shown>
      <Shown name="Section">
        <Section title="Danger zone">
          <Text kind="small" muted>
            What a section holds.
          </Text>
        </Section>
      </Shown>
      <Shown name="Stack, Cluster, Row, Divider">
        <Stack gap={space[8]}>
          <Cluster>
            <Button size="sm">One</Button>
            <Button size="sm">Two</Button>
            <Button size="sm">Three</Button>
          </Cluster>
          <Divider />
          <Row>
            <Text kind="small">A row puts its ends apart</Text>
            <Count>12</Count>
          </Row>
        </Stack>
      </Shown>
      <Shown name="Panel, PanelHead, PanelBody, PanelFoot">
        <Panel>
          <PanelHead title="Details" aside={<Count>3</Count>} />
          <PanelBody>
            <Text kind="small">A panel is told from the page by its ground, not a border.</Text>
          </PanelBody>
          <PanelFoot>
            <Button size="sm">Cancel</Button>
            <Button size="sm" variant="primary">
              Save
            </Button>
          </PanelFoot>
        </Panel>
      </Shown>
      <Shown name="Collection, Item, ItemText, Meta, Fact">
        <Collection>
          <Item
            owner="jacob/"
            title="kurobeni"
            text="Kasane, the design system, and the site it was drawn for."
            marks={
              <Cluster gap="tight">
                <Status>Template</Status>
              </Cluster>
            }
            aside={
              <Meta>
                <Fact>TypeScript</Fact>
                <Fact>2 days ago</Fact>
              </Meta>
            }
            onPress={() => {}}
          />
          <Item
            owner="jacob/"
            title="a-name-long-enough-to-need-two-lines-on-a-phone"
            text="An item whose title cannot fit, to show where it breaks."
            onPress={() => {}}
          />
        </Collection>
      </Shown>
      <Shown name="Empty, Waiting, Failed">
        <Stack gap={space[16]}>
          <Empty>No results found.</Empty>
          <Waiting />
          <Failed error={new Error('502 upstream')} onRetry={() => {}} />
        </Stack>
      </Shown>
    </Stack>
  );
}

/* ---- controls -------------------------------------------------------------------------------- */

function ControlsDemo() {
  const [tray, setTray] = useState('open');
  const [page, setPage] = useState(3);
  return (
    <Stack gap={space[24]}>
      <Shown name="Button">
        <Stack gap={space[8]}>
          <Cluster>
            <Button variant="primary">Primary</Button>
            <Button>Default</Button>
            <Button variant="accent">Accent</Button>
          </Cluster>
          <Cluster>
            <Button variant="quiet">Quiet</Button>
            <Button variant="danger">Delete</Button>
            <Button disabled>Disabled</Button>
          </Cluster>
          <Cluster>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Cluster>
          <Button variant="primary" full icon={<Icons.IconCheck size={16} />}>
            Full width, with an icon
          </Button>
          <LinkButton onPress={() => {}}>A button that reads as a link</LinkButton>
        </Stack>
      </Shown>
      <Shown name="Tray">
        <Stack gap={space[8]}>
          <Tray
            label="Issue state"
            value={tray}
            onChange={setTray}
            options={[
              { value: 'open', label: 'Open', count: 4 },
              { value: 'closed', label: 'Closed', count: 128 },
            ]}
          />
          <Tray
            label="Size"
            value={tray}
            onChange={setTray}
            size="md"
            options={[
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </Stack>
      </Shown>
      <Shown name="Avatar and AvatarStack">
        <Cluster gap="wide">
          <Avatar initials="JW" />
          <Avatar initials="JW" size="lg" />
          <AvatarStack people={[{ initials: 'JW' }, { initials: 'KB' }, { initials: 'AS' }]} />
        </Cluster>
      </Shown>
      <Shown name="Crumbs">
        <Crumbs
          trail={[{ label: 'jacob', href: '/jacob' }, { label: 'kurobeni', href: '/k' }, { label: 'src' }]}
          onPress={() => {}}
        />
      </Shown>
      <Shown name="Pages">
        <Pages page={page} pages={9} onGo={setPage} />
      </Shown>
      <Shown name="Progress, Skeleton, Spinner, Delta">
        <Stack gap={space[12]}>
          <Progress value={0.62} label="Build" />
          <Skeleton />
          <Skeleton width="60%" />
          <Cluster gap="wide">
            <Spinner />
            <Delta value={12} />
            <Delta value={-4} />
          </Cluster>
        </Stack>
      </Shown>
    </Stack>
  );
}

/* ---- form ------------------------------------------------------------------------------------ */

function FormDemo() {
  const [name, setName] = useState('kurobeni');
  const [mail, setMail] = useState('');
  const [body, setBody] = useState('');
  const [one, setOne] = useState(true);
  const [many, setMany] = useState(false);
  const [on, setOn] = useState(true);
  const [pick, setPick] = useState<string | undefined>('main');
  return (
    <Stack gap={space[24]}>
      <Shown name="Toolbar">
        <Toolbar>
          <Input value={name} onChange={setName} placeholder="Find a repository" kind="search" icon={<Icons.IconSearch size={16} />} />
        </Toolbar>
      </Shown>
      <Shown name="Fieldset, Field, Input, Textarea">
        <Fieldset legend="New repository">
          <Form>
            <Field label="Name" hint="Lower case, no spaces." required>
              <Input value={name} onChange={setName} />
            </Field>
            <Field label="Email" error="That address is already in use.">
              <Input value={mail} onChange={setMail} kind="email" placeholder="you@example.com" invalid />
            </Field>
            <Field label="Description">
              <Textarea value={body} onChange={setBody} placeholder="What is it for?" />
            </Field>
            <FormActions>
              <Button size="sm">Cancel</Button>
              <Button size="sm" variant="primary">
                Create
              </Button>
            </FormActions>
          </Form>
        </Fieldset>
      </Shown>
      <Shown name="Group, Choice, Switch">
        <Group>
          <Choice label="Public" hint="Anyone can read it." checked={one} onChange={setOne} />
          <Choice label="Private" hint="Only you." checked={!one} onChange={(v: boolean) => setOne(!v)} />
          <Choice label="Add a README" checked={many} onChange={setMany} many />
          <Switch label="Issues" value={on} onChange={setOn} />
        </Group>
      </Shown>
      <Shown name="Select">
        <Select
          value={pick}
          onChange={setPick}
          options={[
            { value: 'main', label: 'main' },
            { value: 'kasane', label: 'kasane' },
            { value: 'kasane-api', label: 'kasane-api' },
          ]}
        />
      </Shown>
    </Stack>
  );
}

/* ---- blocks ---------------------------------------------------------------------------------- */

function BlocksDemo() {
  return (
    <Stack gap={space[24]}>
      <Shown name="Hero">
        <Hero
          title="Kasane"
          lede="One system, drawn once, read on a phone and on a desktop."
          actions={<Button variant="primary">Read the docs</Button>}
        />
      </Shown>
      <Shown name="Stats and Stat">
        <Stats>
          <Stat value="3.76M" label="Requests" delta={12} />
          <Stat value="142" unit="ms" label="p99 latency" delta={-4} />
          <Stat value="17" label="Repositories" bar={0.42} />
          <Stat value="99.98" unit="%" label="Uptime" />
        </Stats>
      </Shown>
      <Shown name="Tiles and Tile">
        <Tiles>
          <Tile title="Tokens">
            <Text kind="small" muted>
              Every colour, size and rung, from one DTCG source.
            </Text>
          </Tile>
          <Tile title="Parts" onPress={() => {}}>
            <Text kind="small" muted>
              A tile that is a target says so by lifting under a finger.
            </Text>
          </Tile>
        </Tiles>
      </Shown>
      <Shown name="Callout">
        <Stack gap={space[8]}>
          <Callout kind="note">A note is the accent, and the label is the only coloured part.</Callout>
          <Callout kind="tip">A tip is the ok colour.</Callout>
          <Callout kind="warning">A warning is the warn colour.</Callout>
          <Callout kind="caution">A caution is the error colour.</Callout>
        </Stack>
      </Shown>
      <Shown name="Sheet and SheetRow">
        <Sheet>
          <SheetRow name="Default branch">main</SheetRow>
          <SheetRow name="Licence">MIT</SheetRow>
          <SheetRow name="Size">4.2 MiB</SheetRow>
        </Sheet>
      </Shown>
      <Shown name="Facts, FactGroup, NamedFact">
        <Panel>
          <PanelHead title="Details" />
          <PanelBody>
            <Facts>
              <FactGroup>
                <NamedFact name="Opened">12 Sep 2026</NamedFact>
                <NamedFact name="Closed">—</NamedFact>
              </FactGroup>
              <FactGroup>
                <NamedFact name="Comments">3</NamedFact>
              </FactGroup>
            </Facts>
          </PanelBody>
        </Panel>
      </Shown>
      <Shown name="Cta">
        <Cta
          title="Ship it"
          text="One tag, and the CDN has both themes."
          actions={<Button variant="accent">Tag a release</Button>}
        />
      </Shown>
      <Shown name="ProseTitle">
        <ProseTitle>A document title</ProseTitle>
      </Shown>
    </Stack>
  );
}

/* ---- table ----------------------------------------------------------------------------------- */

type Run = { id: string; branch: string; who: string; at: string; ms: number; state: string };

const RUNS: Run[] = [
  { id: '1', branch: 'main', who: 'jacob', at: '2 min', ms: 42_100, state: 'ok' },
  { id: '2', branch: 'kasane', who: 'jacob', at: '1 hr', ms: 38_900, state: 'ok' },
  { id: '3', branch: 'kasane-api', who: 'jacob', at: '3 hr', ms: 51_400, state: 'err' },
];

function TableDemo() {
  return (
    <Stack gap={space[24]}>
      <Shown name="TableWrap, Table, RowTitle, TableFoot">
        <TableWrap
          foot={
            <TableFoot>
              <Text kind="small" muted>
                3 runs
              </Text>
              <Pages page={1} pages={4} onGo={() => {}} />
            </TableFoot>
          }
        >
          <Table<Run>
            columns={[
              { name: 'Branch', width: 120 },
              { name: 'By' },
              { name: 'Took', num: true, width: 72 },
              { name: 'State', width: 64 },
            ]}
            rows={RUNS}
            keyOf={(row) => row.id}
            onPressRow={() => {}}
            cell={(row, column) =>
              column.name === 'Branch' ? (
                <Text kind="small" mono numberOfLines={1}>
                  {row.branch}
                </Text>
              ) : column.name === 'By' ? (
                row.who
              ) : column.name === 'Took' ? (
                `${(row.ms / 1000).toFixed(1)}s`
              ) : (
                <Status kind={row.state === 'ok' ? 'ok' : 'err'}>
                  {row.state === 'ok' ? 'Passed' : 'Failed'}
                </Status>
              )
            }
          />
        </TableWrap>
      </Shown>
    </Stack>
  );
}

/* ---- listing --------------------------------------------------------------------------------- */

function ListingDemo() {
  return (
    <Stack gap={space[24]}>
      <Shown name="Listing, ListingHead, ListingGroup, ListingRow">
        <Listing>
          <ListingHead>src/css</ListingHead>
          <ListingRow
            first
            title="components"
            note="24 files"
            figure={<Icons.IconFolder size={16} />}
            meta={<Fact>2 days ago</Fact>}
            onPress={() => {}}
          />
          <ListingRow
            title="layout.css"
            note="4.1 KiB"
            figure={<Icons.IconFile size={16} />}
            meta={<Fact>2 days ago</Fact>}
            onPress={() => {}}
          />
          <ListingGroup>Yesterday</ListingGroup>
          <ListingRow
            first
            title="kasane.css"
            note="1.2 KiB"
            figure={<Icons.IconFile size={16} />}
            meta={<Fact>1 day ago</Fact>}
            onPress={() => {}}
          />
        </Listing>
      </Shown>
    </Stack>
  );
}

/* ---- data ------------------------------------------------------------------------------------ */

const YEAR = Array.from({ length: 371 }, (_, i) => ({
  day: `d${i}`,
  // a shape rather than noise: busy in bursts, quiet at the weekend
  value: i % 7 > 4 ? 0 : Math.max(0, Math.round(Math.sin(i / 9) * 6 + (i % 5))),
}));

function DataDemo() {
  return (
    <Stack gap={space[24]}>
      <Shown name="Calendar">
        <Calendar days={YEAR} label="Commits in the last year" />
      </Shown>
      <Shown name="Scale">
        <Stack gap={space[12]}>
          <Scale label="p99 latency" value={142} max={500} unit="ms" />
          <Scale label="Coverage" value={78} unit="%" />
        </Stack>
      </Shown>
      <Shown name="Sparkline and Columns">
        <Stack gap={space[12]}>
          <Sparkline values={[3, 5, 4, 8, 6, 9, 12, 10, 14, 13, 17]} />
          <Columns
            series={[
              { label: 'Mon', value: 12 },
              { label: 'Tue', value: 18 },
              { label: 'Wed', value: 7 },
              { label: 'Thu', value: 21 },
              { label: 'Fri', value: 16 },
            ]}
          />
        </Stack>
      </Shown>
      <Shown name="Log, LogDay, LogLine">
        <Log>
          <LogDay>12 Sep</LogDay>
          <LogLine at="21:04:12">metro: bundle built in 5432ms</LogLine>
          <LogLine at="21:04:19" kind="ok">
            snapshot repos-light.png 780x1688
          </LogLine>
          <LogLine at="21:04:31" kind="warn">
            deprecated: shadow props, use boxShadow
          </LogLine>
          <LogLine at="21:04:44" kind="err">
            fetch failed: 502 upstream
          </LogLine>
        </Log>
      </Shown>
      <Shown name="Diff, DiffFile, DiffRow">
        <Diff>
          <DiffFile path="src/css/chrome/bar.css" added={3} removed={1}>
            <DiffRow kind="hunk">@@ -161,3 +161,5 @@</DiffRow>
            <DiffRow kind="same" old={161} now={161}>
              {'@media (max-width: 767px) {'}
            </DiffRow>
            <DiffRow kind="del" old={162}>
              {'  .kb-bar { top: var(--kb-space-16); }'}
            </DiffRow>
            <DiffRow kind="add" now={162}>
              {'  .kb-bar { top: auto; bottom: var(--kb-space-16); }'}
            </DiffRow>
          </DiffFile>
        </Diff>
      </Shown>
      <Shown name="Source">
        <Source
          from={12}
          lines={[
            '.kb-bar {',
            '  position: fixed;',
            '  background: var(--kb-bg-surface);',
            '  border-radius: var(--kb-radius-block);',
            '}',
          ]}
        />
      </Shown>
    </Stack>
  );
}

/* ---- feedback -------------------------------------------------------------------------------- */

function FeedbackDemo() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const say = useToast();
  return (
    <Stack gap={space[24]}>
      <Shown name="Dialog and Drawer">
        <Cluster>
          <Button onPress={() => setDialog(true)}>Open a dialog</Button>
          <Button onPress={() => setDrawer(true)}>Open a drawer</Button>
        </Cluster>
        <Dialog
          open={dialog}
          title="Delete this repository?"
          onClose={() => setDialog(false)}
          actions={
            <>
              <Button size="sm" onPress={() => setDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onPress={() => setDialog(false)}>
                Delete
              </Button>
            </>
          }
        >
          <Text kind="small" muted>
            This cannot be undone. Every issue and every release goes with it.
          </Text>
        </Dialog>
        <Drawer open={drawer} title="Branches" onClose={() => setDrawer(false)}>
          <Stack gap={space[4]}>
            <Text>main</Text>
            <Text>kasane</Text>
            <Text>kasane-api</Text>
          </Stack>
        </Drawer>
      </Shown>
      <Shown name="Menu">
        <Menu
          label="Repository"
          items={[
            { label: 'Watch' },
            { label: 'Star' },
            { label: 'Fork' },
            { label: 'Delete', kind: 'danger' },
          ]}
          trigger={(open) => <Button onPress={open}>Open a menu</Button>}
        />
      </Shown>
      <Shown name="useToast">
        <Cluster>
          <Button size="sm" onPress={() => say('ok', 'Release published.')}>
            Say ok
          </Button>
          <Button size="sm" onPress={() => say('err', 'Could not reach the instance.')}>
            Say failed
          </Button>
        </Cluster>
      </Shown>
      <Shown name="Disclosure">
        <Disclosure summary="What the compact ladder remaps" start>
          <Text kind="small" muted>
            16 is 12, 24 is 16, 32 is 24, 48 is 32, 64 is 48 and 96 is 64. Controls are untouched.
          </Text>
        </Disclosure>
      </Shown>
      <Shown name="Accordion">
        <Accordion
          items={[
            {
              summary: 'Why the bar is at the bottom',
              body: (
                <Text kind="small" muted>
                  Because bar.css moves it there under 768, and a phone is always under 768.
                </Text>
              ),
            },
            {
              summary: 'Why a list is a collection',
              body: (
                <Text kind="small" muted>
                  A rule between repeating items is the table treatment. A list of repositories is
                  told apart by room.
                </Text>
              ),
            },
          ]}
        />
      </Shown>
    </Stack>
  );
}

/* ---- chrome ---------------------------------------------------------------------------------- */

const ICONS = Object.entries(Icons).filter(([name]) => name.startsWith('Icon'));

function ChromeDemo() {
  return (
    <Stack gap={space[24]}>
      <Shown name="Bar">
        <Text kind="small" muted>
          The bar is the pill at the bottom of this screen. It is drawn once in the layout, so it
          stays put while a screen pushes in under it, which is how the site behaves.
        </Text>
      </Shown>
      <Shown name="Seal">
        <Cluster gap="wide">
          <Seal size={32} />
          <Seal size={48} />
          <Seal size={64} />
        </Cluster>
      </Shown>
      <Shown name={`Icons (${ICONS.length})`}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[16] }}>
          {ICONS.map(([name, Icon]) => (
            <View key={name} style={{ width: 72, alignItems: 'center', gap: space[4] }}>
              {/* every icon takes the ink it sits in */}
              <Icon size={24} />
              <Text kind="caps" muted numberOfLines={1} style={{ fontSize: 9 }}>
                {name.replace('Icon', '')}
              </Text>
            </View>
          ))}
        </View>
      </Shown>
      <Shown name="Footer">
        <Footer>
          <Text kind="small" muted>
            git.konpeki.co.uk
          </Text>
          <Text kind="small" muted>
            Powered by Gitea
          </Text>
        </Footer>
      </Shown>
    </Stack>
  );
}

/* ---- markdown -------------------------------------------------------------------------------- */

const BODY = `# What this renders

The web client renders markdown with remark and a sanitiser. That pipeline does not port: this
draws native views, so there is no HTML to sanitise and nothing to inject.

## Blocks it knows

- headings, one through six
- bullet and numbered lists
- \`code\` spans, **strong**, *italic* and a [link](https://kurobeni.jp)
- fenced code
- quotes and rules

1. a numbered item
2. and another

> A quote is a filled block on the page ground. The left rule is a markdown convention, not one of
> ours.

\`\`\`css
.kb-bar {
  bottom: var(--kb-space-16);
}
\`\`\`

---

Anything it does not know reads as the text it was, which is the behaviour to want from something
this small.`;

function MarkdownDemo() {
  return (
    <Shown name="Markdown">
      <Panel>
        <PanelBody lone>
          <Markdown source={BODY} />
        </PanelBody>
      </Panel>
    </Shown>
  );
}

export const DEMOS: Record<string, () => React.ReactElement> = {
  text: TextDemo,
  layout: LayoutDemo,
  controls: ControlsDemo,
  form: FormDemo,
  blocks: BlocksDemo,
  table: TableDemo,
  listing: ListingDemo,
  data: DataDemo,
  feedback: FeedbackDemo,
  chrome: ChromeDemo,
  markdown: MarkdownDemo,
};
