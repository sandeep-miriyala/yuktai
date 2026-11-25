# yuktai-grid-core

The sort and search engine behind the [YuktAI data grid](https://sandeep-miriyala.github.io/yuktai/grid/), which searches and sorts 10 lakh (1,000,000) rows in the browser. Compiled to WebAssembly there; plain Rust works too.

- **`sort_by_keys`:** orders rows by number keys (numbers or dates as numbers). Empty rows (`NaN`) always go last, in both directions, and equal rows keep their original order: the same result as JavaScript's stable sort.
- **`search`:** finds the rows whose text contains the query. All the rows' text sits in one buffer, prepared once, so each keystroke only scans.
- **No allocator, no dependencies.** `no_std` on wasm32, so the .wasm is tiny.

```toml
[dependencies]
yuktai-grid-core = "0.1"
```

```rust
use yuktai_grid_core::{search, sort_by_keys};

// Sort: NaN = empty, always last
let keys = [30.0, f64::NAN, 10.0, 20.0];
let mut order = [0u32; 4];
sort_by_keys(&keys, false, &mut order);
assert_eq!(order, [2, 3, 0, 1]);

// Search: rows back to back, row i = text[offsets[i]..offsets[i + 1]]
let rows = ["ravi hyderabad", "sita vizag", "ramu hyderabad"];
let text: String = rows.concat();
let mut offsets = vec![0u32];
for r in rows { offsets.push(offsets.last().unwrap() + r.len() as u32); }
let mut out = [0u32; 3];
let n = search(text.as_bytes(), &offsets, b"hyderabad", &mut out);
assert_eq!(&out[..n], &[0, 2]);
```

The grid decides the rules (what is empty, what counts as a number or a date, what text is searched) and gives this engine plain numbers and text.

Part of [YuktAI](https://github.com/sandeep-miriyala/yuktai), free and open source (GPL-3.0-only). Made by Sandeep Miriyala, Yuktishaalaa AI Lab.
