/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🎯 CRITICAL FOR VPS DEPLOYMENT
  output: "standalone",
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
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
    ],
    // ❌ REMOVED: The 'domains' property is deprecated and caused the warning.
    // domains: ["alpha-arts.s3.eu-north-1.amazonaws.com"],
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
