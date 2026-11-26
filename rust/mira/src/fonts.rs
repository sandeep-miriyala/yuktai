//! The Telugu fonts MiRa knows, by the short name a developer writes in `font="…"`.
//!
//! Every font is free under the SIL Open Font License 1.1. MiRa serves the font
//! files unchanged from the Fontsource npm packages (Telugu part only), so no
//! request ever goes to Google and every font keeps its designers' names.
//! Several of these fonts came to everyone through Silicon Andhra
//! (fonts.siliconandhra.org), drawn by Appaji Ambarisha Darbha and Purushoth
//! Kumar Guthula; thanks to every designer listed here.

/// One font.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Font {
    /// What a developer writes: `font="ntr"`.
    pub key: &'static str,
    /// The CSS family name.
    pub family: &'static str,
    /// The npm package under `@fontsource/`.
    pub package: &'static str,
    /// Weights in the package (the browser makes bold from 400 when 700 is missing).
    pub weights: &'static [u16],
    /// Who drew it (from fonts.siliconandhra.org for the Silicon Andhra fonts).
    pub designer: &'static str,
    /// What it suits, in Telugu and English.
    pub style_te: &'static str,
    pub style_en: &'static str,
    /// From the font's own license file.
    pub copyright: &'static str,
}

/// The Fontsource release MiRa tested every font with.
pub const FONTSOURCE_VERSION: &str = "5.3.0";

/// The Telugu block plus the marks Telugu text uses (same as the font packages).
pub const UNICODE_RANGE: &str = "U+0951-0952,U+0964-0965,U+0C00-0C7F,U+1CDA,U+1CF2,U+200C-200D,U+25CC";

/// The name for the default font.
pub const DEFAULT: &str = "telugu";

/// MiRa 1.0: 22 Telugu fonts, most of them from Silicon Andhra.
pub const FONTS: [Font; 22] = [
    Font { key: "telugu", family: "Noto Sans Telugu", package: "noto-sans-telugu", weights: &[400, 700], designer: "Noto Project (Google)",
        style_te: "సాదా, అన్ని అక్షరాలు (default)", style_en: "plain, every letter (the default)",
        copyright: "Copyright 2022 The Noto Project Authors (https://github.com/notofonts/telugu)" },
    Font { key: "noto-serif-telugu", family: "Noto Serif Telugu", package: "noto-serif-telugu", weights: &[400, 700], designer: "Noto Project (Google)",
        style_te: "పుస్తకం శైలి, వ్యాసాలు", style_en: "book style, long reading",
        copyright: "Copyright 2022 The Noto Project Authors (https://github.com/notofonts/telugu)" },
    Font { key: "mandali", family: "Mandali", package: "mandali", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "సాదా, స్పష్టం: పేరాలు", style_en: "plain and clear: paragraphs",
        copyright: "Copyright (c) 2012 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "mallanna", family: "Mallanna", package: "mallanna", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "సాదా: పేరాలు", style_en: "plain: paragraphs",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
    Font { key: "suravaram", family: "Suravaram", package: "suravaram", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "సాంప్రదాయ: పేరాలు", style_en: "traditional: paragraphs",
        copyright: "Copyright (c) 2012 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "hind-guntur", family: "Hind Guntur", package: "hind-guntur", weights: &[400, 700], designer: "Indian Type Foundry",
        style_te: "ఆధునిక: buttons, forms, menus", style_en: "modern: buttons, forms, menus",
        copyright: "Copyright (c) 2015 Indian Type Foundry (info@indiantypefoundry.com)" },
    Font { key: "ramabhadra", family: "Ramabhadra", package: "ramabhadra", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "బలమైనది: శీర్షికలు", style_en: "strong: headings",
        copyright: "Copyright (c) 2012 Andhra Pradesh Society for Knowledge Networks (fonts.siliconandhra.org). Digitized data copyright (c) 2010-2012 Google Corporation" },
    Font { key: "ntr", family: "NTR", package: "ntr", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "బలమైనది: శీర్షికలు", style_en: "strong: headings",
        copyright: "Copyright (c) 2012 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "gurajada", family: "Gurajada", package: "gurajada", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "బలమైనది: శీర్షికలు", style_en: "strong: headings",
        copyright: "Copyright (c) 2012 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "ravi-prakash", family: "Ravi Prakash", package: "ravi-prakash", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "బలమైనది: posters", style_en: "bold display: posters",
        copyright: "Copyright (c) 2011 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "chathura", family: "Chathura", package: "chathura", weights: &[400, 700], designer: "Appaji Ambarisha Darbha",
        style_te: "సన్నగా: శీర్షికలు", style_en: "thin and tall: headings",
        copyright: "Copyright 2009 The Chathura Project Authors" },
    Font { key: "gidugu", family: "Gidugu", package: "gidugu", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "అలంకారం: శీర్షికలు", style_en: "decorative: headings",
        copyright: "Copyright 2025 The Gidugu Project Authors (https://github.com/googlefonts/gidugu)" },
    Font { key: "dhurjati", family: "Dhurjati", package: "dhurjati", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "అలంకారం: శీర్షికలు", style_en: "decorative: headings",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
    Font { key: "ponnala", family: "Ponnala", package: "ponnala", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "అలంకారం: శీర్షికలు", style_en: "decorative: headings",
        copyright: "Copyright (c) 2012 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "suranna", family: "Suranna", package: "suranna", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "సాంప్రదాయ: పద్యాలు", style_en: "traditional: poems",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
    Font { key: "peddana", family: "Peddana", package: "peddana", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "సాంప్రదాయ: పద్యాలు", style_en: "traditional: poems",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
    Font { key: "ramaraja", family: "Ramaraja", package: "ramaraja", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "సాంప్రదాయ: శీర్షికలు", style_en: "traditional: headings",
        copyright: "Copyright (c) 2012 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "sree-krushnadevaraya", family: "Sree Krushnadevaraya", package: "sree-krushnadevaraya", weights: &[400], designer: "Purushoth Kumar Guthula",
        style_te: "సాంప్రదాయ: ఆహ్వానాలు", style_en: "traditional: invitations",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
    Font { key: "sirivennela", family: "Sirivennela", package: "sirivennela", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "చేతిరాత శైలి: పాటలు, కవితలు", style_en: "handwritten feel: songs, poems",
        copyright: "Copyright 2021 The Sirivennela Font Project Authors (https://github.com/appajid/Sirivennela)" },
    Font { key: "timmana", family: "Timmana", package: "timmana", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "చేతిరాత శైలి: ఉత్తరాలు", style_en: "handwritten feel: letters",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
    Font { key: "lakki-reddy", family: "Lakki Reddy", package: "lakki-reddy", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "సరదా అలంకారం: ఆహ్వానాలు", style_en: "playful: invitations",
        copyright: "Copyright (c) 2011 Silicon Andhra (fonts.siliconandhra.org)" },
    Font { key: "tenali-ramakrishna", family: "Tenali Ramakrishna", package: "tenali-ramakrishna", weights: &[400], designer: "Appaji Ambarisha Darbha",
        style_te: "సరదా: కథలు, పిల్లలు", style_en: "playful: stories, children",
        copyright: "Copyright (c) 2012 Andhrapradesh Society for Knowledge Networks (fonts.siliconandhra.org)" },
];

/// `"NTR"`, `" ntr "`, `"Tenali Ramakrishna"`, `"tenali_ramakrishna"` → the same key.
fn normalize(name: &str) -> String {
    name.trim().to_lowercase().chars().map(|c| if c == ' ' || c == '_' { '-' } else { c }).collect()
}

/// The font for a name, or `None`. An empty name means the default font.
pub fn find(name: &str) -> Option<&'static Font> {
    let n = normalize(name);
    let key = match n.as_str() {
        "" | "default" | "noto-sans-telugu" | "noto-sans" => DEFAULT,
        "noto-serif" => "noto-serif-telugu",
        "hind" => "hind-guntur",
        "tenali" => "tenali-ramakrishna",
        k => k,
    };
    FONTS.iter().find(|f| f.key == key)
}

/// The closest known name for a misspelt one (`"tleugu"` → `"telugu"`).
pub fn suggest(name: &str) -> Option<&'static str> {
    let n = normalize(name);
    if n.is_empty() {
        return None;
    }
    FONTS
        .iter()
        .map(|f| (distance(&n, f.key), f.key))
        .filter(|(d, key)| *d <= 2.max(key.chars().count() / 3))
        .min()
        .map(|(_, key)| key)
}

/// Edit distance, with a swap of two neighbouring letters counted as one edit.
fn distance(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let mut d = vec![vec![0usize; b.len() + 1]; a.len() + 1];
    for (i, row) in d.iter_mut().enumerate() {
        row[0] = i;
    }
    for (j, cell) in d[0].iter_mut().enumerate() {
        *cell = j;
    }
    for i in 1..=a.len() {
        for j in 1..=b.len() {
            let cost = usize::from(a[i - 1] != b[j - 1]);
            let mut v = (d[i - 1][j] + 1).min(d[i][j - 1] + 1).min(d[i - 1][j - 1] + cost);
            if i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1] {
                v = v.min(d[i - 2][j - 2] + 1);
            }
            d[i][j] = v;
        }
    }
    d[a.len()][b.len()]
}

/// Where one font file lives under `base` (default: jsDelivr's npm mirror).
pub fn file_url(base: &str, font: &Font, weight: u16) -> String {
    let base = base.trim_end_matches('/');
    format!(
        "{base}/@fontsource/{p}@{v}/files/{p}-telugu-{weight}-normal.woff2",
        p = font.package,
        v = FONTSOURCE_VERSION
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_fonts_by_any_spelling() {
        assert_eq!(find("ntr").unwrap().family, "NTR");
        assert_eq!(find(" NTR ").unwrap().key, "ntr");
        assert_eq!(find("Tenali Ramakrishna").unwrap().key, "tenali-ramakrishna");
        assert_eq!(find("tenali_ramakrishna").unwrap().key, "tenali-ramakrishna");
        assert_eq!(find("").unwrap().key, "telugu");
        assert_eq!(find("telugu").unwrap().family, "Noto Sans Telugu");
        assert!(find("arial").is_none());
    }

    #[test]
    fn suggests_the_closest_name() {
        assert_eq!(suggest("tleugu"), Some("telugu"));
        assert_eq!(suggest("ramabhadhra"), Some("ramabhadra"));
        assert_eq!(suggest("rambarda"), Some("ramabhadra"));
        assert_eq!(suggest("mandly"), Some("mandali"));
        assert_eq!(suggest("arial"), None);
    }

    #[test]
    fn keys_are_unique_and_lowercase() {
        for (i, f) in FONTS.iter().enumerate() {
            assert_eq!(f.key, normalize(f.key));
            assert!(FONTS[i + 1..].iter().all(|g| g.key != f.key));
            assert!(f.weights.contains(&400));
        }
    }

    #[test]
    fn file_urls_point_at_the_telugu_files() {
        let ntr = find("ntr").unwrap();
        assert_eq!(
            file_url("https://cdn.jsdelivr.net/npm/", ntr, 400),
            "https://cdn.jsdelivr.net/npm/@fontsource/ntr@5.3.0/files/ntr-telugu-400-normal.woff2"
        );
        assert_eq!(file_url("/fonts", ntr, 400), "/fonts/@fontsource/ntr@5.3.0/files/ntr-telugu-400-normal.woff2");
    }
}
