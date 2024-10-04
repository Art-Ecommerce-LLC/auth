import type { Metadata } from "next";
import "./styles/globals.css";
import { Toaster } from "@/components/ui/toaster"
import {NextUIProvider} from "@nextui-org/react";
import { ChakraProvider } from '@chakra-ui/react';

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
      <NextUIProvider>
        <ChakraProvider>
        {children}
        </ChakraProvider>
        <Toaster />
        </NextUIProvider>
      </body>
    </html>
  );
}
