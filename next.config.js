/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enhanced webpack configuration to fix chunk loading issues
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize chunk splitting for development
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
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
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: -5,
            reuseExistingChunk: true,
          },
        },
      }
      
      // Add fallback for failed chunk loading
      config.output.chunkLoadingGlobal = 'webpackChunkLoad'
      config.output.globalObject = 'globalThis'
    }
    
    return config
  },
  // Experimental features to improve stability
  experimental: {
    optimizeCss: false,
  },
  // Enhanced error handling
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Disable source maps in development to reduce chunk size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
