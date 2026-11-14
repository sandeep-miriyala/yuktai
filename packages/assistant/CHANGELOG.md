# Changelog

## 6.0.2 (2026-11-14)

- **Smart dark mode** from `@yuktishaalaa/a11y` 6.0.2: real dark colours instead of inverting the page; photos, emoji and brand colours stay right; text keeps AA/AAA contrast.
- Ask page 1.0.2: a clear message when the question and the page are in different languages.

## 6.0.1 (2026-11-14)

### Fixed
- **Your brand**: new `title` (e.g. your site's name) and `color` options. The text on the colour is picked for contrast.
- **Text size slider can be dragged**: it no longer jumps out of the hand while moving; the size applies live and is saved when you let go.
- **Messages stay**: screen reader messages are no longer wiped by the next redraw, and "no voice for this language" is shown in the panel with how to add the voice in Windows.
- **Tabs work without Ask**: arrow keys move only between the tabs that exist.
- **One Ask button** (the extra one in the footer is gone).
- **Windows High Contrast**: selected level, theme and dark-mode buttons show a ✓ and an outline; the ♿ button has a border.
- **Panel language**: the panel's `lang` matches its words (screen readers use the right voice), and visitors can pick English, తెలుగు or हिन्दी. The language chip says whether the site set the language or YuktAI found it.
- **The panel follows your colours**: dark when dark mode is on, black and yellow with High contrast. Dark mode shows why it is off with a theme other than Default, or on a page that is already dark.
- **Read aloud** uses `readTarget()` (main content, not an ad or the menu), and stops when a single-page app moves to another page.

### New
- **"Go to main content"** button in the panel.
- **Alt+Shift+Y** opens and closes the panel on websites (turn off with `shortcut: false`; the extension keeps its own Alt+Shift+Y).
- The ♿ button gets focus back when Ask closes.

## 6.0.0

First release, as part of YuktAI 6.0.

- `<yuktai-assistant>` panel: Accessibility, Colours and Ask tabs; English, Telugu and Hindi; keyboard and screen reader friendly (axe: 0 violations).
- npm: `mountAssistant()`, and `<YuktaiAssistant />` from `@yuktishaalaa/assistant/next` for Next.js and React.
- Script: `assistant.global.js` with `window.YuktaiAssistantConfig`.
- Browser extension for Chrome, Edge and Brave: popup, Alt+Shift+Y, Alt+Shift+A for Ask, "Always on for this site" (per-site permission). Works on pages with a strict Content Security Policy. Replaces the "Ask this page" extension.
- Visitor choices saved on the device only.
