#if canImport(SwiftUI)
  import KasaneKit
  import SwiftUI

  // The two screens the Expo app has, in SwiftUI, on fixed content. Fixed because these are what CI
  // renders: a picture of a screen that fetched nothing is the only picture that is the same twice.

  public struct Repos: View {
    public struct Item: Identifiable, Sendable {
      public let id: Int
      public let name: String
      public let note: String?
      public let meta: String?

      public init(id: Int, name: String, note: String? = nil, meta: String? = nil) {
        self.id = id
        self.name = name
        self.note = note
        self.meta = meta
      }
    }

    let items: [Item]

    public init(items: [Item] = Repos.sample) {
      self.items = items
    }

    public static let sample: [Item] = [
      .init(id: 1, name: "jacob/kurobeni", note: "Kasane, the design system", meta: "4 open"),
      .init(id: 2, name: "jacob/gitea", note: "Go", meta: "1 open"),
      .init(id: 3, name: "jacob/prototype_2", note: "TypeScript"),
      .init(id: 4, name: "jacob/testing", note: "somewhere to put fixtures"),
    ]

    public var body: some View {
      Kasaned {
        VStack(spacing: 0) {
          Bar("Repositories") { Spinner(step: .body) }
          ScrollView {
            VStack(alignment: .leading, spacing: Kasane.Space.s8) {
              KText("\(items.count) public repositories", step: .small, muted: true)
              Panel {
                VStack(spacing: 0) {
                  ForEach(Array(items.enumerated()), id: \.element.id) { at, item in
                    Row(
                      title: item.name, note: item.note, meta: item.meta,
                      last: at == items.count - 1
                    )
                  }
                }
              }
            }
            .padding(Kasane.Space.s16)
          }
        }
      }
    }
  }

  public struct Issue: View {
    @State private var state = "open"

    public init() {}

    public var body: some View {
      Kasaned {
        VStack(spacing: 0) {
          Bar("#4", back: {}) { Spinner(step: .body) }
          ScrollView {
            VStack(alignment: .leading, spacing: Kasane.Space.s16) {
              VStack(alignment: .leading, spacing: Kasane.Space.s8) {
                KText("Parse rgba tokens in Colour", step: .title)
                HStack(spacing: Kasane.Space.s8) {
                  Pill("Open", kind: .ok)
                  Pill("Pull request")
                  KText("jacob opened this 2 days ago", step: .small, muted: true)
                }
              }

              Tray(
                value: $state,
                options: [.init(value: "open", label: "Open"), .init(value: "closed", label: "Closed")]
              )

              Panel {
                VStack(alignment: .leading, spacing: Kasane.Space.s8) {
                  KText(
                    "Three of the colour tokens are translucent, so the hex path returns nil and the "
                      + "dim and the scrim both come out pink."
                  )
                  KText("Colour(token:) takes rgb() and rgba() as well now.", step: .small, muted: true)
                }
                .padding(Kasane.Space.s16)
                .frame(maxWidth: .infinity, alignment: .leading)
              }

              HStack(spacing: Kasane.Space.s8) {
                KButton("Comment", primary: true)
                KButton("Close")
              }
              KText("Reading only: signing in is not built yet.", step: .small, muted: true)
            }
            .padding(Kasane.Space.s16)
          }
        }
      }
    }
  }
#endif
