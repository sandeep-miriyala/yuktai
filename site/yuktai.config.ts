// YuktAI settings for this app: one place for the name, colours and features.
// Change something here and the header, widget, manifest and pages follow.
const config = {
  name: "yuktai-site",
  title: "YuktAI",
  description:
    "YuktAI: open-source accessibility widget, data grid, page Q&A and agents with Rust search in WebAssembly. One script tag, no server, no API key.",

  theme: {
    accent: "blue", // blue | violet | teal | orange (colours in src/styles/tokens.css)
    color: "#000633", // browser bar and installed-app colour
  },

  features: {
    accessibility: true, // ♿ button: contrast, text size, dyslexia font, reduced motion…
    ask: true, // "Ask this page" panel, Ctrl + K. Answers come from the page itself.
    pwa: true, // Install button, works offline
    pageTools: true, // 🛠 button: QA report, copilot, form review
    grid: false, // data grid page (search, sort, CSV)
  },

  // "rust": Rust compiled to WebAssembly (falls back to TypeScript if it is not built)
  engine: "rust" as "rust" | "ts",

  widget: { position: "left" as "left" | "right" },
};

export default config;
