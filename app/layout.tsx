import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";

import { Providers } from "@/app/providers";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { env } from "@/lib/env";

import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  keywords: [
    "VaultDrop",
    "Flare",
    "Confidential Compute",
    "confidential compute apps",
    "TEE",
    "secure file sharing",
    "end-to-end encryption",
    "key custody",
    "attestation",
    "Coston2",
    "token gating",
    "NFT gating",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "security",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo1.svg", type: "image/svg+xml" },
      { url: "/logo1.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/logo1.svg",
    apple: [{ url: "/logo1.png", sizes: "1024x1024", type: "image/png" }],
  },
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    url: "/",
    siteName: APP_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo1.png",
        width: 1024,
        height: 1024,
        alt: `${APP_NAME} — ${APP_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    images: ["/logo1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0d0f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${hanken.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
