import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import NavbarWrapper from "./lib/navbar/navbar-wrapper";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "split",
  description:
    "split allows you to easily split expenses with your travel budddies",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
          <div className="flex justify-center">
            {children}
            <SpeedInsights />
          </div>
        </Providers>
        <ToastContainer />
      </body>
    </html>
  );
}
