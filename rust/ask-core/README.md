# yuktai-ask-core

Search for one web page or a small set of passages, with Telugu and other Indian scripts handled properly. It is the engine behind [Ask page](https://www.npmjs.com/package/@yuktishaalaa/ask-page), compiled to WebAssembly there, and it works in plain Rust too.

- **Tokenizer that keeps Indian words whole:** vowel signs, viramas and ZWJ/ZWNJ stay inside the word. Latin text is lower-cased. Question words in English and Telugu ("what", "ఎలా") are dropped.
- **BM25 with an inverted index:** a question word also matches longer words that start with it (రత్న → రత్నం, install → installation), from 4 letters up.
- **Vectors:** embeddings stored as int8 (4× smaller), cosine by dot product.
- **Hybrid ranking:** Reciprocal Rank Fusion (k = 60) of the BM25 and vector rankings.
- **Confidence:** every hit says how many question words it covers, so you can answer "this page doesn't say" instead of guessing.
- **No dependencies.** `no_std` + `alloc` on wasm32, so the .wasm stays small.

```toml
[dependencies]
yuktai-ask-core = "0.1"
```

```rust
use yuktai_ask_core::{Index, MODE_KEYWORD, query_terms, tokenize};

let mut ix = Index::new();
ix.add("Pricing: the free plan has 3 projects");
ix.add("Installation: run npm install @yuktishaalaa/ask-page and add one line");
ix.add("Options: choose Fast, Balanced or Best mode");

let hits = ix.search("How do I install it?", None, MODE_KEYWORD, 3);
assert_eq!(hits[0].doc, 1);

assert_eq!(tokenize("రత్నదీపాలు, రంగుల పద్యం!"), vec!["రత్నదీపాలు", "రంగుల", "పద్యం"]);
assert_eq!(query_terms("ask-page ఎలా install చేయాలి?"), vec!["ask", "install"]);
```

For hybrid search, store vectors with `quantize` and `Index::set_vectors`, then pass the question's vector and `MODE_HYBRID`.

Part of [YuktAI](https://github.com/sandeep-miriyala/yuktai), free and open source (GPL-3.0-only). Made by Sandeep Miriyala, Yuktishaalaa AI Lab.
