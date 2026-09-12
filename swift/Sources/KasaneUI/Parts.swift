#if canImport(SwiftUI)
  import KasaneKit
  import SwiftUI

  // The same kit as the Expo app, in SwiftUI: text, a chevron, a panel, a row, a tray, a pill, a
  // button, a bar and a spinner. Nothing here is a stock control, for the same reason nothing there
  // is: a system control brings the system's look, and the look is the thing being built.

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

  /// A tray: one named group of choices, the chosen one filled, so where you are is not carried by
  /// colour alone.
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
              .foregroundStyle(on ? k.onFill : k.fgSecondary)
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

  public struct Pill: View {
    @Environment(\.kasane) private var k
    let label: String
    var kind: Kind = .neutral

    public init(_ label: String, kind: Kind = .neutral) {
      self.label = label
      self.kind = kind
    }

    public enum Kind: Sendable { case neutral, ok, warn }

    public var body: some View {
      let ground = kind == .ok ? k.ok : kind == .warn ? k.warn : k.control
      return Text(label)
        .font(.kasane(.caps, face: Face.medium))
        .foregroundStyle(ground)
        .padding(.horizontal, Kasane.Space.s12)
        .padding(.vertical, Kasane.Space.s4)
        .overlay(
          RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous)
            .strokeBorder(ground, lineWidth: 0.5)
        )
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
          .padding(.horizontal, Kasane.Space.s24)
          .frame(height: Kasane.Control.md)
          .background(primary ? k.fill : k.surface)
          .clipShape(RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: Kasane.radius, style: .continuous)
              .strokeBorder(primary ? Color.clear : k.control, lineWidth: 0.5)
          )
      }
      .buttonStyle(.plain)
    }
  }

  /// A ring with a gap in it. Two arcs and two heads would be a drawing; this reads as refresh and
  /// needs no asset.
  public struct Arrows: View {
    @Environment(\.kasane) private var k
    var step: Step = .body

    public init(step: Step = .body) { self.step = step }

    public var body: some View {
      let edge = step.token.size + 2
      return Circle()
        .trim(from: 0, to: 0.75)
        .stroke(k.fg, style: StrokeStyle(lineWidth: max(2, edge / 8), lineCap: .butt))
        .frame(width: edge, height: edge)
        .rotationEffect(.degrees(45))
        .accessibilityHidden(true)
    }
  }

  /// A refresh the bar can hold, since pull to refresh is the platform's control and its spinner.
  public struct Refresh: View {
    @Environment(\.kasane) private var k
    let busy: Bool
    var action: () -> Void = {}

    public init(busy: Bool = false, action: @escaping () -> Void = {}) {
      self.busy = busy
      self.action = action
    }

    public var body: some View {
      Button(action: action) {
        Group {
          if busy { Spinner(step: .body) } else { Arrows() }
        }
        .frame(width: Kasane.Control.md, height: Kasane.Control.md)
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .disabled(busy)
      .accessibilityLabel("Refresh")
    }
  }

  /// A ring with one lit edge, turning. ProgressView is the platform's and brings its look with it.
  public struct Spinner: View {
    @Environment(\.kasane) private var k
    @State private var turning = false
    var step: Step = .heading

    public init(step: Step = .heading) { self.step = step }

    public var body: some View {
      let edge = step.token.size
      return Circle()
        .trim(from: 0, to: 0.25)
        .stroke(k.fgSecondary, style: StrokeStyle(lineWidth: max(2, edge / 8), lineCap: .round))
        .frame(width: edge, height: edge)
        .rotationEffect(.degrees(turning ? 360 : 0))
        .animation(.linear(duration: 0.9).repeatForever(autoreverses: false), value: turning)
        .onAppear { turning = true }
        .accessibilityLabel("Loading")
    }
  }

  /// The bar. A navigation title brings its own type, its own chevron and its own ground, none of
  /// which are ours.
  public struct Bar<Action: View>: View {
    @Environment(\.kasane) private var k
    let title: String
    var back: (() -> Void)?
    private let action: Action

    public init(_ title: String, back: (() -> Void)? = nil, @ViewBuilder action: () -> Action) {
      self.title = title
      self.back = back
      self.action = action()
    }

    public var body: some View {
      HStack(spacing: Kasane.Space.s4) {
        if let back {
          Button(action: back) {
            Chevron()
              .frame(width: Kasane.Control.md, height: Kasane.Control.md)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
          .accessibilityLabel("Back")
        } else {
          Spacer().frame(width: Kasane.Space.s8)
        }
        KText(title, step: .heading).lineLimit(1)
          .frame(maxWidth: .infinity, alignment: .leading)
        action
      }
      .padding(Kasane.Space.s8)
      .background(k.page)
      .overlay(alignment: .bottom) { Rectangle().fill(k.hairline).frame(height: 0.5) }
    }
  }

  public extension Bar where Action == EmptyView {
    init(_ title: String, back: (() -> Void)? = nil) {
      self.init(title, back: back) { EmptyView() }
    }
  }
#endif
