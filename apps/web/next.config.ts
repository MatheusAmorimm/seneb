import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    // Foto do desenvolvedor na landing (avatar público do GitHub).
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;
