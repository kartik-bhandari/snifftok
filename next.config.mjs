/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  async rewrites() {
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${API}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
