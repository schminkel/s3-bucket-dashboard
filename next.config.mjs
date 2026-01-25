/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // For GitHub Pages, uncomment the following line and replace with your repo name
  // basePath: '/s3-bucket-dashboard',
}

export default nextConfig