// Menu and links. Items with a `feature` only show when it is on in yuktai.config.ts.
import config from "@config";

type NavItem = { href: string; label: string; feature?: keyof typeof config.features };

const ALL: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/grid/", label: "Data grid", feature: "grid" },
  { href: "/qa/", label: "QA report", feature: "pageTools" },
  { href: "/icons/", label: "Icons", feature: "icons" },
  { href: "/about/", label: "About" },
];

export const NAV = ALL.filter((n) => !n.feature || config.features[n.feature]);

export const LINKS = {
  yuktai: "https://www.npmjs.com/package/@yuktishaalaa/yuktai",
  askPage: "https://www.npmjs.com/package/@yuktishaalaa/ask-page",
  docs: "https://yuktaidocs.netlify.app",
};
