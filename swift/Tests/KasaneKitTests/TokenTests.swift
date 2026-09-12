import Testing
@testable import KasaneKit

// The tokens are generated, so these check the rules the generator is meant to hold to.

@Test func controlsClearTheMobileFloor() {
  // the same three heights as the web. Density never reaches a control, and 32 already clears the
  // WCAG 2.5.8 floor of 24.
  #expect([Kasane.Control.sm, Kasane.Control.md, Kasane.Control.lg] == [32, 40, 48])
  #expect(Kasane.Control.sm >= 24)
}

@Test func oneRadius() {
  #expect(Kasane.radius == 24)
}

@Test func bothThemesCarryTheSameNames() {
  #expect(Kasane.light.keys.sorted() == Kasane.dark.keys.sorted())
  #expect(!Kasane.light.isEmpty)
}

@Test func aScrimLetsWhatIsUnderItThrough() {
  // these three are rgba in the tokens, which is the point of them
  for name in ["bg.dim", "bg.dimPressed", "bg.scrim"] {
    let c = Kasane.colour(name)
    #expect(c != nil, "\(name) did not parse")
    #expect(c!.alpha < 1, "\(name) should be translucent")
  }
}

@Test func everyColourParses() {
  for (name, hex) in Kasane.light {
    #expect(Colour(token: hex) != nil, "light \(name) is not a colour: \(hex)")
  }
  for (name, hex) in Kasane.dark {
    #expect(Colour(token: hex) != nil, "dark \(name) is not a colour: \(hex)")
  }
}

@Test func bodyTextReadsOnItsGround() {
  // The pair the whole system rests on, in both themes.
  for dark in [false, true] {
    let fg = Kasane.colour("fg.default", dark: dark)
    let bg = Kasane.colour("bg.page", dark: dark)
    #expect(fg != nil && bg != nil)
    let ratio = fg!.contrast(against: bg!)
    #expect(ratio >= 4.5, "body text on the page is \(ratio) in \(dark ? "dark" : "light")")
  }
}

@Test func theTypeLadderClimbs() {
  let steps = [Kasane.TypeScale.t12, Kasane.TypeScale.t14, Kasane.TypeScale.t16, Kasane.TypeScale.t18]
  for (a, b) in zip(steps, steps.dropFirst()) {
    #expect(b.size > a.size)
  }
}
