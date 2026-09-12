import Foundation

// A colour as the tokens carry it. Most are hex; the scrims are rgba, because a scrim is meant to
// let what is under it through.
public struct Colour: Equatable, Sendable {
  public let red: Double
  public let green: Double
  public let blue: Double
  public let alpha: Double

  public init(red: Double, green: Double, blue: Double, alpha: Double = 1) {
    self.red = red
    self.green = green
    self.blue = blue
    self.alpha = alpha
  }

  /// Parses either form the tokens use: #rgb, #rrggbb, or rgba(r, g, b, a).
  public init?(token: String) {
    let text = token.trimmingCharacters(in: .whitespaces)
    if text.hasPrefix("#") {
      var body = text
      body.removeFirst()
      if body.count == 3 { body = body.map { "\($0)\($0)" }.joined() }
      guard body.count == 6, let n = UInt32(body, radix: 16) else { return nil }
      self.init(
        red: Double((n >> 16) & 0xff) / 255,
        green: Double((n >> 8) & 0xff) / 255,
        blue: Double(n & 0xff) / 255
      )
      return
    }
    guard text.hasPrefix("rgba(") || text.hasPrefix("rgb(") else { return nil }
    let inside = text.drop(while: { $0 != "(" }).dropFirst().prefix(while: { $0 != ")" })
    let parts = inside.split(separator: ",").map {
      Double($0.trimmingCharacters(in: .whitespaces)) ?? -1
    }
    guard parts.count == 3 || parts.count == 4, !parts.contains(-1) else { return nil }
    self.init(
      red: parts[0] / 255,
      green: parts[1] / 255,
      blue: parts[2] / 255,
      alpha: parts.count == 4 ? parts[3] : 1
    )
  }

  /// WCAG relative luminance. Only meaningful for an opaque colour.
  public var luminance: Double {
    func channel(_ c: Double) -> Double {
      c <= 0.03928 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  }

  public func contrast(against other: Colour) -> Double {
    let a = luminance, b = other.luminance
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)
  }
}

public extension Kasane {
  static func colour(_ name: String, dark: Bool = false) -> Colour? {
    guard let raw = (dark ? Kasane.dark : Kasane.light)[name] else { return nil }
    return Colour(token: raw)
  }
}
