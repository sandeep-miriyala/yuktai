"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PaletteIcon } from "@yuktishaalaa/yuktai/icons";
import config from "@config";
import { FONT_PRESETS, PRESETS, TARGET, applyLook, canUseLocalFonts, localFontFamilies, paletteFor, readLook, type Look } from "./look";
import { useLifecycle } from "./lifecycle";

const DEFAULT_FONT = 'system-ui, -apple-system, "Segoe UI", "Noto Sans", sans-serif';
const quote = (family: string) => `"${family.replace(/["\\]/g, "")}", ${DEFAULT_FONT}`;

/**
 * 🎨 Let visitors choose a colour and a font for this site.
 * Colours are adjusted to keep 7:1 contrast. Fonts on this computer are offered on
 * desktop Chrome and Edge only. Everything is saved in this browser; nothing is sent.
 */
export default function LookPicker() {
  const [open, setOpen] = useState(false);
  const [look, setLook] = useState<Look>({});
  const [local, setLocal] = useState<string[] | null>(null);
  const [localOk, setLocalOk] = useState(false);
  const [filter, setFilter] = useState("");
  const [note, setNote] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const life = useLifecycle<Look>({ part: "look" });

  useEffect(() => {
    // read what this visitor chose before (browser storage is only available after mount)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLook(readLook());
    setLocalOk(config.theme.localFonts && canUseLocalFonts());
  }, []);

  // Esc and clicks outside close the panel.
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const click = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", click);
    panel.current?.querySelector<HTMLElement>("button, input, select")?.focus();
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", click);
    };
  }, [open]);

  const save = (next: Look) => {
    setLook(next);
    applyLook(next);
    life.change(next);
  };

  const pickColor = (color: string) => {
    const p = paletteFor(color);
    setNote(
      p.changed
        ? `Made a little darker so text stays readable: ${p.ratioLight.toFixed(1)}:1 light, ${p.ratioDark.toFixed(1)}:1 dark.`
        : `Readable: ${p.ratioLight.toFixed(1)}:1 light, ${p.ratioDark.toFixed(1)}:1 dark.`,
    );
    save({ ...look, color });
  };

  const loadLocal = async () => {
    try {
      setNote("Your browser will ask before it shares the font list with this page.");
      setLocal(await localFontFamilies());
      setNote("");
    } catch {
      setNote("Fonts on this computer were not shared. You can still use the fonts above.");
    }
  };

  const shown = local?.filter((f) => f.toLowerCase().includes(filter.trim().toLowerCase())).slice(0, 200) ?? [];
  const current = look.color ? paletteFor(look.color).light : undefined;

  return (
    <div className="look">
      <button
        ref={button}
        type="button"
        className="icon-btn"
        aria-expanded={open}
        aria-controls={id}
        aria-label="Colour and font"
        title="Colour and font"
        onClick={() => setOpen((o) => !o)}
      >
        <PaletteIcon size={20} aria-hidden="true" />
      </button>

      {open && (
        <div ref={panel} id={id} className="look-panel" role="dialog" aria-label="Colour and font">
          <fieldset className="look-colors">
            <legend>Colour</legend>
            {PRESETS.map((p) => (
              <label key={p.color} title={p.name}>
                <input type="radio" name={`${id}-c`} checked={current === p.color} onChange={() => pickColor(p.color)} />
                <span className="dot" style={{ background: p.color }} />
                <span className="sr-only">{p.name}</span>
              </label>
            ))}
            <label className="look-custom">
              <input type="color" value={look.color ?? PRESETS[0].color} onChange={(e) => pickColor(e.target.value)} />
              <span>Any colour</span>
            </label>
          </fieldset>

          <label className="field">
            <span>Font</span>
            <select
              value={look.fontName && !FONT_PRESETS.some((f) => f.name === look.fontName) ? "__local" : look.fontName ?? "Default"}
              onChange={(e) => {
                const f = FONT_PRESETS.find((x) => x.name === e.target.value);
                if (f) save({ ...look, font: f.font || undefined, fontName: f.font ? f.name : undefined });
              }}
            >
              {FONT_PRESETS.map((f) => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
              {look.fontName && !FONT_PRESETS.some((f) => f.name === look.fontName) && <option value="__local">{look.fontName}</option>}
            </select>
          </label>

          {localOk && !local && (
            <button type="button" className="btn" onClick={loadLocal}>Use a font from this computer</button>
          )}
          {local && (
            <div className="look-local">
              <label className="field">
                <span>Fonts on this computer ({local.length})</span>
                <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Gautami, Nirmala…" />
              </label>
              <ul>
                {shown.map((f) => (
                  <li key={f}>
                    <button type="button" style={{ fontFamily: quote(f) }} aria-pressed={look.fontName === f} onClick={() => save({ ...look, font: quote(f), fontName: f })}>
                      {f}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="hint" role="status">{note || `Any colour you pick is kept at ${TARGET}:1 contrast or more. Saved in this browser only.`}</p>
          <button type="button" className="btn" onClick={() => { setNote(""); save({}); }}>Reset</button>
        </div>
      )}
    </div>
  );
}
