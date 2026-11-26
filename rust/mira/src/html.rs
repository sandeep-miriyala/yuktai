//! MiRa on HTML text: at build time, on a server, or with the `mira` command.
//!
//! Everything MiRa does not change comes out byte for byte as it went in:
//! the page's own tags, spacing, comments, scripts and styles. Only `<mira …>`
//! tags, MiRa attributes and `lang="te"` change, and the font CSS goes in
//! before `</head>`.

use crate::css::fonts_css;
use crate::element::{plan, Input, Warning};
use crate::fonts::Font;
use crate::{has_telugu, truncate};

/// Settings for [`build`].
#[derive(Debug, Clone)]
pub struct Options {
    /// Where the font files are: jsDelivr by default, or your own folder
    /// laid out like npm (`/fonts/@fontsource/ntr@5.3.0/files/…`).
    pub font_base: String,
    /// Put the font CSS into the page (`<style data-mira>`). Off: read it from [`Output::css`].
    pub inline_css: bool,
}

impl Default for Options {
    fn default() -> Self {
        Options { font_base: "https://cdn.jsdelivr.net/npm/".into(), inline_css: true }
    }
}

/// A problem, with the line it is on.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Diagnostic {
    pub line: usize,
    pub warning: Warning,
}

/// What [`build`] gives back.
#[derive(Debug, Clone)]
pub struct Output {
    pub html: String,
    /// The `@font-face` rules and classes for the fonts used.
    pub css: String,
    /// Keys of the fonts used, in the order first met.
    pub fonts: Vec<&'static str>,
    pub warnings: Vec<Diagnostic>,
}

// ---------- reading HTML ----------

#[derive(Debug, Clone)]
struct Attr {
    name: String,
    value: String,
    /// As written, with its leading space: ` href="/"`.
    raw: String,
}

#[derive(Debug)]
struct Start {
    name: String,
    attrs: Vec<Attr>,
    raw: String,
    self_closing: bool,
    at: usize,
}

#[derive(Debug)]
enum Node {
    /// Text, a comment, a doctype, script or style content: copied as is.
    Raw(String),
    Text(String),
    Element { start: Start, children: Vec<Node>, end: Option<String> },
}

const RAW_TEXT: &[&str] = &["script", "style"];
const RCDATA: &[&str] = &["textarea", "title"];
const HTML_VOID: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
];

fn find_ci(hay: &str, needle: &str) -> Option<usize> {
    let (h, n) = (hay.as_bytes(), needle.as_bytes());
    (0..=h.len().saturating_sub(n.len())).find(|&i| h.len() >= n.len() && h[i..i + n.len()].eq_ignore_ascii_case(n))
}

/// Reads a start tag at `s[0] == '<'`. Returns the tag and its length.
fn read_start(s: &str, at: usize) -> Option<(Start, usize)> {
    let b = s.as_bytes();
    if b.len() < 2 || !b[1].is_ascii_alphabetic() {
        return None;
    }
    let mut i = 1;
    while i < b.len() && !b[i].is_ascii_whitespace() && b[i] != b'>' && b[i] != b'/' {
        i += 1;
    }
    let name = s[1..i].to_ascii_lowercase();
    let mut attrs = Vec::new();
    let mut self_closing = false;
    loop {
        let from = i;
        while i < b.len() && b[i].is_ascii_whitespace() {
            i += 1;
        }
        if i >= b.len() {
            return None;
        }
        if b[i] == b'>' {
            i += 1;
            break;
        }
        if b[i] == b'/' {
            i += 1;
            if i < b.len() && b[i] == b'>' {
                self_closing = true;
                i += 1;
                break;
            }
            continue;
        }
        let ns = i;
        while i < b.len() && !b[i].is_ascii_whitespace() && !matches!(b[i], b'=' | b'>' | b'/') {
            i += 1;
        }
        let an = s[ns..i].to_ascii_lowercase();
        let mut j = i;
        while j < b.len() && b[j].is_ascii_whitespace() {
            j += 1;
        }
        let mut value = String::new();
        if j < b.len() && b[j] == b'=' {
            j += 1;
            while j < b.len() && b[j].is_ascii_whitespace() {
                j += 1;
            }
            if j < b.len() && (b[j] == b'"' || b[j] == b'\'') {
                let q = b[j];
                let vs = j + 1;
                let ve = vs + s[vs..].bytes().position(|c| c == q)?;
                value = s[vs..ve].to_string();
                j = ve + 1;
            } else {
                let vs = j;
                while j < b.len() && !b[j].is_ascii_whitespace() && b[j] != b'>' {
                    j += 1;
                }
                value = s[vs..j].to_string();
            }
            i = j;
        }
        attrs.push(Attr { name: an, value: decode(&value), raw: s[from..i].to_string() });
    }
    Some((Start { name, attrs, raw: s[..i].to_string(), self_closing, at }, i))
}

/// The few entities that matter for finding Telugu in attributes.
fn decode(v: &str) -> String {
    if !v.contains('&') {
        return v.to_string();
    }
    let mut out = String::new();
    let mut rest = v;
    while let Some(p) = rest.find('&') {
        out.push_str(&rest[..p]);
        rest = &rest[p..];
        let end = rest.find(';').filter(|&e| e <= 10);
        let ent = end.map(|e| &rest[1..e]);
        let ch = match ent {
            Some("amp") => Some('&'),
            Some("lt") => Some('<'),
            Some("gt") => Some('>'),
            Some("quot") => Some('"'),
            Some("apos") | Some("#39") => Some('\''),
            Some(e) if e.starts_with("#x") || e.starts_with("#X") => u32::from_str_radix(&e[2..], 16).ok().and_then(char::from_u32),
            Some(e) if e.starts_with('#') => e[1..].parse().ok().and_then(char::from_u32),
            _ => None,
        };
        match (ch, end) {
            (Some(c), Some(e)) => {
                out.push(c);
                rest = &rest[e + 1..];
            }
            _ => {
                out.push('&');
                rest = &rest[1..];
            }
        }
    }
    out.push_str(rest);
    out
}

fn escape_attr(v: &str) -> String {
    v.replace('&', "&amp;").replace('"', "&quot;")
}

fn escape_text(v: &str) -> String {
    v.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;")
}

/// The tag a `<mira …>` start tag becomes, for knowing whether it closes.
fn mira_tag(start: &Start) -> Option<&'static str> {
    let attrs: Vec<(String, String)> = start.attrs.iter().map(|a| (a.name.clone(), a.value.clone())).collect();
    plan(&Input { name: "mira", attrs: &attrs, telugu_text: false, inside_te: false, whole_page: false }).tag
}

fn parse(src: &str) -> Vec<Node> {
    // Each open element: (start, children, its tag for MiRa tags).
    let mut stack: Vec<(Start, Vec<Node>)> = Vec::new();
    let mut top: Vec<Node> = Vec::new();
    let mut i = 0;
    let mut text_from = 0;

    fn push(stack: &mut [(Start, Vec<Node>)], top: &mut Vec<Node>, n: Node) {
        match stack.last_mut() {
            Some((_, kids)) => kids.push(n),
            None => top.push(n),
        }
    }
    fn close(stack: &mut Vec<(Start, Vec<Node>)>, top: &mut Vec<Node>, end: Option<String>) {
        if let Some((start, children)) = stack.pop() {
            push(stack, top, Node::Element { start, children, end });
        }
    }

    while let Some(off) = src[i..].find('<') {
        let at = i + off;
        let rest = &src[at..];
        // what kind of '<' is this?
        let (node, len): (Option<Node>, usize) = if rest.starts_with("<!--") {
            let e = rest.find("-->").map(|e| e + 3).unwrap_or(rest.len());
            (Some(Node::Raw(rest[..e].to_string())), e)
        } else if rest.starts_with("<!") || rest.starts_with("<?") {
            let e = rest.find('>').map(|e| e + 1).unwrap_or(rest.len());
            (Some(Node::Raw(rest[..e].to_string())), e)
        } else if rest.starts_with("</") && rest.len() > 2 && rest.as_bytes()[2].is_ascii_alphabetic() {
            (None, 0)
        } else if let Some((start, len)) = read_start(rest, at) {
            if text_from < at {
                push(&mut stack, &mut top, Node::Text(src[text_from..at].to_string()));
            }
            let name = start.name.clone();
            let void = start.self_closing
                || HTML_VOID.contains(&name.as_str())
                || (name == "mira" && mira_tag(&start).is_some_and(|t| crate::element::VOID.contains(&t)));
            i = at + len;
            text_from = i;
            if void {
                push(&mut stack, &mut top, Node::Element { start, children: vec![], end: None });
            } else if RAW_TEXT.contains(&name.as_str()) || RCDATA.contains(&name.as_str()) {
                let close_at = find_ci(&src[i..], &format!("</{name}")).map(|p| i + p).unwrap_or(src.len());
                let close_end = src[close_at..].find('>').map(|e| close_at + e + 1).unwrap_or(src.len());
                let inner = &src[i..close_at];
                let child = if RAW_TEXT.contains(&name.as_str()) { Node::Raw(inner.to_string()) } else { Node::Text(inner.to_string()) };
                let end = (close_at < src.len()).then(|| src[close_at..close_end].to_string());
                push(&mut stack, &mut top, Node::Element { start, children: vec![child], end });
                i = close_end;
                text_from = i;
            } else {
                stack.push((start, vec![]));
            }
            continue;
        } else {
            i = at + 1;
            continue;
        };

        if text_from < at {
            push(&mut stack, &mut top, Node::Text(src[text_from..at].to_string()));
        }
        if let Some(n) = node {
            push(&mut stack, &mut top, n);
            i = at + len;
            text_from = i;
            continue;
        }

        // an end tag: </name …>
        let e = rest.find('>').map(|e| e + 1).unwrap_or(rest.len());
        let raw = rest[..e].to_string();
        let name: String = rest[2..]
            .chars()
            .take_while(|c| !c.is_ascii_whitespace() && *c != '>' && *c != '/')
            .collect::<String>()
            .to_ascii_lowercase();
        i = at + e;
        text_from = i;
        match stack.iter().rposition(|(s, _)| s.name == name) {
            Some(pos) => {
                while stack.len() > pos + 1 {
                    close(&mut stack, &mut top, None);
                }
                close(&mut stack, &mut top, Some(raw));
            }
            // </mira input> after a void MiRa tag: nothing to close, drop it
            None if name == "mira" => {}
            None => push(&mut stack, &mut top, Node::Raw(raw)),
        }
    }
    if text_from < src.len() {
        push(&mut stack, &mut top, Node::Text(src[text_from..].to_string()));
    }
    while !stack.is_empty() {
        close(&mut stack, &mut top, None);
    }
    top
}

// ---------- changing it ----------

struct Run<'s> {
    src: &'s str,
    whole_page: bool,
    fonts: Vec<&'static Font>,
    warnings: Vec<Diagnostic>,
}

impl Run<'_> {
    fn line(&self, at: usize) -> usize {
        self.src[..at.min(self.src.len())].matches('\n').count() + 1
    }

    fn write(&mut self, nodes: Vec<Node>, inside_te: bool, out: &mut String) {
        for n in nodes {
            match n {
                Node::Raw(s) | Node::Text(s) => out.push_str(&s),
                Node::Element { start, mut children, end } => {
                    let attrs: Vec<(String, String)> = start.attrs.iter().map(|a| (a.name.clone(), a.value.clone())).collect();
                    let telugu_text = children.iter().any(|c| matches!(c, Node::Text(t) if has_telugu(t)));
                    let p = plan(&Input { name: &start.name, attrs: &attrs, telugu_text, inside_te, whole_page: self.whole_page });
                    for w in p.warnings.iter().cloned() {
                        let line = self.line(start.at);
                        self.warnings.push(Diagnostic { line, warning: w });
                    }
                    if let Some(f) = p.font {
                        if !self.fonts.contains(&f) {
                            self.fonts.push(f);
                        }
                    }
                    let in_te = inside_te
                        || p.set.iter().any(|(n, v)| n == "lang" && v == "te")
                        || attrs.iter().any(|(n, v)| n == "lang" && v.to_ascii_lowercase().starts_with("te"));

                    if p.is_empty() {
                        out.push_str(&start.raw);
                    } else {
                        let tag = p.tag.unwrap_or(&start.name);
                        out.push('<');
                        out.push_str(if p.tag.is_some() { tag } else { &start.raw[1..1 + start.name.len()] });
                        let mut class_done = false;
                        for a in &start.attrs {
                            if p.remove.contains(&a.name) {
                                continue;
                            }
                            if a.name == "class" {
                                if let Some(c) = &p.class {
                                    out.push_str(&format!(" class=\"{}\"", escape_attr(&join_class(&a.value, c))));
                                    class_done = true;
                                    continue;
                                }
                            }
                            out.push_str(&a.raw);
                        }
                        for (n, v) in &p.set {
                            out.push_str(&format!(" {n}=\"{}\"", escape_attr(v)));
                        }
                        if let (Some(c), false) = (&p.class, class_done) {
                            out.push_str(&format!(" class=\"{c}\""));
                        }
                        if let Some(max) = p.truncate {
                            if let [Node::Text(t)] = children.as_slice() {
                                let full = t.trim().to_string();
                                let short = truncate(&full, max);
                                if short != full {
                                    if !start.attrs.iter().any(|a| a.name == "title") {
                                        out.push_str(&format!(" title=\"{}\"", escape_attr(&full)));
                                    }
                                    children = vec![Node::Text(escape_text(&short))];
                                }
                            }
                        }
                        out.push_str(if start.self_closing && p.tag.is_none() { " />" } else { ">" });
                    }
                    let void = p.is_void() || (p.tag.is_none() && (start.self_closing || HTML_VOID.contains(&start.name.as_str())));
                    self.write(children, in_te, out);
                    if void {
                        continue;
                    }
                    match (p.tag, end) {
                        (Some(t), _) => out.push_str(&format!("</{t}>")),
                        (None, Some(e)) => out.push_str(&e),
                        (None, None) => {}
                    }
                }
            }
        }
    }
}

fn join_class(existing: &str, add: &str) -> String {
    if existing.split_whitespace().any(|c| c == add) {
        existing.to_string()
    } else if existing.trim().is_empty() {
        add.to_string()
    } else {
        format!("{} {add}", existing.trim())
    }
}

fn has_whole_page(nodes: &[Node]) -> bool {
    nodes.iter().any(|n| match n {
        Node::Element { start, children, .. } => {
            (start.name == "body" && start.attrs.iter().any(|a| a.name == "mira" || a.name == "mira-font"))
                || has_whole_page(children)
        }
        _ => false,
    })
}

/// Turn a page's MiRa tags into real HTML and add the font CSS.
///
/// ```
/// use mira::html::{build, Options};
/// let page = r#"<head></head><body mira="mandali">
///   <mira h1 font="ntr">మిరా</mira h1>
///   <mira input font="mandali" placeholder="మీ పేరు">
/// </body>"#;
/// let out = build(page, &Options::default());
/// assert!(out.html.contains(r#"<h1 lang="te" class="mira-font-ntr">మిరా</h1>"#));
/// assert!(out.html.contains(r#"<input placeholder="మీ పేరు" lang="te" class="mira-font-mandali">"#));
/// assert!(out.html.contains(r#"<body class="mira-font-mandali">"#));
/// assert_eq!(out.fonts, ["mandali", "ntr"]);
/// ```
pub fn build(src: &str, options: &Options) -> Output {
    let nodes = parse(src);
    let mut run = Run { src, whole_page: has_whole_page(&nodes), fonts: vec![], warnings: vec![] };
    let mut html = String::with_capacity(src.len() + 256);
    run.write(nodes, false, &mut html);
    let css = fonts_css(&run.fonts, &options.font_base);
    if options.inline_css && !css.is_empty() {
        let style = format!("<style data-mira>\n{css}</style>\n");
        let at = find_ci(&html, "</head>").or_else(|| find_ci(&html, "<body")).unwrap_or(0);
        html.insert_str(at, &style);
    }
    Output { html, css, fonts: run.fonts.iter().map(|f| f.key).collect(), warnings: run.warnings }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn b(src: &str) -> Output {
        build(src, &Options { inline_css: false, ..Options::default() })
    }

    #[test]
    fn the_example_from_the_readme() {
        let page = "<script src=\"https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira\" defer></script>\n<body mira=\"mandali\">\n  <mira h1 font=\"ntr\">మిరా</mira h1>\n  <mira p font=\"ramabhadra\">ఒక్క పద్యం చాలు</mira p>\n  <mira input font=\"mandali\" placeholder=\"మీ పేరు\">\n</body>";
        let out = b(page);
        assert_eq!(
            out.html,
            "<script src=\"https://cdn.jsdelivr.net/npm/@yuktishaalaa/mira\" defer></script>\n<body class=\"mira-font-mandali\">\n  <h1 lang=\"te\" class=\"mira-font-ntr\">మిరా</h1>\n  <p lang=\"te\" class=\"mira-font-ramabhadra\">ఒక్క పద్యం చాలు</p>\n  <input placeholder=\"మీ పేరు\" lang=\"te\" class=\"mira-font-mandali\">\n</body>"
        );
        assert_eq!(out.fonts, ["mandali", "ntr", "ramabhadra"]);
        assert!(out.warnings.is_empty());
    }

    #[test]
    fn a_page_without_mira_is_unchanged() {
        let page = "<!doctype html>\n<html lang=\"en\"><head><title>Hi</title><style>p{x:1}</style></head>\n<body><p>Hello <b>there</b><br>\n<li>one<li>two<!-- <mira p> --></body></html>";
        assert_eq!(b(page).html, page);
        assert_eq!(build(page, &Options::default()).html, page);
    }

    #[test]
    fn script_and_style_are_never_touched() {
        let page = "<script>let s = '<mira h1 font=\"ntr\">x</mira h1>';</script><style>/* <mira p> */</style>";
        assert_eq!(b(page).html, page);
    }

    #[test]
    fn upper_case_and_nested_tags() {
        let out = b("<MIRA SECTION FONT=\"suranna\"><mira h2 font=\"ntr\">పద్యం</mira h2><mira span>మిరా</mira span></MIRA SECTION>");
        assert_eq!(
            out.html,
            "<section class=\"mira-font-suranna\"><h2 lang=\"te\" class=\"mira-font-ntr\">పద్యం</h2><span lang=\"te\">మిరా</span></section>"
        );
    }

    #[test]
    fn closing_tag_may_be_plain() {
        assert_eq!(b("<mira p font=\"ntr\">మిరా</mira>").html, "<p lang=\"te\" class=\"mira-font-ntr\">మిరా</p>");
    }

    #[test]
    fn void_tags_with_or_without_a_closing_tag() {
        let out = b("<mira img font=\"ntr\" src=\"m.jpg\" alt=\"మిరా గారు\"></mira img><p>after</p><mira br><mira hr/>");
        assert_eq!(out.html, "<img src=\"m.jpg\" alt=\"మిరా గారు\" lang=\"te\" class=\"mira-font-ntr\"><p>after</p><br><hr>");
    }

    #[test]
    fn tables_selects_and_title_work_at_build_time() {
        let out = b("<table><tr><mira td font=\"ntr\">పేరు</mira td></tr></table><select><mira option value=\"1\">ఒకటి</mira option></select>");
        assert_eq!(
            out.html,
            "<table><tr><td lang=\"te\" class=\"mira-font-ntr\">పేరు</td></tr></table><select><option value=\"1\" lang=\"te\">ఒకటి</option></select>"
        );
    }

    #[test]
    fn attribute_form_keeps_other_attributes_and_classes() {
        let out = b("<h1 id=\"t\" class=\"big\" mira=\"ntr\">మిరా</h1><p mira-font=\"mandali\" class=\"x mira-font-mandali\">ఒక్క</p>");
        assert_eq!(
            out.html,
            "<h1 id=\"t\" class=\"big mira-font-ntr\" lang=\"te\">మిరా</h1><p class=\"x mira-font-mandali\" lang=\"te\">ఒక్క</p>"
        );
    }

    #[test]
    fn body_mira_marks_every_telugu_element_once() {
        let out = b("<body mira><div><p>తెలుగు <b>బాగుంది</b></p><p>English</p><p lang=\"en\">మిరా</p></div><button>పంపు</button></body>");
        assert_eq!(
            out.html,
            "<body class=\"mira-font-telugu\"><div><p lang=\"te\">తెలుగు <b>బాగుంది</b></p><p>English</p><p lang=\"en\">మిరా</p></div><button lang=\"te\">పంపు</button></body>"
        );
    }

    #[test]
    fn without_body_mira_plain_elements_stay_as_they_are() {
        assert_eq!(b("<p>తెలుగు</p>").html, "<p>తెలుగు</p>");
    }

    #[test]
    fn warnings_carry_line_numbers() {
        let out = b("<p>x</p>\n\n<mira h1 font=\"tleugu\">మిరా</mira h1>");
        assert_eq!(out.warnings.len(), 1);
        assert_eq!(out.warnings[0].line, 3);
        assert_eq!(out.html, "<p>x</p>\n\n<h1 lang=\"te\">మిరా</h1>");
    }

    #[test]
    fn truncate_cuts_whole_letters_and_keeps_the_full_text_in_title() {
        let out = b("<mira p truncate=\"4\">ఒక్క పద్యం చాలు</mira p>");
        assert_eq!(out.html, "<p lang=\"te\" title=\"ఒక్క పద్యం చాలు\">ఒక్క పద్యం…</p>");
    }

    #[test]
    fn css_goes_before_head_end_with_only_the_fonts_used() {
        let out = build("<html><head><title>t</title></head><body><mira h1 font=\"ntr\">మిరా</mira h1></body></html>", &Options::default());
        let style = out.html.find("<style data-mira>").unwrap();
        assert!(style < out.html.find("</head>").unwrap());
        assert!(out.html.contains("https://cdn.jsdelivr.net/npm/@fontsource/ntr@5.3.0/files/ntr-telugu-400-normal.woff2"));
        assert_eq!(out.html.matches("@font-face").count(), 1);
        let own = build("<mira p font=\"ntr\">మిరా</mira p>", &Options { font_base: "/fonts/".into(), inline_css: true });
        assert!(own.html.starts_with("<style data-mira>"));
        assert!(own.html.contains("url(\"/fonts/@fontsource/ntr@5.3.0/"));
    }

    #[test]
    fn entities_in_attributes() {
        let out = b("<mira input placeholder=\"&#3118;&#3135; &amp; x\">");
        assert_eq!(out.html, "<input placeholder=\"&#3118;&#3135; &amp; x\" lang=\"te\">");
    }

    #[test]
    fn broken_html_does_not_panic() {
        for s in ["<", "<mira", "<mira h1 font=\"ntr", "</", "</mira h1>", "<p>తెలుగు", "<mira p>తెలుగు", "<<>>", "<a b='c>"] {
            let _ = b(s);
        }
        assert_eq!(b("<mira p>తెలుగు").html, "<p lang=\"te\">తెలుగు</p>");
    }
}
