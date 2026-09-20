import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bungora | EuropeRoute",
  description: "European career opportunities, candidate membership and secure CV applications.",
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
