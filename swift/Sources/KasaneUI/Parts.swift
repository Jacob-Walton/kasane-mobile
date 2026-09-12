#if canImport(SwiftUI)
  import KasaneKit
  import SwiftUI

  // The same kit as the Expo app, in SwiftUI. Every part is a Kasane rule, named above it, and
  // nothing is a stock control: a system control brings the platform's look with it, and the look
  // is the thing being built. A phone-only difference belongs in deviations.json, not here.

  public struct KText: View {
    @Environment(\.kasane) private var k
    let text: String
    var step: Step = .body
    var muted = false
    var strong = false

    public init(_ text: String, step: Step = .body, muted: Bool = false, strong: Bool = false) {
      self.text = text
      self.step = step
      self.muted = muted
      self.strong = strong
    }

    public var body: some View {
      let heavy = strong || step == .title || step == .heading
      let face = heavy ? Face.semibold : Face.regular
      return Text(step == .caps ? text.uppercased() : text)
        .font(.kasane(step, face: face))
        .tracking(step.token.tracking * step.token.size)
        .lineSpacing(Face.extraLeading(step, face: face))
        .foregroundStyle(muted ? k.fgSecondary : k.fg)
    }
  }

  /// A chevron drawn as a path. A glyph renders at whatever size the face gives it, which in a bar
  /// is smaller than the target it sits in.
  public struct Chevron: View {
    @Environment(\.kasane) private var k
    @ScaledMetric(relativeTo: .title3) private var height: CGFloat = 12
    let facing: Side

    public init(facing: Side = .leading) { self.facing = facing }

    public enum Side: Sendable { case leading, trailing }

    public var body: some View {
      let h = min(max(height, 9), 20)
      return Path { p in
        p.move(to: CGPoint(x: h / 2, y: 0))
        p.addLine(to: CGPoint(x: 0, y: h / 2))
        p.addLine(to: CGPoint(x: h / 2, y: h))
      }
      .stroke(
        k.fg, style: StrokeStyle(lineWidth: max(1.5, h / 6), lineCap: .round, lineJoin: .round)
      )
      .frame(width: h / 2, height: h)
      .rotationEffect(.degrees(facing == .leading ? 0 : 180))
      .accessibilityHidden(true)
    }
  }

  public struct Panel<Content: View>: View {
    @Environment(\.kasane) private var k
    private let content: Content

    public init(@ViewBuilder _ content: () -> Content) { self.content = content() }

    public var body: some View {
      content
        .background(k.surface)
        .clipShape(RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous))
        .overlay(
          RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous)
            .strokeBorder(k.hairline, lineWidth: 0.5)
        )
    }
  }

  /// A row in a list. The whole row is the target: a phone is aimed at with a thumb.
  public struct Row: View {
    @Environment(\.kasane) private var k
    let title: String
    var note: String?
    var meta: String?
    var last = false
    var action: () -> Void = {}

    public init(
      title: String, note: String? = nil, meta: String? = nil, last: Bool = false,
      action: @escaping () -> Void = {}
    ) {
      self.title = title
      self.note = note
      self.meta = meta
      self.last = last
      self.action = action
    }

    public var body: some View {
      Button(action: action) {
        HStack(spacing: Kasane.Space.s12) {
          VStack(alignment: .leading, spacing: 2) {
            KText(title).lineLimit(2)
            if let note { KText(note, step: .small, muted: true).lineLimit(1) }
          }
          .frame(maxWidth: .infinity, alignment: .leading)
          if let meta { KText(meta, step: .small, muted: true) }
        }
        .padding(.horizontal, Kasane.Space.s16)
        .padding(.vertical, Kasane.Space.s12)
        .frame(minHeight: Kasane.Control.md)
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .overlay(alignment: .bottom) {
        if !last { Rectangle().fill(k.hairline).frame(height: 0.5) }
      }
    }
  }

  /// .kb-tray: a pill holding a segmented set, on the deepest ground step so it reads on the page
  /// and on a panel alike. An unselected item is full ink on a transparent ground; the selected one
  /// is filled, so where you are is not carried by colour alone.
  public struct Tray: View {
    @Environment(\.kasane) private var k
    @Binding var value: String
    let options: [Option]

    public struct Option: Identifiable, Sendable {
      public let value: String
      public let label: String
      public var id: String { value }

      public init(value: String, label: String) {
        self.value = value
        self.label = label
      }
    }

    public init(value: Binding<String>, options: [Option]) {
      _value = value
      self.options = options
    }

    public var body: some View {
      HStack(spacing: Kasane.Space.s4) {
        ForEach(options) { option in
          let on = option.value == value
          Button { value = option.value } label: {
            Text(option.label)
              .font(.kasane(.small, face: Face.medium))
              .foregroundStyle(on ? k.onFill : k.fg)
              .padding(.horizontal, Kasane.Space.s16)
              .frame(height: Kasane.Control.sm)
              .background(on ? k.fill : Color.clear)
              .clipShape(RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous))
          }
          .buttonStyle(.plain)
          .accessibilityAddTraits(on ? [.isButton, .isSelected] : [.isButton])
        }
      }
      .padding(Kasane.Space.s4)
      .background(k.pressed)
      .clipShape(RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous))
    }
  }

  /// .kb-status: a state is coloured text at 14 and medium, with no chip around it. An outlined
  /// badge is not in Kasane.
  public struct Status: View {
    @Environment(\.kasane) private var k
    let label: String
    var kind: Kind = .neutral

    public init(_ label: String, kind: Kind = .neutral) {
      self.label = label
      self.kind = kind
    }

    public enum Kind: Sendable { case neutral, ok, warn, err }

    public var body: some View {
      let ink =
        switch kind {
        case .ok: k.ok
        case .warn: k.warn
        case .err: k.colour("status.err")
        case .neutral: k.fgSecondary
        }
      return Text(label)
        .font(.kasane(.small, face: Face.medium))
        .foregroundStyle(ink)
    }
  }

  /// .kb-count: a number beside a label, secondary and tabular so a column of them lines up.
  public struct Count: View {
    @Environment(\.kasane) private var k
    let value: Int

    public init(_ value: Int) { self.value = value }

    public var body: some View {
      Text(value.formatted())
        .font(.kasane(.small).monospacedDigit())
        .foregroundStyle(k.fgSecondary)
    }
  }

  public struct KButton: View {
    @Environment(\.kasane) private var k
    let label: String
    var primary = false
    var action: () -> Void = {}

    public init(_ label: String, primary: Bool = false, action: @escaping () -> Void = {}) {
      self.label = label
      self.primary = primary
      self.action = action
    }

    public var body: some View {
      Button(action: action) {
        Text(label)
          .font(.kasane(.small, face: Face.medium))
          .foregroundStyle(primary ? k.onFill : k.fg)
          .padding(.horizontal, Kasane.Space.s16)
          .frame(height: Kasane.Control.md)
          .background(primary ? k.fill : k.surface)
          .clipShape(RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous)
              .strokeBorder(primary ? k.fill : k.control, lineWidth: 0.5)
          )
      }
      .buttonStyle(.plain)
    }
  }

  /// .kb-spin: a 2px ring in the current ink with its top edge cleared, turning in 700ms. Not
  /// ProgressView, which brings the platform own look with it.
  public struct Spinner: View {
    @Environment(\.kasane) private var k
    @State private var turning = false
    var step: Step = .heading

    public init(step: Step = .heading) { self.step = step }

    public var body: some View {
      let edge = step.token.size
      return Circle()
        .trim(from: 0, to: 0.75)
        .stroke(k.fgSecondary, style: StrokeStyle(lineWidth: 2, lineCap: .butt))
        .frame(width: edge, height: edge)
        .rotationEffect(.degrees(turning ? 360 : 0))
        .animation(.linear(duration: 0.7).repeatForever(autoreverses: false), value: turning)
        .onAppear { turning = true }
        .accessibilityLabel("Loading")
    }
  }

  /// .kb-bar: a pill that floats over the page, not a strip across the top of it. Surface ground, a
  /// hairline all round, the one radius, the bar shadow, and 8 of padding. The web pins it 16 below
  /// the top and centres it; on a phone the 16 is measured from the safe area instead.
  ///
  /// What it carries is .kb-bar__brand: the instance, at 16 and semibold. Not the page title. The
  /// web keeps one bar across every page and lets each page say what it is in its own Head.
  public struct Bar<Action: View>: View {
    @Environment(\.kasane) private var k
    let title: String
    var back: (() -> Void)?
    private let action: Action

    public init(
      _ title: String = "Kurobeni", back: (() -> Void)? = nil, @ViewBuilder action: () -> Action
    ) {
      self.title = title
      self.back = back
      self.action = action()
    }

    public var body: some View {
      HStack(spacing: Kasane.Space.s8) {
        if let back {
          Button(action: back) {
            Chevron()
              .frame(width: Kasane.Control.md, height: Kasane.Control.md)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
          .accessibilityLabel("Back")
        }
        Text(title)
          .font(.kasane(.body, face: Face.semibold))
          .foregroundStyle(k.fg)
          .lineLimit(1)
          .padding(.leading, back == nil ? Kasane.Space.s16 : 0)
          .frame(maxWidth: .infinity, alignment: .leading)
        action
      }
      .padding(Kasane.Space.s8)
      .background(k.surface)
      .clipShape(RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous)
          .strokeBorder(k.hairline, lineWidth: 0.5)
      )
      .shadow(
        color: k.shadow(Kasane.Shadows.bar),
        radius: Kasane.Shadows.bar.blur / 2,
        x: Kasane.Shadows.bar.x,
        y: Kasane.Shadows.bar.y
      )
      .padding(.horizontal, Kasane.Space.s16)
    }
  }

  public extension Bar where Action == EmptyView {
    init(_ title: String = "Kurobeni", back: (() -> Void)? = nil) {
      self.init(title, back: back) { EmptyView() }
    }
  }
#endif
