/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false
  },
}

module.exports = nextConfig
