# Changelog

## 5.5.3
- Clickable grid rows and phone cards (`onRowClick`) open with Tab, then Enter or Space.
- The selection column has a heading screen readers announce ("Select").
- The loading screen closes with Skip or Esc only.
- Unused code removed. Lint: 68 warnings → 48, 0 errors.

## 5.5.2
- Stable Rust only: `rust-toolchain.toml` pins the stable channel; the nightly build path is gone.
- Oxlint and Biome for lint and format. GitHub Actions check on every push.

## 5.5.1
- Longer loading screens: with `minMs` of 4,000 or more the bar fills over that time and Skip counts down.
- `tips` shows short lines one after another (`tipMs`, default 3 s).

## 5.5.0
- `<YuktaiSplash>` loading screen with "Welcome" in 7 languages.
- `<YuktaiPreferences>`: site language and animations (Device, Off, Calm, Lively).
- `<Reveal>` fades sections in on scroll.

## 5.4.1
- Floating buttons read `--yk-fab-*` CSS variables.

## 5.4.0
- Show all: every row in one scrolling list (virtual scrolling), even 10 lakh rows.

## 5.3.16
- First and Last buttons, page numbers and "Go to page".

## 5.3.14
- Grid colours as `--yk-grid-*` CSS variables, stable class names.

## 5.3.13
- Text and date columns sort in Rust: 10 lakh rows in 0.2 to 0.8 s.
