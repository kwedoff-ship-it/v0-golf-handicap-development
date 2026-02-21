import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true, // Catches bugs in development

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  compress: true, //Faster page loads with gzip
  poweredByHeader: false, //Removes "Powered by Next.js" header (security)

  experimental: {
    serverActions: {
      //Sets body size limit for form submissions
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
