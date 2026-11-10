import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { asset } from "@/lib/base";
import config from "@config";
import Analytics from "@/components/ui/Analytics";
import Header from "@/components/yuktai/Header";
import Providers from "@/components/yuktai/Providers";
import BackToTop from "@/components/yuktai/BackToTop";
import { INSTALL_SCRIPT, THEME_SCRIPT } from "@/components/yuktai/theme";
import { MOTION_SCRIPT, SPLASH_SCRIPT } from "@yuktishaalaa/yuktai/head";
import { YuktaiSplash } from "@yuktishaalaa/yuktai/experience";
import { LINKS, VERSIONS } from "@/data/site";

// How long the loading screen stays on the first visit in a tab (Skip, Esc or a click end it sooner)
const SPLASH_SECONDS = 15;
const SPLASH_TIPS = [
  "10 lakh rows, searched and sorted in Rust, right in your browser.",
  "Ask this page: answers come with their source, and nothing is sent anywhere.",
  "WCAG 2.2 accessibility fixes on every page, with one script tag.",
  "Menus in English, తెలుగు, हिन्दी, தமிழ், ಕನ್ನಡ, മലയാളം and বাংলা.",
  "Free and open source (GPL-3.0). Python API and LangGraph agents with one command.",
];
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "YuktAI: docs, demos and guides for accessible, agent-ready web apps", template: `%s · ${config.title}` },
  description: config.description,
  manifest: asset("/manifest.json"),
  icons: {
    icon: [
      { url: asset("/favicon.ico"), sizes: "48x48" },
      { url: asset("/icons/favicon.svg"), type: "image/svg+xml" },
      { url: asset("/icons/favicon-32.png"), sizes: "32x32", type: "image/png" },
    ],
    apple: asset("/icons/apple-touch-icon.png"),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000633" },
    { media: "(prefers-color-scheme: dark)", color: "#08081a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT + MOTION_SCRIPT + SPLASH_SCRIPT + INSTALL_SCRIPT }} />
      </head>
      <body>
        {/* Loading screen: the banner, "Welcome" in 7 languages and short tips, once per tab. Skip any time. */}
        <YuktaiSplash
          title={config.title}
          minMs={SPLASH_SECONDS * 1000}
          tips={SPLASH_TIPS}
          logo={
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-banner-light" src={asset("/brand/yuktai-logo-light.svg")} alt="" width={588} height={176} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-banner-dark" src={asset("/brand/yuktai-logo-dark.svg")} alt="" width={620} height={208} />
            </>
          }
        />
        <a className="skip" href="#main">Skip to content</a>
        <Providers>
          <Header />
          <main id="main" tabIndex={-1}>{children}</main>
          <footer className="footer">
            <div className="wrap footer-in">
              <span>YuktAI {VERSIONS.yuktai} · Ask page {VERSIONS.askPage} · made with <code>npm create yuktai</code></span>
              <span>
                <Link href="/about/">How this site is built</Link> · <a href={LINKS.github}>GitHub</a> · <a href={LINKS.npmYuktai}>npm</a> · <a href={LINKS.npmAsk}>Ask page on npm</a>
              </span>
            </div>
          </footer>
          <BackToTop />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
