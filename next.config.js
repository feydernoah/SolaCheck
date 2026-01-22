const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/solacheck/offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  output: 'standalone', // Required for Docker deployment
  basePath: '/solacheck', // Serve from /solacheck path
  assetPrefix: '/solacheck',
};

module.exports = withPWA(nextConfig);
