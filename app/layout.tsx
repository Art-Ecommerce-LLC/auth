// app/layout.tsx
import type { Metadata } from "next";
import "./styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Roboto } from 'next/font/google';
import { Providers } from "@/components/Providers";

const geist = Roboto({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Auth Project",
  description: "Code For Auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className}>
      <body>
          <Providers>
            {children}
            <Toaster />
          </Providers>
      </body>
    </html>
  );
}
