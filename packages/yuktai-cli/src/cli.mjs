// yuktai: the command line for YuktAI apps.
//   yuktai init [name]   create a new app (asks a few questions, or --yes for defaults)
//   yuktai dev           Rust → WebAssembly (when there is a rust/ folder), then next dev
//   yuktai build         Rust → WebAssembly, then next build (static files in out/)
import { readFileSync } from "node:fs";
import { init } from "./init.mjs";
import { build, dev } from "./run.mjs";
import { c } from "./ui.mjs";

const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const HELP = `
  ${c.bold("yuktai")} ${VERSION}: accessible, AI-in-the-browser web apps

  ${c.bold("Usage")}
    npx yuktai init my-app          create an app (asks a few questions)
    npx yuktai init my-app --yes    create with the defaults
    yuktai dev                      run locally (Rust → WASM, then Next.js)
    yuktai build                    build static files into out/

  ${c.bold("init options")}
    --stack next-rust|next          default: next-rust
    --template starter|docs         default: starter
    --features grid,page-tools      extra features (Ask, accessibility and PWA are always on)
    --host netlify|github-pages|none   default: netlify
    --accent violet|blue|teal|orange   default: violet
    --title "My App"                site title
    --no-install                    skip npm install
    --no-git                        skip git init
    --yes, -y                       use defaults for anything not given

  Docs: https://yuktaidocs.netlify.app
`;

export async function main(argv) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") return void console.log(HELP);
  if (cmd === "--version" || cmd === "-v") return void console.log(VERSION);
  if (cmd === "init" || cmd === "create") return init(rest, VERSION);
  if (cmd === "dev") return dev(rest);
  if (cmd === "build") return build(rest);
  throw new Error(`Unknown command "${cmd}". Run "npx yuktai help".`);
}
