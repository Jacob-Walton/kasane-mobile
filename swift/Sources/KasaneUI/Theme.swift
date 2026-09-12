#if canImport(SwiftUI)
  import KasaneKit
  import SwiftUI

  // Nothing in this target holds a colour or a number. They all come from KasaneTokens.swift, which
  // is generated from the same DTCG source the web and the Expo app read.
  //
  // The whole target is behind canImport so the package still builds on Windows, where SwiftUI does
  // not exist.

  public struct Palette: Sendable {
    let dark: Bool

    public func colour(_ name: String) -> Color {
      guard let c = Kasane.colour(name, dark: dark) else { return .pink }
      return Color(.sRGB, red: c.red, green: c.green, blue: c.blue, opacity: c.alpha)
    }

    public var fg: Color { colour("fg.default") }
    public var fgSecondary: Color { colour("fg.secondary") }
    public var onFill: Color { colour("fg.onFill") }
    public var page: Color { colour("bg.page") }
    public var surface: Color { colour("bg.surface") }
    public var raised: Color { colour("bg.raised") }
    public var pressed: Color { colour("bg.pressed") }
    public var hairline: Color { colour("border.hairline") }
    public var control: Color { colour("border.control") }
    public var fill: Color { colour("fill.default") }
    public var accent: Color { colour("accent.default") }
    public var ok: Color { colour("status.ok") }
    public var warn: Color { colour("status.warn") }

    /// A shadow token carries its opacity in the rgba the web writes; here it is a separate part.
    public func shadow(_ s: Kasane.Shadow) -> Color {
      guard let c = Colour(token: s.colour) else { return Color.black.opacity(s.opacity) }
      return Color(.sRGB, red: c.red, green: c.green, blue: c.blue, opacity: s.opacity)
    }
  }

  struct PaletteKey: EnvironmentKey {
    static let defaultValue = Palette(dark: false)
  }

  public extension EnvironmentValues {
    var kasane: Palette {
      get { self[PaletteKey.self] }
      set { self[PaletteKey.self] = newValue }
    }
  }

  /// Wraps a screen so every view under it reads the right theme and sits on the page ground.
  public struct Kasaned<Content: View>: View {
    @Environment(\.colorScheme) private var scheme
    private let content: Content

    public init(@ViewBuilder _ content: () -> Content) {
      self.content = content()
    }

    public var body: some View {
      let palette = Palette(dark: scheme == .dark)
      return content
        .environment(\.kasane, palette)
        .background(palette.page)
    }
  }

  // Kasane's face, the same one the web and the Expo app use. A weight is a family: the files are
  // static, so asking for semibold on the regular file gets a smeared fake.
  public enum Face {
    public static let regular = "IBMPlexSans-Regular"
    public static let medium = "IBMPlexSans-Medium"
    public static let semibold = "IBMPlexSans-SemiBold"
    public static let mono = "IBMPlexMono-Regular"

    /// The tokens carry leading the way CSS does: a multiple of the size, counting the whole line.
    /// SwiftUI counts lineSpacing as what to add on top of the face's own line height, so the
    /// face's height has to come out of the token before it is handed over.
    public static func extraLeading(_ step: Step, face: String) -> CGFloat {
      _ = registered
      let font = CTFontCreateWithName(face as CFString, step.token.size, nil)
      let own = CTFontGetAscent(font) + CTFontGetDescent(font) + CTFontGetLeading(font)
      return max(0, step.token.size * step.token.leading - own)
    }
  }

  public enum Step {
    case caps, small, body, heading, title

    var token: Kasane.TypeStep {
      switch self {
      case .caps: Kasane.TypeScale.t12
      case .small: Kasane.TypeScale.t14
      case .body: Kasane.TypeScale.t16
      case .heading: Kasane.TypeScale.t20
      case .title: Kasane.TypeScale.t32
      }
    }
  }

  // A SwiftPM library has no Info.plist, so UIAppFonts is not available: the files are registered
  // with CoreText the first time a face is asked for.
  private let registered: Bool = {
    let names = [
      "IBMPlexSans_400Regular", "IBMPlexSans_500Medium", "IBMPlexSans_600SemiBold",
      "IBMPlexSans_400Regular_Italic", "IBMPlexMono_400Regular",
    ]
    let urls = names.compactMap { Bundle.module.url(forResource: $0, withExtension: "ttf") }
    CTFontManagerRegisterFontURLs(urls as CFArray, .process, true, nil)
    return true
  }()

  public extension Font {
    /// A step from Kasane's ladder, in the face and weight asked for. Dynamic Type still scales it:
    /// relativeTo means the reader's setting moves the size the token names.
    static func kasane(_ step: Step, face: String = Face.regular) -> Font {
      _ = registered
      return .custom(face, size: step.token.size, relativeTo: step.textStyle)
    }
  }

  extension Step {
    // what the OS should scale this step against, so a size the tokens name still grows and shrinks
    var textStyle: Font.TextStyle {
      switch self {
      case .caps: .caption
      case .small: .subheadline
      case .body: .body
      case .heading: .title3
      case .title: .largeTitle
      }
    }
  }
#endif
