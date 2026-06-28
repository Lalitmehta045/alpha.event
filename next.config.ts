/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🎯 CRITICAL FOR VPS DEPLOYMENT
  output: "standalone",

  // Include native/dynamic modules in standalone output
  // heic-convert & heic-decode are dynamically imported and won't be traced automatically
  serverExternalPackages: ["heic-convert", "heic-decode", "sharp", "mongoose"],

  // ✅ Increase body size limit for API routes (fixes 413 Request Entity Too Large)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    // ✅ Keep: remotePatterns is the correct, modern, and secure way to define external image sources.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alpha-arts.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "alpha-arts-v2.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
    ],
    // ❌ REMOVED: The 'domains' property is deprecated and caused the warning.
    // domains: ["alpha-arts.s3.eu-north-1.amazonaws.com"],
    // 🔧 Disable image optimization for S3 signed URLs to prevent 502 errors
    // Signed URLs with query parameters don't work well with Next.js optimization
    unoptimized: false, // Keep false, but add unoptimized prop to Image components using signed URLs
  },

  async headers() {
    return [
      {
        source: "/api/:path*", // apply CORS to all API routes
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.alphaartandevents.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
