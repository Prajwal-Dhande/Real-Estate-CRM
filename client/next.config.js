/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Use in-memory cache instead of filesystem pack files to prevent Windows NTFS lock / ENOENT crashes
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
