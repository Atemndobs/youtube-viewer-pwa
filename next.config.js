const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const path = require('path');

const nextConfig = withPWA({
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        bindings: false,
      };
    }

    config.resolve.alias['@utils'] = path.resolve(__dirname, 'src/utils');

    return config;
  },
});

module.exports = nextConfig;
