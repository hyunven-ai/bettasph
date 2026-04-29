import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — foto lelang
      {
        protocol: "https",
        hostname: "dgocoeiqmqnkmwphorzy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase Storage (format lama)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Imgur
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "imgur.com" },
      // Google Drive / Photos
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
      // General https (fallback untuk URL eksternal lain)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
