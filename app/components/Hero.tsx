"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-grid" />
      <div className="absolute inset-0 hero-gradient" />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--accent-blue)]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[var(--accent-cyan)]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 py-20">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6 animate-fade-in-up text-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
            <span className="text-[var(--text-secondary)]">🖥️ พร้อมให้บริการ ซื้อ-เช่าคอมได้ 24/7</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            คอมพิวเตอร์
            <br />
            <span className="text-gradient">ยุคใหม่</span>
            <br />
            <span className="text-[var(--text-secondary)] text-3xl sm:text-4xl lg:text-5xl">ซื้อง่าย เช่าสะดวก</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            I-Kom ศูนย์รวมคอมพิวเตอร์คุณภาพสูง ทั้งซื้อและเช่า
            พร้อมระบบ AI ช่วยแนะนำสเปคที่เหมาะกับคุณ
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/shop" className="btn-primary text-lg !py-3 !px-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              เลือกซื้อเลย
            </Link>
            <Link href="/shop" className="btn-secondary text-lg !py-3 !px-8">
              ดูราคาเช่า
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gradient">500+</div>
              <div className="text-sm text-[var(--text-muted)]">สินค้าพร้อมส่ง</div>
            </div>
            <div className="w-px h-10 bg-[var(--border-color)]" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gradient-cyan">2,000+</div>
              <div className="text-sm text-[var(--text-muted)]">ลูกค้าไว้วางใจ</div>
            </div>
            <div className="w-px h-10 bg-[var(--border-color)]" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gradient">24/7</div>
              <div className="text-sm text-[var(--text-muted)]">บริการหลังการขาย</div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 blur-3xl rounded-full scale-110" />
            <div className="relative animate-float">
              <Image
                src="/gaming-desktop.png"
                alt="I-Kom Gaming Desktop"
                width={500}
                height={500}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s" }}>
        <span className="text-xs text-[var(--text-muted)]">เลื่อนลง</span>
        <div className="w-5 h-8 rounded-full border border-[var(--border-color)] flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-[var(--accent-blue)] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
