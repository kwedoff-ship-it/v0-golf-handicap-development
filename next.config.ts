import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, //Catches bugs in development
  
  images: { //Ready for image optimization when you add images
    formats: ['image/avif', 'image/webp'],
  },

  compress: true, //Faster page loads with gzip
  poweredByHeader: false, //Removes "Powered by Next.js" header (security)

  experimental: {
    serverActions: { //Sets body size limit for form submissions
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
