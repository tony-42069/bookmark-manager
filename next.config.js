/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: '/bookmark-manager',
    trailingSlash: true,
  }
  
  module.exports = nextConfig