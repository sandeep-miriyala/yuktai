//! The `mira` command.
//!
//!   mira build page.html            → the page with real tags and font CSS, to the screen
//!   mira build page.html -o out.html
//!   mira build page.html --fonts /fonts/   (font files on your own server)
//!   mira fonts                      → every font: name, family, designers' copyright
//!   mira split "లక్ష్మి కృష్ణ"        → ల | క్ష్మి | కృ | ష్ణ
//!   mira count "లక్ష్మి కృష్ణ"        → 4

use std::process::ExitCode;

const HELP: &str = "MiRa: Telugu for every HTML element

  mira build <page.html> [-o <out.html>] [--fonts <url or folder>]
  mira check <page.html>       only the warnings (for CI)
  mira fonts                   the Telugu fonts and their designers
  mira split <text>            the aksharas
  mira count <text>            how many letters a reader sees
";

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let Some(cmd) = args.first() else {
        print!("{HELP}");
        return ExitCode::SUCCESS;
    };
    let rest = &args[1..];
    match cmd.as_str() {
        "build" | "check" => build(rest, cmd == "check"),
        "fonts" => {
            for f in mira::FONTS.iter() {
                println!("{:<22} {:<22} {}\n{:<22} {} · {}\n", f.key, f.family, f.style_te, "", f.designer, f.copyright);
            }
            println!("License: SIL Open Font License 1.1 (every font). Files: @fontsource/* {}", mira::fonts::FONTSOURCE_VERSION);
            ExitCode::SUCCESS
        }
        "split" => {
            println!("{}", mira::split(&rest.join(" ")).join(" | "));
            ExitCode::SUCCESS
        }
        "count" => {
            println!("{}", mira::count(&rest.join(" ")));
            ExitCode::SUCCESS
        }
        "-v" | "--version" | "version" => {
            println!("mira {}", mira::VERSION);
            ExitCode::SUCCESS
        }
        _ => {
            print!("{HELP}");
            ExitCode::from(2)
        }
    }
}

fn build(args: &[String], check_only: bool) -> ExitCode {
    let mut input = None;
    let mut output = None;
    let mut options = mira::html::Options::default();
    let mut it = args.iter();
    while let Some(a) = it.next() {
        match a.as_str() {
            "-o" | "--out" => output = it.next().cloned(),
            "--fonts" => {
                if let Some(v) = it.next() {
                    options.font_base = v.clone();
                }
            }
            _ => input = Some(a.clone()),
        }
    }
    let Some(input) = input else {
        eprint!("{HELP}");
        return ExitCode::from(2);
    };
    let src = match std::fs::read_to_string(&input) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("mira: {input}: {e}");
            return ExitCode::from(1);
        }
    };
    let out = mira::html::build(&src, &options);
    for d in &out.warnings {
        eprintln!("{input}:{}: {}", d.line, d.warning.message());
    }
    if check_only {
        return if out.warnings.is_empty() { ExitCode::SUCCESS } else { ExitCode::from(1) };
    }
    match output {
        Some(path) => {
            if let Err(e) = std::fs::write(&path, &out.html) {
                eprintln!("mira: {path}: {e}");
                return ExitCode::from(1);
            }
            eprintln!("mira: {path} ({} fonts: {})", out.fonts.len(), out.fonts.join(", "));
        }
        None => print!("{}", out.html),
    }
    ExitCode::SUCCESS
}
