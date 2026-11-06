// Menu, guides and links. Items with a `feature` only show when it is on in yuktai.config.ts.
import config from "@config";

type NavItem = { href: string; label: string; feature?: keyof typeof config.features };

const ALL: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/getting-started/", label: "Docs" },
  { href: "/grid/", label: "Data grid", feature: "grid" },
  { href: "/about/", label: "About" },
];

export const NAV = ALL.filter((n) => !n.feature || config.features[n.feature]);

// The sidebar on guide pages, in order. Add a guide: a folder in src/app/(guides)/ and a line here.
export const GUIDES = [
  { href: "/getting-started/", title: "Getting started" },
  { href: "/configuration/", title: "Configuration" },
  { href: "/deploy/", title: "Deploy" },
];

export const LINKS = {
  yuktai: "https://www.npmjs.com/package/@yuktishaalaa/yuktai",
  askPage: "https://www.npmjs.com/package/@yuktishaalaa/ask-page",
  docs: "https://yuktaidocs.netlify.app",
};
