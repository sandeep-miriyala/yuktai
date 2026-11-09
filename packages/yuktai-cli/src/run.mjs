// yuktai dev / yuktai build, run inside an app.
// When the app has rust/Cargo.toml: build it for WebAssembly and copy the .wasm into public/wasm/.
// Then hand over to Next.js. Without Rust installed the app still works (TypeScript fallback).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { delimiter, join } from "node:path";
import { homedir } from "node:os";
import { run, runSync, win } from "./proc.mjs";
import { startApi } from "./api.mjs";
import { ensureNextConfig } from "./nextConfig.mjs";
import { c, info, step, warn } from "./ui.mjs";

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
  const r = runSync("cargo", ["build", "--release", "--target", target, "--manifest-path", cargoToml], { cwd, stdio: "inherit" });
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

function next(args, cwd = process.cwd(), onStart = () => {}) {
  const bin = join(cwd, "node_modules", ".bin", win ? "next.cmd" : "next");
  if (!existsSync(bin)) throw new Error(`Next.js is not installed here. Run "npm install" first.`);
  return new Promise((resolve, reject) => {
    const p = run(bin, args, { cwd, stdio: "inherit" });
    onStart(p);
    p.on("exit", (code, signal) => (code === 0 || signal ? resolve() : reject(new Error(`next ${args[0]} stopped (exit ${code})`))));
  });
}

/** Stops a child and everything it started (Windows runs it inside a shell). */
function stopChild(p) {
  if (!p || p.exitCode !== null || p.signalCode !== null) return;
  if (win) runSync("taskkill", ["/pid", String(p.pid), "/T", "/F"], { stdio: "ignore" });
  else p.kill("SIGTERM");
}

// One command for everything: Rust → WebAssembly, the Python API (backend/) and Next.js.
// --no-api skips the Python API.
export async function dev(args) {
  buildRust();
  const removeConfig = ensureNextConfig();
  const api = args.includes("--no-api") ? null : await startApi();
  const stopApi = api?.stop;
  // the site calls the API where it really started (8001… when 8000 was busy)
  if (api && !process.env.NEXT_PUBLIC_API_URL) process.env.NEXT_PUBLIC_API_URL = api.url;
  let site = null;
  // Ctrl + C (or closing the terminal) stops the site and the API together
  const stopAll = () => { stopApi?.(); stopChild(site); removeConfig(); };
  process.once("SIGINT", stopAll);
  process.once("SIGTERM", stopAll);
  try {
    await next(["dev", ...args.filter((a) => a !== "--no-api")], process.cwd(), (p) => { site = p; });
  } finally {
    stopApi?.();
    removeConfig();
  }
}

/**
 * --setup-rust: hosts whose build machines have no Rust (Vercel) install a minimal toolchain
 * with the official rustup installer, then add the WebAssembly target. Only for apps with
 * rust/Cargo.toml. Returns false when Rust is still missing; the build then uses TypeScript.
 */
export function setupRust(cwd = process.cwd()) {
  if (!existsSync(join(cwd, "rust", "Cargo.toml"))) return false;
  const cargoBin = join(process.env.CARGO_HOME || join(homedir(), ".cargo"), "bin");
  const path = process.env.PATH ?? "";
  if (!path.split(delimiter).includes(cargoBin)) process.env.PATH = cargoBin + delimiter + path;
  const has = (cmd) => runSync(cmd, ["--version"], { stdio: "ignore" }).status === 0;
  if (!has("cargo")) {
    if (win) {
      warn(`Rust is not installed. Install it from ${c.cyan("https://rustup.rs")}; the build uses TypeScript for now.`);
      return false;
    }
    info("Rust is not installed here: installing a minimal toolchain (rustup.rs)…");
    const r = runSync("sh", ["-c", "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable --no-modify-path"], { cwd, stdio: "inherit" });
    if (r.status !== 0 || !has("cargo")) {
      warn("Rust could not be installed. The build goes on with the TypeScript engine.");
      return false;
    }
  }
  if (has("rustup")) runSync("rustup", ["target", "add", "wasm32-unknown-unknown"], { cwd, stdio: "inherit" });
  return true;
}

export async function build(args) {
  // --rust-required: fail the build when Rust can't be built (for CI that must ship the WASM)
  // --setup-rust: install Rust first when it is missing (Vercel)
  const required = args.includes("--rust-required");
  if (args.includes("--setup-rust")) setupRust();
  buildRust(process.cwd(), { required });
  const removeConfig = ensureNextConfig();
  try {
    await next(["build", ...args.filter((a) => a !== "--rust-required" && a !== "--setup-rust")]);
  } finally {
    removeConfig();
  }
}
