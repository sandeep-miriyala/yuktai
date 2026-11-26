# MiRa (మిరా): Telugu for every HTML element

Named after **Dr. Miriyala Ramakrishna (మిరా)**: writer, researcher, and a teacher of Telugu for 36 years.

Write the element and the font name. **MiRa does the rest**: the real tag, `lang="te"`, and a free Telugu font that loads only for Telugu letters.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira" defer></script>
</head>
<body mira="mandali">
  <mira h1 font="ntr">మిరా</mira h1>
  <mira p font="ramabhadra">ఒక్క పద్యం చాలు</mira p>
  <mira input font="mandali" placeholder="మీ పేరు">
</body>
</html>
```

The browser gets:

```html
<body class="mira-font-mandali">
  <h1 lang="te" class="mira-font-ntr">మిరా</h1>
  <p lang="te" class="mira-font-ramabhadra">ఒక్క పద్యం చాలు</p>
  <input placeholder="మీ పేరు" lang="te" class="mira-font-mandali">
</body>
```

## How to write it

| Write | For |
|---|---|
| `<mira h1 font="ntr">మిరా</mira h1>` | any element: `h1`–`h6`, `p`, `span`, `a`, `button`, `label`, `li`, `section`, `nav`, `form`… |
| `<mira input font="mandali" placeholder="మీ పేరు">` | elements with no closing tag (`input`, `img`, `br`, `hr`): **write no `</mira input>` in plain HTML** |
| `<h1 mira="ntr">మిరా</h1>` | React, Vue, anywhere |
| `<table mira="ntr">`, `<td mira="ntr">`, `<option mira="ntr">` | tables, their rows and cells, options and `<title>`: in plain HTML the browser drops unknown tags there before any script runs (`mira build` takes `<mira table>` too) |
| `<body mira="mandali">` | the whole page: every element with Telugu gets `lang="te"` |
| `<mira p truncate="20">…</mira p>` | cut to 20 letters, never in the middle of క్ష్మి; the full text goes in `title` |

- **The font is for Telugu letters only.** English and numbers keep your page's font.
- **Only the fonts the page uses are downloaded**, once, then cached.
- **Elements added later** (React, fetch) are handled too.
- **Without JavaScript** the text is still there, in the system font.
- A misspelt name gets a hint in the console: `"tleugu" అనే font లేదు. "telugu" అనుకుంటున్నారా?`

## The 22 fonts

Most of them were drawn for Silicon Andhra by **Appaji Ambarisha Darbha** and **Purushoth Kumar Guthula**.

| `font="…"` | Font | Designer | Suits |
|---|---|---|---|
| `telugu` | Noto Sans Telugu | Noto Project (Google) | plain, every letter (the default) |
| `noto-serif-telugu` | Noto Serif Telugu | Noto Project (Google) | book style, long reading |
| `mandali` | Mandali | Purushoth Kumar Guthula | plain and clear: paragraphs |
| `mallanna` | Mallanna | Purushoth Kumar Guthula | plain: paragraphs |
| `suravaram` | Suravaram | Purushoth Kumar Guthula | traditional: paragraphs |
| `hind-guntur` | Hind Guntur | Indian Type Foundry | modern: buttons, forms, menus |
| `ramabhadra` | Ramabhadra | Purushoth Kumar Guthula | strong: headings |
| `ntr` | NTR | Purushoth Kumar Guthula | strong: headings |
| `gurajada` | Gurajada | Purushoth Kumar Guthula | strong: headings |
| `ravi-prakash` | Ravi Prakash | Appaji Ambarisha Darbha | bold display: posters |
| `chathura` | Chathura | Appaji Ambarisha Darbha | thin and tall: headings |
| `gidugu` | Gidugu | Purushoth Kumar Guthula | decorative: headings |
| `dhurjati` | Dhurjati | Purushoth Kumar Guthula | decorative: headings |
| `ponnala` | Ponnala | Appaji Ambarisha Darbha | decorative: headings |
| `suranna` | Suranna | Purushoth Kumar Guthula | traditional: poems |
| `peddana` | Peddana | Appaji Ambarisha Darbha | traditional: poems |
| `ramaraja` | Ramaraja | Appaji Ambarisha Darbha | traditional: headings |
| `sree-krushnadevaraya` | Sree Krushnadevaraya | Purushoth Kumar Guthula | traditional: invitations |
| `sirivennela` | Sirivennela | Appaji Ambarisha Darbha | handwritten feel: songs, poems |
| `timmana` | Timmana | Appaji Ambarisha Darbha | handwritten feel: letters |
| `lakki-reddy` | Lakki Reddy | Appaji Ambarisha Darbha | playful: invitations |
| `tenali-ramakrishna` | Tenali Ramakrishna | Appaji Ambarisha Darbha | playful: stories, children |

All under the SIL Open Font License 1.1. Designers and copyright: [CREDITS.md](CREDITS.md).

## Privacy

**No request goes to Google.** The font files come unchanged from the Fontsource npm packages through jsDelivr. To serve them yourself, copy `@fontsource/<font>@5.3.0/files/` to your server and point MiRa at it:

```html
<script src="/mira.js" data-mira-fonts="/fonts/" defer></script>
```

## In page scripts

```js
mira.count("లక్ష్మి కృష్ణ")          // 4 letters (JavaScript's .length says 13)
mira.split("లక్ష్మి")                 // ["ల", "క్ష్మి"]
mira.truncate("ఒక్క పద్యం చాలు", 2)   // "ఒక్క…"
mira.html(pageText)                   // what `mira build` gives
mira.fonts()                          // the 22 names
```

## At build time (Rust)

The same Rust rules run on HTML files, so the browser gets finished HTML and needs no script:

```
cargo install --path rust/mira
mira build page.html -o out.html          # tags, lang, and the font CSS in <head>
mira build page.html --fonts /fonts/ -o out.html
mira check page.html                      # warnings only, for CI
mira fonts                                # the fonts and their designers
```

At build time `<mira table>`, `<mira td>`, `<mira option>` and `<mira title>` work too.

## How it works

```
rust/mira       the rules: tags, fonts, lang, aksharas, HTML (no dependencies)
rust/mira-web   the same rules on the live DOM, as WebAssembly (wasm-bindgen + web-sys)
mira.js         one file: rust/mira-web with the .wasm inside (npm run build:mira)
```

**All 101 HTML elements** MiRa knows are tested one by one in a real browser, and twelve real structures (forms, tables, lists, media, nested void tags) must come out the same from the browser and from `mira build`. Also tested: every `<mira>` tag converted, nothing swallowed after `<mira input>`, all 22 fonts loaded, no request leaving the site, axe 0 violations, and **`mira build` and the browser give the same page**.

## License

GPL-3.0-only. Sandeep Miriyala (సందీప్ మిరియాల), Yuktishaalaa AI Lab. The fonts keep their own license (OFL 1.1).
