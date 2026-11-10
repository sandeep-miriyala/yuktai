"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, MenuIcon, ArrowDownIcon } from "@yuktishaalaa/yuktai/icons";
import { GUIDES, VERSIONS } from "@/data/site";
import { GuideIcon } from "@/components/ui/Icon";

export default function GuideNav() {
  const path = usePathname().replace(/\/?$/, "/");
  const [open, setOpen] = useState(false);
  const current = GUIDES.find((g) => g.href === path);

  return (
    <nav className={`gnav ${open ? "open" : ""}`} aria-label="Documentation">
      <button type="button" className="gnav-toggle" aria-expanded={open} aria-controls="gnav-list" onClick={() => setOpen(!open)}>
        <MenuIcon size={20} aria-hidden="true" />
        <span>Menu · {current?.title ?? "Guides"}</span>
        <ArrowDownIcon size={18} aria-hidden="true" className="chev" />
      </button>
      <p className="gnav-title">Guides</p>
      <ul id="gnav-list">
        <li><Link href="/"><HomeIcon size={20} aria-hidden="true" />Home</Link></li>
        {GUIDES.map((g) => (
          <li key={g.href}>
            <Link href={g.href} aria-current={g.href === path ? "page" : undefined} onClick={() => setOpen(false)}>
              <GuideIcon name={g.icon} size={20} />{g.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="gnav-note">Every demo runs YuktAI {VERSIONS.yuktai} in your browser. No API keys, no server.</p>
    </nav>
  );
}
