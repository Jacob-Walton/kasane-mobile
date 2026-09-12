#if canImport(SwiftUI)
  import ImageIO
  import KasaneKit
  import SwiftUI
  import UniformTypeIdentifiers
  import XCTest

  @testable import KasaneUI

  // SwiftUI cannot be built on Windows, so this is the round trip: a mac runner draws every screen
  // and every state, writes the pictures to SNAPSHOT_DIR and hands them back as an artifact. A test
  // that asserts nothing but produces a picture is still the only way to see this from here.
  //
  // There is no reference image to compare against. A snapshot that fails is one that would not
  // render at all; the rest is read by eye.

  @MainActor
  final class SnapshotTests: XCTestCase {
    /// Where CI collects the pictures from. Set it in the workflow; off CI they land in the
    /// package's temporary directory and the test still proves every screen renders.
    private var out: URL {
      let named = ProcessInfo.processInfo.environment["SNAPSHOT_DIR"]
      let url = named.map { URL(fileURLWithPath: $0) } ?? FileManager.default.temporaryDirectory
      try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
      return url
    }

    private func shoot(
      _ name: String, width: CGFloat = 390, dark: Bool = false,
      type: DynamicTypeSize = .large, @ViewBuilder _ view: () -> some View
    ) throws {
      let renderer = ImageRenderer(
        content: view()
          .environment(\.colorScheme, dark ? .dark : .light)
          .environment(\.dynamicTypeSize, type)
          .frame(width: width)
      )
      renderer.scale = 2

      let image = try XCTUnwrap(renderer.cgImage, "\(name) rendered nothing")
      XCTAssertGreaterThan(image.width, 0)
      XCTAssertGreaterThan(image.height, 0)

      let file = out.appendingPathComponent("\(name).png")
      let sink = try XCTUnwrap(
        CGImageDestinationCreateWithURL(file as CFURL, UTType.png.identifier as CFString, 1, nil),
        "could not write \(file.path)"
      )
      CGImageDestinationAddImage(sink, image, nil)
      XCTAssertTrue(CGImageDestinationFinalize(sink), "could not finalise \(file.path)")
      print("snapshot \(file.path) \(image.width)x\(image.height)")
    }

    func testRepos() throws {
      try shoot("repos-light") { Repos() }
      try shoot("repos-dark", dark: true) { Repos() }
    }

    func testIssue() throws {
      try shoot("issue-light") { Issue() }
      try shoot("issue-dark", dark: true) { Issue() }
    }

    /// The reader's text scale is the one setting that breaks a phone layout, so it gets a picture
    /// at both ends of the range.
    func testTextScale() throws {
      try shoot("issue-small", type: .xSmall) { Issue() }
      try shoot("issue-huge", type: .accessibility3) { Issue() }
      try shoot("repos-huge", type: .accessibility3) { Repos() }
    }

    /// The kit on its own, so a part that breaks is visible without reading a screen for it.
    func testParts() throws {
      try shoot("parts-light") { Sheet() }
      try shoot("parts-dark", dark: true) { Sheet() }
    }
  }

  /// Every part at once, on the page ground.
  private struct Sheet: View {
    @State private var tray = "open"

    var body: some View {
      Kasaned {
        VStack(alignment: .leading, spacing: Kasane.Space.s16) {
          KText("Title, thirty two", step: .title)
          KText("Heading, twenty", step: .heading)
          KText("Body, sixteen, the size a screen is read at.")
          KText("Small, fourteen", step: .small, muted: true)
          KText("Caps, twelve", step: .caps, muted: true)

          HStack(spacing: Kasane.Space.s8) {
            Pill("Neutral")
            Pill("Open", kind: .ok)
            Pill("Warn", kind: .warn)
          }

          Tray(
            value: $tray,
            options: [.init(value: "open", label: "Open"), .init(value: "closed", label: "Closed")]
          )

          HStack(spacing: Kasane.Space.s8) {
            KButton("Primary", primary: true)
            KButton("Secondary")
          }

          HStack(spacing: Kasane.Space.s16) {
            Chevron()
            Chevron(facing: .trailing)
            Spinner()
            Spinner(step: .body)
          }
          .frame(height: Kasane.Control.md)

          Panel {
            VStack(spacing: 0) {
              Row(title: "One row", note: "with a note", meta: "2")
              Row(title: "Another row", last: true)
            }
          }
        }
        .padding(Kasane.Space.s16)
      }
    }
  }
#endif
