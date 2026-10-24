import { describe, expect, it, vi } from "vitest"
import { ICON_NAMES, ICON_PATHS } from "../paths"
import { ICON_MIN_CONTRAST, iconContrast, iconSvg, pickGlyphColor, resolveIconColours } from "../variant"

describe("icon variants (WCAG)", () => {
  it("has 41 icons, every one with SVG shapes", () => {
    expect(ICON_NAMES.length).toBe(41)
    ICON_NAMES.forEach((n) => expect(ICON_PATHS[n]).toMatch(/^<(path|circle|rect)/))
  })

  it("outline uses currentColor and is decorative without a label (1.1.1)", () => {
    const svg = iconSvg("mic")
    expect(svg).toContain('aria-hidden="true"')
    expect(svg).toContain('stroke="currentColor"')
    expect(svg).toContain('data-variant="outline"')
  })

  it("a label gives role=img and an accessible name (1.1.1)", () => {
    const svg = iconSvg("mic", { label: 'Voice "input"' })
    expect(svg).toContain('role="img"')
    expect(svg).toContain('aria-label="Voice &quot;input&quot;"')
    expect(svg).not.toContain("aria-hidden")
  })

  it("filled picks a glyph colour with at least 3:1 contrast (1.4.11)", () => {
    for (const bg of ["#005a9c", "#0f766e", "#1e3a8a", "#b91c1c", "#fde047", "#e5e7eb", "#000000", "#ffffff"]) {
      const glyph = pickGlyphColor(bg)
      expect(iconContrast(glyph, bg)!).toBeGreaterThanOrEqual(ICON_MIN_CONTRAST)
    }
    expect(pickGlyphColor("#fde047")).toBe("#111827") // yellow → dark glyph
    expect(pickGlyphColor("#005a9c")).toBe("#ffffff") // blue → white glyph
  })

  it("warns when a custom glyph colour fails 3:1", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const r = resolveIconColours({ variant: "filled", color: "#bbbbbb", glyphColor: "#ffffff" })
    expect(r.contrast!).toBeLessThan(3)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it("filled supports forced colours (Windows High Contrast)", () => {
    const svg = iconSvg("wand", { variant: "filled", color: "#005a9c", shape: "circle" })
    expect(svg).toContain("forced-colors: active")
    expect(svg).toContain("<circle")
    expect(svg).toContain('data-variant="filled"')
  })
})
