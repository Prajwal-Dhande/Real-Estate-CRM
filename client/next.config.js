/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable pack file gzip compression on Windows to eliminate .pack.gz file locks
      config.cache = {
        type: 'filesystem',
        compression: false,
      };
    }
    if (isServer) {
      config.externals = [...(config.externals || []), 'leaflet'];
    }
    return config;
  },
};

module.exports = nextConfig;
