// ─────────────────────────────────────────────────────────────────────────────
// @yuktishaalaa/ask-page · rust/ask-core/src/lib.rs
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

#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

use alloc::collections::BTreeMap;
use alloc::string::String;
use alloc::vec;
use alloc::vec::Vec;
use core::cmp::Ordering;

// ─── Text ────────────────────────────────────────────────────────────────────

/// Letters, digits, and the marks Indic scripts need inside a word.
pub fn is_word_char(c: char) -> bool {
    let u = c as u32;
    c.is_alphanumeric()
        || (0x0900..=0x0DFF).contains(&u) // Devanagari … Sinhala, incl. Telugu 0C00–0C7F and their signs
        || (0x0300..=0x036F).contains(&u) // combining diacritics
        || u == 0x200C
        || u == 0x200D // ZWNJ, ZWJ
}

const STOP: &[&str] = &[
    // English
    "a", "an", "the", "is", "are", "was", "were", "be", "to", "of", "in", "on", "for", "and", "or", "how", "what",
    "which", "who", "why", "when", "where", "do", "does", "did", "i", "it", "its", "this", "that", "these", "those",
    "with", "can", "could", "should", "my", "me", "you", "your", "about", "tell", "please", "there", "here", "any",
    "from", "by", "as", "at", "we", "us", "our", "show", "give", "explain", "page", "much", "many", "get", "have",
    "has", "will", "would", "am", "if", "so", "into", "than", "then", "also", "just", "no", "not",
    "version", "versions", "kind", "kinds", "available",
    // Telugu
    "ఈ", "ఆ", "ఏమిటి", "ఏమి", "ఏం", "ఎలా", "ఎందుకు", "ఎప్పుడు", "ఎక్కడ", "ఎవరు", "ఏది", "గురించి", "చెప్పండి", "చెప్పు",
    "లో", "కి", "కు", "ని", "ను", "ఉంది", "ఉన్నాయి", "ఏ", "మరియు", "లేదా", "చేయాలి",
    "చేస్తారు", "చేస్తాం", "చేయవచ్చు", "చేయండి", "ఉంటుంది", "ఉంటాయి", "అవుతుంది", "కావాలి", "ఉందా", "ఏమిటో",
    // Hindi
    "क्या", "कैसे", "है", "हैं", "का", "की", "के", "में", "और", "यह", "इस",
];

pub fn is_stop(w: &str) -> bool {
    STOP.contains(&w)
}

/// Splits text into lower-case words. Keeps every word (stop words too):
/// passages need their true length for BM25.
pub fn tokenize(text: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut cur = String::new();
    for c in text.chars() {
        if is_word_char(c) {
            for l in c.to_lowercase() {
                cur.push(l);
            }
        } else if !cur.is_empty() {
            out.push(core::mem::take(&mut cur));
        }
    }
    if !cur.is_empty() {
        out.push(cur);
    }
    out
}

/// Question words that carry meaning: no stop words, no repeats.
pub fn query_terms(text: &str) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for t in tokenize(text) {
        if !is_stop(&t) && !out.contains(&t) {
            out.push(t);
        }
    }
    out
}

fn chars(s: &str) -> usize {
    s.chars().count()
}

// ─── Small math (no_std has no ln or abs for floats) ──────────────────────────

/// Natural log for x > 0, accurate to ~1e-15.
pub fn ln(x: f64) -> f64 {
    if !(x > 0.0) {
        return f64::NEG_INFINITY;
    }
    let bits = x.to_bits();
    let mut e = ((bits >> 52) & 0x7ff) as i64 - 1023;
    let mut m = f64::from_bits((bits & 0x000f_ffff_ffff_ffff) | 0x3ff0_0000_0000_0000); // [1, 2)
    if m > 1.414_213_562_373_095 {
        m *= 0.5;
        e += 1;
    }
    let s = (m - 1.0) / (m + 1.0);
    let s2 = s * s;
    let mut term = s;
    let mut sum = 0.0;
    let mut k = 1.0;
    while k < 40.0 {
        sum += term / k;
        term *= s2;
        k += 2.0;
    }
    2.0 * sum + e as f64 * core::f64::consts::LN_2
}

fn fabs(x: f32) -> f32 {
    if x < 0.0 { -x } else { x }
}

fn round_i8(x: f32) -> i8 {
    let r = if x >= 0.0 { x + 0.5 } else { x - 0.5 };
    let r = r as i32;
    r.clamp(-127, 127) as i8
}

/// int8 quantization, one scale per vector: q = round(v / scale), scale = max|v| / 127.
pub fn quantize(v: &[f32], dim: usize, out: &mut [i8], scales: &mut [f32]) {
    let n = v.len() / dim.max(1);
    for i in 0..n {
        let row = &v[i * dim..(i + 1) * dim];
        let mut max = 0.0f32;
        for &x in row {
            let a = fabs(x);
            if a > max {
                max = a;
            }
        }
        let scale = if max > 0.0 { max / 127.0 } else { 1.0 };
        scales[i] = scale;
        for (j, &x) in row.iter().enumerate() {
            out[i * dim + j] = round_i8(x / scale);
        }
    }
}

// ─── Index ───────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Hit {
    pub doc: u32,
    /// Ranking score: BM25 alone, cosine alone, or the RRF sum in hybrid mode.
    pub fused: f64,
    pub bm25: f64,
    /// Cosine similarity with the question, or 0 without vectors.
    pub cosine: f64,
    /// Share of the question found in this passage, 0..1, weighted by idf:
    /// missing a rare word ("refund") costs more than missing a common one.
    pub coverage: f64,
}

pub const MODE_KEYWORD: u32 = 0;
pub const MODE_VECTOR: u32 = 1;
pub const MODE_HYBRID: u32 = 2;
const RRF_K: f64 = 60.0;

#[derive(Default)]
pub struct Index {
    vocab: BTreeMap<String, u32>,
    postings: Vec<Vec<(u32, u32)>>, // per word: (passage, count)
    word_chars: Vec<u32>,
    doc_len: Vec<u32>,
    total_len: u64,
    dim: usize,
    vectors: Vec<i8>,
    scales: Vec<f32>,
    pub last_terms: usize,
}

impl Index {
    pub fn new() -> Index {
        Index::default()
    }

    pub fn docs(&self) -> usize {
        self.doc_len.len()
    }

    /// Adds one passage and returns its id.
    pub fn add(&mut self, text: &str) -> u32 {
        let doc = self.doc_len.len() as u32;
        let mut counts: BTreeMap<u32, u32> = BTreeMap::new();
        let mut len = 0u32;
        for t in tokenize(text) {
            len += 1;
            let id = match self.vocab.get(&t) {
                Some(&id) => id,
                None => {
                    let id = self.postings.len() as u32;
                    self.word_chars.push(chars(&t) as u32);
                    self.vocab.insert(t, id);
                    self.postings.push(Vec::new());
                    id
                }
            };
            *counts.entry(id).or_insert(0) += 1;
        }
        for (w, c) in counts {
            self.postings[w as usize].push((doc, c));
        }
        self.doc_len.push(len);
        self.total_len += len as u64;
        doc
    }

    /// Stores int8 vectors (one per passage, in passage order).
    pub fn set_vectors(&mut self, vectors: &[i8], scales: &[f32], dim: usize) {
        self.dim = dim;
        self.vectors = vectors.to_vec();
        self.scales = scales.to_vec();
    }

    pub fn has_vectors(&self) -> bool {
        self.dim > 0 && self.scales.len() == self.docs()
    }

    /// Word ids that count for question word q, with a weight: the word
    /// itself 1.0, a longer word starting with q 0.8 (install → installation),
    /// a shorter word of 4+ letters that q starts with 0.5 (installation → install).
    fn matching_words(&self, q: &str) -> Vec<(u32, f64)> {
        let mut out: Vec<(u32, f64)> = Vec::new();
        if let Some(&id) = self.vocab.get(q) {
            out.push((id, 1.0));
        }
        if chars(q) >= 4 {
            let from = (core::ops::Bound::Excluded(q), core::ops::Bound::Unbounded);
            for (w, &id) in self.vocab.range::<str, _>(from) {
                if !w.starts_with(q) {
                    break;
                }
                out.push((id, 0.8));
            }
        }
        for (n, (i, c)) in q.char_indices().enumerate() {
            let end = i + c.len_utf8();
            if n + 1 >= 4 && end < q.len() {
                if let Some(&id) = self.vocab.get(&q[..end]) {
                    if self.word_chars[id as usize] >= 4 {
                        out.push((id, 0.5));
                    }
                }
            }
        }
        out
    }

    /// "sugar free" → "sugarfree" when the page writes it as one word.
    fn join_compounds(&self, terms: Vec<String>) -> Vec<String> {
        let mut out: Vec<String> = Vec::new();
        let mut i = 0;
        while i < terms.len() {
            let mut joined = String::new();
            if i + 1 < terms.len() {
                joined.push_str(&terms[i]);
                joined.push_str(&terms[i + 1]);
            }
            if !joined.is_empty() && self.vocab.contains_key(joined.as_str()) {
                if !out.contains(&joined) {
                    out.push(joined);
                }
                i += 2;
            } else {
                if !out.contains(&terms[i]) {
                    out.push(terms[i].clone());
                }
                i += 1;
            }
        }
        out
    }

    /// BM25 per passage, and the idf-weighted share of the question each covers.
    fn keyword_scores(&self, terms: &[String]) -> (Vec<f64>, Vec<f64>) {
        let n = self.docs();
        let mut score = vec![0.0f64; n];
        let mut covered = vec![0.0f64; n];
        if n == 0 {
            return (score, covered);
        }
        let avg = self.total_len as f64 / n as f64;
        let avg = if avg == 0.0 { 1.0 } else { avg };
        let mut tf = vec![0.0f64; n];
        let mut touched: Vec<u32> = Vec::new();
        let mut total_idf = 0.0;
        for q in terms {
            for (w, weight) in self.matching_words(q) {
                for &(d, c) in &self.postings[w as usize] {
                    if tf[d as usize] == 0.0 {
                        touched.push(d);
                    }
                    tf[d as usize] += c as f64 * weight;
                }
            }
            let df = touched.len() as f64;
            let idf = ln(1.0 + (n as f64 - df + 0.5) / (df + 0.5));
            total_idf += idf;
            for &d in &touched {
                let d = d as usize;
                let t = tf[d];
                let len = self.doc_len[d] as f64;
                score[d] += idf * ((t * 2.2) / (t + 1.2 * (0.25 + 0.75 * (len / avg))));
                covered[d] += idf;
                tf[d] = 0.0;
            }
            touched.clear();
        }
        if total_idf > 0.0 {
            for c in covered.iter_mut() {
                *c /= total_idf;
            }
        }
        (score, covered)
    }

    fn cosines(&self, q: &[f32]) -> Vec<f64> {
        let n = self.docs();
        let mut out = vec![0.0f64; n];
        if !self.has_vectors() || q.len() != self.dim {
            return out;
        }
        for d in 0..n {
            let row = &self.vectors[d * self.dim..(d + 1) * self.dim];
            let mut dot = 0.0f32;
            for j in 0..self.dim {
                dot += q[j] * row[j] as f32;
            }
            out[d] = (dot * self.scales[d]) as f64;
        }
        out
    }

    /// Best `k` passages for a question. `qvec` (normalized, `dim` long) is
    /// used in vector and hybrid modes; without it they fall back to keywords.
    pub fn search(&mut self, question: &str, qvec: Option<&[f32]>, mode: u32, k: usize) -> Vec<Hit> {
        let terms = self.join_compounds(query_terms(question));
        self.last_terms = terms.len();
        let n = self.docs();
        let (bm25, covered) = self.keyword_scores(&terms);
        let use_vec = mode != MODE_KEYWORD && qvec.is_some() && self.has_vectors();
        let cos = match qvec {
            Some(q) if use_vec => self.cosines(q),
            _ => vec![0.0; n],
        };
        let coverage = |d: usize| if terms.is_empty() { 0.0 } else { covered[d] };

        let rank = |scores: &Vec<f64>, keep: &dyn Fn(usize) -> bool| -> Vec<u32> {
            let mut ids: Vec<u32> = (0..n as u32).filter(|&d| keep(d as usize)).collect();
            ids.sort_by(|&a, &b| {
                scores[b as usize].partial_cmp(&scores[a as usize]).unwrap_or(Ordering::Equal).then(a.cmp(&b))
            });
            ids
        };

        let mut fused = vec![0.0f64; n];
        let mut in_result = vec![false; n];
        if !use_vec || mode == MODE_KEYWORD {
            for d in 0..n {
                if bm25[d] > 0.0 {
                    fused[d] = bm25[d];
                    in_result[d] = true;
                }
            }
        } else if mode == MODE_VECTOR {
            for d in 0..n {
                fused[d] = cos[d];
                in_result[d] = true;
            }
        } else {
            let kw = rank(&bm25, &|d| bm25[d] > 0.0);
            let vc = rank(&cos, &|_| true);
            // vector list is cut at the same depth RRF would care about
            let depth = (k * 4).max(20);
            for (r, &d) in kw.iter().enumerate() {
                fused[d as usize] += 1.0 / (RRF_K + r as f64 + 1.0);
                in_result[d as usize] = true;
            }
            for (r, &d) in vc.iter().take(depth).enumerate() {
                fused[d as usize] += 1.0 / (RRF_K + r as f64 + 1.0);
                in_result[d as usize] = true;
            }
        }

        let order = rank(&fused, &|d| in_result[d]);
        order
            .into_iter()
            .take(k)
            .map(|d| {
                let i = d as usize;
                Hit { doc: d, fused: fused[i], bm25: bm25[i], cosine: cos[i], coverage: coverage(i) }
            })
            .collect()
    }
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Tests: `cargo test` in rust/ask-core
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    fn index(passages: &[&str]) -> Index {
        let mut ix = Index::new();
        for p in passages {
            ix.add(p);
        }
        ix
    }

    #[test]
    fn telugu_words_keep_their_vowel_signs() {
        assert_eq!(tokenize("రత్నదీపాలు, రంగుల పద్యం!"), vec!["రత్నదీపాలు", "రంగుల", "పద్యం"]);
        assert_eq!(tokenize("Install ask-page v2"), vec!["install", "ask", "page", "v2"]);
        assert_eq!(tokenize("हिन्दी भाषा"), vec!["हिन्दी", "भाषा"]);
    }

    #[test]
    fn question_words_are_dropped() {
        assert_eq!(query_terms("How do I install the package?"), vec!["install", "package"]);
        assert_eq!(query_terms("ask-page ఎలా install చేయాలి?"), vec!["ask", "install"]);
    }

    #[test]
    fn ln_matches_std() {
        for x in [1e-9, 0.01, 0.5, 1.0, 1.5, 2.0, 3.7, 10.0, 12345.678, 1e12] {
            assert!((ln(x) - x.ln()).abs() < 1e-12, "ln({x})");
        }
    }

    #[test]
    fn bm25_finds_the_right_passage() {
        let mut ix = index(&[
            "Pricing: the free plan has 3 projects",
            "Installation: run npm install @yuktishaalaa/ask-page and add one line",
            "Options: choose Fast, Balanced or Best mode",
        ]);
        let hits = ix.search("How do I install it?", None, MODE_KEYWORD, 3);
        assert_eq!(hits[0].doc, 1);
        assert_eq!(hits.len(), 1);
        assert!((hits[0].coverage - 1.0).abs() < 1e-9);
    }

    #[test]
    fn prefixes_match_both_ways() {
        let mut ix = index(&["రత్నం ఒక విలువైన రాయి", "installation steps for the package", "nothing here"]);
        assert_eq!(ix.search("రత్న", None, MODE_KEYWORD, 3)[0].doc, 0);
        assert_eq!(ix.search("install", None, MODE_KEYWORD, 3)[0].doc, 1);
        let mut ix2 = index(&["install it", "other"]);
        assert_eq!(ix2.search("installation", None, MODE_KEYWORD, 3)[0].doc, 0);
        // short words match exactly only
        let mut ix3 = index(&["cat catalog", "car"]);
        assert_eq!(ix3.search("ca", None, MODE_KEYWORD, 3).len(), 0);
    }

    #[test]
    fn no_hits_when_page_does_not_answer() {
        let mut ix = index(&["Installation steps", "Options table"]);
        assert!(ix.search("refund policy", None, MODE_KEYWORD, 5).is_empty());
        assert_eq!(ix.last_terms, 2);
    }

    #[test]
    fn coverage_is_weighted_by_idf() {
        let mut ix = index(&["content security policy for workers", "install steps", "options table", "usage"]);
        let hits = ix.search("refund policy", None, MODE_KEYWORD, 3);
        assert_eq!(hits[0].doc, 0);
        assert!(hits[0].coverage < 0.5, "{}", hits[0].coverage);
        let full = ix.search("security policy", None, MODE_KEYWORD, 3);
        assert!((full[0].coverage - 1.0).abs() < 1e-9);
    }

    #[test]
    fn split_words_match_a_compound() {
        let mut ix = index(&["Sugarfree energy drink", "The original drink", "Company history"]);
        let hits = ix.search("is it sugar free?", None, MODE_KEYWORD, 3);
        assert_eq!(hits[0].doc, 0);
        assert!((hits[0].coverage - 1.0).abs() < 1e-9, "{}", hits[0].coverage);
    }

    #[test]
    fn rarer_words_weigh_more() {
        let mut ix = index(&["grid grid grid table", "grid accessibility", "grid", "grid"]);
        let hits = ix.search("grid accessibility", None, MODE_KEYWORD, 4);
        assert_eq!(hits[0].doc, 1);
    }

    fn normalize(v: &mut [f32]) {
        let n: f32 = v.iter().map(|x| x * x).sum::<f32>();
        let n = n.sqrt();
        v.iter_mut().for_each(|x| *x /= n);
    }

    #[test]
    fn int8_cosine_is_close_to_float() {
        let dim = 8;
        let mut raw: Vec<f32> = vec![
            0.9, 0.1, 0.0, 0.2, 0.0, 0.1, 0.3, 0.0, //
            0.0, 0.8, 0.5, 0.0, 0.1, 0.0, 0.0, 0.2, //
            -0.3, 0.0, 0.1, 0.9, 0.2, 0.0, 0.1, 0.1,
        ];
        for r in raw.chunks_mut(dim) {
            normalize(r);
        }
        let mut q8 = vec![0i8; raw.len()];
        let mut sc = vec![0f32; 3];
        quantize(&raw, dim, &mut q8, &mut sc);
        let mut ix = index(&["a", "b", "c"]);
        ix.set_vectors(&q8, &sc, dim);
        let q = raw[8..16].to_vec();
        let hits = ix.search("zzz", Some(&q), MODE_VECTOR, 3);
        assert_eq!(hits[0].doc, 1);
        assert!((hits[0].cosine - 1.0).abs() < 0.02, "{}", hits[0].cosine);
        let exact: f32 = raw[0..8].iter().zip(&q).map(|(a, b)| a * b).sum();
        let got = hits.iter().find(|h| h.doc == 0).unwrap().cosine;
        assert!((got - exact as f64).abs() < 0.02);
    }

    #[test]
    fn hybrid_rrf_rewards_agreement() {
        let dim = 4;
        let mut v: Vec<f32> = vec![1.0, 0.0, 0.0, 0.0, 0.7, 0.7, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0];
        for r in v.chunks_mut(dim) {
            normalize(r);
        }
        let mut q8 = vec![0i8; v.len()];
        let mut sc = vec![0f32; 3];
        quantize(&v, dim, &mut q8, &mut sc);
        let mut ix = index(&["refund rules", "refund and cancel policy", "shipping times"]);
        ix.set_vectors(&q8, &sc, dim);
        let mut q = vec![0.6, 0.8, 0.0, 0.0];
        normalize(&mut q);
        let hits = ix.search("cancel refund", Some(&q), MODE_HYBRID, 3);
        assert_eq!(hits[0].doc, 1); // top in both lists
        // vector-only passages still appear in hybrid mode
        assert!(hits.iter().any(|h| h.doc == 2));
        // keyword mode ignores the vector
        let kw = ix.search("cancel refund", Some(&q), MODE_KEYWORD, 3);
        assert!(kw.iter().all(|h| h.cosine == 0.0));
    }

    #[test]
    fn vector_modes_fall_back_to_keywords_without_vectors() {
        let mut ix = index(&["install steps", "other"]);
        let hits = ix.search("install", None, MODE_HYBRID, 3);
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].doc, 0);
    }

    #[test]
    fn many_passages() {
        let texts: Vec<String> = (0..3000).map(|i| alloc::format!("passage {i} word{i} common")).collect();
        let mut ix = Index::new();
        for t in &texts {
            ix.add(t);
        }
        let hits = ix.search("word2999", None, MODE_KEYWORD, 3);
        assert_eq!(hits[0].doc, 2999);
    }
}
