/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iip.smk.dk",
        pathname: "/iiif/**",
      },
    ],
  },
};

export default nextConfig;
