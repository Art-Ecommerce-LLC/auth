
import type { Metadata } from "next";
import "./styles/globals.css";
import { Toaster } from "@/components/ui/toaster"
import {NextUIProvider} from "@nextui-org/react";
import { Roboto } from 'next/font/google'
 
const geist = Roboto({
  subsets: ['latin'],
})
 
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
    <html lang="en" className={geist.className}>
      <body>
      <NextUIProvider>
          {children}
        <Toaster />
        </NextUIProvider>
      </body>
    </html>
  );
}
