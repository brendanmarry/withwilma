import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false, // Temporarily disabled for WebSocket debugging
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_URL || "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
