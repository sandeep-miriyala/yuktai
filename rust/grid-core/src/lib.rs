// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · rust/grid-core/src/lib.rs (WebAssembly build)
//
// The grid's EXISTING search and number/date sort, in Rust (WebAssembly).
// No new features: the TypeScript grids decide every rule (what is empty,
// what a number or date is, what text is searched) and hand this engine
// plain numbers and text. The engine only does the heavy part:
//
//   sort   — order rows by number keys. Empty (NaN) rows always go LAST, in
//            both directions, and equal rows keep their original order
//            (the same result as JavaScript's stable Array.prototype.sort).
//   search — find the rows whose text contains the query. The text is
//            prepared once per data change, so each keystroke only scans.
//
// No allocator and no dependencies: TypeScript writes the inputs into this
// module's memory (after __heap_base) and reads the answers back.
// ─────────────────────────────────────────────────────────────────────────────
//
// The engine itself lives in the published `yuktai` crate
// (rust/yuktai/src/grid.rs). This crate compiles that same file and adds the
// WebAssembly entry points below, so the browser and crates.io never drift.
// ─────────────────────────────────────────────────────────────────────────────

#![cfg_attr(target_arch = "wasm32", no_std)]

#[path = "../../yuktai/src/grid.rs"]
mod engine;
pub use engine::*;

// ─────────────────────────────────────────────────────────────────────────────
// WebAssembly entry points (called from src/grid/rust/engine.ts)
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(target_arch = "wasm32")]
mod wasm {
    use core::slice;

    /// Engine version, so TypeScript can check it loaded the module it expects.
    #[no_mangle]
    pub extern "C" fn yk_version() -> u32 {
        1
    }

    extern "C" {
        // Set by the linker: the first free byte after the stack and data.
        static __heap_base: u8;
    }

    /// Where TypeScript may start writing inputs. Everything from here up is
    /// unused by Rust, because this engine never allocates.
    #[no_mangle]
    #[allow(unused_unsafe)] // needed by Rust < 1.82, harmless on newer versions
    pub extern "C" fn yk_heap_base() -> u32 {
        // SAFETY: only the address is taken; the byte is never read.
        unsafe { core::ptr::addr_of!(__heap_base) as u32 }
    }

    /// keys: n f64 values (NaN = empty) · out: room for n u32 row positions.
    ///
    /// # Safety
    /// Both pointers must point to `n` valid, non-overlapping values in this
    /// module's memory. engine.ts guarantees this.
    #[no_mangle]
    pub unsafe extern "C" fn yk_sort(keys: *const f64, n: u32, desc: u32, out: *mut u32) {
        let n = n as usize;
        let keys = slice::from_raw_parts(keys, n);
        let out = slice::from_raw_parts_mut(out, n);
        super::sort_by_keys(keys, desc != 0, out);
    }

    /// Returns the number of matching rows written to `out`.
    ///
    /// # Safety
    /// `text` (text_len bytes), `offsets` (rows + 1 values), `query`
    /// (query_len bytes) and `out` (rows values) must be valid regions of this
    /// module's memory, and `out` must not overlap the others. engine.ts
    /// guarantees this.
    #[no_mangle]
    pub unsafe extern "C" fn yk_search(
        text: *const u8,
        text_len: u32,
        offsets: *const u32,
        rows: u32,
        query: *const u8,
        query_len: u32,
        out: *mut u32,
    ) -> u32 {
        let text = slice::from_raw_parts(text, text_len as usize);
        let offsets = slice::from_raw_parts(offsets, rows as usize + 1);
        let query = slice::from_raw_parts(query, query_len as usize);
        let out = slice::from_raw_parts_mut(out, rows as usize);
        super::search(text, offsets, query, out) as u32
    }

    #[panic_handler]
    fn panic(_: &core::panic::PanicInfo) -> ! {
        core::arch::wasm32::unreachable()
    }
}
