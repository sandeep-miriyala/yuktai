// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · rust/rag-core/src/lib.rs (WebAssembly build)
//
// The EXISTING page + data RAG search (createContextIndex, used by the "Ask
// page" tool after askAboutPage), in Rust (WebAssembly). Same BM25 scores,
// same passages, same order — only faster:
//
//   TypeScript today: every question scans every word of every passage.
//   Rust: an inverted index jumps straight to the passages that contain the
//   question's words (and their prefix forms), then scores only those.
//
// Rules stay in TypeScript: it tokenizes the text (Telugu-aware) and computes
// each question word's idf with Math.log, so the numbers are bit-for-bit the
// ones TypeScript would get. Rust does the counting and the BM25 arithmetic,
// in exactly the same order of operations.
//
// Matching rule (unchanged): passage word t counts for question word q when
//   t == q,  or  len(q) >= 4 and t starts with q,  or  len(t) >= 4 and q
//   starts with t       (lengths in UTF-16 units, like JavaScript's .length)
// ─────────────────────────────────────────────────────────────────────────────
//
// The engine itself lives in the published `yuktai` crate
// (rust/yuktai/src/rag.rs). This crate compiles that same file and adds the
// WebAssembly entry points below, so the browser and crates.io never drift.
// ─────────────────────────────────────────────────────────────────────────────

#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

#[path = "../../yuktai/src/rag.rs"]
mod engine;
pub use engine::*;

// ─────────────────────────────────────────────────────────────────────────────
// WebAssembly: a tiny bump allocator and the entry points used by
// src/agentic/rust/ragEngine.ts. One module instance = one index.
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(target_arch = "wasm32")]
mod wasm {
    use super::Index;
    use alloc::vec::Vec;
    use core::alloc::{GlobalAlloc, Layout};
    use core::arch::wasm32;
    use core::ptr::{addr_of, addr_of_mut, null_mut};
    use core::slice;

    const PAGE: usize = 65536;

    extern "C" {
        static __heap_base: u8;
    }

    #[allow(unused_unsafe)] // needed by Rust < 1.82
    fn heap_base() -> usize {
        // SAFETY: only the address is taken.
        unsafe { addr_of!(__heap_base) as usize }
    }

    static mut NEXT: usize = 0;

    /// Memory is handed out in order and given back all at once by
    /// yk_rag_reset(), which is all an index that is rebuilt as a whole needs.
    struct Bump;

    unsafe impl GlobalAlloc for Bump {
        unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
            if NEXT == 0 {
                NEXT = heap_base();
            }
            let start = (NEXT + layout.align() - 1) & !(layout.align() - 1);
            let end = match start.checked_add(layout.size()) {
                Some(e) => e,
                None => return null_mut(),
            };
            let have = wasm32::memory_size(0) * PAGE;
            if end > have && wasm32::memory_grow(0, (end - have).div_ceil(PAGE)) == usize::MAX {
                return null_mut();
            }
            NEXT = end;
            start as *mut u8
        }

        unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
            // Only the most recent block can be given back early.
            if ptr as usize + layout.size() == NEXT {
                NEXT = ptr as usize;
            }
        }

        unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
            // Grow the most recent block in place (keeps big Vec pushes cheap)
            if ptr as usize + layout.size() == NEXT {
                let end = ptr as usize + new_size;
                let have = wasm32::memory_size(0) * PAGE;
                if end > have && wasm32::memory_grow(0, (end - have).div_ceil(PAGE)) == usize::MAX {
                    return null_mut();
                }
                NEXT = end;
                return ptr;
            }
            let new = self.alloc(Layout::from_size_align_unchecked(new_size, layout.align()));
            if !new.is_null() {
                core::ptr::copy_nonoverlapping(ptr, new, layout.size().min(new_size));
            }
            new
        }
    }

    #[global_allocator]
    static ALLOC: Bump = Bump;

    struct State {
        index: Option<Index>,
        scratch: Vec<u8>,
    }

    static mut STATE: State = State { index: None, scratch: Vec::new() };

    #[allow(unused_unsafe)]
    fn state() -> &'static mut State {
        // SAFETY: WebAssembly here is single-threaded and calls never overlap.
        unsafe { &mut *addr_of_mut!(STATE) }
    }

    #[no_mangle]
    pub extern "C" fn yk_rag_version() -> u32 {
        1
    }

    /// Frees everything (the old index and scratch) before a rebuild.
    #[no_mangle]
    pub extern "C" fn yk_rag_reset() {
        let s = state();
        core::mem::forget(s.index.take());
        core::mem::forget(core::mem::take(&mut s.scratch));
        // SAFETY: nothing allocated before this point is used again.
        unsafe { NEXT = heap_base() };
    }

    /// A buffer of at least `size` bytes for TypeScript to write inputs into
    /// (and read outputs from). Stays valid until the next call that grows it.
    #[no_mangle]
    pub extern "C" fn yk_rag_scratch(size: u32) -> u32 {
        let s = state();
        let size = size as usize + 8;
        if s.scratch.len() < size {
            s.scratch.resize(size, 0);
        }
        (s.scratch.as_mut_ptr() as usize + 7 & !7) as u32
    }

    /// Builds the index from `len` bytes at `ptr`. Returns the number of
    /// distinct words.
    ///
    /// # Safety
    /// `ptr..ptr+len` must be inside the scratch buffer. ragEngine.ts does this.
    #[no_mangle]
    pub unsafe extern "C" fn yk_rag_build(ptr: u32, len: u32, docs: u32) -> u32 {
        let text = slice::from_raw_parts(ptr as *const u8, len as usize);
        let index = Index::build(text, docs as usize);
        let words = index.words() as u32;
        state().index = Some(index);
        words
    }

    /// Returns how many passages were written to out_doc / out_score.
    ///
    /// # Safety
    /// All regions must be inside the scratch buffer and not overlap.
    #[no_mangle]
    pub unsafe extern "C" fn yk_rag_search(
        terms: u32,
        terms_len: u32,
        idf: u32,
        n_terms: u32,
        avg_div: f64,
        k: u32,
        out_doc: u32,
        out_score: u32,
    ) -> u32 {
        let s = state();
        let Some(index) = s.index.as_mut() else { return 0 };
        let terms = slice::from_raw_parts(terms as *const u8, terms_len as usize);
        let idf = slice::from_raw_parts(idf as *const f64, n_terms as usize);
        let out_doc = slice::from_raw_parts_mut(out_doc as *mut u32, k as usize);
        let out_score = slice::from_raw_parts_mut(out_score as *mut f64, k as usize);
        index.search_into(terms, idf, avg_div, out_doc, out_score) as u32
    }

    #[panic_handler]
    fn panic(_: &core::panic::PanicInfo) -> ! {
        wasm32::unreachable()
    }
}
