import "./globals.css";
import type { Metadata } from "next";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Lama Dev X Clone",
  description: "Next.js social media application project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
