//! # MiRa: Telugu for every HTML element
//!
//! Named after **Dr. Miriyala Ramakrishna (మిరా)**: writer, researcher and a
//! teacher of Telugu for 36 years.
//!
//! A developer writes
//!
//! ```html
//! <body mira="mandali">
//!   <mira h1 font="ntr">మిరా</mira h1>
//!   <mira p font="ramabhadra">ఒక్క పద్యం చాలు</mira p>
//!   <mira input font="mandali" placeholder="మీ పేరు">
//! </body>
//! ```
//!
//! and MiRa turns every `<mira …>` into the real element, marks Telugu text
//! with `lang="te"` and loads only the free (OFL) Telugu fonts the page uses:
//!
//! ```
//! let out = mira::html::build(r#"<mira h1 font="ntr">మిరా</mira h1>"#, &mira::html::Options::default());
//! assert!(out.html.contains(r#"<h1 lang="te" class="mira-font-ntr">మిరా</h1>"#));
//! assert_eq!(out.fonts, ["ntr"]);
//! ```
//!
//! The same rules run in two places:
//! * [`html::build`]: on HTML text, at build time or on a server (and the `mira` command);
//! * the `yuktai-mira-web` crate: on the live DOM in the browser, as WebAssembly.
//!
//! Every decision about one element is made by [`element::plan`], so both give the same page.

#![forbid(unsafe_code)]

pub mod akshara;
pub mod css;
pub mod element;
pub mod fonts;
pub mod html;

pub use akshara::{count, split, truncate};
pub use fonts::{Font, FONTS};

/// True when the text has at least one Telugu character (U+0C00–U+0C7F).
pub fn has_telugu(text: &str) -> bool {
    text.chars().any(is_telugu_char)
}

/// U+0C00–U+0C7F, the Telugu block.
pub fn is_telugu_char(c: char) -> bool {
    ('\u{0C00}'..='\u{0C7F}').contains(&c)
}

/// MiRa's version, the same as the npm package.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg(test)]
mod tests {
    #[test]
    fn telugu_detection() {
        assert!(super::has_telugu("Hello అందరికీ"));
        assert!(!super::has_telugu("Hello 2026"));
    }
}
