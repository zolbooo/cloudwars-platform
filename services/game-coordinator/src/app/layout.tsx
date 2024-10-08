import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Cloudwars",
    default: "Cloudwars",
  },
  icons: [
    {
      url: "/favicon.ico",
      sizes: "16x16",
    },
    {
      url: "/favicon-16x16.png",
      sizes: "16x16",
    },
    {
      url: "/favicon-32x32.png",
      sizes: "32x32",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
