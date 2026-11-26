//! What MiRa does to one element. The build path ([`crate::html`]) and the
//! browser path (`yuktai-mira-web`) both ask [`plan`], so a page comes out the
//! same either way.
//!
//! Three ways to write it:
//!
//! | Written | Meaning |
//! |---|---|
//! | `<mira h1 font="ntr">మిరా</mira h1>` | a MiRa tag: the real tag is the first empty attribute that names an HTML element |
//! | `<h1 mira="ntr">మిరా</h1>` | any element, any framework (React too) |
//! | `<body mira="mandali">` | the whole page: Telugu text everywhere gets `lang="te"` |

use crate::css::class_name;
use crate::fonts::{find, suggest, Font, DEFAULT};
use crate::has_telugu;

/// Elements a MiRa tag can become.
pub const ELEMENTS: &[&str] = &[
    "a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "blockquote", "br", "button",
    "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn",
    "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2",
    "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "i", "iframe", "img", "input", "ins", "kbd", "label",
    "legend", "li", "main", "map", "mark", "menu", "meter", "nav", "object", "ol", "optgroup", "option", "output",
    "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select",
    "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot",
    "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr",
];

/// Elements with no closing tag. `<mira input …>` needs no `</mira input>`.
pub const VOID: &[&str] = &["area", "br", "col", "embed", "hr", "img", "input", "source", "track", "wbr"];

/// Before any script runs the browser moves an unknown tag out of a table, a
/// select or the head, and drops table rows that are not inside a real <table>.
/// So in plain HTML these need the attribute form, `<table mira="ntr">`,
/// `<td mira="ntr">`. `mira build` handles the `<mira table>` form too.
pub const BUILD_ONLY: &[&str] = &[
    "caption", "col", "colgroup", "optgroup", "option", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr",
];

/// Attributes whose Telugu a reader (or a screen reader) meets.
pub const TEXT_ATTRS: &[&str] = &["placeholder", "alt", "title", "aria-label", "value"];

/// One element as either path sees it. Names are lower case, attributes in source order.
#[derive(Debug, Clone)]
pub struct Input<'a> {
    pub name: &'a str,
    pub attrs: &'a [(String, String)],
    /// Its own text (not its children's) has Telugu.
    pub telugu_text: bool,
    /// An ancestor already says `lang="te"`.
    pub inside_te: bool,
    /// `<body mira>` is on: every element with Telugu gets `lang="te"`.
    pub whole_page: bool,
}

/// What to do.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct Plan {
    /// The element to make, when this is a `<mira …>` tag.
    pub tag: Option<&'static str>,
    /// Attribute names to drop (MiRa's own).
    pub remove: Vec<String>,
    /// Attributes to set.
    pub set: Vec<(String, String)>,
    /// Class to add.
    pub class: Option<String>,
    /// The font, when one was asked for and is known.
    pub font: Option<&'static Font>,
    /// Cut the text to this many letters (`truncate="20"`).
    pub truncate: Option<usize>,
    /// Problems to tell the developer about.
    pub warnings: Vec<Warning>,
}

impl Plan {
    /// Nothing to change.
    pub fn is_empty(&self) -> bool {
        self.tag.is_none() && self.remove.is_empty() && self.set.is_empty() && self.class.is_none() && self.truncate.is_none()
    }
    /// The element has no closing tag.
    pub fn is_void(&self) -> bool {
        self.tag.is_some_and(|t| VOID.contains(&t))
    }
}

/// A problem, in Telugu and English.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Warning {
    UnknownFont { given: String, suggestion: Option<&'static str> },
    MissingTag,
    NotAllowed(String),
    BadTruncate(String),
}

impl Warning {
    pub fn message(&self) -> String {
        match self {
            Warning::UnknownFont { given, suggestion: Some(s) } => format!(
                "\"{given}\" అనే font లేదు. \"{s}\" అనుకుంటున్నారా? / No font \"{given}\". Did you mean \"{s}\"?"
            ),
            Warning::UnknownFont { given, suggestion: None } => format!(
                "\"{given}\" అనే తెలుగు font MiRa లో లేదు. ఉన్నవి: {list} / No Telugu font \"{given}\" in MiRa. Fonts: {list}",
                list = crate::FONTS.iter().map(|f| f.key).collect::<Vec<_>>().join(", ")
            ),
            Warning::MissingTag => "<mira …> లో tag పేరు లేదు, ఉదా: <mira h1 font=\"ntr\">. span గా మార్చాం. / A <mira> tag needs an element name, e.g. <mira h1 font=\"ntr\">. Made it a span.".into(),
            Warning::NotAllowed(t) => format!(
                "<mira {t}> కుదరదు. <{t} mira=\"…\"> వాడండి. / <mira {t}> is not allowed. Use <{t} mira=\"…\">."
            ),
            Warning::BadTruncate(v) => format!(
                "truncate=\"{v}\" ఒక సంఖ్య కావాలి. / truncate=\"{v}\" must be a number."
            ),
        }
    }
}

fn attr<'a>(attrs: &'a [(String, String)], name: &str) -> Option<&'a str> {
    attrs.iter().find(|(n, _)| n == name).map(|(_, v)| v.as_str())
}

/// The real tag inside `<mira …>`: the first attribute with no value that names an element.
fn tag_of(attrs: &[(String, String)]) -> Result<(&'static str, String), Warning> {
    for (n, v) in attrs {
        if !v.is_empty() {
            continue;
        }
        if let Some(t) = ELEMENTS.iter().find(|e| **e == n) {
            return Ok((t, n.clone()));
        }
        if matches!(n.as_str(), "html" | "head" | "body" | "script" | "style" | "template" | "link" | "meta" | "base") {
            return Err(Warning::NotAllowed(n.clone()));
        }
    }
    Err(Warning::MissingTag)
}

/// Decide what MiRa does to one element.
pub fn plan(el: &Input) -> Plan {
    let mut p = Plan::default();
    let mut font_name: Option<&str> = None;

    if el.name == "mira" {
        match tag_of(el.attrs) {
            Ok((tag, attr_name)) => {
                p.tag = Some(tag);
                p.remove.push(attr_name);
            }
            Err(w) => {
                if let Warning::NotAllowed(n) = &w {
                    p.remove.push(n.clone());
                }
                p.tag = Some("span");
                p.warnings.push(w);
            }
        }
        if let Some(f) = attr(el.attrs, "font") {
            font_name = Some(f);
            p.remove.push("font".into());
        }
        if let Some(t) = attr(el.attrs, "truncate") {
            p.remove.push("truncate".into());
            match t.trim().parse::<usize>() {
                Ok(n) if n > 0 => p.truncate = Some(n),
                _ => p.warnings.push(Warning::BadTruncate(t.into())),
            }
        }
    }
    for name in ["mira", "mira-font"] {
        if let Some(f) = attr(el.attrs, name) {
            font_name = font_name.or(Some(f));
            p.remove.push(name.into());
        }
    }

    if let Some(given) = font_name {
        match find(given) {
            Some(f) => {
                p.font = Some(f);
                p.class = Some(class_name(f));
            }
            None => p.warnings.push(Warning::UnknownFont { given: given.trim().into(), suggestion: suggest(given) }),
        }
    }

    // lang="te": on MiRa elements always when they hold Telugu, on the rest of the page with <body mira>.
    let marked = p.tag.is_some() || font_name.is_some();
    let telugu = el.telugu_text
        || TEXT_ATTRS.iter().any(|a| attr(el.attrs, a).is_some_and(has_telugu));
    if (marked || el.whole_page) && telugu && !el.inside_te && attr(el.attrs, "lang").is_none() {
        p.set.push(("lang".into(), "te".into()));
    }
    p
}

/// The default font's name, for `<body mira>` with no value.
pub const DEFAULT_FONT: &str = DEFAULT;

#[cfg(test)]
mod tests {
    use super::*;

    fn a(list: &[(&str, &str)]) -> Vec<(String, String)> {
        list.iter().map(|(n, v)| (n.to_string(), v.to_string())).collect()
    }
    fn input<'a>(name: &'a str, attrs: &'a [(String, String)], telugu: bool) -> Input<'a> {
        Input { name, attrs, telugu_text: telugu, inside_te: false, whole_page: false }
    }

    #[test]
    fn mira_tag_becomes_the_real_tag() {
        let at = a(&[("h1", ""), ("font", "ntr")]);
        let p = plan(&input("mira", &at, true));
        assert_eq!(p.tag, Some("h1"));
        assert_eq!(p.remove, ["h1", "font"]);
        assert_eq!(p.class.as_deref(), Some("mira-font-ntr"));
        assert_eq!(p.set, [("lang".to_string(), "te".to_string())]);
        assert!(p.warnings.is_empty());
    }

    #[test]
    fn attribute_values_are_not_tags() {
        // title="…" and span="2" are attributes, the empty "a" is the tag
        let at = a(&[("title", "శీర్షిక"), ("a", ""), ("href", "/")]);
        assert_eq!(plan(&input("mira", &at, false)).tag, Some("a"));
    }

    #[test]
    fn void_elements_and_telugu_in_attributes() {
        let at = a(&[("input", ""), ("font", "mandali"), ("placeholder", "మీ పేరు")]);
        let p = plan(&input("mira", &at, false));
        assert!(p.is_void());
        assert_eq!(p.set, [("lang".to_string(), "te".to_string())]);
    }

    #[test]
    fn attribute_form_on_any_element() {
        let at = a(&[("mira", "ramabhadra")]);
        let p = plan(&input("p", &at, true));
        assert_eq!(p.tag, None);
        assert_eq!(p.remove, ["mira"]);
        assert_eq!(p.class.as_deref(), Some("mira-font-ramabhadra"));
    }

    #[test]
    fn body_mira_with_no_value_is_the_default_font() {
        let at = a(&[("mira", "")]);
        assert_eq!(plan(&input("body", &at, false)).class.as_deref(), Some("mira-font-telugu"));
    }

    #[test]
    fn unknown_font_warns_with_a_suggestion() {
        let at = a(&[("h1", ""), ("font", "tleugu")]);
        let p = plan(&input("mira", &at, true));
        assert_eq!(p.class, None);
        assert_eq!(p.warnings, [Warning::UnknownFont { given: "tleugu".into(), suggestion: Some("telugu") }]);
        assert!(p.warnings[0].message().contains("\"telugu\""));
    }

    #[test]
    fn missing_or_forbidden_tag() {
        let at = a(&[("font", "ntr")]);
        let p = plan(&input("mira", &at, true));
        assert_eq!(p.tag, Some("span"));
        assert_eq!(p.warnings, [Warning::MissingTag]);
        let at = a(&[("body", ""), ("font", "ntr")]);
        assert_eq!(plan(&input("mira", &at, true)).warnings, [Warning::NotAllowed("body".into())]);
    }

    #[test]
    fn lang_only_where_needed() {
        let none = a(&[]);
        // plain element: only with <body mira>
        assert!(plan(&input("p", &none, true)).is_empty());
        let whole = Input { whole_page: true, ..input("p", &none, true) };
        assert_eq!(plan(&whole).set.len(), 1);
        // not again inside lang="te", not over the page's own lang
        let inside = Input { inside_te: true, ..whole.clone() };
        assert!(plan(&inside).is_empty());
        let own = a(&[("lang", "en")]);
        assert!(plan(&Input { attrs: &own, ..whole }).is_empty());
        // English only: no lang
        let at = a(&[("h1", ""), ("font", "ntr")]);
        assert!(plan(&input("mira", &at, false)).set.is_empty());
    }

    #[test]
    fn truncate_attribute() {
        let at = a(&[("p", ""), ("truncate", "10")]);
        assert_eq!(plan(&input("mira", &at, true)).truncate, Some(10));
        let at = a(&[("p", ""), ("truncate", "పది")]);
        assert_eq!(plan(&input("mira", &at, true)).warnings, [Warning::BadTruncate("పది".into())]);
    }

    #[test]
    fn every_element_name_is_known_once() {
        for (i, e) in ELEMENTS.iter().enumerate() {
            assert!(!ELEMENTS[i + 1..].contains(e), "{e} twice");
        }
        for v in VOID.iter().chain(BUILD_ONLY) {
            assert!(ELEMENTS.contains(v), "{v}");
        }
    }
}
