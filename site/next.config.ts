import type { NextConfig } from "next";

// Static export: `yuktai build` writes plain files to out/. Free hosting, no server.
// NEXT_PUBLIC_BASE_PATH is set for GitHub Pages (the site lives under /<repo>/).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
};

export default nextConfig;
