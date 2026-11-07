// public/manifest.json for the new app: icons, screenshots and shortcuts for the pages it has.
// Paths are relative, so the app also works under a sub-path (GitHub Pages).
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** o: the init options; theme: the browser-bar colour (#000633 for the brand blue). */
export function manifest(o, theme = "#000633") {
  const p = { theme };
  const has = (f) => o.features.includes(f);
  const shortcuts = [
    has("grid") && { name: "Data grid", short_name: "Grid", description: "10 lakh rows, Grid AI Assistant", url: "./grid/", icons: [{ src: "icons/shortcut-grid.png", sizes: "96x96", type: "image/png" }] },
    has("page-tools") && { name: "QA report", short_name: "QA", description: "15 accessibility checks", url: "./qa/", icons: [{ src: "icons/shortcut-qa.png", sizes: "96x96", type: "image/png" }] },
    has("icons") && { name: "Icons", short_name: "Icons", description: "Every YuktAI icon", url: "./icons/", icons: [{ src: "icons/shortcut-icons.png", sizes: "96x96", type: "image/png" }] },
  ].filter(Boolean);

  return {
    name: o.title,
    short_name: o.title.length > 12 ? o.title.split(" ")[0].slice(0, 12) : o.title,
    description: `${o.title}: an accessible, AI-in-the-browser web app built with YuktAI.`,
    lang: "en",
    dir: "ltr",
    id: "./",
    start_url: "./",
    scope: "./",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: p.theme,
    theme_color: p.theme,
    categories: ["productivity", "developer"],
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "icons/monochrome-512.png", sizes: "512x512", type: "image/png", purpose: "monochrome" },
      { src: "icons/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    // Chrome shows a bigger install window with these. Replace them with pictures of your app.
    screenshots: [
      { src: "screenshots/wide.png", sizes: "1280x800", type: "image/png", form_factor: "wide", label: "The app on a computer" },
      { src: "screenshots/narrow.png", sizes: "540x1080", type: "image/png", form_factor: "narrow", label: "The app on a phone" },
    ],
    ...(shortcuts.length ? { shortcuts } : {}),
  };
}

export function writeManifest(dir, o, theme) {
  writeFileSync(join(dir, "public", "manifest.json"), JSON.stringify(manifest(o, theme), null, 2) + "\n");
}
