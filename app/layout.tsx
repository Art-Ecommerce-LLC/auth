import type { Metadata } from "next";
import "./styles/globals.css";
import { Toaster } from "@/components/ui/toaster"
import { NavbarServer } from '../components/NavbarServer';

export const metadata: Metadata = {
  title: "Auth Project",
  description: "Code For Auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavbarServer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
