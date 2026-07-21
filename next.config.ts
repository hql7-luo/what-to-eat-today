import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const GITHUB_PAGES_BASE_PATH = "/what-to-eat-today";

const nextConfig = (phase: string): NextConfig => {
  const basePath = phase === PHASE_DEVELOPMENT_SERVER ? "" : GITHUB_PAGES_BASE_PATH;

  return {
    output: "export",
    trailingSlash: true,
    basePath,
    assetPrefix: basePath || undefined,
    env: {
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
    poweredByHeader: false,
    reactStrictMode: true,
    images: {
      unoptimized: true,
      qualities: [75, 84],
    },
  };
};

export default nextConfig;
