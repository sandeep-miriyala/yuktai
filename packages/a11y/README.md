# @yuktishaalaa/a11y

> Web accessibility for any page, in the browser. Safe ARIA, WCAG AA/AAA contrast, `lang` for every part found automatically, read aloud in the right voice, and the visitor's own preferences. One attribute. No server, no key, nothing sent anywhere.

Part of **YuktAI 6.0** by Sandeep Miriyala.

## No code: one attribute + one script

```html
<body data-yuktai-a11y="auto" data-yuktai-level="AA">
  ...
  <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/a11y@6/dist/a11y.global.js" defer></script>
</body>
```

| Attribute | Values | Default |
|---|---|---|
| `data-yuktai-a11y` | `auto` (safe fixes + report) · `check` (report only) · `off` | `auto` |
| `data-yuktai-level` | `AA` · `AAA` · `off` | `AA` |
| `data-yuktai-contrast` | `check` · `fix` | `check` |
| `data-yuktai-lang` | `auto` · `off` | `auto` |
| `data-yuktai-speak` | `on` · `off` (🔊 button after h1–h3) | `off` |

Any element can opt out with `data-yuktai-a11y="off"` (and `data-yuktai-speak="off"` for reading).
There is no `lang` setting: the page language is found from the text.

## npm

```ts
import { createA11y } from "@yuktishaalaa/a11y"

const a11y = createA11y({ level: "AA", contrast: "check" })
const report = a11y.run()          // { fixed, check, unknown }
a11y.setPrefs({ textSize: 130, dark: "device" })
a11y.destroy()                     // removes every change
```

In Next.js, call it in a client component after mount (`useEffect`), never during render.

## Do no harm

- **Native elements are checked, never relabelled.** No made-up "Button", "Image" or "Interactive element" labels, no `alt=""` on pictures that may matter, no `role="grid"` on tables. A wrong label is worse than none.
- **Your `lang` and ARIA are never changed.** Only missing `lang` is added.
- **The only structural fix:** an element with an inline `onclick` that is not a control, and that has a name, gets `role="button"`, `tabindex="0"` and Enter/Space.
- **"Not checked" is never "pass".** Text over an image, closed web components and iframes from other sites are listed as *unknown*.
- **Everything can be undone** (`undo()` / `destroy()`): every change carries a `data-yuktai-*` mark.
- **Typing areas, passwords and code are never read.**

## Language, automatically

The script of the text tells the language in every browser (Telugu, Tamil, Kannada, Malayalam, Gujarati, Punjabi, Odia, Bengali, Devanagari, Arabic, Latin and more). Scripts several languages share (Devanagari: Hindi or Marathi?) can be refined with Chrome's on-device `LanguageDetector` (`refineWithDetector`). Missing `<html lang>` is added (WCAG 3.1.1), and parts in another language get their own `lang` (3.1.2), with `dir="rtl"` for Urdu and Arabic. Screen readers then switch voice correctly too.

## Read aloud

`speak(element)` uses the browser's own Web Speech. Text is cut where the language changes and each part is read with a voice for its language (`te-IN`, `en-IN`…). A part whose language has no voice on the device is skipped and reported (`onMissingVoice`), never read with a wrong voice. Long text is read sentence by sentence. Reading starts only on a click.

## Report

| Group | Meaning |
|---|---|
| `fixed` | Changed safely by YuktAI (and undoable) |
| `check` | A person should look; the message says how |
| `unknown` | Could not be checked; never counted as a pass |

Each finding has the WCAG 2.2 criterion (`1.4.3`, `3.1.2`…), a short path, and messages in English and Telugu (`message(finding, "te")`).

## Visitor preferences

`setPrefs({ textSize, spacing, reduceMotion, focusRing, theme, custom, dark })`: one `<style>` element, removed by `destroy()`. `theme: "custom"` darkens or lightens the chosen text colour until it passes the level.

## Browsers

All modern browsers on desktop and phones (Chrome, Edge, Firefox, Safari, Samsung Internet). Read aloud depends on the voices the device has; `LanguageDetector` is Chrome only (others keep the script guess).

## License

GPL-3.0-only. © Sandeep Miriyala — Yuktishaalaa AI Lab.
