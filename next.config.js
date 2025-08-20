/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Fix webpack chunk loading issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
  // Add experimental features to reduce chunk errors
  experimental: {
    optimizeCss: false,
  },
  // Disable source maps in development to reduce chunk size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
