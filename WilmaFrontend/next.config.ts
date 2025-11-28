import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false, // Temporarily disabled for WebSocket debugging
};

export default nextConfig;
