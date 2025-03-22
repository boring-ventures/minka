/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      // Add your Supabase project domain
      "swfgvfhpmicwptupjyko.supabase.co",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // ... other config options
};

module.exports = nextConfig;
