// The app's core: Rust compiled to WebAssembly (rust/src/lib.rs → public/wasm/core.wasm).
// If the .wasm is not there (Rust not installed, or the build skipped it), the same
// functions run in TypeScript, so the app always works.
export type Engine = "rust" | "ts";
type Core = { engine: Engine; countWords: (text: string) => number };

// Same separators as rust/src/lib.rs: spaces, ASCII punctuation, “ ” ‘ ’ — – … । ॥
const SEP = /[\s!-/:-@[-`{-~“”‘’—–…।॥]+/u;
export function countWordsTs(text: string): number {
  return text.split(SEP).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

type Exports = {
  memory: WebAssembly.Memory;
  alloc: (len: number) => number;
  dealloc: (ptr: number, len: number) => void;
  count_words_utf8: (ptr: number, len: number) => number;
};

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
let loading: Promise<Core> | null = null;

async function loadRust(): Promise<Core> {
  const res = await fetch(`${base}/wasm/core.wasm`);
  if (!res.ok) throw new Error("no wasm");
  const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {});
  const w = instance.exports as unknown as Exports;
  const enc = new TextEncoder();
  return {
    engine: "rust",
    countWords(text) {
      const bytes = enc.encode(text);
      if (!bytes.length) return 0;
      const ptr = w.alloc(bytes.length);
      try {
        new Uint8Array(w.memory.buffer, ptr, bytes.length).set(bytes);
        return w.count_words_utf8(ptr, bytes.length);
      } finally {
        w.dealloc(ptr, bytes.length);
      }
    },
  };
}

export function loadCore(): Promise<Core> {
  loading ??= loadRust().catch(() => ({ engine: "ts" as const, countWords: countWordsTs }));
  return loading;
}
