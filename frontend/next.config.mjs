/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the multi-stage Docker build
  output: "standalone",
};

export default nextConfig;
