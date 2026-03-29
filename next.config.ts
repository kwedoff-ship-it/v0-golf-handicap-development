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

  // Allow ffmpeg wasm to load from CDN (required for SharedArrayBuffer)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ]
  },

  // Turbopack config (required for Next.js 16+)
  turbopack: {},
}

export default nextConfig
