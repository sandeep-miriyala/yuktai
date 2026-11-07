#!/usr/bin/env node
// npm create yuktai@latest my-app  →  the same as  npx yuktai@latest init my-app
import { main } from "yuktai/src/cli.mjs";

const args = process.argv.slice(2);
const wantsHelp = args.includes("--help") || args.includes("-h");

main(wantsHelp ? ["help"] : ["init", ...args]).catch((e) => {
  console.error("\n  ✖ " + (e && e.message ? e.message : e));
  process.exit(1);
});
