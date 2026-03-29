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

  // Allow ffmpeg wasm to load from CDN
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

  // Exclude ffmpeg from webpack bundling (loaded from CDN)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
}

export default nextConfig
