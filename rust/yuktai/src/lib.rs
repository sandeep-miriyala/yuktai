#![cfg_attr(all(feature = "ask", feature = "grid"), doc = include_str!("../README.md"))]
#![cfg_attr(target_arch = "wasm32", no_std)]
#![forbid(unsafe_code)]
#![cfg_attr(docsrs, feature(doc_cfg))]

extern crate alloc;

#[cfg(feature = "ask")]
pub mod ask;
#[cfg(feature = "grid")]
pub mod grid;
#[cfg(feature = "rag")]
pub mod rag;
