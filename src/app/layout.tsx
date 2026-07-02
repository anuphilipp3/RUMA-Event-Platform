import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { SplashScreen } from "@/components/shared/splash-screen";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial display serif for headings (festive, premium character).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { getOrgSettings } = await import("@/lib/data/org-settings");
  const { brand } = await getOrgSettings();
  const title = brand.tagline ? `${brand.name} ${brand.tagline}` : brand.name;
  return {
    title: { default: title, template: `%s · ${brand.name}` },
    description:
      "Community events, membership, digital tickets, and check-in for Rohan Upavan Malayali Association.",
  };
}

export const viewport: Viewport = {
  themeColor: "#0F6A4A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh">
        <SplashScreen />
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{ className: "font-sans" }}
        />
      </body>
    </html>
  );
}
