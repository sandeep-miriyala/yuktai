// yuktai dev / yuktai build, run inside an app.
// When the app has rust/Cargo.toml: build it for WebAssembly and copy the .wasm into public/wasm/.
// Then hand over to Next.js. Without Rust installed the app still works (TypeScript fallback).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { c, step, warn } from "./ui.mjs";

const win = process.platform === "win32";

function crateName(cargoToml) {
  const m = readFileSync(cargoToml, "utf8").match(/^\s*name\s*=\s*"([^"]+)"/m);
  return m ? m[1].replace(/-/g, "_") : null;
}

/** Returns true when public/wasm/<crate>.wasm is ready. */
export function buildRust(cwd = process.cwd(), { required = false } = {}) {
  const cargoToml = join(cwd, "rust", "Cargo.toml");
  if (!existsSync(cargoToml)) return false;
  const crate = crateName(cargoToml);
  const target = "wasm32-unknown-unknown";
  const r = spawnSync("cargo", ["build", "--release", "--target", target, "--manifest-path", cargoToml], { cwd, stdio: "inherit", shell: win });
  if (r.status !== 0) {
    const msg = `Rust → WebAssembly did not build. The app uses its TypeScript fallback.
      Install Rust: ${c.cyan("https://rustup.rs")}  then  ${c.cyan(`rustup target add ${target}`)}`;
    if (required) throw new Error(msg);
    warn(msg);
    return false;
  }
  const outDir = join(cwd, "rust", "target", target, "release");
  const wasm = readdirSync(outDir).find((f) => f === `${crate}.wasm`) ?? readdirSync(outDir).find((f) => f.endsWith(".wasm"));
  mkdirSync(join(cwd, "public", "wasm"), { recursive: true });
  copyFileSync(join(outDir, wasm), join(cwd, "public", "wasm", "core.wasm"));
  step(`Rust → WebAssembly: public/wasm/core.wasm`);
  return true;
}

function next(args, cwd = process.cwd()) {
  const bin = join(cwd, "node_modules", ".bin", win ? "next.cmd" : "next");
  if (!existsSync(bin)) throw new Error(`Next.js is not installed here. Run "npm install" first.`);
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { cwd, stdio: "inherit", shell: win });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`next ${args[0]} stopped (exit ${code})`))));
  });
}

export async function dev(args) {
  buildRust();
  await next(["dev", ...args]);
}

export async function build(args) {
  // --rust-required: fail the build when Rust can't be built (for CI that must ship the WASM)
  const required = args.includes("--rust-required");
  buildRust(process.cwd(), { required });
  await next(["build", ...args.filter((a) => a !== "--rust-required")]);
}
