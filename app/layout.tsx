import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gatherly — A little ghost for every gathering",
  description:
    "An open-weight AI event planner that runs in your browser. Build a budget, timeline, vendor checklist, and ideas without an AI API key.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
