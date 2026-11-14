// sitemap.xml for search engines: every page of the site, built at build time.
import type { MetadataRoute } from "next";
import { GUIDES } from "@/data/site";

export const dynamic = "force-static";

const ORIGIN = "https://sandeep-miriyala.github.io";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/about/", ...GUIDES.map((g) => g.href)];
  return [...new Set(paths)].map((p) => ({
    url: `${ORIGIN}${BASE}${p}`,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
}
