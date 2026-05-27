/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpila pacotes internos do monorepo
  transpilePackages: ["@industrial/types"],
};

module.exports = nextConfig;
