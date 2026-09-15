import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import {
  SettingsProvider,
  SETTINGS_INIT_SCRIPT,
} from "@/components/providers/settings-provider";

// Single face for the whole UI — DB Sathorn X covers both Thai and Latin
// glyphs, so no separate Thai fallback is needed. Weight ranges are widened
// past the shipped weights (e.g. 700 900) so font-weight: 800 in the heading
// utilities maps to the Bold file instead of a synthetic bold.
const dbSathornX = localFont({
  variable: "--font-db-sathorn-x",
  display: "swap",
  src: [
    { path: "./fonts/db-sathorn-x-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/db-sathorn-x-italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/db-sathorn-x-medium.ttf", weight: "500 600", style: "normal" },
    { path: "./fonts/db-sathorn-x-medium-italic.ttf", weight: "500 600", style: "italic" },
    { path: "./fonts/db-sathorn-x-bold.ttf", weight: "700 900", style: "normal" },
    { path: "./fonts/db-sathorn-x-bold-italic.ttf", weight: "700 900", style: "italic" },
  ],
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
      className={`${dbSathornX.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="settings-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: SETTINGS_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full text-base">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
