import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User cards | Dashboard - Minimal UI",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
