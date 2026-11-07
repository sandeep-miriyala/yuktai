// The Python (FastAPI) backend in backend/: find Python, keep a private virtual
// environment in backend/.venv, install requirements once, run it, test it.
// Everything is optional: without Python the site still runs on its own.
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { run, runSync, win } from "./proc.mjs";
import { c, info, step, warn } from "./ui.mjs";

export const hasApi = (cwd = process.cwd()) => existsSync(join(cwd, "backend", "app", "main.py"));

/** The API port: API_PORT in backend/.env, else 8000. */
export function apiPort(cwd = process.cwd()) {
  const env = join(cwd, "backend", ".env");
  if (existsSync(env)) {
    const m = readFileSync(env, "utf8").match(/^\s*API_PORT\s*=\s*(\d+)/m);
    if (m) return Number(m[1]);
  }
  return Number(process.env.API_PORT) || 8000;
}

/** A Python 3.10+ on this computer: "py -3" on Windows, else python3 / python. */
function findPython() {
  const tries = win ? [["py", ["-3"]], ["python", []], ["python3", []]] : [["python3", []], ["python", []]];
  for (const [cmd, pre] of tries) {
    const r = runSync(cmd, [...pre, "-c", "import sys; print(sys.version_info[0]*100+sys.version_info[1])"], { encoding: "utf8" });
    if (r.status === 0 && Number(String(r.stdout).trim()) >= 310) return [cmd, pre];
  }
  return null;
}

const venvPython = (cwd) => join(cwd, "backend", ".venv", win ? "Scripts\\python.exe" : "bin/python");

/**
 * backend/.venv with the requirements installed. Installs again only when the
 * requirements file is newer than the last install. Returns the venv's python, or null.
 */
export function ensureApiEnv(cwd = process.cwd(), { dev = false } = {}) {
  const backend = join(cwd, "backend");
  const py = venvPython(cwd);
  if (!existsSync(py)) {
    const found = findPython();
    if (!found) {
      warn(`Python 3.10 or newer was not found, so the API in backend/ is not running. The site works without it.
      Install Python: ${c.cyan("https://www.python.org/downloads/")} (Windows: tick "Add python.exe to PATH")`);
      return null;
    }
    info("Setting up the Python API (once): backend/.venv");
    const [cmd, pre] = found;
    if (runSync(cmd, [...pre, "-m", "venv", ".venv"], { cwd: backend, stdio: "inherit" }).status !== 0) {
      warn("Could not make backend/.venv. The site still runs; the API does not.");
      return null;
    }
  }
  const req = join(backend, dev ? "requirements-dev.txt" : "requirements.txt");
  const stamp = join(backend, ".venv", dev ? ".installed-dev" : ".installed");
  const fresh = existsSync(stamp) && statSync(stamp).mtimeMs >= statSync(req).mtimeMs;
  if (!fresh) {
    info(`Installing Python packages from backend/${dev ? "requirements-dev.txt" : "requirements.txt"}…`);
    const r = runSync(py, ["-m", "pip", "install", "--disable-pip-version-check", "-q", "-r", req], { cwd: backend, stdio: "inherit" });
    if (r.status !== 0) {
      warn("pip install did not finish (are you online?). The site still runs; the API does not.");
      return null;
    }
    writeFileSync(stamp, new Date().toISOString());
  }
  return py;
}

/** True when nothing is listening on this port yet. */
function portFree(port) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port, "127.0.0.1");
  });
}

/**
 * Starts the API with auto-reload on API_PORT (8000), or the next free port when another
 * app already uses it. Returns { stop, url }, or null when it can't run.
 */
export async function startApi(cwd = process.cwd()) {
  if (!hasApi(cwd)) return null;
  const py = ensureApiEnv(cwd);
  if (!py) return null;
  const wanted = apiPort(cwd);
  let port = wanted;
  while (!(await portFree(port)) && port < wanted + 20) port++;
  if (port !== wanted) warn(`Port ${wanted} is busy (another app?), so the Python API uses ${port}.`);
  const child = run(py, ["-m", "uvicorn", "app.main:app", "--reload", "--port", String(port)], { cwd: join(cwd, "backend"), stdio: "inherit" });
  const url = `http://localhost:${port}`;
  step(`Python API: ${c.cyan(`${url}/docs`)}`);
  child.on("exit", (code) => {
    if (code && code !== 0) warn(`The Python API stopped (exit ${code}). The site keeps running.`);
  });
  const stop = () => {
    if (child.exitCode !== null) return;
    // on Windows the API runs inside a shell: stop the whole process tree
    if (win) runSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  };
  return { stop, url };
}

/** yuktai api: the API on its own, until Ctrl + C. */
export async function api() {
  if (!hasApi()) throw new Error("This app has no backend/ folder. Create one with: npx yuktai init my-app --features backend");
  const started = await startApi();
  if (!started) throw new Error("The Python API could not start (see above).");
  const stop = started.stop;
  await new Promise((resolve) => {
    const end = () => { stop(); resolve(); };
    process.once("SIGINT", end);
    process.once("SIGTERM", end);
  });
}

/** yuktai api-test: pytest for backend/. */
export async function apiTest(args) {
  if (!hasApi()) throw new Error("This app has no backend/ folder.");
  const py = ensureApiEnv(process.cwd(), { dev: true });
  if (!py) throw new Error("Python is needed for the API tests (see above).");
  const r = runSync(py, ["-m", "pytest", "-q", ...args], { cwd: join(process.cwd(), "backend"), stdio: "inherit" });
  if (r.status !== 0) throw new Error("API tests failed.");
}

/** Runs a Python module from backend/ with the venv (developer agents). */
function runModule(module, args, dev) {
  if (!hasApi()) throw new Error("This app has no backend/ folder.");
  const py = ensureApiEnv(process.cwd(), { dev });
  if (!py) throw new Error("Python is needed for this (see above).");
  const r = runSync(py, ["-m", module, ...args], { cwd: join(process.cwd(), "backend"), stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${module} stopped (exit ${r.status}).`);
}

/** yuktai agent-test: the Testing Agent runs the checks and explains failures. */
export async function agentTest(args) {
  runModule("app.agents.testing", args, true);
}

/** yuktai assistant: the YuktAI Assistant (add pages and API endpoints, answer how-to questions). */
export async function assistant() {
  runModule("app.agents.assistant", [], false);
}
