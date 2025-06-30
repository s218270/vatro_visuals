/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve .hdr with correct MIME
  async headers() {
    return [
      {
        source: '/hdri/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
