/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pcmcs',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  
}


export default nextConfig
