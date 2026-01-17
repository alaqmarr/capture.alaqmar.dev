import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server region for serverless functions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      // AWS S3
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      // Firebase Storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Cloudflare R2
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
};

export default nextConfig;
