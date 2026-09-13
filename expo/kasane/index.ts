/* The kit. One name a part, the same names Kasane uses on the web, so a screen written against one
   reads the same against the other.

   What a phone has no use for, and why, is listed in scripts/parity.mjs. What is here but shaped
   differently is listed in tokens/deviations.json. */

export {
  Press,
  control,
  face,
  focus,
  hairline,
  motion,
  radius,
  room,
  shadow,
  space,
  useEased,
  useFocusRing,
  useTheme,
} from './theme';
export type { Ink, Step } from './theme';

export { Count, Figure, FigureSwatch, Lede, Status, Text } from './text';
export type { TextKind } from './text';

export {
  Cluster,
  Collection,
  Divider,
  Empty,
  Fact,
  Head,
  Item,
  ItemText,
  Meta,
  Panel,
  PanelBody,
  PanelFoot,
  PanelHead,
  Row,
  Section,
  Stack,
} from './layout';

export { Failed, Waiting } from './screen';

export {
  Avatar,
  AvatarStack,
  Button,
  Crumbs,
  Delta,
  LinkButton,
  Pages,
  Progress,
  Skeleton,
  Spinner,
  Tabs,
  Tray,
} from './controls';
export type { ButtonSize, ButtonVariant, TabItem, TrayItem } from './controls';

export {
  Choice,
  Field,
  Fieldset,
  Form,
  FormActions,
  Group,
  Input,
  Select,
  Switch,
  Textarea,
  Toolbar,
  Turn,
} from './form';

export {
  Callout,
  Cta,
  FactGroup,
  Facts,
  Hero,
  NamedFact,
  ProseTitle,
  Sheet,
  SheetRow,
  Stat,
  Stats,
  Tile,
  Tiles,
} from './blocks';

export { RowTitle, Table, TableFoot, TableWrap } from './table';
export type { Column, Priority } from './table';

export { Listing, ListingGroup, ListingHead, ListingRow } from './listing';

export {
  Calendar,
  Columns,
  Diff,
  DiffFile,
  DiffRow,
  Log,
  LogDay,
  LogLine,
  Scale,
  Source,
  Sparkline,
  logKind,
} from './data';
export type { DiffKind, LogKind, ScalePart } from './data';

export {
  Accordion,
  Dialog,
  Disclosure,
  Drawer,
  Menu,
  ToastProvider,
  useToast,
} from './feedback';
export type { MenuItem, ToastKind } from './feedback';

export { Bar, Footer, Seal } from './chrome';
export { Band, Col, useBarInsets, usePagePad } from './page';
export type { NavItem } from './chrome';
