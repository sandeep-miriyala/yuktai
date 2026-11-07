import type { Metadata, Viewport } from "next";
import config from "@config";
import Header from "@/components/yuktai/Header";
import Providers from "@/components/yuktai/Providers";
import BackToTop from "@/components/yuktai/BackToTop";
import { THEME_SCRIPT } from "@/components/yuktai/theme";
import { LOOK_SCRIPT } from "@/components/yuktai/look";
import { LINKS } from "@/data/site";
import "@/styles/globals.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: { default: config.title, template: `%s · ${config.title}` },
  description: config.description,
  manifest: `${base}/manifest.json`,
  icons: {
    icon: [
      { url: `${base}/favicon.ico`, sizes: "48x48" },
      { url: `${base}/icons/favicon.svg`, type: "image/svg+xml" },
      { url: `${base}/icons/favicon-32.png`, sizes: "32x32", type: "image/png" },
    ],
    apple: `${base}/icons/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = { themeColor: config.theme.color };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT + LOOK_SCRIPT }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Providers>
          <Header />
          <main id="main" tabIndex={-1}>{children}</main>
          <footer className="footer">
            <div className="wrap footer-in">
              <span>{config.title} · built with YuktAI</span>
              <span><a href={LINKS.docs}>YuktAI docs</a></span>
            </div>
          </footer>
          {config.features.backToTop && <BackToTop />}
        </Providers>
      </body>
    </html>
  );
}
