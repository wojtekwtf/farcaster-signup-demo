import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "../providers/web3Provider";
import { FidProvider } from "../providers/fidContext";
import { SignerProvider } from "@/providers/signerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sign up for Farcaster",
  description:
    "Simple app illustrating how to sign up for Farcaster. Educational purposes only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link
        rel="icon"
        href="https://framerusercontent.com/modules/jVMp8b8ZfTZpbLnhDiml/NV8p4XHr9GEQFJDJsKKb/assets/DE2CvWySqIW7eDC8Ehs5bCK6g.svg"
      ></link>
      <body className={inter.className}>
        <ClientLayout>
          <FidProvider>
            <SignerProvider>{children}</SignerProvider>
          </FidProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
