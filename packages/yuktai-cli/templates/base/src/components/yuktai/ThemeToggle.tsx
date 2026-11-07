"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@yuktishaalaa/yuktai/icons";
import { useUiText } from "@yuktishaalaa/yuktai/experience";
import { isDark, setTheme, subscribeTheme } from "./theme";

export default function ThemeToggle() {
  const { t } = useUiText();
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
  return (
    <button type="button" className="icon-btn" onClick={() => setTheme(isDark() ? "light" : "dark")} aria-pressed={dark} aria-label={t("darkTheme")}>
      {dark ? <SunIcon size={20} aria-hidden="true" /> : <MoonIcon size={20} aria-hidden="true" />}
    </button>
  );
}
