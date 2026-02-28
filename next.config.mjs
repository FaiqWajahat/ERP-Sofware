/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. The Fix: Treat these packages as external to avoid bundling errors
  serverExternalPackages: ["ssh2", "ssh2-sftp-client"],
  
  // NOTE: If you are on Next.js 14 or older, and the above line causes an error, 
  // comment it out and use this 'experimental' block instead:
  /*
  experimental: {
    serverComponentsExternalPackages: ["ssh2", "ssh2-sftp-client"],
  },
  */

  // 2. Your existing configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;