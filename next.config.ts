import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost }]
      : [],
  },
  // Load @react-pdf/renderer as a real Node module on the server instead of
  // bundling/transpiling it — transpiling breaks its internal renderer
  // (TypeError: Cannot read properties of undefined) at runtime.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
