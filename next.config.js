/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/bookmark-manager',
    assetPrefix: '/bookmark-manager/',
  }
  
  module.exports = nextConfig