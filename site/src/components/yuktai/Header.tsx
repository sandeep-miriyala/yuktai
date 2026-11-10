"use client";

import Link from "next/link";
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
