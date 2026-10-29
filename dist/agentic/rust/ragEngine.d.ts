import { type GridEngine } from "../../grid/rust/engine";
/** `engine: "auto"` switches the RAG search to Rust from this many passages. */
export declare const RAG_AUTO_MIN_PASSAGES = 1000;
export declare function wantsRustRag(engine: GridEngine | undefined, passages: number): boolean;
/** Compiles the RAG engine once per page; resolves null without WebAssembly. */
export declare function loadRagCore(): Promise<WebAssembly.Module | null>;
export declare function getLoadedRagCore(): WebAssembly.Module | null;
export interface RagHit {
    /** Passage position, as given to build() */
    doc: number;
    score: number;
}
/** One index per RagCore (each has its own WebAssembly memory). */
export declare class RagCore {
    private readonly x;
    private readonly encoder;
    private docs;
    private ready;
    private constructor();
    static create(mod?: WebAssembly.Module | null): RagCore | null;
    /**
     * Indexes the passages: one array of tokenize() words per passage.
     * Returns false if Rust could not take it (TypeScript is then used).
     */
    build(docs: string[][]): boolean;
    /**
     * Best passages for the question words `terms` (tokenize() output), with
     * `idf[i]` per word and `avgDiv` = average passage length (or 1).
     * Null means "use TypeScript".
     */
    search(terms: string[], idf: number[], avgDiv: number, k: number): RagHit[] | null;
}
