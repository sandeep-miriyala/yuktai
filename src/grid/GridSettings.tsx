"use client";
// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · src/grid/GridSettings.tsx (v5.7.0)
// The grid's ⚙ settings: a disclosure panel (button + region) under the
// toolbar, so it scrolls with the page on phones and in installed apps.
// Escape closes it and returns focus to the ⚙ button.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef, useState } from "react";
import type { GridDownloadFormat } from "./types";
import type { GridEngine } from "./rust/engine";
import { ACCENT_PRESETS, accentText, accentVisible, type GridDensity, type GridPrefs } from "./gridPrefs";
import type { EngineComparison } from "./gridBench";

type Lang = "en-US" | "te-IN";

const TEXT = {
  "en-US": {
    settings: "Grid settings",
    assistant: "Assistant",
    showAssistant: "Show the assistant",
    colour: "Colour",
    siteColour: "Site colour",
    custom: "Your own colour",
    readable: (ratio: string) => `Button text picked for contrast ${ratio}:1.`,
    faint: (ratio: string) => `This colour is faint on the background (${ratio}:1, 3:1 is the minimum). Borders may be hard to see.`,
    spacing: "Row spacing",
    density: { compact: "Compact", normal: "Normal", comfortable: "Roomy" } as Record<GridDensity, string>,
    download: "Download",
    downloadRows: (n: string) => `${n} row(s), as shown now (search, filters and sort applied).`,
    formats: { csv: "CSV", xlsx: "Excel", json: "JSON", pdf: "PDF (print)" } as Record<GridDownloadFormat, string>,
    developer: "Developer",
    engine: "Engine",
    engines: { auto: "Auto (Rust from 10,000 rows)", rust: "Rust (WebAssembly)", ts: "TypeScript" } as Record<GridEngine, string>,
    showTime: "Show search time",
    compare: "Compare TypeScript and Rust",
    comparing: "Timing…",
    chartTitle: (work: string) => `Median time for ${work}`,
    rows: "Rows",
    noRust: "not available",
    reset: "Reset my settings",
    close: "Close settings",
  },
  "te-IN": {
    settings: "గ్రిడ్ సెట్టింగ్‌లు",
    assistant: "సహాయకుడు",
    showAssistant: "సహాయకుడిని చూపించు",
    colour: "రంగు",
    siteColour: "సైట్ రంగు",
    custom: "మీ సొంత రంగు",
    readable: (ratio: string) => `చదవడానికి సరిపడా అక్షరాల రంగు ఎంచుకున్నాం (${ratio}:1).`,
    faint: (ratio: string) => `ఈ రంగు నేపథ్యం మీద లేతగా ఉంది (${ratio}:1, కనీసం 3:1 కావాలి). అంచులు సరిగ్గా కనిపించకపోవచ్చు.`,
    spacing: "వరుసల మధ్య దూరం",
    density: { compact: "దగ్గరగా", normal: "సాధారణం", comfortable: "విశాలంగా" } as Record<GridDensity, string>,
    download: "డౌన్‌లోడ్",
    downloadRows: (n: string) => `${n} వరుసలు, ఇప్పుడు చూపిస్తున్నట్టే (శోధన, ఫిల్టర్లు, క్రమం తో).`,
    formats: { csv: "CSV", xlsx: "Excel", json: "JSON", pdf: "PDF (ప్రింట్)" } as Record<GridDownloadFormat, string>,
    developer: "డెవలపర్",
    engine: "ఇంజిన్",
    engines: { auto: "ఆటో (10,000 వరుసల నుంచి Rust)", rust: "Rust (WebAssembly)", ts: "TypeScript" } as Record<GridEngine, string>,
    showTime: "శోధన సమయం చూపించు",
    compare: "TypeScript, Rust పోల్చు",
    comparing: "కొలుస్తున్నాం…",
    chartTitle: (work: string) => `${work}: మధ్యస్థ సమయం`,
    rows: "వరుసలు",
    noRust: "అందుబాటులో లేదు",
    reset: "నా సెట్టింగ్‌లు రీసెట్ చేయి",
    close: "సెట్టింగ్‌లు మూసివేయి",
  },
};

export interface GridSettingsProps {
  language: Lang;
  locale: string;
  colors: { bg: string; text: string; border: string; control: string; controlBg: string; muted: string; accent: string; accentText: string };
  dark: boolean;
  prefs: GridPrefs;
  onChange: (patch: Partial<GridPrefs>) => void;
  onReset: () => void;
  assistantAvailable: boolean;
  assistantOn: boolean;
  allowCustomColor: boolean;
  downloads: GridDownloadFormat[];
  rowCount: number;
  onDownload: (format: GridDownloadFormat) => void;
  devTools: boolean;
  engine: GridEngine;
  showTime: boolean;
  onCompare: () => Promise<EngineComparison>;
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** The ⚙ button. Render it in the toolbar; render <GridSettingsPanel> under the toolbar. */
export function GridSettingsButton({
  open,
  onToggle,
  panelId,
  language,
  colors,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  panelId: string;
  language: Lang;
  colors: GridSettingsProps["colors"];
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const t = TEXT[language];
  return (
    <button
      ref={buttonRef}
      type="button"
      className="yk-grid__settings-button"
      aria-label={t.settings}
      title={t.settings}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
      style={{
        width: 40,
        height: 40,
        minWidth: 40,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        borderRadius: 8,
        border: `1px solid ${open ? colors.accent : colors.control}`,
        background: open ? colors.accent : colors.controlBg,
        color: open ? colors.accentText : colors.text,
        cursor: "pointer",
      }}
    >
      <GearIcon />
    </button>
  );
}

const fieldset: React.CSSProperties = { border: 0, margin: 0, padding: 0, minWidth: 0 };
const legend: React.CSSProperties = { fontWeight: 700, fontSize: 13, marginBottom: 8, padding: 0 };

function EngineChart({ result, t, locale, colors }: { result: EngineComparison; t: (typeof TEXT)["en-US"]; locale: string; colors: GridSettingsProps["colors"] }) {
  const max = Math.max(0.001, ...result.timings.flatMap((r) => [r.ts, r.rust ?? 0]));
  const fmt = (ms: number) => (ms < 1 ? ms.toFixed(2) : ms < 10 ? ms.toFixed(1) : Math.round(ms).toLocaleString(locale));
  const barH = 14;
  const groupH = barH * 2 + 14;
  const width = 300;
  const labelW = 70;
  return (
    <figure style={{ margin: "8px 0 0" }}>
      <figcaption style={{ fontSize: 12, marginBottom: 6 }}>{t.chartTitle(result.work)}</figcaption>
      <svg width="100%" viewBox={`0 0 ${width + labelW + 60} ${result.timings.length * groupH}`} role="img" aria-hidden="true" focusable="false" style={{ maxWidth: 440, display: "block" }}>
        {result.timings.map((r, i) => {
          const y = i * groupH;
          const tsW = (r.ts / max) * width;
          const rustW = r.rust == null ? 0 : (r.rust / max) * width;
          return (
            <g key={r.rows}>
              <text x={0} y={y + barH + 4} fontSize="11" fill="currentColor">{r.rows.toLocaleString(locale)}</text>
              <rect x={labelW} y={y} width={Math.max(1, tsW)} height={barH} rx={3} fill={colors.muted} />
              <text x={labelW + Math.max(1, tsW) + 4} y={y + barH - 3} fontSize="10" fill="currentColor">TS {fmt(r.ts)} ms</text>
              <rect x={labelW} y={y + barH + 2} width={Math.max(1, rustW)} height={barH} rx={3} fill={colors.accent} />
              <text x={labelW + Math.max(1, rustW) + 4} y={y + barH * 2 - 1} fontSize="10" fill="currentColor">
                Rust {r.rust == null ? "—" : `${fmt(r.rust)} ms`}
              </text>
            </g>
          );
        })}
      </svg>
      {/* the same numbers as a table, for screen readers and for copying */}
      <table style={{ borderCollapse: "collapse", fontSize: 12, marginTop: 6 }}>
        <caption style={{ textAlign: "left", fontSize: 12, opacity: 0.8 }}>{t.chartTitle(result.work)}</caption>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: "left", padding: "2px 8px" }}>{t.rows}</th>
            <th scope="col" style={{ textAlign: "right", padding: "2px 8px" }}>TypeScript (ms)</th>
            <th scope="col" style={{ textAlign: "right", padding: "2px 8px" }}>Rust (ms)</th>
          </tr>
        </thead>
        <tbody>
          {result.timings.map((r) => (
            <tr key={r.rows}>
              <th scope="row" style={{ textAlign: "left", padding: "2px 8px", fontWeight: 400 }}>{r.rows.toLocaleString(locale)}</th>
              <td style={{ textAlign: "right", padding: "2px 8px" }}>{fmt(r.ts)}</td>
              <td style={{ textAlign: "right", padding: "2px 8px" }}>{r.rust == null ? t.noRust : fmt(r.rust)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function GridSettingsPanel(props: GridSettingsProps & { id: string; onClose: () => void }) {
  const { language, locale, colors, dark, prefs, onChange, onReset, id, onClose } = props;
  const t = TEXT[language];
  const name = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [comparison, setComparison] = useState<EngineComparison | null>(null);
  const [comparing, setComparing] = useState(false);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    panel?.focus();
    // Escape anywhere in the panel closes it (a listener, not a JSX handler on a region)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
      }
    };
    panel?.addEventListener("keydown", onKey);
    return () => panel?.removeEventListener("keydown", onKey);
  }, []);

  const accent = prefs.accent;
  const textPick = accent ? accentText(accent) : null;
  const visible = accent ? accentVisible(accent, dark) : null;

  const radio = (checked: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    padding: "0 10px",
    borderRadius: 8,
    border: `1px solid ${checked ? colors.accent : colors.control}`,
    cursor: "pointer",
    fontSize: 13,
  });
  const button: React.CSSProperties = {
    minHeight: 40,
    padding: "0 12px",
    borderRadius: 8,
    border: `1px solid ${colors.control}`,
    background: colors.controlBg,
    color: colors.text,
    cursor: "pointer",
    fontSize: 13,
  };

  return (
    <div
      id={id}
      ref={panelRef}
      role="region"
      aria-label={t.settings}
      tabIndex={-1}
      className="yk-grid__settings"
      style={{
        display: "grid",
        gap: 18,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        padding: 14,
        borderBottom: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.text,
        outline: "none",
      }}
    >
      {props.assistantAvailable && (
        <fieldset style={fieldset}>
          <legend style={legend}>{t.assistant}</legend>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, fontSize: 13 }}>
            <input type="checkbox" checked={props.assistantOn} onChange={(e) => onChange({ assistant: e.target.checked })} style={{ width: 20, height: 20 }} />
            {t.showAssistant}
          </label>
        </fieldset>
      )}

      {props.allowCustomColor && (
        <fieldset style={fieldset}>
          <legend style={legend}>{t.colour}</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <label style={radio(!accent)}>
              <input type="radio" name={`${name}-c`} checked={!accent} onChange={() => onChange({ accent: undefined })} />
              {t.siteColour}
            </label>
            {ACCENT_PRESETS.map((p) => (
              <label key={p.value} style={radio(accent === p.value)} title={language === "te-IN" ? p.te : p.name}>
                <input type="radio" name={`${name}-c`} checked={accent === p.value} onChange={() => onChange({ accent: p.value })} />
                <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 4, background: p.value, display: "inline-block" }} />
                {language === "te-IN" ? p.te : p.name}
              </label>
            ))}
          </div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 13 }}>
            {t.custom}
            <input
              type="color"
              value={accent && /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#2563eb"}
              onChange={(e) => onChange({ accent: e.target.value })}
              style={{ width: 44, height: 36, padding: 0, border: `1px solid ${colors.control}`, borderRadius: 6, background: "transparent" }}
            />
          </label>
          {textPick && (
            <p role="status" style={{ fontSize: 12, margin: "6px 0 0", opacity: 0.85 }}>
              {t.readable(textPick.ratio.toFixed(1))}
              {visible && !visible.ok ? ` ${t.faint(visible.ratio.toFixed(1))}` : ""}
            </p>
          )}
        </fieldset>
      )}

      <fieldset style={fieldset}>
        <legend style={legend}>{t.spacing}</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(["compact", "normal", "comfortable"] as GridDensity[]).map((d) => {
            const checked = (prefs.density ?? "normal") === d;
            return (
              <label key={d} style={radio(checked)}>
                <input type="radio" name={`${name}-d`} checked={checked} onChange={() => onChange({ density: d === "normal" ? undefined : d })} />
                {t.density[d]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {props.downloads.length > 0 && (
        <fieldset style={fieldset}>
          <legend style={legend}>{t.download}</legend>
          <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.85 }}>{t.downloadRows(props.rowCount.toLocaleString(locale))}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {props.downloads.map((f) => (
              <button key={f} type="button" style={button} onClick={() => props.onDownload(f)} disabled={props.rowCount === 0}>
                {t.formats[f]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {props.devTools && (
        <fieldset style={{ ...fieldset, gridColumn: "1 / -1" }}>
          <legend style={legend}>{t.developer}</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              {t.engine}
              <select
                value={props.engine}
                onChange={(e) => onChange({ engine: e.target.value as GridEngine })}
                style={{ minHeight: 40, padding: "0 8px", borderRadius: 8, border: `1px solid ${colors.control}`, background: colors.controlBg, color: colors.text }}
              >
                {(["auto", "rust", "ts"] as GridEngine[]).map((e) => (
                  <option key={e} value={e}>
                    {t.engines[e]}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, fontSize: 13 }}>
              <input type="checkbox" checked={props.showTime} onChange={(e) => onChange({ showTime: e.target.checked })} style={{ width: 20, height: 20 }} />
              {t.showTime}
            </label>
            <button
              type="button"
              style={button}
              aria-busy={comparing}
              aria-disabled={comparing}
              // not `disabled`: a disabled button drops keyboard focus to the page
              onClick={async () => {
                if (comparing) return;
                setComparing(true);
                try {
                  setComparison(await props.onCompare());
                } finally {
                  setComparing(false);
                }
              }}
            >
              {comparing ? t.comparing : t.compare}
            </button>
          </div>
          <div aria-live="polite">{comparison && <EngineChart result={comparison} t={t} locale={locale} colors={colors} />}</div>
        </fieldset>
      )}

      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" style={button} onClick={onReset}>
          {t.reset}
        </button>
        <button type="button" style={button} onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
}
