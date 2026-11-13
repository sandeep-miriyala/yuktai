# Changelog

## 6.0.0

First release, as part of YuktAI 6.0.

- One-attribute setup: `data-yuktai-a11y`, `data-yuktai-level`, `data-yuktai-contrast`, `data-yuktai-lang`, `data-yuktai-speak`; `a11y.global.js` starts by itself.
- "Do no harm" ARIA: native elements are checked, never relabelled; only inline-`onclick` elements with a name become buttons.
- Contrast for AA and AAA with large-text rules; `fix` picks the nearest passing colour; text over images is *unknown*, never *pass*.
- Automatic `lang` for the page and its parts from the text's script; `dir="rtl"` for right-to-left parts; optional Chrome `LanguageDetector`.
- Read aloud with Web Speech, each part in its own voice; missing voices are reported, not faked.
- Visitor preferences: text size, spacing (WCAG 1.4.12), reduced motion, focus ring, themes (high contrast, soft, custom), dark mode.
- Report in three groups (fixed, check, unknown) with WCAG numbers and English/Telugu messages; open shadow roots are scanned, closed ones and cross-site iframes listed as unknown.
- `undo()` / `destroy()` remove every change.
