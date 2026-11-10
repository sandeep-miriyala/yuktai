// The site lives under a base path on GitHub Pages (sandeep-miriyala.github.io/yuktai/).
// Next.js <Link> adds it by itself; plain <img src>, the service worker and the
// manifest need it added by hand. Set by the GitHub Action: NEXT_PUBLIC_BASE_PATH=/yuktai.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** "/brand/x.svg" → "/yuktai/brand/x.svg" in production, unchanged in `npm run dev`. */
export const asset = (path: string): string => `${BASE}${path}`;
