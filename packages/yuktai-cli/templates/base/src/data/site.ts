// Menu and links. Items with a `feature` only show when it is on in yuktai.config.ts.
import config from "@config";

// `key` is the word in src/data/uiText.ts, so the menu follows the visitor's language.
type NavItem = { href: string; label: string; key: string; feature?: keyof typeof config.features };

const ALL: NavItem[] = [
  { href: "/", label: "Home", key: "home" },
  { href: "/grid/", label: "Data grid", key: "grid", feature: "grid" },
  { href: "/qa/", label: "QA report", key: "qa", feature: "pageTools" },
  { href: "/icons/", label: "Icons", key: "icons", feature: "icons" },
  { href: "/about/", label: "About", key: "about" },
];

export const NAV = ALL.filter((n) => !n.feature || config.features[n.feature]);

export const LINKS = {
  yuktai: "https://www.npmjs.com/package/@yuktishaalaa/yuktai",
  askPage: "https://www.npmjs.com/package/@yuktishaalaa/ask-page",
  docs: "https://yuktaidocs.netlify.app",
};
