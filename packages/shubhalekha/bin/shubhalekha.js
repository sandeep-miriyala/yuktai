#!/usr/bin/env node
// శుభలేఖ / Shubhalekha
//   shubhalekha init <folder> --type <వేడుక>   కొత్త folder: <వేడుక>.json + photos/ + package.json
//   shubhalekha build [folder]                  dist/ తయారీ
//   shubhalekha studio [folder]                 code లేకుండా browser లో form
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { build, findConfig } from "../src/build.js";
import { startStudio } from "../src/studio.js";

const TEMPLATES = new URL("../templates/", import.meta.url);
const types = readdirSync(TEMPLATES).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();
const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const positional = rest.filter((a, i) => !a.startsWith("--") && !rest[i - 1]?.startsWith("--"));

function help() {
  console.log(`శుభలేఖ / Shubhalekha ${VERSION}: invitation pages for every Indian celebration, in 22 Indian languages

  shubhalekha init <folder> --type <${types.join("|")}>
  shubhalekha build [folder]
  shubhalekha studio [folder]     fill a form in your browser instead of editing JSON

Then publish <folder>/dist on Vercel, Netlify or GitHub Pages (free).`);
}

/** కొత్త వేడుక folder */
function init(dirArg, type) {
  if (!types.includes(type)) throw new Error(`Unknown type "${type}". Use one of: ${types.join(", ")}`);
  const dir = resolve(dirArg || `my-${type}`);
  const file = `${type}.json`;
  if (existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(".json") && f !== "package.json")) {
    throw new Error(`${dir} already has an event file, not overwriting it`);
  }
  mkdirSync(join(dir, "photos"), { recursive: true });
  writeFileSync(join(dir, file), readFileSync(new URL(`${type}.json`, TEMPLATES)));
  if (!existsSync(join(dir, "package.json"))) {
    writeFileSync(join(dir, "package.json"), JSON.stringify({
      name: basename(dir).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      private: true,
      type: "module",
      scripts: { build: "shubhalekha build", studio: "shubhalekha studio" },
      devDependencies: { "@yuktishaalaa/shubhalekha": `^${VERSION}` },
    }, null, 2) + "\n");
  }
  writeFileSync(join(dir, ".gitignore"), "node_modules/\ndist/\n");
  writeFileSync(join(dir, "README.md"), `# ${basename(dir)}

1. \`${file}\` లో మీ వివరాలు నింపండి / Fill in \`${file}\`
2. ఫోటోలు \`photos/\` లో పెట్టండి / Put photos in \`photos/\`
3. \`npm install\` తర్వాత \`npm run build\`
4. \`dist/\` folder ను Vercel / Netlify / GitHub Pages లో ప్రచురించండి

Form కావాలంటే / Prefer a form: \`npm run studio\`
`);
  return { dir, file };
}

try {
  if (cmd === "init") {
    const { dir, file } = init(positional[0], flag("type") || "wedding");
    console.log(`✓ ${dir}
  1. ${file} లో మీ వివరాలు నింపండి / fill in ${file}
  2. ఫోటోలు photos/ లో పెట్టండి / put photos in photos/
  3. cd ${basename(dir)} && npm install && npm run build`);
  } else if (cmd === "build") {
    const dir = resolve(positional[0] || ".");
    const r = await build(dir);
    console.log(`✓ ${r.configFile} → ${r.outDir} (${r.files.length} files, version ${r.version})`);
    for (const w of r.warnings) console.log(`  ⚠ ${w}`);
  } else if (cmd === "studio") {
    const dir = resolve(positional[0] || ".");
    try { findConfig(dir); } catch { init(dir, flag("type") || "wedding"); }
    try { await build(dir); } catch { /* తప్పులుంటే Studio లోనే చూపిస్తాం */ }
    const port = Number(flag("port") || 4321);
    await startStudio(dir, { port });
    console.log(`✓ శుభలేఖ Studio: http://localhost:${port}\n  Browser లో ఈ address తెరవండి / Open this address in your browser. Stop: Ctrl+C`);
  } else if (cmd === "--version" || cmd === "-v") {
    console.log(VERSION);
  } else {
    help();
    if (cmd && cmd !== "help" && cmd !== "--help") process.exitCode = 1;
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exitCode = 1;
}
