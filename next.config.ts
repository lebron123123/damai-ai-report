import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone output: bundles a minimal server + only the deps actually used,
  // which is what the Tencent CloudBase 云托管 Dockerfile expects (COPY .next/standalone)
  output: "standalone",
};

export default nextConfig;
