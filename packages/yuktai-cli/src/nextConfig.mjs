// The app keeps one settings file: yuktai.config.ts. Next.js still needs a next.config file
// in the app folder, so `yuktai dev` and `yuktai build` write one just for that run and
// remove it afterwards. An app that has its own next.config.* keeps it untouched.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const NEXT_CONFIG_FILE = "next.config.mjs";
const MARK = "// made by yuktai for this run; your settings live in yuktai.config.ts";
const NAMES = ["next.config.js", "next.config.mjs", "next.config.cjs", "next.config.ts", "next.config.mts"];

export const NEXT_CONFIG = `${MARK}
// Static export: plain files in out/, any free host works. NEXT_PUBLIC_BASE_PATH is set
// for GitHub Pages, where the site lives under /<repo>/.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
};
`;

const ours = (file) => existsSync(file) && readFileSync(file, "utf8").startsWith(MARK);

/** Writes next.config.mjs when the app has none. Returns a function that removes it again. */
export function ensureNextConfig(cwd = process.cwd()) {
  const file = join(cwd, NEXT_CONFIG_FILE);
  const theirs = NAMES.some((n) => existsSync(join(cwd, n)) && !ours(join(cwd, n)));
  if (theirs) return () => {};
  writeFileSync(file, NEXT_CONFIG);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    try {
      if (ours(file)) rmSync(file);
    } catch {
      /* already gone */
    }
  };
}
