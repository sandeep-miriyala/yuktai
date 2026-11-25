//! Grid engine: sort and search for very large tables (10 lakh rows and more).
//!
//! The caller decides the rules (what is empty, what is a number or a date,
//! which text is searched) and hands this engine plain numbers and text.
//!
//! - [`sort_by_keys`]: orders rows by number keys. Empty rows (`NaN`) always go
//!   last, in both directions, and equal rows keep their original order: the
//!   same result as JavaScript's stable `Array.prototype.sort`.
//! - [`search`]: finds the rows whose text contains the query. All rows sit in
//!   one buffer, prepared once per data change, so each keystroke only scans.
//!
//! No allocation and no dependencies.
//!
//! Source of truth: `rust/yuktai/src/grid.rs`. `rust/grid-core` compiles this
//! same file to WebAssembly for the YuktAI data grid.

use core::cmp::Ordering;

/// Fills `out` with row positions 0..n sorted by `keys`.
///
/// * `NaN` means "empty": those rows go last and are never flipped by `desc`.
/// * `desc` reverses the order of the non-empty rows only.
/// * Equal keys keep their original order (stable).
pub fn sort_by_keys(keys: &[f64], desc: bool, out: &mut [u32]) {
    let n = keys.len().min(out.len());
    let out = &mut out[..n];
    for (i, slot) in out.iter_mut().enumerate() {
        *slot = i as u32;
    }
    // An unstable sort with the original position as the final tie-breaker
    // gives exactly one possible answer: the stable one.
    out.sort_unstable_by(|&a, &b| {
        let ka = keys[a as usize];
        let kb = keys[b as usize];
        let by_key = match (ka.is_nan(), kb.is_nan()) {
            (true, true) => Ordering::Equal,
            (true, false) => Ordering::Greater,
            (false, true) => Ordering::Less,
            (false, false) => {
                let o = ka.partial_cmp(&kb).unwrap_or(Ordering::Equal);
                if desc {
                    o.reverse()
                } else {
                    o
                }
            }
        };
        by_key.then(a.cmp(&b))
    });
}

/// Writes the positions of the rows whose text contains `query` into `out`,
/// in original order, and returns how many there are.
///
/// `text` holds every row's text back to back (UTF-8); row `i` is
/// `text[offsets[i]..offsets[i + 1]]`. An empty query matches nothing:
/// the TypeScript side never asks for one.
pub fn search(text: &[u8], offsets: &[u32], query: &[u8], out: &mut [u32]) -> usize {
    if query.is_empty() || offsets.len() < 2 {
        return 0;
    }
    let rows = offsets.len() - 1;
    let mut found = 0;
    for i in 0..rows {
        if found >= out.len() {
            break;
        }
        let start = offsets[i] as usize;
        let end = offsets[i + 1] as usize;
        if start > end || end > text.len() {
            continue;
        }
        if contains(&text[start..end], query) {
            out[found] = i as u32;
            found += 1;
        }
    }
    found
}

/// Byte substring search. On valid UTF-8 this is the same as a text
/// substring search, because UTF-8 never matches in the middle of a letter.
fn contains(hay: &[u8], needle: &[u8]) -> bool {
    let m = needle.len();
    if m > hay.len() {
        return false;
    }
    let first = needle[0];
    let last_start = hay.len() - m;
    let mut i = 0;
    while i <= last_start {
        if hay[i] == first && &hay[i..i + m] == needle {
            return true;
        }
        i += 1;
    }
    false
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests — `cargo test` in rust/grid-core
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    fn sorted(keys: &[f64], desc: bool) -> Vec<u32> {
        let mut out = vec![0u32; keys.len()];
        sort_by_keys(keys, desc, &mut out);
        out
    }

    #[test]
    fn sorts_ascending_and_descending() {
        let keys = [30.0, 10.0, 20.0];
        assert_eq!(sorted(&keys, false), vec![1, 2, 0]);
        assert_eq!(sorted(&keys, true), vec![0, 2, 1]);
    }

    #[test]
    fn empty_rows_stay_last_in_both_directions() {
        let keys = [f64::NAN, 5.0, f64::NAN, 1.0];
        assert_eq!(sorted(&keys, false), vec![3, 1, 0, 2]);
        assert_eq!(sorted(&keys, true), vec![1, 3, 0, 2]);
    }

    #[test]
    fn equal_rows_keep_their_order() {
        let keys = [2.0, 1.0, 2.0, 1.0, 2.0];
        assert_eq!(sorted(&keys, false), vec![1, 3, 0, 2, 4]);
        assert_eq!(sorted(&keys, true), vec![0, 2, 4, 1, 3]);
    }

    #[test]
    fn negative_zero_equals_zero() {
        assert_eq!(sorted(&[0.0, -0.0, 0.0], false), vec![0, 1, 2]);
    }

    #[test]
    fn infinities_sort_at_the_ends() {
        let keys = [f64::INFINITY, -1.0, f64::NEG_INFINITY];
        assert_eq!(sorted(&keys, false), vec![2, 1, 0]);
    }

    fn find(rows: &[&str], query: &str) -> Vec<u32> {
        let mut text = Vec::new();
        let mut offsets = vec![0u32];
        for r in rows {
            text.extend_from_slice(r.as_bytes());
            offsets.push(text.len() as u32);
        }
        let mut out = vec![0u32; rows.len()];
        let n = search(&text, &offsets, query.as_bytes(), &mut out);
        out.truncate(n);
        out
    }

    #[test]
    fn finds_rows_in_original_order() {
        let rows = ["hyderabad\0ravi", "vizag\0sita", "hyderabad\0gopal"];
        assert_eq!(find(&rows, "hyderabad"), vec![0, 2]);
        assert_eq!(find(&rows, "sita"), vec![1]);
        assert_eq!(find(&rows, "pune"), Vec::<u32>::new());
    }

    #[test]
    fn telugu_text_matches() {
        let rows = ["రంగు రంగుల రత్నదీపాలు", "శ్రీ యాజ్ఞవల్క్య జయంతి"];
        assert_eq!(find(&rows, "రత్న"), vec![0]);
        assert_eq!(find(&rows, "జయంతి"), vec![1]);
    }

    #[test]
    fn query_never_spans_two_columns() {
        // Columns are joined with \0, and queries never contain \0.
        let rows = ["ab\0cd"];
        assert_eq!(find(&rows, "bc"), Vec::<u32>::new());
    }

    #[test]
    fn empty_query_or_no_rows_matches_nothing() {
        assert_eq!(find(&["a"], ""), Vec::<u32>::new());
        assert_eq!(find(&[], "a"), Vec::<u32>::new());
    }
}
