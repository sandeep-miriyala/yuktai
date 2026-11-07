# Contributing to YuktAI

Thank you for helping. Bug reports, docs fixes, translations and code are all welcome.

## Ways to help

- **Report a bug:** open an [issue](https://github.com/sandeep-miriyala/yuktai/issues) with the version, browser, steps to reproduce and what you expected. A small HTML page or CodeSandbox link helps most.
- **Suggest a feature:** open an issue first, so we can agree on it before you write code.
- **Improve a translation:** words for each language live in `src/experience/uiLanguage.ts`. Native speakers are very welcome.
- **Fix docs:** typos and unclear sentences in any README are good first pull requests.
- **Security problems:** please don't open a public issue. See [SECURITY.md](SECURITY.md).

## Set up

You need **Node.js 20.9+**. Rust is optional (the library falls back to TypeScript without it).

```bash
git clone https://github.com/sandeep-miriyala/yuktai.git
cd yuktai
npm install
npm run build:all
npm test
```

With Rust installed (stable toolchain, pinned in `rust-toolchain.toml`):

```bash
npm run build:rust
npm run test:rust
```

## Before you open a pull request

```bash
npm run check          # lint + tests + Rust tests
npm run format         # Biome
npm run typecheck
```

- Keep the pull request small and about one thing.
- Add or update a test for what you changed.
- Accessibility is not optional: anything clickable must work with the keyboard and have a name screen readers can read.
- Don't add a new dependency without asking in an issue first.
- Never commit secrets, `.env` files, `node_modules`, build output or `.tgz` files.

## Where things are

See [ARCHITECTURE.md](ARCHITECTURE.md) for a map of the repository.

| Change | Folder |
|---|---|
| Grid, accessibility, page tools, icons | `src/` |
| Rust engines (WebAssembly) | `rust/` |
| `yuktai` command and app templates | `packages/yuktai-cli/` |
| `npm create yuktai` | `packages/create-yuktai/` |
| Ask page panel | `packages/ask-page/` |

## Commit messages

Short and in plain English, starting with the area:

```
grid: open rows with Enter or Space
cli: pick a free port for the Python API
docs: fix the jQuery example
```

## License

By contributing, you agree that your contribution is licensed under [GPL-3.0](LICENSE), the same as the project.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
