import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Tắt ở local để đỡ rắc rối khi code
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "omzwdzmfjyknwdeljlct.supabase.co",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Bắt buộc phải bọc nextConfig bằng withPWA ở đây
export default withPWA(nextConfig);
