# create-yuktai

Create a YuktAI app in one command.

```bash
npm create yuktai@latest my-app
cd my-app
npm run dev
```

Skip the questions and use the defaults:

```bash
npm create yuktai@latest my-app -- --yes
```

The same as `npx yuktai@latest init my-app`. Every option of `yuktai init` works here too (put `--` before them when you use `npm create`).

## Live demos

- [miriyalas.github.io/yuktai](https://miriyalas.github.io/yuktai/): made with no laptop. Created, built and published from a browser with GitHub Codespaces
- [పద్యాలవాల](https://sandeep-miriyala.github.io/padyalavala/): Telugu poetry site with Rust search and the Grid AI Assistant in Telugu
- [YuktaiDocs](https://sandeep-miriyala.github.io/yuktai/): docs and playgrounds

**No laptop?** Open [GitHub Codespaces](https://github.com/codespaces) → Blank, run `npm create yuktai@latest my-app -- --yes`, push, then Settings → Pages → Source: GitHub Actions. [Step by step](https://sandeep-miriyala.github.io/yuktai/create/#codespaces)

Docs: https://sandeep-miriyala.github.io/yuktai/create/

License: GPL-3.0
