import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["ws"],
  },
  async headers() {
    return [];
  },
};

export default nextConfig;
