import type { NextConfig } from "next";

// GitHub Pages serves a project repo from /<repo-name>, so the deploy
// workflow sets NEXT_PUBLIC_BASE_PATH (e.g. "/portfolio"). Locally it is
// empty and the site runs at http://localhost:3000.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export", // build a fully static site into ./out
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
