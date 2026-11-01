// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · src/worker/worker.ts
// Web Worker entry. Bundled by scripts/build-worker.mjs into a string
// (workerSource.ts) and started from a blob: URL, so sites host nothing extra.
// ─────────────────────────────────────────────────────────────────────────────

import * as Comlink from "comlink"
import { Backend } from "./backend"

Comlink.expose(new Backend())
