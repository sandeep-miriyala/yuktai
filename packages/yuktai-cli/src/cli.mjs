// yuktai: the command line for YuktAI apps.
//   yuktai init [name]   create a new app (asks a few questions, or --yes for defaults)
//   yuktai dev           Rust → WebAssembly, the Python API (backend/) and next dev, together
//   yuktai build         Rust → WebAssembly, then next build (static files in out/)
//   yuktai api           the Python API on its own
//   yuktai api-test      the Python API's tests (pytest)
//   yuktai agent-test    Testing Agent · yuktai assistant: YuktAI Assistant
import { readFileSync } from "node:fs";
import { init } from "./init.mjs";
import { build, dev } from "./run.mjs";
import { agentTest, api, apiTest, assistant } from "./api.mjs";
import { c } from "./ui.mjs";

const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const HELP = `
  ${c.bold("yuktai")} ${VERSION}: accessible, agentic web apps. Rust speed, Indian languages, one command.

  ${c.bold("Usage")}
    npx yuktai init my-app          create an app (asks a few questions)
    npx yuktai init my-app --yes    create with everything on (docs, grid, QA report, icons, Python API)
    yuktai dev                      run locally: Rust → WASM, the Python API and Next.js together
    yuktai dev --no-api             the same without the Python API
    yuktai build                    build static files into out/
    yuktai build --setup-rust       install Rust first when it is missing (used on Vercel)
    yuktai api                      the Python API on its own (http://localhost:8000/docs)
    yuktai api-test                 the Python API's tests (pytest)
    yuktai agent-test               Testing Agent: runs every check, explains what failed
    yuktai assistant                YuktAI Assistant: add pages and API endpoints, ask how-to

  ${c.bold("init options")}
    --stack next-rust|next          default: next-rust
    --template docs|starter         default: docs
    --features grid,page-tools,icons,backend   default: all (Ask, accessibility and PWA are always on)
    --features none                 none of them
    --host github-pages|vercel|netlify|none   default: github-pages
    --accent blue|violet|teal|orange   default: blue
    --title "My App"                site title
    --no-install                    skip npm install
    --no-git                        skip git init
    --yes, -y                       use defaults for anything not given

  Docs: https://sandeep-miriyala.github.io/yuktai/
`;

export async function main(argv) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") return void console.log(HELP);
  if (cmd === "--version" || cmd === "-v") return void console.log(VERSION);
  if (cmd === "init" || cmd === "create") return init(rest, VERSION);
  if (cmd === "dev") return dev(rest);
  if (cmd === "build") return build(rest);
  if (cmd === "api") return api();
  if (cmd === "api-test") return apiTest(rest);
  if (cmd === "agent-test") return agentTest(rest);
  if (cmd === "assistant") return assistant();
  throw new Error(`Unknown command "${cmd}". Run "npx yuktai help".`);
}
