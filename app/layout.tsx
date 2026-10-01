import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvrupaRotam",
  description:
    "Avrupa’da kariyer fırsatları, aday üyeliği ve güvenli CV başvuruları.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}