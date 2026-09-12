import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // LinkedIn profile photos, fetched via og:image during onboarding.
    remotePatterns: [
      { protocol: "https", hostname: "*.licdn.com" },
    ],
  },
};

export default nextConfig;
