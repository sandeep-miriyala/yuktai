"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, NamaskarIcon } from "@yuktishaalaa/yuktai/icons";
import config from "@config";
import { NAV } from "@/data/site";
import { ask } from "./ask";
import InstallButton from "./InstallButton";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const path = usePathname();
  const here = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link className="brand" href="/">
          <span className="brandmark" aria-hidden="true"><NamaskarIcon size={22} /></span>
          <span>{config.title}</span>
        </Link>
        <nav className="topnav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={here(n.href) ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>
        <div className="tools">
          {config.features.pwa && <InstallButton />}
          {config.features.ask && (
            <button type="button" className="ask-btn" onClick={() => ask()} aria-keyshortcuts="Control+K">
              <ChatIcon size={18} aria-hidden="true" />
              <span className="ask-text">Ask this page…</span>
              <kbd className="kbd" aria-hidden="true">Ctrl K</kbd>
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
