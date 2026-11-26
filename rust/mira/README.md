# yuktai-mira: the rules behind MiRa (మిరా)

Telugu for every HTML element. Named after **Dr. Miriyala Ramakrishna (మిరా)**.

```rust
let out = mira::html::build(r#"<mira h1 font="ntr">మిరా</mira h1>"#, &mira::html::Options::default());
assert!(out.html.contains(r#"<h1 lang="te" class="mira-font-ntr">మిరా</h1>"#));

assert_eq!(mira::count("లక్ష్మి కృష్ణ"), 4);
assert_eq!(mira::split("లక్ష్మి"), ["ల", "క్ష్మి"]);
```

- `mira::html::build`: MiRa tags → real HTML, `lang="te"`, font CSS. Everything else is copied byte for byte.
- `mira::element::plan`: what happens to one element. The browser crate (`rust/mira-web`) uses the same function, so build and browser give the same page.
- `mira::fonts`: the 22 OFL Telugu fonts and their copyright notices.
- `mira::akshara`: `split`, `count`, `truncate` (rules and tests from Ratnalabala).
- The `mira` command: `mira build`, `mira check`, `mira fonts`, `mira split`, `mira count`.

No dependencies, no unsafe code. GPL-3.0-only. Sandeep Miriyala, Yuktishaalaa AI Lab. See `packages/mira/README.md`.
