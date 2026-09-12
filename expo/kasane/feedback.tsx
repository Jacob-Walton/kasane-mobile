import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconCheck, IconChevronDown, IconClose } from '../icons';
import { Press, control, radius, shadow, space, useTheme } from './theme';
import { Cluster, Stack } from './layout';
import { Text } from './text';
import { Button } from './controls';
import { Turn } from './form';

/* What interrupts, and what folds away.

   A dialog and a drawer are both the platform's Modal here, because a phone has no window to put a
   layer inside: the OS owns the layer. What is drawn inside it is ours. */

function Scrim({ onPress }: { onPress: () => void }) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityLabel="Close"
      onPress={onPress}
      style={{ position: 'absolute', inset: 0, backgroundColor: t.bg.scrim }}
    />
  );
}

/** .kb-dialog: one question, centred, on the scrim */
export function Dialog({
  open,
  title,
  onClose,
  actions,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const { t } = useTheme();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', padding: space[16] }}>
        <Scrim onPress={onClose} />
        <View
          accessibilityViewIsModal
          style={{
            gap: space[16],
            padding: space[24],
            backgroundColor: t.bg.surface,
            borderRadius: radius,
            shadowColor: shadow.raised.colour,
            shadowOffset: { width: shadow.raised.x, height: shadow.raised.y },
            shadowRadius: shadow.raised.blur / 2,
            shadowOpacity: shadow.raised.opacity,
            elevation: 16,
          }}
        >
          <Cluster>
            <Text kind="heading" style={{ flex: 1 }}>
              {title}
            </Text>
            <Button variant="quiet" onPress={onClose} icon={<IconClose size={18} />} />
          </Cluster>
          {children}
          {actions ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space[8] }}>
              {actions}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

/* .kb-drawer: a panel that comes in from an edge. On the web it is the side; on a phone it is the
   bottom, because that is the edge a thumb reaches and the width is already spent. */
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Scrim onPress={onClose} />
        <View
          accessibilityViewIsModal
          style={{
            gap: space[16],
            padding: space[16],
            paddingBottom: insets.bottom + space[16],
            backgroundColor: t.bg.surface,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          }}
        >
          <Cluster>
            <Text kind="heading" style={{ flex: 1 }}>
              {title}
            </Text>
            <Button variant="quiet" onPress={onClose} icon={<IconClose size={18} />} />
          </Cluster>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/* .kb-toast: what happened, after it happened. Held at the bottom, where the bar is, so the two do
   not argue over the same corner. */
export type ToastKind = 'ok' | 'err' | 'info';

type Toast = { id: number; kind: ToastKind; text: string };

const ToastBox = createContext<(kind: ToastKind, text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState<Toast[]>([]);

  const say = useCallback((kind: ToastKind, text: string) => {
    const id = shown.length + Math.floor(performance.now());
    setShown((was) => [...was, { id, kind, text }]);
    setTimeout(() => setShown((was) => was.filter((one) => one.id !== id)), 4000);
  }, [shown.length]);

  return (
    <ToastBox.Provider value={say}>
      {children}
      {shown.length ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: space[16],
            right: space[16],
            bottom: insets.bottom + space[96],
            gap: space[8],
          }}
        >
          {shown.map((one) => (
            <View
              key={one.id}
              accessibilityLiveRegion="polite"
              style={{
                padding: space[12],
                backgroundColor: t.bg.toast,
                borderRadius: radius,
                borderWidth: 0.5,
                borderColor: t.border.toast,
              }}
            >
              <Text
                kind="small"
                style={{
                  color:
                    one.kind === 'ok'
                      ? t.fg.toastOk
                      : one.kind === 'err'
                        ? t.fg.toastErr
                        : t.fg.toast,
                }}
              >
                {one.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ToastBox.Provider>
  );
}

export function useToast() {
  return useContext(ToastBox);
}

/** .kb-disclosure: a summary that opens what is under it */
export function Disclosure({
  summary,
  children,
  start,
}: {
  summary: string;
  children: ReactNode;
  start?: boolean;
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(!!start);
  return (
    <View style={{ backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' }}>
      <Press
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        rest={t.bg.surface}
        down={t.bg.pressed}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[8],
          padding: space[16],
        }}
      >
        <Text kind="sub" style={{ flex: 1 }}>
          {summary}
        </Text>
        <Turn open={open}>
          <IconChevronDown size={18} />
        </Turn>
      </Press>
      {open ? <View style={{ padding: space[16], paddingTop: 0 }}>{children}</View> : null}
    </View>
  );
}

/** .kb-accordion: a run of disclosures, one open at a time */
export function Accordion({
  items,
}: {
  items: { summary: string; body: ReactNode }[];
}) {
  const { t } = useTheme();
  const [at, setAt] = useState<number | null>(0);
  return (
    <Stack gap={space[8]}>
      {items.map((item, i) => (
        <View
          key={i}
          style={{ backgroundColor: t.bg.surface, borderRadius: radius, overflow: 'hidden' }}
        >
          <Press
            accessibilityRole="button"
            accessibilityState={{ expanded: at === i }}
            onPress={() => setAt(at === i ? null : i)}
            rest={t.bg.surface}
            down={t.bg.pressed}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[8],
              padding: space[16],
            }}
          >
            <Text kind="sub" style={{ flex: 1 }}>
              {item.summary}
            </Text>
            <Turn open={at === i}>
              <IconChevronDown size={18} />
            </Turn>
          </Press>
          {at === i ? <View style={{ padding: space[16], paddingTop: 0 }}>{item.body}</View> : null}
        </View>
      ))}
    </Stack>
  );
}

/* .kb-menu: a list of things to do, opened by one control. On a phone it opens from the bottom
   edge: a popover anchored to a bar at the bottom of the screen has nowhere to go. */
export type MenuItem = {
  label: string;
  onPress?: () => void;
  kind?: 'danger';
  /** a caps label above this item, which starts a group */
  group?: string;
  /** the one you are on */
  checked?: boolean;
  note?: string;
};

export function Menu({
  label,
  items,
  trigger,
}: {
  label: string;
  items: MenuItem[];
  trigger: (open: () => void) => ReactNode;
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const show = useMemo(() => () => setOpen(true), []);
  return (
    <>
      {trigger(show)}
      <Drawer open={open} title={label} onClose={() => setOpen(false)}>
        <Stack gap={space[4]}>
          {items.map((item, i) => (
            <Fragment key={i}>
              {item.group ? (
                <Text kind="caps" muted style={{ paddingHorizontal: space[16], paddingTop: space[8] }}>
                  {item.group}
                </Text>
              ) : null}
              <Press
                accessibilityRole="menuitem"
                accessibilityState={{ selected: !!item.checked }}
                onPress={() => {
                  setOpen(false);
                  item.onPress?.();
                }}
                rest={item.checked ? t.bg.raised : 'transparent'}
                down={t.bg.pressed}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space[8],
                  minHeight: control.lg,
                  paddingHorizontal: space[16],
                  borderRadius: radius,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: item.kind === 'danger' ? t.status.err : t.fg.default }}>
                    {item.label}
                  </Text>
                  {item.note ? (
                    <Text kind="caps" muted style={{ textTransform: 'none' }}>
                      {item.note}
                    </Text>
                  ) : null}
                </View>
                {item.checked ? <IconCheck size={16} /> : null}
              </Press>
            </Fragment>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}
