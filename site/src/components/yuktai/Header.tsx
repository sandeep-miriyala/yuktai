"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChatIcon, GlobeIcon } from "@yuktishaalaa/yuktai/icons";
import { YuktaiPreferences, useUiText } from "@yuktishaalaa/yuktai/experience";
import config from "@config";
import { NAV, isGroup } from "@/data/site";
import { SITE_TEXT } from "@/data/uiText";
import { ask } from "./ask";
import InstallButton from "./InstallButton";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import NavMenu from "./NavMenu";

export default function Header() {
  const path = usePathname();
  const { t, lang } = useUiText(SITE_TEXT);
  const here = (href: string) => {
    const page = href.split("#")[0];
    return href.startsWith("/") && page !== "/" && !href.startsWith("/#") && path.startsWith(page);
  };
  // Links to a section (#packages) and keyboard focus must not end up under this
  // sticky header (WCAG 2.4.11). On phones it wraps to two or three rows, so the
  // space the page keeps for it follows its real height.
  useEffect(() => {
    const h = document.querySelector<HTMLElement>("header.topbar");
    if (!h || typeof ResizeObserver === "undefined") return;
    const set = () => document.documentElement.style.setProperty("scroll-padding-top", `${Math.ceil(h.getBoundingClientRect().height) + 16}px`);
    set();
    // opened with #section in the address: the browser jumped before this ran
    if (location.hash.length > 1) {
      try { document.querySelector(decodeURIComponent(location.hash))?.scrollIntoView(); } catch {}
    }
    const ro = new ResizeObserver(set);
    ro.observe(h);
    return () => ro.disconnect();
  }, []);

  return (
    <header className="topbar" data-lang={lang}>
      <div className="topbar-in">
        <Link className="brand" href="/">
          <Logo />
          <span>{config.title}</span>
        </Link>
        <nav className="topnav" aria-label="Main" lang={lang}>
          {NAV.map((n) =>
            isGroup(n) ? (
              <NavMenu key={n.key} group={n} t={t} current={here} />
            ) : (
              <Link key={n.href} href={n.href} aria-current={here(n.href) ? "page" : undefined}>{n.key ? t(n.key) : n.label}</Link>
            ),
          )}
        </nav>
        <div className="tools" lang={lang}>
          {config.features.pwa && <InstallButton />}
          {config.features.ask && (
            <button type="button" className="ask-btn" onClick={() => ask()} aria-keyshortcuts="Control+K" aria-label={`${t("askThisPage")} Ctrl K`}>
              <ChatIcon size={18} aria-hidden="true" />
              <span className="ask-text">{t("askThisPage")}</span>
              <kbd className="kbd" aria-hidden="true">Ctrl K</kbd>
            </button>
          )}
          {/* Site language (English + 6 Indian languages) and animations: the visitor decides */}
          <YuktaiPreferences icon={<GlobeIcon size={18} aria-hidden="true" />} text={SITE_TEXT} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
