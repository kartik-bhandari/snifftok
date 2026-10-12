import { Inter, Syne } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata = {
  title: "snifftok | Artisanal Luxury Perfumes",
  description: "Mobile-first haute perfumery storefront. Artisanal extraits formulated in Grasse & Dubai.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
