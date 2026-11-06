import type { MetadataRoute } from "next";
import config from "@config";

// The installable app (PWA). Next.js writes /manifest.webmanifest at build time.
export const dynamic = "force-static";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.title,
    short_name: config.title.slice(0, 12),
    description: config.description,
    id: `${base}/`,
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#08081a",
    theme_color: config.theme.color,
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
