import { useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';
import { IconCheck, IconChevronDown } from '../icons';
import {
  Press,
  control,
  face,
  hairline,
  radius,
  space,
  useEased,
  useFocusRing,
  useTheme,
} from './theme';
import { Stack } from './layout';
import { Text } from './text';
import { Button } from './controls';

/* Fields, drawn from form.css rule for rule.

   Two things a phone adds. A field says what kind of text it wants so the OS offers the right
   keyboard, which the web does with the type attribute. And there is no :hover, so a press shows
   the :active rule: on the web a finger fires hover and then active, and active is the one that is
   true while the finger is down. */

/** .kb-fieldset: a titled group of fields on a surface */
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        gap: space[16],
        padding: space[32],
        backgroundColor: t.bg.surface,
        borderRadius: radius,
      }}
    >
      {/* .kb-fieldset > legend: 24, semibold, and 8 clear of the first field */}
      <Text kind="heading" style={{ marginBottom: space[8] }}>
        {legend}
      </Text>
      {children}
    </View>
  );
}

/** .kb-form: fields down a column */
export function Form({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

/** .kb-form__actions: what the form does, at its end */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: space[8],
        paddingTop: space[8],
      }}
    >
      {children}
    </View>
  );
}

/* .kb-field: a label, the control, and the hint or the error under it. The label and the hint are
   inset by 16 so they line up with the text inside the control. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const { t, size } = useTheme();
  return (
    <View style={{ gap: space[4] }}>
      <Text kind="small" style={{ paddingHorizontal: space[16], fontFamily: face.medium }}>
        {label}
        {required ? (
          <Text kind="small" style={{ color: t.status.err, fontFamily: face.medium }}>
            {' *'}
          </Text>
        ) : null}
      </Text>
      {children}
      {/* .kb-field__error is 12 and medium in the error colour; the hint is 12 and secondary */}
      {error ? (
        <Text
          style={{
            paddingHorizontal: space[16],
            color: t.status.err,
            fontSize: size('12'),
            fontFamily: face.medium,
          }}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          muted
          style={{ paddingHorizontal: space[16], fontSize: size('12'), fontFamily: face.regular }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

type Kind = 'text' | 'email' | 'password' | 'search' | 'number' | 'url';

const KEYBOARD: Record<Kind, 'default' | 'email-address' | 'numeric' | 'url'> = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  search: 'default',
  number: 'numeric',
  url: 'url',
};

/* .kb-input: one control height, the surface ground, a hairline in the control colour.

   :active takes the ground to raised, which needs a press the field itself cannot report, so the
   field sits inside one. Pressing it also puts the caret in, which is what clicking does. */
export function Input({
  value,
  onChange,
  placeholder,
  kind = 'text',
  invalid,
  disabled,
  icon,
  small,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  kind?: Kind;
  invalid?: boolean;
  disabled?: boolean;
  /** .kb-input-icon: a mark inside the field, at its leading edge */
  icon?: ReactNode;
  small?: boolean;
}) {
  const { t, size } = useTheme();
  const field = useRef<TextInput>(null);
  const [down, setDown] = useState(false);
  const focusRing = useFocusRing();

  return (
    <Pressable
      unstable_pressDelay={0}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      onPress={() => field.current?.focus()}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[8],
          height: small ? control.sm : control.md,
          paddingHorizontal: small ? space[12] : space[16],
          borderRadius: radius,
          // :active is the ground; [disabled] is the ground, the ink and the edge
          backgroundColor: disabled || down ? t.bg.raised : t.bg.surface,
          // invalid is a border and an inset ring of the same colour, which is two of them
          borderWidth: invalid ? hairline * 2 : hairline,
          borderColor: invalid ? t.status.err : disabled ? t.border.hairline : t.border.control,
        },
        focusRing.ring,
      ]}
    >
      {icon}
      <TextInput
        ref={field}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        // .kb-input::placeholder is the muted ink at full opacity
        placeholderTextColor={t.fg.muted}
        editable={!disabled}
        secureTextEntry={kind === 'password'}
        keyboardType={KEYBOARD[kind]}
        autoCapitalize={kind === 'email' || kind === 'url' ? 'none' : 'sentences'}
        autoCorrect={kind !== 'email' && kind !== 'url' && kind !== 'password'}
        onFocus={focusRing.onFocus}
        onBlur={focusRing.onBlur}
        style={{
          flex: 1,
          color: disabled ? t.fg.muted : t.fg.default,
          fontSize: small ? size('14') : size('16'),
          fontFamily: face.regular,
          // a TextInput carries its own padding on Android, which puts the text off the centre line
          padding: 0,
        }}
      />
    </Pressable>
  );
}

/* .kb-textarea: the same field, at least two and a half controls tall, with 8 above and below and
   its own 1.5 leading rather than the ladder's. */
export function Textarea({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { t, size } = useTheme();
  const focusRing = useFocusRing();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.fg.muted}
      editable={!disabled}
      multiline
      textAlignVertical="top"
      onFocus={focusRing.onFocus}
      onBlur={focusRing.onBlur}
      style={[
        {
          minHeight: control.md * 2.5,
          paddingHorizontal: space[16],
          paddingVertical: space[8],
          backgroundColor: disabled ? t.bg.raised : t.bg.surface,
          color: disabled ? t.fg.muted : t.fg.default,
          borderRadius: radius,
          borderWidth: hairline,
          borderColor: disabled ? t.border.hairline : t.border.control,
          fontSize: size('16'),
          lineHeight: size('16') * 1.5,
          fontFamily: face.regular,
        },
        focusRing.ring,
      ]}
    />
  );
}

/** .kb-group: fields two abreast on the web, one under the other here */
export function Group({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

/* .kb-choice: a label, its box, and the words beside it. Not a card: the CSS gives it no ground and
   no border of its own, only a gap of 8 and a minimum height.

   The box is 28 by 20 for a checkbox and 20 by 20 for a radio, and the mark inside is 14 square,
   or an 8 dot for a radio. Those are literals in form.css too, not rungs. */
export function Choice({
  label,
  hint,
  checked,
  onChange,
  many,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** many is a checkbox, one is a radio */
  many?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTheme();
  const [down, setDown] = useState(false);
  const focusRing = useFocusRing();
  const mark = useEased(checked ? 1 : 0);

  const ground = disabled
    ? checked
      ? t.border.control
      : t.bg.raised
    : checked
      ? down
        ? t.accent.active
        : t.accent.default
      : down
        ? t.bg.pressed
        : t.bg.surface;
  const edge = disabled
    ? checked
      ? t.border.control
      : t.border.hairline
    : checked
      ? down
        ? t.accent.active
        : t.accent.default
      : t.border.control;

  return (
    <Pressable
      accessibilityRole={many ? 'checkbox' : 'radio'}
      accessibilityState={{ checked, disabled: !!disabled }}
      unstable_pressDelay={0}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      onPress={() => onChange(!checked)}
      onFocus={focusRing.onFocus}
      onBlur={focusRing.onBlur}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: space[8],
        minHeight: space[24],
      }}
    >
      <View
        style={[
          {
            width: many ? 28 : 20,
            height: 20,
            marginVertical: 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: many ? radius : 10,
            borderWidth: hairline,
            borderColor: edge,
            backgroundColor: ground,
          },
          focusRing.ring,
        ]}
      >
        <Animated.View style={{ opacity: mark }}>
          {many ? (
            <IconCheck size={14} colour={t.fg.onAccent} />
          ) : (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.fg.onAccent }} />
          )}
        </Animated.View>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          kind="small"
          style={{ color: disabled ? t.fg.muted : t.fg.default, fontFamily: face.medium }}
        >
          {label}
        </Text>
        {/* .kb-choice__text small: 12, regular, secondary, on its own line */}
        {hint ? (
          <Text muted style={{ fontSize: 12, fontFamily: face.regular }}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/* .kb-switch: a 64 by 32 track carrying the word for its state, and a 24 knob that crosses to the
   other end over the motion tokens. Every number here is in form.css. */
export function Switch({
  label,
  value,
  onChange,
  on = 'On',
  off = 'Off',
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** .kb-switch reads these off data-kb-on and data-kb-off */
  on?: string;
  off?: string;
  disabled?: boolean;
}) {
  const { t, size } = useTheme();
  const [down, setDown] = useState(false);
  const focusRing = useFocusRing();
  const at = useEased(value ? 1 : 0);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      unstable_pressDelay={0}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      onPress={() => onChange(!value)}
      onFocus={focusRing.onFocus}
      onBlur={focusRing.onBlur}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[8],
        minHeight: space[32],
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={[
          {
            width: 64,
            height: space[32],
            borderRadius: radius,
            borderWidth: hairline,
            borderColor: value ? t.accent.default : t.border.control,
            backgroundColor: value ? t.accent.default : t.bg.raised,
            justifyContent: 'center',
          },
          focusRing.ring,
        ]}
      >
        {/* the word sits in a 34 column at the end the knob is not at */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 34,
            left: value ? 0 : undefined,
            right: value ? undefined : 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: value ? t.fg.onAccent : t.fg.secondary,
              fontSize: size('12'),
              fontFamily: face.medium,
              letterSpacing: size('12') * 0.04,
            }}
          >
            {value ? on : off}
          </Text>
        </View>
        <Animated.View
          style={{
            position: 'absolute',
            top: 3,
            width: 24,
            height: 24,
            borderRadius: radius,
            borderWidth: hairline,
            borderColor: value ? t.fg.onAccent : t.border.control,
            backgroundColor: down
              ? value
                ? t.fill.active
                : t.bg.raised
              : value
                ? t.fg.onAccent
                : t.bg.surface,
            left: at.interpolate({ inputRange: [0, 1], outputRange: [3, 35] }),
          }}
        />
      </View>
      <Text kind="small" style={{ flex: 1, fontFamily: face.medium }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** .kb-select: one of a set. The list it opens is .kb-dd__list. */
export function Select({
  value,
  options,
  onChange,
  placeholder = 'Choose',
  disabled,
}: {
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value);
  return (
    <View style={{ gap: space[4] }}>
      <Press
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        onPress={disabled ? undefined : () => setOpen(!open)}
        rest={disabled ? t.bg.raised : t.bg.surface}
        down={t.bg.pressed}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[8],
          height: control.md,
          paddingHorizontal: space[16],
          borderRadius: radius,
          borderWidth: hairline,
          borderColor: disabled ? t.border.hairline : t.border.control,
        }}
      >
        <Text kind="body" muted={!chosen} style={{ flex: 1 }}>
          {chosen?.label ?? placeholder}
        </Text>
        <Turn open={open}>
          <IconChevronDown size={18} />
        </Turn>
      </Press>
      {open ? (
        <View
          style={{
            backgroundColor: t.bg.surface,
            borderRadius: radius,
            borderWidth: hairline,
            borderColor: t.border.control,
            overflow: 'hidden',
          }}
        >
          {/* .kb-dd__list [role=option]: selected is the raised ground, pressed is pressed */}
          {options.map((option) => (
            <Press
              key={option.value}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: option.value === value }}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              rest={option.value === value ? t.bg.raised : t.bg.surface}
              down={t.bg.pressed}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space[8],
                minHeight: control.md,
                paddingHorizontal: space[16],
              }}
            >
              <Text kind="body" style={{ flex: 1 }}>
                {option.label}
              </Text>
              {option.value === value ? <IconCheck size={16} /> : null}
            </Press>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** .kb-icon-turn: a chevron that points the way it will go, crossing over the motion tokens */
export function Turn({ open, children }: { open: boolean; children: ReactNode }) {
  const at = useEased(open ? 1 : 0);
  return (
    <Animated.View
      style={{
        transform: [
          { rotate: at.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** .kb-toolbar: the controls above a table or a list */
export function Toolbar({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: space[8],
        padding: space[12],
        backgroundColor: t.bg.surface,
        borderRadius: radius,
      }}
    >
      {children}
    </View>
  );
}

export { Button };
