//! MiRa in the browser. The page loads one `<script>`; this Rust code walks the
//! live DOM, asks `mira::element::plan` about every element (the same rules as
//! `mira build`) and makes the change:
//!
//! * `<mira h1 font="ntr">మిరా</mira h1>` → a real `<h1 lang="te" class="mira-font-ntr">`,
//!   children, ids and event listeners kept (nodes are moved, never re-parsed: no innerHTML);
//! * `<h1 mira="ntr">` → the class and `lang="te"`;
//! * `<body mira="mandali">` → every element with Telugu text gets `lang="te"`;
//! * only the fonts the page uses get an `@font-face`, Telugu letters only;
//! * elements added later (React, fetch, templates) are handled the same way.

use std::cell::RefCell;

use mira::element::{plan, Input, BUILD_ONLY};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{Document, Element, HtmlElement, MutationObserver, MutationObserverInit, MutationRecord, Node};

const XHTML: &str = "http://www.w3.org/1999/xhtml";
const DEFAULT_BASE: &str = "https://cdn.jsdelivr.net/npm/";

struct State {
    base: String,
    whole_page: bool,
    fonts: Vec<&'static str>,
    style: Option<Element>,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State { base: DEFAULT_BASE.into(), whole_page: false, fonts: vec![], style: None });
}

fn document() -> Option<Document> {
    web_sys::window()?.document()
}

fn warn(msg: &str) {
    web_sys::console::warn_1(&JsValue::from_str(&format!("MiRa: {msg}")));
}

/// Runs when the script loads.
#[wasm_bindgen(start)]
pub fn start() {
    let Some(doc) = document() else { return };
    if doc.ready_state() == "loading" {
        let go = Closure::once_into_js(run);
        let _ = doc.add_event_listener_with_callback("DOMContentLoaded", go.unchecked_ref());
    } else {
        run();
    }
}

fn run() {
    let Some(doc) = document() else { return };
    let Some(body) = doc.body() else { return };
    let body: Element = body.into();

    // <script src="…/mira" data-mira-fonts="/fonts/"> serves the fonts from your own server
    let base = doc
        .query_selector("script[data-mira-fonts]")
        .ok()
        .flatten()
        .and_then(|s| s.get_attribute("data-mira-fonts"))
        .filter(|b| !b.trim().is_empty());
    let whole_page = body.has_attribute("mira") || body.has_attribute("mira-font");
    STATE.with(|s| {
        let mut s = s.borrow_mut();
        if let Some(b) = base {
            s.base = b;
        }
        s.whole_page = whole_page;
    });

    keep_page_font(&doc, &body);
    process(&doc, &body);
    observe(&body);
}

/// English and numbers keep the page's own font: `--mira-base` is the body's font before MiRa.
fn keep_page_font(doc: &Document, body: &Element) {
    let Some(win) = web_sys::window() else { return };
    let Some(root) = doc.document_element().and_then(|r| r.dyn_into::<HtmlElement>().ok()) else { return };
    let own = win.get_computed_style(&root).ok().flatten().and_then(|c| c.get_property_value("--mira-base").ok()).unwrap_or_default();
    if !own.trim().is_empty() {
        return;
    }
    if let Some(family) = win.get_computed_style(body).ok().flatten().and_then(|c| c.get_property_value("font-family").ok()) {
        if !family.trim().is_empty() {
            let _ = root.style().set_property("--mira-base", &family);
        }
    }
}

fn is_void_mira(el: &Element) -> bool {
    el.local_name() == "mira" && plan(&Input { name: "mira", attrs: &attributes(el), telugu_text: false, inside_te: false, whole_page: false }).is_void()
}

/// The browser does not know `<mira input …>` has no closing tag. It puts what
/// follows inside it, and every `</mira …>` after it then closes one MiRa tag too
/// deep: `</mira label>` closes the input, `</mira form>` closes the label, and so
/// on up to the first element that is not a MiRa tag. Undo that shift: the nodes
/// swallowed by the input go after it, and at each MiRa level above, whatever
/// came after the wrongly closed tag goes after its parent. (So in plain HTML
/// write void MiRa tags with no closing tag; `mira build` takes either.)
fn fix_void_tags(root: &Element) {
    let all = root.get_elements_by_tag_name("mira");
    let list: Vec<Element> = (0..all.length()).filter_map(|i| all.item(i)).collect();
    for v in list.iter().filter(|v| v.is_connected() && is_void_mira(v)) {
        let Some(parent) = v.parent_node() else { continue };
        let mut carry = v.next_sibling();
        while let Some(c) = v.first_child() {
            if parent.insert_before(&c, carry.as_ref()).is_err() {
                break;
            }
        }
        let mut cur: Element = v.clone();
        while let Some(m) = cur.parent_element().filter(|p| p.local_name() == "mira" && !is_void_mira(p)) {
            let Some(grand) = m.parent_node() else { break };
            let next_carry = m.next_sibling();
            let mut node = carry;
            while let Some(n) = node {
                node = n.next_sibling();
                if grand.insert_before(&n, next_carry.as_ref()).is_err() {
                    break;
                }
            }
            carry = next_carry;
            cur = m;
        }
    }
}

/// Every element under `root` (and `root` itself), in document order.
fn process(doc: &Document, root: &Element) {
    fix_void_tags(root);
    let mut list = vec![root.clone()];
    if let Ok(all) = root.query_selector_all("*") {
        for i in 0..all.length() {
            if let Some(e) = all.item(i).and_then(|n| n.dyn_into::<Element>().ok()) {
                list.push(e);
            }
        }
    }
    let whole_page = STATE.with(|s| s.borrow().whole_page);
    for el in &list {
        visit(doc, el, whole_page);
    }
}

fn attributes(el: &Element) -> Vec<(String, String)> {
    let map = el.attributes();
    (0..map.length()).filter_map(|i| map.item(i)).map(|a| (a.name(), a.value())).collect()
}

fn own_text_has_telugu(el: &Element) -> bool {
    let kids = el.child_nodes();
    (0..kids.length())
        .filter_map(|i| kids.item(i))
        .any(|n| n.node_type() == Node::TEXT_NODE && n.node_value().is_some_and(|t| mira::has_telugu(&t)))
}

fn inside_telugu(el: &Element) -> bool {
    el.parent_element()
        .and_then(|p| p.closest("[lang]").ok().flatten())
        .and_then(|l| l.get_attribute("lang"))
        .is_some_and(|l| l.to_ascii_lowercase().starts_with("te"))
}

fn visit(doc: &Document, el: &Element, whole_page: bool) {
    if !el.is_connected() || el.namespace_uri().as_deref() != Some(XHTML) {
        return;
    }
    let name = el.local_name();
    if matches!(name.as_str(), "script" | "style" | "template" | "noscript") {
        return;
    }
    let is_mira = name == "mira";
    if !is_mira && !whole_page && !el.has_attribute("mira") && !el.has_attribute("mira-font") {
        return;
    }
    let attrs = attributes(el);
    let p = plan(&Input { name: &name, attrs: &attrs, telugu_text: own_text_has_telugu(el), inside_te: inside_telugu(el), whole_page });
    for w in &p.warnings {
        warn(&w.message());
    }
    if let Some(tag) = p.tag.filter(|t| BUILD_ONLY.contains(t)) {
        warn(&format!(
            "<mira {tag}> browser లో పని చేయదు (browser దాన్ని బయటకు జరుపుతుంది). <{tag} mira=\"…\"> వాడండి, లేదా mira build. / <mira {tag}> cannot work in the browser, which moves it before any script runs. Use <{tag} mira=\"…\"> or mira build."
        ));
    }
    if p.is_empty() {
        return;
    }
    if let Some(f) = p.font {
        use_font(doc, f);
    }

    let target = match p.tag {
        Some(tag) => match replace(doc, el, tag, &attrs, &p.remove, p.is_void()) {
            Some(t) => t,
            None => return,
        },
        None => {
            for n in &p.remove {
                let _ = el.remove_attribute(n);
            }
            el.clone()
        }
    };
    for (n, v) in &p.set {
        let _ = target.set_attribute(n, v);
    }
    if let Some(c) = &p.class {
        let _ = target.class_list().add_1(c);
    }
    if let Some(max) = p.truncate {
        let kids = target.child_nodes();
        if kids.length() == 1 && kids.item(0).is_some_and(|n| n.node_type() == Node::TEXT_NODE) {
            let full = target.text_content().unwrap_or_default().trim().to_string();
            let short = mira::truncate(&full, max);
            if short != full {
                if !target.has_attribute("title") {
                    let _ = target.set_attribute("title", &full);
                }
                target.set_text_content(Some(&short));
            }
        }
    }
}

/// `<mira h1 …>` → a new `<h1>` in its place, with its attributes and children moved over.
fn replace(doc: &Document, el: &Element, tag: &str, attrs: &[(String, String)], remove: &[String], void: bool) -> Option<Element> {
    let new = doc.create_element(tag).ok()?;
    for (n, v) in attrs {
        if !remove.contains(n) {
            let _ = new.set_attribute(n, v);
        }
    }
    if !void {
        while let Some(c) = el.first_child() {
            new.append_child(&c).ok()?;
        }
    }
    el.replace_with_with_node_1(&new).ok()?;
    if void {
        // The browser put everything after <mira input …> inside it: move it back out.
        let parent = new.parent_node()?;
        let next = new.next_sibling();
        while let Some(c) = el.first_child() {
            parent.insert_before(&c, next.as_ref()).ok()?;
        }
    }
    Some(new)
}

/// The `@font-face` and class for a font, once per page.
fn use_font(doc: &Document, font: &'static mira::Font) {
    STATE.with(|s| {
        let mut s = s.borrow_mut();
        if s.fonts.contains(&font.key) {
            return;
        }
        s.fonts.push(font.key);
        let css = mira::css::font_css(font, &s.base);
        if s.style.is_none() {
            let Ok(style) = doc.create_element("style") else { return };
            let _ = style.set_attribute("data-mira", "");
            let parent: Option<Node> = doc.head().map(Into::into).or_else(|| doc.document_element().map(Into::into));
            if let Some(p) = parent {
                let _ = p.append_child(&style);
            }
            s.style = Some(style);
        }
        if let Some(style) = &s.style {
            let old = style.text_content().unwrap_or_default();
            style.set_text_content(Some(&(old + &css)));
        }
    });
}

/// Elements added later get the same treatment.
fn observe(body: &Element) {
    let cb = Closure::<dyn FnMut(js_sys::Array, MutationObserver)>::new(|records: js_sys::Array, _o: MutationObserver| {
        let Some(doc) = document() else { return };
        for r in records.iter() {
            let Ok(r) = r.dyn_into::<MutationRecord>() else { continue };
            let added = r.added_nodes();
            for i in 0..added.length() {
                if let Some(e) = added.item(i).and_then(|n| n.dyn_into::<Element>().ok()) {
                    process(&doc, &e);
                }
            }
        }
    });
    if let Ok(obs) = MutationObserver::new(cb.as_ref().unchecked_ref()) {
        let init = MutationObserverInit::new();
        init.set_child_list(true);
        init.set_subtree(true);
        let _ = obs.observe_with_options(body, &init);
    }
    cb.forget();
}

// ---------- for page scripts: window.mira ----------

/// The aksharas: `mira.split("లక్ష్మి")` → `["ల", "క్ష్మి"]`.
#[wasm_bindgen]
pub fn split(text: &str) -> Vec<String> {
    mira::split(text).into_iter().map(String::from).collect()
}

/// Letters a reader sees: `mira.count("లక్ష్మి")` → 2.
#[wasm_bindgen]
pub fn count(text: &str) -> u32 {
    mira::count(text) as u32
}

/// `mira.truncate(text, 10)`: whole letters only, then "…".
#[wasm_bindgen]
pub fn truncate(text: &str, max: u32) -> String {
    mira::truncate(text, max as usize)
}

/// `mira.html(page)`: what `mira build` gives, for HTML you have as text.
#[wasm_bindgen]
pub fn html(src: &str) -> String {
    let base = STATE.with(|s| s.borrow().base.clone());
    mira::html::build(src, &mira::html::Options { font_base: base, inline_css: true }).html
}

/// The font names MiRa knows.
#[wasm_bindgen]
pub fn fonts() -> Vec<String> {
    mira::FONTS.iter().map(|f| f.key.to_string()).collect()
}

/// Run again on a part of the page (normally not needed: new elements are seen).
#[wasm_bindgen]
pub fn refresh() {
    if let (Some(doc), Some(body)) = (document(), document().and_then(|d| d.body())) {
        process(&doc, &body.into());
    }
}

#[wasm_bindgen]
pub fn version() -> String {
    mira::VERSION.into()
}
