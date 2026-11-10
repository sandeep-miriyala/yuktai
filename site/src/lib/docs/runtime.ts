// Shared helpers for the live demos on the guide pages (window.Docs).
// YuktAI comes from npm (@yuktishaalaa/yuktai/vanilla, Rust engines built in): no CDN.
import { iconSvg } from "@yuktishaalaa/yuktai/icons";
import { VERSIONS } from "@/data/site";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Yuktai = any;
type ReadyFn = (y: Yuktai) => void;

declare global {
  interface Window {
    yuktai?: Yuktai;
    Docs?: DocsApi;
    DocsData?: any;
    DOCS_CONFIG?: { version: string; pinned: string; customWidget?: boolean };
    YUKTAI_CONFIG?: Record<string, unknown>;
  }
}

export interface DocsApi {
  version: string;
  source: string;
  ready(fn: ReadyFn, onFail?: () => void): void;
  icon(name: string, cls?: string): string;
  esc(s: unknown): string;
  say(text: string): void;
  copy(text: string, what?: string): void;
  setCode(id: string, fw: string, src: string, part?: number, fileName?: string): void;
  framework(): string;
}

const KEY_CUSTOM = "docs-yuktai-config";

/** The ♿ / 🛠 buttons for this site, set before YuktAI loads. */
function widgetConfig() {
  let hasPrefs = false;
  try { hasPrefs = !!localStorage.getItem("yuktai-a11y-prefs"); } catch {}
  const base: Record<string, any> = {
    position: "left",
    primaryColor: "#0038B4",
    title: "Accessibility",
    showPageTools: true,
    defaultTab: "ask",
    voiceLang: "en-IN",
    // the site has its own skip link; auto-fix stays off so the practice areas keep their problems
    config: { showSkipLinks: false, autoFix: false },
    applyOnLoad: hasPrefs,
  };
  window.DOCS_CONFIG = { version: VERSIONS.yuktai, pinned: VERSIONS.yuktai };
  // "Try it on this site" on the Accessibility guide: kept for this browser tab only
  try {
    const custom = JSON.parse(sessionStorage.getItem(KEY_CUSTOM) || "null");
    if (custom && typeof custom === "object") {
      for (const k of ["position", "primaryColor", "title", "showPageTools", "defaultTab", "voiceLang"]) if (k in custom) base[k] = custom[k];
      if (custom.config && typeof custom.config === "object") base.config = { ...base.config, ...custom.config };
      window.DOCS_CONFIG.customWidget = true;
    }
  } catch {}
  window.YUKTAI_CONFIG = base;
}

const $$ = (s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<HTMLElement>(s));
const esc = (s: unknown) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const icon = (name: string, cls?: string) => iconSvg(name, { size: 24 }).replace("<svg ", `<svg class="i${cls ? " " + cls : ""}" `);

let started: Promise<DocsApi> | null = null;
let pageSetup: () => void = () => {};

/** After each page change: code tabs, versions, release note for the page now on screen. */
export function setupPage() {
  pageSetup();
}

/** Starts once per page: the helpers, the code tabs, then YuktAI. */
export function startDocs(): Promise<DocsApi> {
  if (started) return started;
  started = (async () => {
    // one polite live region for the whole site
    const live = document.createElement("p");
    live.className = "sr-only"; live.id = "docs-live";
    live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
    document.body.appendChild(live);
    const say = (text: string) => { live.textContent = ""; setTimeout(() => { live.textContent = text; }, 40); };

    function copy(text: string, what?: string) {
      const done = () => say((what || "Code") + " copied");
      navigator.clipboard?.writeText(text).then(done, () => say("Copy failed. Select the code and copy it."));
    }

    // code tabs: Next.js / React or Vanilla JS, one choice for the whole site
    let currentFw = "next";
    try { if (localStorage.getItem("docs-fw") === "vanilla") currentFw = "vanilla"; } catch {}
    function showFw(fw: string, focusBox?: Element) {
      currentFw = fw;
      $$("[data-codetabs]").forEach((box) => {
        const tabs = $$("[role=tab]", box);
        if (!tabs.some((t) => t.getAttribute("data-fw") === fw)) return;
        tabs.forEach((t) => {
          const on = t.getAttribute("data-fw") === fw;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(t.getAttribute("aria-controls") || "");
          if (panel) panel.hidden = !on;
          if (on && focusBox === box) t.focus();
        });
      });
    }
    const pick = (fw: string, box?: Element) => { try { localStorage.setItem("docs-fw", fw); } catch {} showFw(fw, box); };
    document.addEventListener("click", (e) => {
      const t = (e.target as Element).closest?.("[data-codetabs] [role=tab]");
      if (t) pick(t.getAttribute("data-fw") || "next");
      const b = (e.target as Element).closest?.(".copy-btn");
      if (b) {
        const code = b.closest(".codefile, .snippet")?.querySelector("pre code");
        if (code) copy(code.textContent || "", b.getAttribute("data-what") || undefined);
        const lbl = b.querySelector(".copy-label");
        if (lbl) { lbl.textContent = "Copied"; setTimeout(() => { lbl.textContent = "Copy"; }, 1600); }
      }
    });
    document.addEventListener("keydown", (e) => {
      const t = (e.target as Element).closest?.("[data-codetabs] [role=tab]");
      if (!t) return;
      const box = t.closest("[data-codetabs]")!, tabs = $$("[role=tab]", box), i = tabs.indexOf(t as HTMLElement);
      const n = ({ ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 } as Record<string, number>)[e.key];
      if (n === undefined) return;
      e.preventDefault();
      pick(tabs[(n + tabs.length) % tabs.length].getAttribute("data-fw") || "next", box);
    });
    pageSetup = () => {
      showFw(currentFw);
      // the version on this page, in text and in code
      $$(".ver-text").forEach((el) => { el.textContent = VERSIONS.yuktai; });
      $$("pre code").forEach((c) => {
        const t = (c.textContent || "").replace(/(@yuktishaalaa\/yuktai@)\d+\.\d+\.\d+/g, "$1" + VERSIONS.yuktai);
        if (t !== c.textContent) c.textContent = t;
      });
      // long code scrolls sideways: keyboard users must be able to reach and scroll it (WCAG 2.1.1)
      $$("pre").forEach((pre) => { if (!pre.hasAttribute("tabindex")) pre.tabIndex = 0; });
      latestOnNpm();
    };

    const Docs: DocsApi = {
      version: VERSIONS.yuktai,
      source: "npm: @yuktishaalaa/yuktai@" + VERSIONS.yuktai,
      ready: () => {},
      icon, esc, say, copy,
      setCode(id, fw, src, part, fileName) {
        const cid = id + "-" + fw + "-code" + (part ? "-" + part : "");
        const el = document.getElementById(cid);
        if (el) el.textContent = src;
        const nm = document.getElementById(cid + "-name");
        if (nm && fileName) nm.textContent = fileName;
      },
      framework: () => currentFw,
    };
    window.Docs = Docs;

    // YuktAI itself: the vanilla build from npm, which adds window.yuktai and the ♿ / 🛠 buttons
    let y: Yuktai = null;
    try {
      widgetConfig();
      await import("@yuktishaalaa/yuktai/vanilla");
      y = window.yuktai;
      document.documentElement.setAttribute("data-yuktai", "ready");
    } catch (e) {
      console.error("[YuktaiDocs] YuktAI did not start", e);
    }
    Docs.ready = (fn, onFail) => {
      if (!y) { onFail?.(); return; }
      try { fn(y); } catch (e) { console.error("[YuktaiDocs]", e); }
    };
    return Docs;
  })();
  return started;
}

/** "YuktAI x.y.z is out on npm" when this site runs an older release. */
function latestOnNpm() {
  const newer = (a: string, b: string) => {
    const x = a.split(/[.-]/).map(Number), y = b.split(/[.-]/).map(Number);
    for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
    return false;
  };
  const note = (latest: string) => {
    $$(".latest-text").forEach((el) => { el.textContent = latest; });
    const banner = document.getElementById("docs-banner");
    if (banner && newer(latest, VERSIONS.yuktai)) {
      banner.innerHTML = `<p>${icon("info")}<span>YuktAI <strong>${esc(latest)}</strong> is out on npm. These pages run ${esc(VERSIONS.yuktai)}.</span></p>`;
      banner.hidden = false;
    }
  };
  try {
    const cached = sessionStorage.getItem("docs-latest");
    if (cached) return note(cached);
    if (navigator.onLine === false) return;
    fetch("https://data.jsdelivr.com/v1/packages/npm/@yuktishaalaa/yuktai/resolved?specifier=latest")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.version === "string" && /^\d+\.\d+\.\d+/.test(j.version)) {
          try { sessionStorage.setItem("docs-latest", j.version); } catch {}
          note(j.version);
        }
      })
      .catch(() => {});
  } catch {}
}
