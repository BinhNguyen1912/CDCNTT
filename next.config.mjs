/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com', // domain ảnh ngoài
        pathname: '/**', // đường dẫn cho phép
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**', // cho phép tất cả path
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3300',
        pathname: '/**', // cho phép tất cả path
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**', // cho phép tất cả path
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dribbble.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nhahang.ai',
        pathname: '/**',
      },
    ],
  },
};
export default nextConfig;
