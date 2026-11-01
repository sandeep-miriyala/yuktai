// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/ui/styles.ts
// Panel styles, inside the Shadow DOM so the site's CSS never mixes in.
// Contrast checked for WCAG 2.2 AA in both themes; 44px targets; 17px text
// (18px for Telugu), scaled by A−/A+; forced-colors and reduced motion.
// ─────────────────────────────────────────────────────────────────────────────

export const STYLES = `
:host {
  --ask-w: 420px;
  --bg: #0b1120; --surface: #131d33; --sunk: #0e1628; --line: #24314d; --line-strong: #3b4b6b;
  --fg: #e5e7eb; --muted: #a1a9b8; --accent: #7dd3fc; --accent-ink: #0b1120;
  --icon: #c7d2fe; --focus: #fbbf24; --user: #1e3a5f;
  --ok-bg: #0f2a1e; --ok: #bbf7d0; --danger-bg: #2a1215; --danger-line: #7f1d1d; --danger: #fecaca;
  --warn-bg: #2a2110; --warn: #fde68a; --link: #fbbf24;
  --scale: 1; --base: 17px;
  all: initial;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Telugu", sans-serif;
  color-scheme: dark;
}
:host([theme="light"]) {
  --bg: #ffffff; --surface: #f4f6fa; --sunk: #eef2f7; --line: #d3dbe7; --line-strong: #94a3b8;
  --fg: #0f172a; --muted: #475569; --accent: #0369a1; --accent-ink: #ffffff;
  --icon: #3730a3; --focus: #b45309; --user: #e0f2fe;
  --ok-bg: #ecfdf3; --ok: #166534; --danger-bg: #fef2f2; --danger-line: #fca5a5; --danger: #991b1b;
  --warn-bg: #fffbeb; --warn: #92400e; --link: #9a3412;
  color-scheme: light;
}
@media (prefers-color-scheme: light) {
  :host(:not([theme="dark"])) {
    --bg: #ffffff; --surface: #f4f6fa; --sunk: #eef2f7; --line: #d3dbe7; --line-strong: #94a3b8;
    --fg: #0f172a; --muted: #475569; --accent: #0369a1; --accent-ink: #ffffff;
    --icon: #3730a3; --focus: #b45309; --user: #e0f2fe;
    --ok-bg: #ecfdf3; --ok: #166534; --danger-bg: #fef2f2; --danger-line: #fca5a5; --danger: #991b1b;
    --warn-bg: #fffbeb; --warn: #92400e; --link: #9a3412;
    color-scheme: light;
  }
}
*, *::before, *::after { box-sizing: border-box; }
.ic { flex: none; display: block; }
button, input, select, textarea { font: inherit; color: inherit; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; border-radius: 8px; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* launcher */
.launcher {
  position: fixed; z-index: 2147483000; bottom: max(20px, env(safe-area-inset-bottom)); right: 20px;
  display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 20px;
  border-radius: 999px; border: 1px solid var(--line-strong); background: var(--bg); color: var(--fg);
  font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgb(0 0 0 / .25);
}
:host([side="left"]) .launcher { right: auto; left: 20px; }
.launcher .ic { color: var(--accent); }
.launcher:hover { border-color: var(--accent); }

/* panel */
.panel {
  position: fixed; z-index: 2147483001; top: 0; bottom: 0; right: 0; width: var(--ask-w); max-width: 100vw;
  display: flex; flex-direction: column; background: var(--bg); color: var(--fg);
  border-left: 1px solid var(--line); box-shadow: -8px 0 30px rgb(0 0 0 / .25);
  font-size: calc(var(--base) * var(--scale)); line-height: 1.6;
}
:host([side="left"]) .panel { right: auto; left: 0; border-left: 0; border-right: 1px solid var(--line); box-shadow: 8px 0 30px rgb(0 0 0 / .25); }
.panel[hidden], .launcher[hidden] { display: none !important; }
.panel.te { --base: 18px; }
.resize { position: absolute; left: -6px; top: 0; bottom: 0; width: 12px; cursor: ew-resize; background: transparent; border: 0; padding: 0; }
.resize::after { content: ""; position: absolute; left: 3px; top: 50%; width: 6px; height: 56px; margin-top: -28px; border-radius: 4px; background: var(--line-strong); }
:host([side="left"]) .resize { left: auto; right: -6px; }

.head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 10px 10px 18px; border-bottom: 1px solid var(--line); }
.title { display: flex; flex-direction: column; min-width: 0; }
.title h2 { margin: 0; font-size: 1.12em; line-height: 1.3; display: flex; align-items: center; gap: 8px; }
.title h2 .ic { color: var(--accent); }
.title p { margin: 0; font-size: .8em; color: var(--muted); }
.badge { font-size: .62em; font-weight: 700; letter-spacing: .06em; padding: 2px 7px; border-radius: 6px; border: 1px solid var(--line-strong); color: var(--muted); }
.tools { display: flex; gap: 2px; flex: none; }
.iconbtn { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 10px; border: 1px solid transparent; background: transparent; color: var(--icon); cursor: pointer; }
.iconbtn:hover { background: var(--surface); border-color: var(--line); }
.iconbtn[aria-pressed="true"] { color: var(--accent); }

.privacy { display: flex; align-items: center; gap: 8px; padding: 8px 18px; background: var(--ok-bg); color: var(--ok); font-size: .86em; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.privacy .grow { flex: 1 1 auto; }
.privacy b { font-weight: 600; }
.status { padding: 8px 18px; font-size: .86em; color: var(--muted); border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px; }
.status[hidden] { display: none; }
.bar { height: 6px; border-radius: 3px; background: var(--sunk); overflow: hidden; }
.bar > span { display: block; height: 100%; width: 0; background: var(--accent); transition: width .2s; }
.notice { margin: 12px 18px 0; padding: 10px 12px; border-radius: 10px; background: var(--warn-bg); color: var(--warn); font-size: .88em; display: flex; gap: 8px; }

/* chat */
.chat-view, .settings-view { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.chat-view[hidden], .settings-view[hidden] { display: none; }
.log { min-height: 0; flex: 1 1 auto; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; overscroll-behavior: contain; }
.msg { max-width: 94%; padding: 12px 14px; border-radius: 16px; overflow-wrap: anywhere; }
.msg.you { align-self: flex-end; background: var(--user); border-radius: 16px 16px 4px 16px; display: flex; gap: 6px; align-items: flex-start; }
.msg.you .q { flex: 1; }
.msg.bot { align-self: flex-start; background: var(--surface); border: 1px solid var(--line); border-radius: 16px 16px 16px 4px; display: flex; flex-direction: column; gap: 8px; }
.msg.intro { background: transparent; border: 1px dashed var(--line-strong); color: var(--muted); font-size: .92em; }
.msg.unknown { border-color: var(--line-strong); }
.msg p { margin: 0 0 .5em; } .msg p:last-child { margin-bottom: 0; }
.msg ul { margin: .2em 0 .4em; padding-left: 1.2em; }
.msg code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .88em; background: var(--sunk); padding: 1px 5px; border-radius: 5px; }
.msg sup.cite { color: var(--accent); font-size: .72em; }
.meta { font-size: .8em; color: var(--muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.sources { display: flex; flex-direction: column; gap: 4px; }
.src { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--sunk); color: var(--link); font-weight: 600; font-size: .9em; text-align: left; cursor: pointer; }
.src span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.src:hover { border-color: var(--link); }
.actions { display: flex; gap: 2px; flex-wrap: wrap; }
.actions .iconbtn { width: 40px; height: 40px; min-width: 40px; }
.stale { font-size: .82em; color: var(--warn); display: flex; gap: 6px; align-items: flex-start; }
.typing::after { content: "▍"; animation: blink 1s steps(1) infinite; color: var(--accent); }
@keyframes blink { 50% { opacity: 0; } }

.sugg { padding: 0 18px 10px; display: flex; flex-direction: column; gap: 8px; }
.sugg h3 { margin: 0; font-size: .82em; color: var(--muted); font-weight: 600; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0; }
.chips li { margin: 0; display: flex; }
.chip { min-height: 44px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); font-size: .9em; cursor: pointer; text-align: left; }
.chip:hover { border-color: var(--accent); }
.chip .ic { color: var(--accent); }
.chip.pinned .ic { color: var(--focus); }
.chip.owner .ic { color: var(--icon); }
.chip.more { border-style: dashed; color: var(--muted); }

/* composer */
.composer { padding: 12px 18px max(14px, env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: var(--sunk); display: flex; flex-direction: column; gap: 10px; }
.composer label { font-size: .86em; color: var(--muted); }
.row { display: flex; gap: 8px; align-items: center; }
.row .grow { flex: 1 1 auto; }
.input { flex: 1 1 auto; min-width: 0; min-height: 52px; padding: 12px 14px; border-radius: 12px; border: 2px solid var(--line-strong); background: var(--bg); color: var(--fg); resize: none; line-height: 1.4; max-height: 9em; }
.input::placeholder { color: var(--muted); opacity: 1; }
.input:focus { border-color: var(--accent); }
.primary { min-height: 52px; padding: 0 18px; border-radius: 12px; border: 0; background: var(--accent); color: var(--accent-ink); font-weight: 700; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.primary:disabled { opacity: .55; cursor: not-allowed; }
.btn { min-height: 44px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--fg); display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: .92em; }
.btn:hover { border-color: var(--accent); }
.btn.danger { background: var(--danger-bg); border-color: var(--danger-line); color: var(--danger); font-weight: 600; }
.btn.danger:hover { border-color: var(--danger); }
.toast { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 6px 6px 14px; border-radius: 10px; background: var(--surface); border: 1px solid var(--line); font-size: .9em; }

/* settings */
.settings { flex: 1 1 auto; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 20px; }
.settings fieldset { margin: 0; padding: 0; border: 0; display: flex; flex-direction: column; gap: 8px; }
.settings legend, .field > label { font-weight: 600; margin-bottom: 6px; padding: 0; }
.modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
.mode { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; min-height: 44px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; }
.mode:has(input:checked) { border: 2px solid var(--accent); }
.mode span:first-child { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.mode small { color: var(--muted); font-size: .8em; }
.mode input, .check input { width: 20px; height: 20px; margin: 0; accent-color: var(--accent); flex: none; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; }
select { min-height: 48px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--fg); }
.check { display: flex; align-items: center; gap: 10px; min-height: 44px; }
.checks { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }
.card { padding: 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); display: flex; flex-direction: column; gap: 8px; }
.card .muted { color: var(--muted); font-size: .9em; }
.consent { padding: 14px; border-radius: 12px; border: 2px solid var(--accent); background: var(--surface); display: flex; flex-direction: column; gap: 10px; }
.consent h3 { margin: 0; font-size: 1em; }
.consent p { margin: 0; color: var(--muted); font-size: .92em; }
.foot { padding: 12px 18px max(14px, env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: var(--sunk); display: flex; gap: 8px; }

@media (max-width: 640px) {
  .panel { top: auto; left: 0; right: 0; width: 100vw; height: min(88vh, 100%); border-left: 0; border-top: 1px solid var(--line); border-radius: 20px 20px 0 0; box-shadow: 0 -8px 30px rgb(0 0 0 / .35); }
  :host([side="left"]) .panel { border-right: 0; }
  .resize { display: none; }
  .grab { display: block; width: 48px; height: 5px; border-radius: 3px; background: var(--line-strong); margin: 8px auto 0; }
  .two, .checks { grid-template-columns: 1fr; }
}
.grab { display: none; }
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
@media (forced-colors: active) {
  .panel, .launcher, .msg, .chip, .btn, .src, .mode, .card, .input, .primary, .consent { border: 1px solid CanvasText; }
  .primary { background: ButtonText; color: ButtonFace; }
  .ic { color: CanvasText; }
}
`
