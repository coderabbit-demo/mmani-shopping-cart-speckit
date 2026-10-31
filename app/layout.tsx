import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { StoreProvider } from "../components/store-provider";
import { Shell } from "../components/shell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-geist" });
const hack = localFont({ src: [{ path: "../public/fonts/Hack-Regular.woff2", weight: "400" }, { path: "../public/fonts/Hack-Bold.woff2", weight: "700" }], variable: "--font-hack" });
export const metadata: Metadata = { title: "DeskDrop" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${geist.variable} ${hack.variable}`}><body><StoreProvider><Shell>{children}</Shell></StoreProvider></body></html>;
}
