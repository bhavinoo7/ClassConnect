import type { NextConfig } from 'next';
import path from 'path';
require("dotenv").config();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'example.com', 'anotherdomain.com'],
  },
  output: 'standalone',
};

export default nextConfig;
