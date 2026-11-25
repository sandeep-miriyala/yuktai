// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · rust/ask-core/src/lib.rs (WebAssembly build)
//
// The search core behind Ask page. Everything that has to be fast runs here:
//
//   1. Tokenizer   Telugu-aware: vowel signs, viramas and ZWJ/ZWNJ stay inside
//                  the word, Latin is lower-cased, English and Telugu question
//                  words ("what", "ఎలా") are dropped.
//   2. BM25        inverted index; a question word also matches longer words
//                  that start with it (రత్న → రత్నం, install → installation)
//                  and shorter words it starts with, both from 4 letters up.
//   3. Vectors     embeddings stored as int8 (4x smaller), cosine by dot
//                  product (vectors arrive normalized).
//   4. Hybrid      Reciprocal Rank Fusion (k = 60) of the BM25 and vector
//                  rankings.
//   5. Confidence  for every hit: how many question words it covers and its
//                  cosine, so the caller can say "this page doesn't answer
//                  that" instead of guessing.
//
// no_std + alloc only, so the .wasm stays small and imports nothing.
// ─────────────────────────────────────────────────────────────────────────────
//
// The engine itself lives in the published `yuktai` crate
// (rust/yuktai/src/ask.rs). This crate compiles that same file and adds the
// WebAssembly entry points below, so the browser and crates.io never drift.
// ─────────────────────────────────────────────────────────────────────────────

#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

#[path = "../../yuktai/src/ask.rs"]
mod engine;
pub use engine::*;

// ─────────────────────────────────────────────────────────────────────────────
// WebAssembly: a bump allocator and the entry points used by
// packages/ask-page/src/search/wasm.ts. One module instance = one index.
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(target_arch = "wasm32")]
mod wasm {
    use super::{quantize, Index};
    use alloc::vec::Vec;
    use core::alloc::{GlobalAlloc, Layout};
    use core::arch::wasm32;
    use core::ptr::{addr_of, addr_of_mut, null_mut};
    use core::slice;

    const PAGE: usize = 65536;

    extern "C" {
        static __heap_base: u8;
    }

    #[allow(unused_unsafe)]
    fn heap_base() -> usize {
        // SAFETY: only the address is taken.
        unsafe { addr_of!(__heap_base) as usize }
    }

    static mut NEXT: usize = 0;

    /// Hands memory out in order; ak_reset() gives it all back at once, which
    /// is all an index that is rebuilt as a whole needs.
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
            if ptr as usize + layout.size() == NEXT {
                NEXT = ptr as usize;
            }
        }

        unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
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
        // SAFETY: single-threaded, calls never overlap.
        unsafe { &mut *addr_of_mut!(STATE) }
    }

    fn index() -> &'static mut Index {
        let s = state();
        if s.index.is_none() {
            s.index = Some(Index::new());
        }
        s.index.as_mut().unwrap()
    }

    #[no_mangle]
    pub extern "C" fn ak_version() -> u32 {
        1
    }

    /// Frees the index and scratch; the next call starts an empty index.
    #[no_mangle]
    pub extern "C" fn ak_reset() {
        let s = state();
        core::mem::forget(s.index.take());
        core::mem::forget(core::mem::take(&mut s.scratch));
        // SAFETY: nothing allocated before this point is used again.
        unsafe { NEXT = heap_base() };
    }

    /// A buffer of at least `size` bytes, 8-byte aligned, for inputs and outputs.
    #[no_mangle]
    pub extern "C" fn ak_scratch(size: u32) -> u32 {
        let s = state();
        let size = size as usize + 8;
        if s.scratch.len() < size {
            s.scratch.resize(size, 0);
        }
        (s.scratch.as_mut_ptr() as usize + 7 & !7) as u32
    }

    /// Adds one passage (UTF-8 at ptr). Returns its id.
    ///
    /// # Safety
    /// `ptr..ptr+len` must be valid UTF-8 inside the scratch buffer.
    #[no_mangle]
    pub unsafe extern "C" fn ak_add(ptr: u32, len: u32) -> u32 {
        let bytes = slice::from_raw_parts(ptr as *const u8, len as usize);
        let text = core::str::from_utf8(bytes).unwrap_or("");
        index().add(text)
    }

    #[no_mangle]
    pub extern "C" fn ak_docs() -> u32 {
        index().docs() as u32
    }

    /// Quantizes `n` f32 vectors of `dim` into int8 + one f32 scale each.
    ///
    /// # Safety
    /// All regions must be inside the scratch buffer and not overlap.
    #[no_mangle]
    pub unsafe extern "C" fn ak_quantize(src: u32, n: u32, dim: u32, out: u32, scales: u32) {
        let total = (n * dim) as usize;
        let v = slice::from_raw_parts(src as *const f32, total);
        let o = slice::from_raw_parts_mut(out as *mut i8, total);
        let s = slice::from_raw_parts_mut(scales as *mut f32, n as usize);
        quantize(v, dim as usize, o, s);
    }

    /// Stores int8 vectors for the passages (one per passage).
    ///
    /// # Safety
    /// Regions must be inside the scratch buffer.
    #[no_mangle]
    pub unsafe extern "C" fn ak_set_vectors(vecs: u32, scales: u32, n: u32, dim: u32) {
        let v = slice::from_raw_parts(vecs as *const i8, (n * dim) as usize);
        let s = slice::from_raw_parts(scales as *const f32, n as usize);
        index().set_vectors(v, s, dim as usize);
    }

    /// Searches. `qvec` = 0 or a pointer to `dim` f32. Writes up to `k` hits
    /// to `out` as 5 f64 each: doc, fused, bm25, cosine, coverage. Returns the
    /// hit count; ak_terms() then gives the question's word count.
    ///
    /// # Safety
    /// Regions must be inside the scratch buffer and not overlap.
    #[no_mangle]
    pub unsafe extern "C" fn ak_search(q: u32, q_len: u32, qvec: u32, dim: u32, mode: u32, k: u32, out: u32) -> u32 {
        let bytes = slice::from_raw_parts(q as *const u8, q_len as usize);
        let question = core::str::from_utf8(bytes).unwrap_or("");
        let v = if qvec != 0 && dim > 0 { Some(slice::from_raw_parts(qvec as *const f32, dim as usize)) } else { None };
        let hits = index().search(question, v, mode, k as usize);
        let o = slice::from_raw_parts_mut(out as *mut f64, hits.len() * 5);
        for (i, h) in hits.iter().enumerate() {
            o[i * 5] = h.doc as f64;
            o[i * 5 + 1] = h.fused;
            o[i * 5 + 2] = h.bm25;
            o[i * 5 + 3] = h.cosine;
            o[i * 5 + 4] = h.coverage;
        }
        hits.len() as u32
    }

    #[no_mangle]
    pub extern "C" fn ak_terms() -> u32 {
        index().last_terms as u32
    }

    #[panic_handler]
    fn panic(_: &core::panic::PanicInfo) -> ! {
        wasm32::unreachable()
    }
}
