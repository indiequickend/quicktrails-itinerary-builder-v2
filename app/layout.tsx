import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Clean, modern font for the dashboard UI
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Elegant, editorial serif font for itinerary titles and branding
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "QuickTrails Agent Workspace",
  description: "Premium Itinerary Builder and B2B Portal for QuickTrails",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}