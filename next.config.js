/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Other config options as needed
  reactStrictMode: false,
  swcMinify: true,
  transpilePackages: ['framer-motion'],
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;