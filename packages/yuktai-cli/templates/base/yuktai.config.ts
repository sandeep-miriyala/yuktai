// YuktAI settings for this app: one place for the name, colours and features.
// Change something here and the header, widget, manifest and pages follow.
const config = {
  name: "{{name}}",
  title: "{{title}}",
  description: "{{title}}: an accessible, AI-in-the-browser web app built with YuktAI.",

  theme: {
    accent: "{{accentName}}", // violet | blue | teal | orange (colours in src/styles/tokens.css)
    color: "{{themeColor}}", // browser bar and installed-app colour
  },

  features: {
    accessibility: true, // ♿ button: contrast, text size, dyslexia font, reduced motion…
    ask: true, // "Ask this page" panel, Ctrl + K. Answers come from the page itself.
    pwa: true, // Install button, works offline
    pageTools: {{pageTools}}, // 🛠 button: QA report, copilot, form review
    grid: {{grid}}, // data grid page (search, sort, CSV)
  },

  // "rust": Rust compiled to WebAssembly (falls back to TypeScript if it is not built)
  engine: "{{engine}}" as "rust" | "ts",

  widget: { position: "left" as "left" | "right" },
};

export default config;
