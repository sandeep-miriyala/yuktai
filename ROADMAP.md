# Roadmap

Plans change with feedback. Have an idea? Open an [issue](https://github.com/sandeep-miriyala/yuktai/issues).

## Now: make it simple

The focus is a smaller, clearer first experience.

- [ ] `npm create yuktai@latest` as the main way to start
- [ ] A small default app; the grid, Python API and agents added only when asked
- [ ] Clean up the repository layout (one `packages/` folder, workspaces)
- [ ] Fix the remaining lint warnings
- [ ] Shorter default loading screen

## Next

- [ ] Translate every menu and button, not only the main words
- [ ] More Indian languages in the interface (all 22 scheduled languages, including Sanskrit)
- [ ] `yuktai add` commands to add a page, a grid or an API to an existing app
- [ ] Agent-to-agent (A2A) communication between YuktAI agents

## Later

- [ ] Faster grid storage in Rust (columnar), for more rows with less memory
- [ ] More of the agent logic in Rust
- [ ] Angular, Vue and .NET support
- [ ] A Python package

## Done

- [x] Grid with Show all: 10 lakh rows in one smooth list (5.4.0)
- [x] Rust sorting for every column (5.3.13)
- [x] Loading screen, 7 languages, animations the visitor controls (5.5.0)
- [x] Stable Rust only, Oxlint and Biome, CI on every push (5.5.2)
- [x] Keyboard and screen-reader fixes for the grid (5.5.3)
- [x] One-command apps with `yuktai`, with a Python API and LangGraph agents (CLI 1.3.0)
