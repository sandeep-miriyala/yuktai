// search: one box for every page of the site, and the assistant on the page that answers.
import type { Metadata } from "next";
import { YuktaiIcon } from "@yuktishaalaa/yuktai/icons";
import SiteSearch, { type PageRef } from "@/components/search/SiteSearch";
import { GUIDES } from "@/data/site";

export const metadata: Metadata = {
  title: "Search and help",
  description: "Search every page of the YuktAI site, then ask the assistant on the page that has the answer. Day or night, in your browser, nothing sent anywhere.",
};

// Every page the search reads, in the order the menu shows them.
const PAGES: PageRef[] = [
  { href: "/", title: "Home" },
  ...GUIDES.filter((g) => g.href !== "/search/").map(({ href, title }) => ({ href, title })),
  { href: "/shubhalekha/make/", title: "Make a Shubhalekha" },
  { href: "/about/", title: "About" },
];

export default function SearchPage() {
  return (
    <>
      <div className="page-head">
        <p className="kicker"><YuktaiIcon name="search" className="i" size={24} aria-hidden="true" />Search and help, 24×7</p>
        <h1>Find it on this site</h1>
        <p className="lead">
          One box for every page: guides, packages, Setu, Shubhalekha. Pick a result to read that part, or ask your question on
          that page and the assistant answers from it, with the source highlighted.
        </p>
      </div>

      <SiteSearch pages={PAGES} />

      <h2 id="how">How it works</h2>
      <ul className="checks">
        <li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>Your browser reads the site&apos;s own pages and matches your words: whole words, or the start of a word from three letters (&quot;instal&quot; finds install).</span></li>
        <li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>&quot;Ask on this page&quot; opens that page and asks the Ask page assistant there. It quotes the page and says so when the page doesn&apos;t answer.</span></li>
        <li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>Open at any hour, and offline after your first visit: the pages come from the site&apos;s offline cache.</span></li>
        <li><YuktaiIcon name="check" className="i" size={24} aria-hidden="true" /><span>No server, no API key, no tracking. What you type stays in this tab.</span></li>
      </ul>
      <p className="hint">On any page, <kbd className="kbd">Ctrl K</kbd> asks about the page you are on.</p>
    </>
  );
}
