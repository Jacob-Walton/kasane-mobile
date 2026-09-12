# kasane-mobile

Kasane on iOS and Android. Tokens generated from the design system, a Swift package, and an Expo
app.

## Tokens

`tokens/generate.mjs` reads Kasane's DTCG source and writes `KasaneTokens.swift` and `theme.ts`.
The CDN does not serve the token JSON, so it takes a path to a Kasane checkout:

```
node tokens/generate.mjs ../kurobeni
```

Three values differ from the web.

| | web | here | why |
| --- | --- | --- | --- |
| control sm | 32 | 44 | iOS asks 44pt |
| control md | 40 | 48 | Android asks 48dp |
| type | fixed px | base numbers | the platform scales them by the user's text setting |

Safe area insets are not tokens. The OS reports them at runtime.

Colours, the space ladder and the one 24px radius are Kasane's, unchanged. 39 colours per theme.

## Swift

`swift/` is a SwiftPM package. `KasaneKit` holds the tokens, colour parsing and the logic a view
reads. It builds and tests on Windows:

```
cd swift
swift build
swift test
```

SwiftUI is not in this target. It does not exist off Apple platforms, so views live in `KasaneUI`
and are built and snapshotted on a macOS runner.

## Expo

Not written yet.

## Layout

```
tokens/     generator and its output
swift/      KasaneKit, builds anywhere
expo/       the app
```
