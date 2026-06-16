import type { Metadata } from "next";
import {
  Public_Sans,
  Barlow,
  Inter,
  DM_Sans,
  Nunito_Sans,
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
      className={`${publicSans.variable} ${barlow.variable} ${inter.variable} ${dmSans.variable} ${nunitoSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SETTINGS_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
