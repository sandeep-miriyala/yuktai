// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/yuktai · rust/rag-core/src/lib.rs
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

#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

use alloc::vec;
use alloc::vec::Vec;
use core::cmp::Ordering;

/// Length in UTF-16 code units (JavaScript `.length`) of valid UTF-8.
fn utf16_len(s: &[u8]) -> u32 {
    let mut n = 0;
    for &b in s {
        if b & 0xC0 != 0x80 {
            n += if b >= 0xF0 { 2 } else { 1 };
        }
    }
    n
}

fn hash(s: &[u8]) -> u64 {
    // FNV-1a
    let mut h: u64 = 0xcbf2_9ce4_8422_2325;
    for &b in s {
        h ^= b as u64;
        h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
    h
}

/// The search index for one set of passages.
pub struct Index {
    words: Vec<u8>,        // every distinct word, back to back
    word_start: Vec<u32>,  // word w = words[word_start[w]..word_start[w + 1]]
    word_u16: Vec<u32>,    // JavaScript length of each word
    sorted: Vec<u32>,      // word ids in byte order (for prefix ranges)
    table: Vec<u32>,       // open-addressing hash table: word id + 1, 0 = empty
    post_start: Vec<u32>,  // passages of word w = post_*[post_start[w]..post_start[w + 1]]
    post_doc: Vec<u32>,
    post_cnt: Vec<u32>,
    doc_len: Vec<u32>,     // words per passage (duplicates included)
    // per-query scratch, sized at build time so searching never allocates
    tf: Vec<u32>,
    score: Vec<f64>,
    in_hit: Vec<u8>,
    touched: Vec<u32>,
    hits: Vec<u32>,
    stamp: Vec<u32>,
    stamp_now: u32,
    matched: Vec<u32>,
}

impl Index {
    fn word(&self, w: u32) -> &[u8] {
        let w = w as usize;
        &self.words[self.word_start[w] as usize..self.word_start[w + 1] as usize]
    }

    fn lookup(&self, s: &[u8]) -> Option<u32> {
        let mask = self.table.len() - 1;
        let mut i = (hash(s) as usize) & mask;
        loop {
            let slot = self.table[i];
            if slot == 0 {
                return None;
            }
            if self.word(slot - 1) == s {
                return Some(slot - 1);
            }
            i = (i + 1) & mask;
        }
    }

    /// `text`: passages separated by '\n', words inside a passage by ' '
    /// (exactly what TypeScript's tokenize() produced). `docs` = passage count.
    pub fn build(text: &[u8], docs: usize) -> Index {
        let mut ix = Index {
            words: Vec::new(),
            word_start: vec![0],
            word_u16: Vec::new(),
            sorted: Vec::new(),
            table: vec![0; 1024],
            post_start: Vec::new(),
            post_doc: Vec::new(),
            post_cnt: Vec::new(),
            doc_len: vec![0; docs],
            tf: vec![0; docs],
            score: vec![0.0; docs],
            in_hit: vec![0; docs],
            touched: Vec::with_capacity(docs),
            hits: Vec::with_capacity(docs),
            stamp: Vec::new(),
            stamp_now: 0,
            matched: Vec::new(),
        };

        // (word id << 32 | passage) for every word occurrence
        let mut pairs: Vec<u64> = Vec::new();
        for (doc, line) in text.split(|&b| b == b'\n').enumerate() {
            if doc >= docs {
                break;
            }
            for tok in line.split(|&b| b == b' ') {
                if tok.is_empty() {
                    continue;
                }
                let id = match ix.lookup(tok) {
                    Some(id) => id,
                    None => ix.insert(tok),
                };
                pairs.push(((id as u64) << 32) | doc as u64);
                ix.doc_len[doc] += 1;
            }
        }

        // Postings: per word, its passages in order with a count
        pairs.sort_unstable();
        let words = ix.word_start.len() - 1;
        ix.post_start = vec![0; words + 1];
        let mut i = 0;
        while i < pairs.len() {
            let p = pairs[i];
            let mut j = i + 1;
            while j < pairs.len() && pairs[j] == p {
                j += 1;
            }
            ix.post_doc.push(p as u32);
            ix.post_cnt.push((j - i) as u32);
            ix.post_start[(p >> 32) as usize + 1] += 1;
            i = j;
        }
        for w in 0..words {
            ix.post_start[w + 1] += ix.post_start[w];
        }

        ix.sorted = (0..words as u32).collect();
        let (bytes, starts) = (&ix.words, &ix.word_start);
        ix.sorted.sort_unstable_by(|&a, &b| {
            let wa = &bytes[starts[a as usize] as usize..starts[a as usize + 1] as usize];
            let wb = &bytes[starts[b as usize] as usize..starts[b as usize + 1] as usize];
            wa.cmp(wb)
        });
        ix.stamp = vec![0; words];
        ix.matched = Vec::with_capacity(words);
        ix
    }

    fn insert(&mut self, s: &[u8]) -> u32 {
        let id = (self.word_start.len() - 1) as u32;
        self.words.extend_from_slice(s);
        self.word_start.push(self.words.len() as u32);
        self.word_u16.push(utf16_len(s));
        if (id as usize + 1) * 2 > self.table.len() {
            self.grow_table();
        }
        let mask = self.table.len() - 1;
        let mut i = (hash(s) as usize) & mask;
        while self.table[i] != 0 {
            i = (i + 1) & mask;
        }
        self.table[i] = id + 1;
        id
    }

    fn grow_table(&mut self) {
        let size = self.table.len() * 2;
        let mut table = vec![0u32; size];
        let mask = size - 1;
        for w in 0..(self.word_start.len() - 1) as u32 {
            let mut i = (hash(self.word(w)) as usize) & mask;
            while table[i] != 0 {
                i = (i + 1) & mask;
            }
            table[i] = w + 1;
        }
        self.table = table;
    }

    pub fn words(&self) -> usize {
        self.word_start.len() - 1
    }

    fn mark(&mut self, w: u32) {
        if self.stamp[w as usize] != self.stamp_now {
            self.stamp[w as usize] = self.stamp_now;
            self.matched.push(w);
        }
    }

    /// Words of the index that count for question word `q` (see matching rule).
    fn match_words(&mut self, q: &[u8]) {
        self.stamp_now = self.stamp_now.wrapping_add(1);
        if self.stamp_now == 0 {
            self.stamp.iter_mut().for_each(|s| *s = 0);
            self.stamp_now = 1;
        }
        self.matched.clear();

        // t == q, or len(q) >= 4 and t starts with q: a range of the sorted words
        if utf16_len(q) >= 4 {
            let mut lo = 0;
            let mut hi = self.sorted.len();
            while lo < hi {
                let mid = (lo + hi) / 2;
                if self.word(self.sorted[mid]) < q {
                    lo = mid + 1;
                } else {
                    hi = mid;
                }
            }
            while lo < self.sorted.len() {
                let w = self.sorted[lo];
                if !self.word(w).starts_with(q) {
                    break;
                }
                self.mark(w);
                lo += 1;
            }
        } else if let Some(w) = self.lookup(q) {
            self.mark(w);
        }

        // len(t) >= 4 and q starts with t: look up each whole-letter prefix of q
        for end in 1..=q.len() {
            if end < q.len() && q[end] & 0xC0 == 0x80 {
                continue; // not a letter boundary
            }
            let p = &q[..end];
            if utf16_len(p) < 4 {
                continue;
            }
            if let Some(w) = self.lookup(p) {
                if self.word_u16[w as usize] >= 4 {
                    self.mark(w);
                }
            }
        }
    }

    /// BM25 search. `terms`: question words joined by ' '; `idf[i]` for each,
    /// computed by TypeScript; `avg_div` = (average passage length || 1).
    /// Writes up to `out_doc.len()` best passages (score > 0, highest first,
    /// ties in passage order) and returns how many.
    pub fn search_into(&mut self, terms: &[u8], idf: &[f64], avg_div: f64, out_doc: &mut [u32], out_score: &mut [f64]) -> usize {
        for (i, q) in terms.split(|&b| b == b' ').enumerate() {
            if i >= idf.len() || q.is_empty() {
                break;
            }
            self.match_words(q);

            // tf per passage = how many of its words count for q
            self.touched.clear();
            for m in 0..self.matched.len() {
                let w = self.matched[m] as usize;
                for j in self.post_start[w] as usize..self.post_start[w + 1] as usize {
                    let d = self.post_doc[j] as usize;
                    if self.tf[d] == 0 {
                        self.touched.push(d as u32);
                    }
                    self.tf[d] += self.post_cnt[j];
                }
            }

            // Same expression, same order as contextIndex.ts:
            // idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (len / avg))))
            for t in 0..self.touched.len() {
                let d = self.touched[t] as usize;
                let tf = self.tf[d] as f64;
                let len = self.doc_len[d] as f64;
                let add = idf[i] * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (len / avg_div))));
                if self.in_hit[d] == 0 {
                    self.in_hit[d] = 1;
                    self.score[d] = 0.0;
                    self.hits.push(d as u32);
                }
                self.score[d] += add;
                self.tf[d] = 0;
            }
        }

        for &d in &self.hits {
            self.in_hit[d as usize] = 0;
        }
        let score = &self.score;
        self.hits.retain(|&d| score[d as usize] > 0.0);
        self.hits.sort_unstable_by(|&a, &b| {
            score[b as usize]
                .partial_cmp(&score[a as usize])
                .unwrap_or(Ordering::Equal)
                .then(a.cmp(&b))
        });
        let n = self.hits.len().min(out_doc.len()).min(out_score.len());
        for i in 0..n {
            out_doc[i] = self.hits[i];
            out_score[i] = score[self.hits[i] as usize];
        }
        self.hits.clear();
        n
    }
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Tests — `cargo test` in rust/rag-core
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    /// The TypeScript algorithm from contextIndex.ts, line by line, as the reference.
    fn reference(docs: &[Vec<&str>], q: &[&str], idf: &[f64], avg_div: f64, k: usize) -> Vec<(u32, f64)> {
        let len16 = |s: &str| s.encode_utf16().count();
        let mut scored: Vec<(u32, f64)> = Vec::new();
        for (i, tokens) in docs.iter().enumerate() {
            let mut score = 0.0f64;
            for (qi, term) in q.iter().enumerate() {
                let mut tf = 0u32;
                for t in tokens {
                    if t == term || (len16(term) >= 4 && t.starts_with(term)) || (len16(t) >= 4 && term.starts_with(t)) {
                        tf += 1;
                    }
                }
                if tf == 0 {
                    continue;
                }
                let tf = tf as f64;
                score += idf[qi] * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (tokens.len() as f64 / avg_div))));
            }
            scored.push((i as u32, score));
        }
        let mut hits: Vec<(u32, f64)> = scored.into_iter().filter(|s| s.1 > 0.0).collect();
        hits.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap()); // stable, like JavaScript
        hits.truncate(k);
        hits
    }

    fn run(docs: &[Vec<&str>], q: &[&str], idf: &[f64], avg_div: f64, k: usize) -> Vec<(u32, f64)> {
        let text = docs.iter().map(|d| d.join(" ")).collect::<Vec<_>>().join("\n");
        let mut ix = Index::build(text.as_bytes(), docs.len());
        let mut out_doc = vec![0u32; k];
        let mut out_score = vec![0f64; k];
        let n = ix.search_into(q.join(" ").as_bytes(), idf, avg_div, &mut out_doc, &mut out_score);
        (0..n).map(|i| (out_doc[i], out_score[i])).collect()
    }

    fn same(docs: &[Vec<&str>], q: &[&str], k: usize) {
        let idf: Vec<f64> = (0..q.len()).map(|i| 0.3 + i as f64 * 0.7).collect();
        let total: usize = docs.iter().map(|d| d.len()).sum();
        let avg = total as f64 / docs.len().max(1) as f64;
        let avg_div = if avg == 0.0 { 1.0 } else { avg };
        let got = run(docs, q, &idf, avg_div, k);
        let want = reference(docs, q, &idf, avg_div, k);
        assert_eq!(got.len(), want.len(), "count for {q:?}");
        for (g, w) in got.iter().zip(&want) {
            assert_eq!(g.0, w.0, "passage for {q:?}");
            assert_eq!(g.1.to_bits(), w.1.to_bits(), "score bits for {q:?}");
        }
    }

    #[test]
    fn matches_typescript_on_english_and_telugu() {
        let docs: Vec<Vec<&str>> = vec![
            vec!["salary", "hyderabad", "ravi", "salaries"],
            vec!["రత్నదీపాలు", "రంగు", "రంగుల", "పద్యం"],
            vec!["yagnavalkya", "jayanti", "జయంతి", "festival", "festivals"],
            vec![],
            vec!["sal", "sala", "salar", "hyd"],
            vec!["రత్న", "రత్నం", "రత్నదీపం", "రత్న"],
            vec!["salary", "salary", "salary"],
        ];
        for q in [
            vec!["salary"],
            vec!["sala"],
            vec!["salaryhike"],
            vec!["hyd"],
            vec!["రత్న"],
            vec!["రత్నదీపాలు"],
            vec!["రంగు", "పద్యం"],
            vec!["జయంతి", "festival", "zzz"],
            vec!["salary", "salary"],
            vec!["ab"],
        ] {
            for k in [1, 3, 10] {
                same(&docs, &q, k);
            }
        }
    }

    #[test]
    fn matches_typescript_on_many_random_passages() {
        let pool = [
            "hyderabad", "hyd", "vizag", "salary", "salaries", "sal", "ravi", "sita", "రాము", "సీత", "సీతమ్మ",
            "రత్న", "రత్నం", "రత్నదీపాలు", "జయంతి", "పద్యం", "పద్యాలు", "kavi", "kavitha", "𝒜𝒷𝒸𝒹", "𝒜𝒷",
        ];
        let mut seed: u64 = 42;
        let mut next = || {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            (seed >> 33) as usize
        };
        let docs: Vec<Vec<&str>> = (0..400).map(|_| (0..next() % 12).map(|_| pool[next() % pool.len()]).collect()).collect();
        for _ in 0..200 {
            let q: Vec<&str> = (0..1 + next() % 4).map(|_| pool[next() % pool.len()]).collect();
            same(&docs, &q, 1 + next() % 8);
        }
    }

    #[test]
    fn grows_its_hash_table() {
        let words: Vec<String> = (0..5000).map(|i| format!("word{i}")).collect();
        let docs: Vec<Vec<&str>> = words.chunks(10).map(|c| c.iter().map(|s| s.as_str()).collect()).collect();
        same(&docs, &["word4999"], 3);
        same(&docs, &["word1"], 20);
    }
}
