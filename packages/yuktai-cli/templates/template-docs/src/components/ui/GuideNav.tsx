"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "@yuktishaalaa/yuktai/icons";
import { GUIDES } from "@/data/site";

// The guides sidebar. On phones it folds into a "Menu" button.
export default function GuideNav() {
  const path = usePathname().replace(/\/?$/, "/");
  const [open, setOpen] = useState(false);
  const current = GUIDES.find((g) => g.href === path);
  return (
    <nav className={`gnav ${open ? "open" : ""}`} aria-label="Guides">
      <button type="button" className="gnav-toggle" aria-expanded={open} aria-controls="gnav-list" onClick={() => setOpen(!open)}>
        <MenuIcon size={20} aria-hidden="true" />
        <span>Menu · {current?.title ?? "Guides"}</span>
      </button>
      <p className="gnav-title">Guides</p>
      <ul id="gnav-list">
        {GUIDES.map((g) => (
          <li key={g.href}>
            <Link href={g.href} aria-current={g.href === path ? "page" : undefined} onClick={() => setOpen(false)}>{g.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
