import { useState, type ReactNode } from 'react';
import { Animated, TextInput, View } from 'react-native';
import { IconCheck, IconChevronDown } from '../icons';
import { Press, control, face, radius, space, useEased, useTheme } from './theme';
import { Cluster, Stack } from './layout';
import { Text } from './text';
import { Button } from './controls';

/* Fields. The one thing that differs from the web here is the keyboard: a field says what kind of
   text it wants so the OS offers the right one, which the web does with the type attribute. */

/** .kb-fieldset: a titled group of fields on a surface */
export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        gap: space[16],
        padding: space[24],
        backgroundColor: t.bg.surface,
        borderRadius: radius,
      }}
    >
      <Text kind="heading">{legend}</Text>
      {children}
    </View>
  );
}

/** .kb-form: fields down a column */
export function Form({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

/** .kb-form-actions: what the form does, at its end */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space[8] }}>
      {children}
    </View>
  );
}

/** .kb-field: a label, the control, and the hint or the error under it */
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
  const { t } = useTheme();
  return (
    <View style={{ gap: space[4] }}>
      <Text kind="small" strong style={{ paddingHorizontal: space[16], fontFamily: face.medium }}>
        {label}
        {required ? <Text kind="small" style={{ color: t.status.err }}> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <Text kind="caps" style={{ color: t.status.err, paddingHorizontal: space[16] }}>
          {error}
        </Text>
      ) : hint ? (
        <Text kind="caps" muted style={{ paddingHorizontal: space[16], textTransform: 'none' }}>
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

/** .kb-input: one control height, the surface ground, a control border */
export function Input({
  value,
  onChange,
  placeholder,
  kind = 'text',
  invalid,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  kind?: Kind;
  invalid?: boolean;
  /** .kb-input-icon: a mark inside the field, at its leading edge */
  icon?: ReactNode;
}) {
  const { t, size } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[8],
        height: control.md,
        paddingHorizontal: space[16],
        backgroundColor: t.bg.surface,
        borderRadius: radius,
        borderWidth: invalid || focus ? 1 : 0.5,
        borderColor: invalid ? t.status.err : focus ? t.border.strong : t.border.control,
      }}
    >
      {icon}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.fg.muted}
        secureTextEntry={kind === 'password'}
        keyboardType={KEYBOARD[kind]}
        autoCapitalize={kind === 'email' || kind === 'url' ? 'none' : 'sentences'}
        autoCorrect={kind !== 'email' && kind !== 'url' && kind !== 'password'}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          color: t.fg.default,
          fontSize: size('16'),
          fontFamily: face.regular,
          // a TextInput carries its own padding on Android, which puts the text off the centre line
          padding: 0,
        }}
      />
    </View>
  );
}

/** .kb-textarea: the same field, several lines tall */
export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { t, size, line } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.fg.muted}
      multiline
      textAlignVertical="top"
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        minHeight: line('16') * rows + space[16] * 2,
        padding: space[16],
        backgroundColor: t.bg.surface,
        color: t.fg.default,
        borderRadius: radius,
        borderWidth: focus ? 1 : 0.5,
        borderColor: focus ? t.border.strong : t.border.control,
        fontSize: size('16'),
        lineHeight: line('16'),
        fontFamily: face.regular,
      }}
    />
  );
}

/** .kb-group: fields two abreast on the web, one under the other here */
export function Group({ children }: { children: ReactNode }) {
  return <Stack gap={space[16]}>{children}</Stack>;
}

/* .kb-choice: a radio or a checkbox as one target the width of the row, since a 16px box is not
   something to aim a thumb at. The mark is our own: a platform checkbox is the platform's. */
export function Choice({
  label,
  hint,
  checked,
  onChange,
  many,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** many is a checkbox, one is a radio */
  many?: boolean;
}) {
  const { t } = useTheme();
  return (
    <Press
      accessibilityRole={many ? 'checkbox' : 'radio'}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      rest={t.bg.surface}
      down={t.bg.pressed}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        minHeight: control.md,
        padding: space[12],
        borderRadius: radius,
        borderWidth: 0.5,
        borderColor: checked ? t.border.strong : t.border.control,
      }}
    >
      <View
        style={{
          width: space[24],
          height: space[24],
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: many ? space[8] : space[12],
          borderWidth: checked ? 0 : 0.5,
          borderColor: t.border.control,
          backgroundColor: checked ? t.fill.default : 'transparent',
        }}
      >
        {checked ? <IconCheck size={16} colour={t.fg.onFill} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text kind="small" style={{ fontFamily: face.medium }}>
          {label}
        </Text>
        {hint ? (
          <Text kind="caps" muted style={{ textTransform: 'none' }}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Press>
  );
}

/* .kb-switch: on or off, with the knob crossing over the motion tokens. Not the platform Switch,
   which is the platform's shape and its accent colour. */
export function Switch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = useTheme();
  const at = useEased(value ? 1 : 0);
  const track = space[48];
  const knob = space[24];
  return (
    <Press
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      rest="transparent"
      down={t.bg.pressed}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        minHeight: control.md,
        paddingHorizontal: space[8],
        borderRadius: radius,
      }}
    >
      <Text kind="small" style={{ flex: 1, fontFamily: face.medium }}>
        {label}
      </Text>
      <View
        style={{
          width: track,
          height: knob + 4,
          borderRadius: radius,
          padding: 2,
          backgroundColor: value ? t.fill.default : t.bg.pressed,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            backgroundColor: value ? t.fg.onFill : t.bg.surface,
            transform: [
              {
                translateX: at.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, track - knob - 4],
                }),
              },
            ],
          }}
        />
      </View>
    </Press>
  );
}

/** .kb-select: one of a set. The sheet it opens is in feedback.tsx. */
export function Select({
  value,
  options,
  onChange,
  placeholder = 'Choose',
}: {
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value);
  return (
    <View style={{ gap: space[4] }}>
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
          height: control.md,
          paddingHorizontal: space[16],
          borderRadius: radius,
          borderWidth: 0.5,
          borderColor: t.border.control,
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
            borderWidth: 0.5,
            borderColor: t.border.control,
            overflow: 'hidden',
          }}
        >
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

export { Button, Cluster };
