/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["onnxruntime-node", "@huggingface/transformers"],
  },
};

export default nextConfig;
