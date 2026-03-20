import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces"
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans"
});

export const metadata: Metadata = {
  title: "Accountability Appalachian",
  description:
    "Mobile-first civic transparency platform for finding representatives, tracking public responsiveness, and participating in local events and surveys."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${publicSans.variable} font-sans`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
