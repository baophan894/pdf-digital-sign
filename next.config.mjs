/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: "/api/:path*",
            destination: "https://api-dev.fuses.fun/:path*", 
          },
        ];
      },
};

export default nextConfig;
