import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

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
        <body className="font-[Montserrat] antialiased flex min-h-full flex-col">
          <main className="flex flex-1">{children}</main>
        </body>
      </html>
    </AuthProvider>
  );
}
