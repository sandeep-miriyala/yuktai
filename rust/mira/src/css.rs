//! The CSS for the fonts a page uses: one `@font-face` per weight and one class.
//!
//! The font covers Telugu letters only (`unicode-range`), so English and numbers
//! keep the page's own font: `--mira-base`, which MiRa sets from the page in the
//! browser and a site can set itself.

use crate::fonts::{file_url, Font, UNICODE_RANGE};

/// The class MiRa puts on an element: `mira-font-ntr`.
pub fn class_name(font: &Font) -> String {
    format!("mira-font-{}", font.key)
}

/// `@font-face` rules and the class for one font.
pub fn font_css(font: &Font, base: &str) -> String {
    let mut out = String::new();
    for &w in font.weights {
        out.push_str(&format!(
            "@font-face{{font-family:\"{}\";font-style:normal;font-weight:{w};font-display:swap;src:url(\"{}\") format(\"woff2\");unicode-range:{UNICODE_RANGE}}}\n",
            font.family,
            file_url(base, font, w)
        ));
    }
    // form controls do not take the font from their parent on their own, and
    // code, kbd, samp and pre get monospace from the browser: Telugu needs the font there too
    out.push_str(&format!(
        ".{c},:where(.{c}) :where(input,select,textarea,button){{font-family:\"{f}\",var(--mira-base,system-ui,sans-serif)}}\n\
         .{c}:is(code,kbd,samp,pre),:where(.{c}) :where(code,kbd,samp,pre){{font-family:\"{f}\",ui-monospace,monospace}}\n",
        f = font.family,
        c = class_name(font)
    ));
    out
}

/// The CSS for several fonts, in the order given.
pub fn fonts_css(fonts: &[&Font], base: &str) -> String {
    fonts.iter().map(|f| font_css(f, base)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fonts::find;

    #[test]
    fn one_face_per_weight_and_one_class() {
        let css = font_css(find("hind-guntur").unwrap(), "https://cdn.jsdelivr.net/npm/");
        assert_eq!(css.matches("@font-face").count(), 2);
        assert!(css.contains("font-weight:700"));
        assert!(css.contains("unicode-range:U+0951-0952,U+0964-0965,U+0C00-0C7F"));
        assert!(css.contains("font-display:swap"));
        assert!(css.contains(".mira-font-hind-guntur,:where(.mira-font-hind-guntur) :where(input,select,textarea,button){font-family:\"Hind Guntur\",var(--mira-base,system-ui,sans-serif)}"));
        // code keeps monospace for English, the Telugu font for Telugu
        assert!(css.contains(".mira-font-hind-guntur:is(code,kbd,samp,pre),:where(.mira-font-hind-guntur) :where(code,kbd,samp,pre){font-family:\"Hind Guntur\",ui-monospace,monospace}"));
        assert!(!css.contains("googleapis"));
    }
}
