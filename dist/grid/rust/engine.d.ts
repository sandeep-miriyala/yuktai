/** Which engine sorts and searches the grid. */
export type GridEngine = "ts" | "rust" | "auto";
/** `engine: "auto"` switches to Rust from this many rows. */
export declare const RUST_AUTO_MIN_ROWS = 10000;
/** Joins a row's column values for search. Queries containing it fall back to TypeScript. */
export declare const SEARCH_SEPARATOR = "\0";
export declare function wantsRustEngine(engine: GridEngine | undefined, rowCount: number): boolean;
/** Decodes an embedded WebAssembly module (browser atob, or Node Buffer). */
export declare function decodeBase64(b64: string): Uint8Array;
/**
 * Compiles the Rust engine once per page. Resolves `null` when WebAssembly is
 * not available; the grid then simply keeps using TypeScript.
 */
export declare function loadGridCore(): Promise<WebAssembly.Module | null>;
/** The compiled engine if `loadGridCore()` has already finished, else null. */
export declare function getLoadedGridCore(): WebAssembly.Module | null;
/**
 * One engine per grid. Holds that grid's search text inside the WebAssembly
 * memory, so each keystroke only sends the query.
 */
export declare class GridCore {
    private readonly x;
    private readonly base;
    private readonly encoder;
    private offsetsPtr;
    private textPtr;
    private textLen;
    private rows;
    private hasIndex;
    private freePtr;
    private constructor();
    /** Creates an engine from a compiled module (default: the one already loaded). */
    static create(mod?: WebAssembly.Module | null): GridCore | null;
    private ensure;
    /**
     * Stores one search text per row (the grid joins its columns with
     * SEARCH_SEPARATOR). Returns false when Rust can't match TypeScript
     * exactly for this data; the grid then searches in TypeScript.
     */
    setSearchTexts(texts: string[]): boolean;
    /**
     * Positions (in the array given to setSearchTexts) of the rows whose text
     * contains `query`, in original order. Null means "use TypeScript".
     */
    search(query: string): Uint32Array | null;
    /**
     * Row positions sorted by `keys` (NaN = empty, always last; equal keys keep
     * their order). Null means "use TypeScript".
     */
    sortByKeys(keys: Float64Array, desc: boolean): Uint32Array | null;
}
/** "0.9 ms", "12 ms", "<0.1 ms" — for search time labels. */
export declare function formatSearchTime(ms: number): string;
/** Picks `rows[i]` for each position, keeping the given order. */
export declare function pickRows<T>(rows: readonly T[], positions: Uint32Array): T[];
