/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/imgs.json',
        destination: 'https://imgs.geshem.space/imgs.json',
      },
      {
        source: '/imgs/:path*',
        destination: 'https://imgs.geshem.space/imgs/:path*',
      },
    ];
  },
};

export default nextConfig;
