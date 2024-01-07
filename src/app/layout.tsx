import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import NavbarWrapper from "./lib/navbar/navbar-wrapper";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "split",
  description:
    "split allows you to easily split expenses with your travel budddies",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="text-foreground bg-background">
      <body className={`${inter.className}`}>
        <NavbarWrapper />
        <Providers>
          <div className="flex justify-center">{children}</div>
        </Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
