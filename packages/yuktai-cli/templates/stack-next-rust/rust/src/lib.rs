//! The app's core in Rust. `yuktai build` compiles it to WebAssembly (public/wasm/core.wasm)
//! and src/lib/core.ts calls it from the browser, with a TypeScript fallback.
//!
//! Strings cross from JavaScript as bytes: JS asks for memory with `alloc`, writes UTF-8
//! into it, calls a function with (pointer, length), then gives the memory back with `dealloc`.

/// Characters that separate words (besides spaces): ASCII punctuation and a few common
/// Unicode marks, including the Devanagari danda. Kept the same as the TypeScript fallback.
fn is_separator(c: char) -> bool {
    c.is_whitespace()
        || c.is_ascii_punctuation()
        || matches!(c, '“' | '”' | '‘' | '’' | '—' | '–' | '…' | '।' | '॥')
}

/// Words in a text, in any script (English, Telugu, Hindi, …).
pub fn count_words(text: &str) -> u32 {
    text.split(is_separator)
        .filter(|w| w.chars().any(char::is_alphanumeric))
        .count() as u32
}

// ── WebAssembly interface ───────────────────────────────────────────────────

/// Memory for JavaScript to write into.
#[no_mangle]
pub extern "C" fn alloc(len: usize) -> *mut u8 {
    let mut buf = Vec::<u8>::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    core::mem::forget(buf);
    ptr
}

/// Gives back memory from `alloc`.
///
/// # Safety
/// `ptr` and `len` must come from one `alloc` call.
#[no_mangle]
pub unsafe extern "C" fn dealloc(ptr: *mut u8, len: usize) {
    drop(Vec::from_raw_parts(ptr, 0, len));
}

/// `count_words` for JavaScript: the text is UTF-8 at (ptr, len).
///
/// # Safety
/// (ptr, len) must point at `len` bytes written by JavaScript.
#[no_mangle]
pub unsafe extern "C" fn count_words_utf8(ptr: *const u8, len: usize) -> u32 {
    let bytes = core::slice::from_raw_parts(ptr, len);
    match core::str::from_utf8(bytes) {
        Ok(text) => count_words(text),
        Err(_) => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::count_words;

    #[test]
    fn english() {
        assert_eq!(count_words("Hello, world! This is YuktAI."), 5);
    }

    #[test]
    fn telugu_and_hindi() {
        assert_eq!(count_words("నమస్కారం ప్రపంచం"), 2);
        assert_eq!(count_words("नमस्ते दुनिया। स्वागत है॥"), 4);
    }

    #[test]
    fn numbers_count_punctuation_does_not() {
        assert_eq!(count_words("Version 5.3.12 — out now…"), 6);
        assert_eq!(count_words(" — … । "), 0);
        assert_eq!(count_words(""), 0);
    }
}
