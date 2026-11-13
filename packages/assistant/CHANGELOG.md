# Changelog

## 6.0.0

First release, as part of YuktAI 6.0.

- `<yuktai-assistant>` panel: Accessibility, Colours and Ask tabs; English, Telugu and Hindi; keyboard and screen reader friendly (axe: 0 violations).
- npm: `mountAssistant()`, and `<YuktaiAssistant />` from `@yuktishaalaa/assistant/next` for Next.js and React.
- Script: `assistant.global.js` with `window.YuktaiAssistantConfig`.
- Browser extension for Chrome, Edge and Brave: popup, Alt+Shift+Y, Alt+Shift+A for Ask, "Always on for this site" (per-site permission). Works on pages with a strict Content Security Policy. Replaces the "Ask this page" extension.
- Visitor choices saved on the device only.
