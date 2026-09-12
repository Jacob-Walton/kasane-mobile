// swift-tools-version:6.0
import PackageDescription

// KasaneKit is the part that builds anywhere, Windows included: tokens, models, and the logic a
// view would read. SwiftUI is not here, because it does not exist off Apple platforms.
let package = Package(
  name: "KasaneKit",
  products: [.library(name: "KasaneKit", targets: ["KasaneKit"])],
  targets: [
    .target(name: "KasaneKit"),
    .testTarget(name: "KasaneKitTests", dependencies: ["KasaneKit"]),
  ]
)
