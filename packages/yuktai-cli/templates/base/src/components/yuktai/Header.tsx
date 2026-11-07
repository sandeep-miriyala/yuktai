"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, GlobeIcon } from "@yuktishaalaa/yuktai/icons";
import { YuktaiPreferences, useUiText } from "@yuktishaalaa/yuktai/experience";
import config from "@config";
import { NAV, isGroup } from "@/data/site";
import { APP_TEXT } from "@/data/uiText";
import { ask } from "./ask";
import InstallButton from "./InstallButton";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LookPicker from "./LookPicker";
import NavMenu from "./NavMenu";

export default function Header() {
  const path = usePathname();
  const { t, lang } = useUiText(APP_TEXT);
  const here = (href: string) => {
    const page = href.split("#")[0];
    return page === "/" ? path === "/" : path.startsWith(page);
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
              <Link key={n.href} href={n.href} aria-current={here(n.href) ? "page" : undefined}>{t(n.key)}</Link>
            ),
          )}
        </nav>
        <div className="tools" lang={lang}>
          {config.features.pwa && <InstallButton />}
          {config.features.ask && (
            <button type="button" className="ask-btn" onClick={() => ask()} aria-keyshortcuts="Control+K" aria-label={t("askThisPage")}>
              <ChatIcon size={18} aria-hidden="true" />
              <span className="ask-text">{t("askThisPage")}</span>
              <kbd className="kbd" aria-hidden="true">Ctrl K</kbd>
            </button>
          )}
          {config.theme.picker && <LookPicker />}
          {/* 🌐 site language (English + 6 Indian languages) and animations: the visitor decides */}
          {config.features.preferences && <YuktaiPreferences icon={<GlobeIcon size={18} aria-hidden="true" />} text={APP_TEXT} />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
