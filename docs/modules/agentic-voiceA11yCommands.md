# Voice accessibility commands

**Source:** `src/agentic/voiceA11yCommands.ts`  
**Package after the split:** `@yuktishaalaa/a11y`

Turns spoken (or typed) commands like "bigger text" or "high contrast" into accessibility settings, and moves through grid rows by voice.

## Exports

| Export | What it does |
| --- | --- |
| `parseVoiceA11yCommand(transcript, current?)` | Text to a command, or null when nothing matched. |
| `createVoiceA11yController(options)` | Speech recognition controller: `start`, `stop`, `handle`, `isListening`, `getConfig`. |
| `moveGridRowFocus(action, options?)` | Next, previous, first, last or open row. |
| `DEFAULT_A11Y_SETTINGS, FONT_STEP, FONT_MIN, FONT_MAX` | Defaults and text-size limits (0.8 to 1.3). |

## How it works

Pattern matching on the transcript, then applies the settings through the WCAG plugin. Speaks a confirmation by default. Language set by `lang` (`en-IN` or `te-IN`).

## Notes and findings

- These are the deterministic shortcuts the Ask page agent should check before calling a model: fast and reliable.
- Check which Telugu phrases are matched when `lang` is `te-IN`.

## Checklist

- [ ] Source file matches the exports listed above
- [ ] Privacy: no user-typed values, passwords or form data reach a model, log or network request
- [ ] Runs on the device: no network calls except model downloads
- [ ] Accessibility: results announced (`aria-live`), keyboard reachable, works with a screen reader
- [ ] Telugu: tested with a Telugu page and a Telugu question
- [ ] Fallback: works (or fails clearly) when the AI engine is missing
- [ ] Unit tests (Vitest) and one browser test (Playwright + axe)
- [ ] Docs page on YuktaiDocs with a live example
- [ ] Telugu command phrases listed in the docs and tested
