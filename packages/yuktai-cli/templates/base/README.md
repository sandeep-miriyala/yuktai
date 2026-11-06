# {{title}}

Made with [YuktAI](https://yuktaidocs.netlify.app): Next.js{{stackNote}}, the YuktAI accessibility widget, "Ask this page" (Ctrl + K) and an installable app (PWA).

```
npm run dev      # http://localhost:3000
npm run build    # static files in out/
npm test         # checks the built site
```

| Where | What |
|---|---|
| `yuktai.config.ts` | Name, colours, features: one place |
| `src/app/` | Pages (`page.tsx` is the home page) |
| `src/components/yuktai/` | YuktAI parts: header, widget, Ask, install, theme |
| `src/components/ui/` | Your components |
| `src/styles/tokens.css` | Colours and fonts (light and dark) |
| `src/lib/core.ts` | The app's core functions |
| `tests/` | Checks for the built site |

Everything runs in the visitor's browser. Nothing they type is sent anywhere.
