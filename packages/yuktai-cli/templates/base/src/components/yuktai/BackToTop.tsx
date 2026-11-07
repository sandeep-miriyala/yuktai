"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@yuktishaalaa/yuktai/icons";
import { getMotion, useUiText } from "@yuktishaalaa/yuktai/experience";

/** "Back to top": bottom right, appears after you scroll down. Moves focus to the top too. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  const { t, lang } = useUiText();

  useEffect(() => {
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setShow(window.scrollY > 600));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
    };
  }, []);

  if (!show) return null;
  return (
    <button
      type="button"
      className="to-top"
      lang={lang}
      aria-label={t("backToTop")}
      title={t("backToTop")}
      onClick={() => {
        const still = getMotion() === "off"; // the visitor's animation choice
        window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
        // keyboard and screen-reader users land at the top as well
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
    >
      <ArrowUpIcon size={22} aria-hidden="true" />
    </button>
  );
}
