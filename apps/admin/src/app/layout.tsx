import type { Metadata } from "next";
import Script from "next/script";
import {
  Public_Sans,
  Barlow,
  Inter,
  DM_Sans,
  Nunito_Sans,
  Noto_Sans_Thai,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import {
  SettingsProvider,
  SETTINGS_INIT_SCRIPT,
} from "@/components/providers/settings-provider";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

// Thai glyph coverage — Public Sans/Barlow are Latin-only, so Thai text would
// otherwise fall back to a heavier OS font. Loaded once and appended to every
// font chain (see globals.css) so Thai renders at the correct weight.
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Alternate body fonts — switchable via the settings drawer (Font → Family).
// All three are variable fonts, so the weight axis loads automatically.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
});

// Monospace data face for the control plane — machine identifiers, keys, refs.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
