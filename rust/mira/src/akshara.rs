//! Aksharas: the letters a Telugu reader sees.
//!
//! `"లక్ష్మి".chars().count()` is 7 and JavaScript's `.length` is 7, but a reader
//! sees two letters: ల and క్ష్మి. These rules come from Ratnalabala's
//! `telugu-akshara` crate, with its tests.
//!
//! * a vowel sign, anusvara, visarga, nukta or virama joins the letter before it;
//! * after a virama the next consonant (or ZWNJ) joins too: క్ష్మి is one akshara;
//! * ZWJ keeps a conjunct going, ZWNJ ends it.

const VIRAMA: char = '\u{0C4D}';
const ZWNJ: char = '\u{200C}';
const ZWJ: char = '\u{200D}';

fn is_mark(c: char) -> bool {
    matches!(c as u32,
        0x0C00..=0x0C04       // candrabindu, anusvara, visarga
        | 0x0C3C              // nukta
        | 0x0C3E..=0x0C4D     // vowel signs + virama
        | 0x0C55..=0x0C56     // length marks
        | 0x0C62..=0x0C63)    // vocalic L/LL signs
}

fn is_consonant(c: char) -> bool {
    matches!(c as u32, 0x0C15..=0x0C39 | 0x0C58..=0x0C5A)
}

/// Spaces, punctuation, dandas and joiners are never a letter on their own.
fn is_skipped(c: char) -> bool {
    c.is_whitespace() || c.is_control() || c.is_ascii_punctuation() || matches!(c, '\u{0964}' | '\u{0965}' | ZWNJ | ZWJ)
}

/// Byte ranges of every unit in the text, in order: each akshara, and each
/// skipped character on its own. `split`, `count` and `truncate` use these.
fn units(text: &str) -> Vec<(usize, usize, bool)> {
    let mut out = Vec::new();
    let mut start: Option<usize> = None;
    let mut after_virama = false;
    for (i, c) in text.char_indices() {
        let joins = start.is_some()
            && (is_mark(c) || c == ZWJ || (after_virama && (is_consonant(c) || c == ZWNJ)));
        if !joins {
            if let Some(s) = start.take() {
                out.push((s, i, true));
            }
            if is_skipped(c) {
                out.push((i, i + c.len_utf8(), false));
                after_virama = false;
                continue;
            }
            start = Some(i);
        }
        match c {
            VIRAMA => after_virama = true,
            ZWJ => {}
            _ => after_virama = false,
        }
    }
    if let Some(s) = start {
        out.push((s, text.len(), true));
    }
    out
}

/// The aksharas of a text, without spaces and punctuation.
///
/// ```
/// assert_eq!(mira::split("కృష్ణ లక్ష్మి"), ["కృ", "ష్ణ", "ల", "క్ష్మి"]);
/// ```
pub fn split(text: &str) -> Vec<&str> {
    units(text).into_iter().filter(|u| u.2).map(|(s, e, _)| &text[s..e]).collect()
}

/// How many letters a reader sees (spaces and punctuation are not counted).
///
/// ```
/// assert_eq!(mira::count("కృష్ణ లక్ష్మి"), 4);
/// ```
pub fn count(text: &str) -> usize {
    units(text).iter().filter(|u| u.2).count()
}

/// The first `max` letters and "…", never cutting a letter in half.
/// Text that already fits comes back unchanged.
///
/// ```
/// assert_eq!(mira::truncate("లక్ష్మి స్త్రీ కృష్ణ", 3), "లక్ష్మి స్త్రీ…");
/// assert_eq!(mira::truncate("తెలుగు", 3), "తెలుగు");
/// ```
pub fn truncate(text: &str, max: usize) -> String {
    let mut seen = 0;
    for (_, end, letter) in units(text) {
        if letter {
            seen += 1;
            if seen == max {
                let rest = &text[end..];
                if count(rest) == 0 {
                    return text.to_string();
                }
                return format!("{}…", text[..end].trim_end());
            }
        }
    }
    text.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    // From Ratnalabala (rust/telugu-akshara), unchanged.
    #[test]
    fn splits_telugu_word_into_aksharas() {
        assert_eq!(split("ఎలుక"), ["ఎ", "లు", "క"]);
        assert_eq!(split("తెలుగు"), ["తె", "లు", "గు"]);
    }

    #[test]
    fn keeps_conjunct_consonants_together() {
        assert_eq!(split("కృష్ణ"), ["కృ", "ష్ణ"]);
        assert_eq!(split("లక్ష్మి"), ["ల", "క్ష్మి"]);
        assert_eq!(split("స్త్రీ"), ["స్త్రీ"]);
    }

    #[test]
    fn anusvara_stays_with_its_letter() {
        assert_eq!(split("సంతోషం"), ["సం", "తో", "షం"]);
    }

    #[test]
    fn skips_punctuation_and_spaces() {
        assert_eq!(split("అమ్మ! బాగుంది"), ["అ", "మ్మ", "బా", "గుం", "ది"]);
        assert!(split("  !! ").is_empty());
    }

    #[test]
    fn skips_control_characters() {
        assert_eq!(split("అ\u{1f}మ\tక"), ["అ", "మ", "క"]);
    }

    #[test]
    fn zwnj_breaks_conjunct() {
        assert_eq!(split("క్\u{200c}ష"), ["క్\u{200c}", "ష"]);
    }

    // New in MiRa.
    #[test]
    fn hard_conjuncts_are_one_letter() {
        assert_eq!(split("ర్ఘ్య"), ["ర్ఘ్య"]);
        assert_eq!(split("శ్రీ"), ["శ్రీ"]);
        assert_eq!(count("క్ష్మ్య"), 1);
    }

    #[test]
    fn counts_letters_not_code_points() {
        assert_eq!("లక్ష్మి".chars().count(), 7);
        assert_eq!(count("లక్ష్మి"), 2);
        assert_eq!(count("మిరా"), 2);
        assert_eq!(count(""), 0);
        assert_eq!(count("Hello"), 5);
    }

    #[test]
    fn truncates_on_letter_boundaries() {
        assert_eq!(truncate("ఒక్క పద్యం చాలు", 2), "ఒక్క…");
        assert_eq!(truncate("ఒక్క పద్యం చాలు", 4), "ఒక్క పద్యం…");
        assert_eq!(truncate("ఒక్క పద్యం చాలు", 6), "ఒక్క పద్యం చాలు");
        assert_eq!(truncate("ఒక్క పద్యం చాలు!", 6), "ఒక్క పద్యం చాలు!");
        assert_eq!(truncate("లక్ష్మి", 1), "ల…");
    }
}
