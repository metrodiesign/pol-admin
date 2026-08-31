import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import {
  SettingsProvider,
  SETTINGS_INIT_SCRIPT,
} from "@/components/providers/settings-provider";

const publicSans = localFont({
  src: "./fonts/public-sans-variable.ttf",
  variable: "--font-public-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const barlow = localFont({
  src: [
    { path: "./fonts/barlow-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/barlow-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/barlow-800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
});

// Thai glyph coverage — Public Sans/Barlow are Latin-only, so Thai text would
// otherwise fall back to a heavier OS font. Loaded once and appended to every
// font chain (see globals.css) so Thai renders at the correct weight.
const notoSansThai = localFont({
  src: "./fonts/noto-sans-thai-variable.ttf",
  variable: "--font-noto-thai",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

// Alternate body fonts — switchable via the settings drawer (Font → Family).
// All three are variable fonts, so the weight axis loads automatically.
const inter = localFont({
  src: "./fonts/inter-variable.ttf",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/dm-sans-variable.ttf",
  variable: "--font-dm-sans",
  weight: "100 1000",
  style: "normal",
  display: "swap",
});

const nunitoSans = localFont({
  src: "./fonts/nunito-sans-variable.ttf",
  variable: "--font-nunito-sans",
  weight: "200 1000",
  style: "normal",
  display: "swap",
});

// Monospace data face for the control plane — machine identifiers, keys, refs.
const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-600.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard - Minimal UI",
  description: "Minimal UI dashboard clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${barlow.variable} ${inter.variable} ${dmSans.variable} ${nunitoSans.variable} ${notoSansThai.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="settings-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: SETTINGS_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
