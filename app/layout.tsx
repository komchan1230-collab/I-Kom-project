import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "I-Kom | ศูนย์รวมคอมพิวเตอร์ ซื้อ-เช่า ครบวงจร",
  description:
    "I-Kom ร้านขายและให้เช่าคอมพิวเตอร์คุณภาพสูง ทั้งเกมมิ่ง, แล็ปท็อป, สำนักงาน, เวิร์คสเตชั่น พร้อมระบบ AI ช่วยแนะนำสเปคที่เหมาะกับคุณ ส่งฟรีทั่วประเทศ รับประกัน 3 ปี",
};

import { getSession } from "./actions/auth";

import BottomNav from "./components/BottomNav";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar session={session} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
