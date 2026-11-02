/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Store cache in memory on Windows to prevent PackFileCacheStrategy ENOENT rename collisions
      config.cache = {
        type: 'memory',
      };
    }
    if (isServer) {
      config.externals = [...(config.externals || []), 'leaflet'];
    }
    return config;
  },
};

module.exports = nextConfig;
