import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpha CRM | Premium Business Management",
  description: "Advanced CRM for tracking payments, subscriptions and services.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body
        className={cn(
          inter.variable,
          geistMono.variable,
          "font-sans antialiased min-h-screen bg-background text-foreground"
        )}
      >
        <Toaster richColors position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
