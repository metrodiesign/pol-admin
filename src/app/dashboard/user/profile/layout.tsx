import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User profile | Dashboard - Minimal UI",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
