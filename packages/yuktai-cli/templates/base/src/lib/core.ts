// The app's "core": small, fast functions. In a Next.js + Rust app this file loads
// rust/ compiled to WebAssembly; here it is plain TypeScript.
export type Engine = "rust" | "ts";

/** Words in a text (any script: Latin, Telugu, Devanagari, …). */
export function countWordsTs(text: string): number {
  return text.split(/[\s\p{P}]+/u).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export async function loadCore(): Promise<{ engine: Engine; countWords: (text: string) => number }> {
  return { engine: "ts", countWords: countWordsTs };
}
