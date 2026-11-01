# Page translation

**Source:** `src/core/ai/translator.ts`  
**Package after the split:** `@yuktishaalaa/a11y`

Translates the page in place with Chrome's built-in Translator API, and can restore the original.

## Exports

| Export | What it does |
| --- | --- |
| `SUPPORTED_LANGUAGES` | List of `{ code, label }`. |
| `checkTranslatorSupport(lang)` | Whether a language pair is available. |
| `translatePage(lang)` | Translates visible text; returns how many nodes changed. |
| `restoreOriginalText()` | Puts the original text back. |
| `getCurrentLanguage()` | The language currently shown. |

## How it works

Walks the page's text nodes, translates them on the device and keeps the originals for restore.

## Notes and findings

- Check that Telugu (`te`) is in `SUPPORTED_LANGUAGES`.
- Update the `lang` attribute when translating so screen readers use the right voice.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] `lang` attribute updated on translate and restore
