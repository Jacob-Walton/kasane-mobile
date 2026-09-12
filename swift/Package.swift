// swift-tools-version:6.0
import PackageDescription

// KasaneKit is the part that builds anywhere, Windows included: tokens, models, and the logic a
// view would read. KasaneUI is the SwiftUI layer, which compiles to nothing off Apple platforms,
// so the Windows loop keeps working and CI on a mac is what actually draws it.
let package = Package(
  name: "KasaneKit",
  platforms: [.iOS(.v17), .macOS(.v14)],
  products: [
    .library(name: "KasaneKit", targets: ["KasaneKit"]),
    .library(name: "KasaneUI", targets: ["KasaneUI"]),
  ],
  targets: [
    .target(name: "KasaneKit"),
    .target(
      name: "KasaneUI",
      dependencies: ["KasaneKit"],
      // a SwiftPM library has no Info.plist, so the faces are registered at runtime from here
      resources: [.process("Fonts")]
    ),
    .testTarget(name: "KasaneKitTests", dependencies: ["KasaneKit"]),
    .testTarget(name: "KasaneUITests", dependencies: ["KasaneUI"]),
  ]
)
