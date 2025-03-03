import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arenius",
  description: "Made by Generate NU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" className="h-dvh">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-full flex-col`}
        >
          <main className="flex flex-1">{children}</main>
        </body>
      </html>
    </AuthProvider>
  );
}
