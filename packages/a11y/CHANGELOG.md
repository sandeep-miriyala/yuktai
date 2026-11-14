# Changelog

## 6.0.2 (2026-11-14)

**Smart dark mode.** Dark mode no longer turns the whole page upside down with `filter: invert(1)`.

- Every colour is changed on its own: backgrounds darker, text and icons lighter, the hue kept (a blue button stays blue, a red brand stays red).
- **Text keeps WCAG contrast in dark mode**: each text colour is checked against its new background and moved until it passes the visitor's level (AA 4.5:1, AAA 7:1).
- Photos, videos, emoji, canvases, maps and other iframes keep their real colours (slightly dimmed). The image inside a `<picture>` is no longer inverted three times.
- Text on a background picture keeps its own colour; gradients become their first colour, made dark.
- New content (single-page apps, "load more") is darkened as it arrives.
- Native inputs, selects and scrollbars turn dark (`color-scheme: dark`).
- "Device" follows the operating system live when it switches between light and dark.
- Fast: about 12 ms for a page of 4,000 elements. Off puts the page back exactly as it was.
- New exports: `enableDark()`, `disableDark()`, `isDarkOn()`, `wantsDark()`, `darkBackground()`, `lightText()`.

## 6.0.1 (2026-11-14)

Fixes from an audit of real sites (Telugu, Hindi, Tamil, Urdu, single-page apps, dark sites).

- **Read aloud skips emoji and symbols.** `cleanForSpeech()` drops emoji, flags, icon-font characters, arrows, stars and check marks, and turns `| • · → »` into a pause. Dates with `/` and `₹` are kept.
- **Read aloud reads what is on screen.** Hidden menus, closed `<details>`, `aria-hidden`, `inert` and `<template>` content are skipped; each paragraph and list item ends its own sentence (no more run-on text).
- **`readTarget()`**: reads `<main>` when it has real text, else the biggest `<article>`, else the page without navigation, footer and sidebars (`skipChrome`). An ad `<article>` before `<main>` is no longer read.
- **Short English words inside Telugu/Hindi sentences** ("Login", "PDF") keep the sentence's language, so the voice doesn't switch for one word.
- **Text size works on every site**: uses `zoom` on the page's content instead of `font-size`, so sites with `px` sizes grow too.
- **Dark mode is not applied to pages that are already dark** (`pageIsDark()`), so they are no longer turned light.
- **New checks**: `control-name-symbols` (a button or link named only by symbols or emoji, like "❌" or "→", WCAG 2.4.6) and `skip-link-broken` (a "Skip to main content" link whose target doesn't exist, WCAG 2.4.1).
- **Single-page apps**: the language is found again when the page changes; open shadow roots get `lang` too; changes are re-checked within 2 seconds even on pages that never stop changing.

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
