# yuktai

The Rust engines behind [YuktAI](https://github.com/sandeep-miriyala/yuktai): search that understands Telugu and other Indian scripts, and a grid engine that sorts and searches 10 lakh (1,000,000) rows. The same code runs in browsers as WebAssembly inside the YuktAI npm packages.

- **No dependencies.** Only Rust's `core` and `alloc`.
- **No `unsafe`** in this crate.
- **Pick what you need** with features: `ask`, `grid`, `rag` (all on by default).

```toml
[dependencies]
yuktai = "0.1"
# or only the grid:
# yuktai = { version = "0.1", default-features = false, features = ["grid"] }
```

## `ask`: search a page or passages

A tokenizer that keeps Indian words whole (vowel signs, viramas, ZWJ/ZWNJ), BM25 with prefix matching (రత్న → రత్నం, install → installation), int8 vectors, hybrid ranking (Reciprocal Rank Fusion) and a confidence score for every hit.

```rust
use yuktai::ask::{query_terms, tokenize, Index, MODE_KEYWORD};

let mut ix = Index::new();
ix.add("Pricing: the free plan has 3 projects");
ix.add("Installation: run npm install @yuktishaalaa/ask-page and add one line");
ix.add("Options: choose Fast, Balanced or Best mode");

let hits = ix.search("How do I install it?", None, MODE_KEYWORD, 3);
assert_eq!(hits[0].doc, 1);

assert_eq!(tokenize("రత్నదీపాలు, రంగుల పద్యం!"), vec!["రత్నదీపాలు", "రంగుల", "పద్యం"]);
assert_eq!(query_terms("ask-page ఎలా install చేయాలి?"), vec!["ask", "install"]);
```

For hybrid search, store vectors with `ask::quantize` and `Index::set_vectors`, then pass the question's vector with `MODE_HYBRID`.

## `grid`: sort and search big tables

```rust
use yuktai::grid::{search, sort_by_keys};

// Sort: NaN means empty and always goes last; equal keys keep their order.
let keys = [30.0, f64::NAN, 10.0, 20.0];
let mut order = [0u32; 4];
sort_by_keys(&keys, false, &mut order);
assert_eq!(order, [2, 3, 0, 1]);

// Search: rows back to back, row i = text[offsets[i]..offsets[i + 1]].
let rows = ["ravi hyderabad", "sita vizag", "ramu hyderabad"];
let text: String = rows.concat();
let mut offsets = vec![0u32];
for r in rows {
    offsets.push(offsets.last().unwrap() + r.len() as u32);
}
let mut out = [0u32; 3];
let n = search(text.as_bytes(), &offsets, b"hyderabad", &mut out);
assert_eq!(&out[..n], &[0, 2]);
```

## `rag`: BM25 when you tokenize yourself

`rag::Index` counts and scores; you give it the passages' words and each question word's idf, so the scores can match another implementation bit for bit. YuktAI's TypeScript uses it that way. If you just want search, use `ask`.

## License

GPL-3.0-only. Free and open source. Made by Sandeep Miriyala, Yuktishaalaa AI Lab.
