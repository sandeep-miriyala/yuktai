"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ICON_NAMES, YuktaiIcon, iconContrast, type IconName } from "@yuktishaalaa/yuktai/icons";
import { useLifecycle } from "@/components/yuktai/lifecycle";

const COLOURS = [
  { name: "Brand blue", value: "#0038b4" },
  { name: "Navy", value: "#000633" },
  { name: "Forest green", value: "#084d31" },
  { name: "Rust", value: "#7a3209" },
  { name: "Plum", value: "#5b2a86" },
];

// "factCheck" → "FactCheckIcon": the named import for each icon.
const component = (n: string) => n[0].toUpperCase() + n.slice(1) + "Icon";

/** Every YuktAI icon: search, pick a size, style and colour, then copy the code. */
export default function IconGallery() {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(28);
  const [variant, setVariant] = useState<"outline" | "filled">("outline");
  const [color, setColor] = useState(COLOURS[0].value);
  const [picked, setPicked] = useState<IconName>("accessibility");
  const [copied, setCopied] = useState("");
  const life = useLifecycle<string>({ part: "icons" });

  const q = useDeferredValue(query.trim().toLowerCase());
  const names = useMemo(() => ICON_NAMES.filter((n) => n.toLowerCase().includes(q)), [q]);
  const contrast = iconContrast(color, "#ffffff");

  const props = `size={${size}}${variant === "filled" ? ' variant="filled"' : ""} color="${color}"`;
  const snippets = {
    named: `import { ${component(picked)} } from "@yuktishaalaa/yuktai/icons";\n<${component(picked)} ${props} aria-hidden="true" />`,
    byName: `import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";\n<YuktaiIcon name="${picked}" ${props} label="${picked}" />`,
  };
  const copy = async (key: keyof typeof snippets) => {
    await navigator.clipboard.writeText(snippets[key]).catch(() => {});
    setCopied(key);
  };
  const pick = (n: IconName) => {
    setPicked(n);
    setCopied("");
    life.change(n);
  };

  return (
    <div className="icons">
      <form className="icon-controls" onSubmit={(e) => e.preventDefault()} role="search">
        <label className="field">
          <span>Search {ICON_NAMES.length} icons</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="mic, grid, sun…" />
        </label>
        <label className="field">
          <span>Size: {size}px</span>
          <input type="range" min={16} max={48} step={4} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <fieldset className="seg">
          <legend>Style</legend>
          {(["outline", "filled"] as const).map((v) => (
            <label key={v}>
              <input type="radio" name="variant" checked={variant === v} onChange={() => setVariant(v)} />
              <span>{v === "outline" ? "Outline" : "Filled"}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="seg">
          <legend>Colour</legend>
          {COLOURS.map((c) => (
            <label key={c.value} title={c.name}>
              <input type="radio" name="colour" checked={color === c.value} onChange={() => setColor(c.value)} />
              <span className="dot" style={{ background: c.value }} />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </fieldset>
      </form>

      <p className="hint" role="status">
        {names.length} shown · contrast on white {contrast ? `${contrast.toFixed(1)}:1` : "n/a"} (icons need 3:1)
      </p>

      <ul className="icon-grid">
        {names.map((n) => (
          <li key={n}>
            <button type="button" aria-pressed={picked === n} onClick={() => pick(n)}>
              <YuktaiIcon name={n} size={size} color={color} variant={variant} aria-hidden="true" />
              <span>{n}</span>
            </button>
          </li>
        ))}
      </ul>
      {names.length === 0 && <p>No icon matches “{query}”.</p>}

      <div className="icon-code" aria-live="polite">
        <div className="icon-code-head">
          <h2>
            <YuktaiIcon name={picked} size={28} color={color} variant={variant} aria-hidden="true" /> {picked}
          </h2>
          <button type="button" className="btn" onClick={() => copy("named")}>{copied === "named" ? "Copied" : "Copy import"}</button>
          <button type="button" className="btn" onClick={() => copy("byName")}>{copied === "byName" ? "Copied" : "Copy by name"}</button>
        </div>
        <pre><code>{snippets.named}</code></pre>
      </div>
    </div>
  );
}
