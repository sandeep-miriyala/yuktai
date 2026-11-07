// YuktAI settings for this app: one place for the name, colours and features.
// Change something here and the header, widget, manifest and pages follow.
const config = {
  name: "{{name}}",
  title: "{{title}}",
  description: "{{title}}: an accessible, AI-in-the-browser web app built with YuktAI.",

  theme: {
    accent: "{{accentName}}", // blue | violet | teal | orange (colours in src/styles/tokens.css)
    color: "{{themeColor}}", // browser bar and installed-app colour
    picker: true, // 🎨 lets visitors pick a colour; contrast is kept at 7:1 or more
    localFonts: true, // visitors can use fonts installed on their computer (desktop Chrome and Edge)
  },

  features: {
    accessibility: true, // ♿ button: contrast, text size, dyslexia font, reduced motion…
    ask: true, // "Ask this page" panel, Ctrl + K. Answers come from the page itself.
    pwa: true, // Install button (always shown until installed), works offline
    backToTop: true, // ↑ Back to top button, bottom right
    splash: true, // loading screen: logo and "Welcome" in 7 languages, once per tab
    preferences: true, // 🌐 button: site language (English + 6 Indian languages) and animations (Device setting / Off / Calm / Lively)
    pageTools: {{pageTools}}, // QA report page and the 🛠 button: 15 WCAG checks, copilot, form review
    grid: {{grid}}, // data grid page: 10 lakh sample rows, search, sort
    icons: {{icons}}, // icons guide: every YuktAI icon, copy the code
  },

  // Data grid: the Grid AI Assistant, voice and browser-agent tools
  grid: {
    assistant: true, // "Ask or type a command": search, sort, filter, summary, unusual values
    voice: true, // 🎤 talk to the grid
    language: "en-IN", // assistant and voice language: en-IN or any of the 22 Indian languages (te-IN, hi-IN, ta-IN…)
    webmcp: true, // let browser AI agents use 11 grid tools (Chrome with WebMCP on)
  },

  // "rust": Rust compiled to WebAssembly (falls back to TypeScript if it is not built)
  engine: "{{engine}}" as "rust" | "ts",

  widget: { position: "left" as "left" | "right" },
};

export default config;
