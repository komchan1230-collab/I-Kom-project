"use client";

import Link from "next/link";
import { products } from "./ProductData";
import ProductCard from "./ProductCard";

export default function PopularProducts() {
  const popular = products.filter((p) => p.badge === "hot" || p.badge === "new").slice(0, 4);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-blue)]/3 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-[var(--accent-blue)] mb-4">
            🔥 สินค้ายอดนิยม
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            สินค้า<span className="text-gradient">แนะนำ</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            คัดสรรคอมพิวเตอร์คุณภาพสูง ตอบโจทย์ทุกการใช้งาน
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} mode="buy" />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/shop" className="btn-secondary text-lg !py-3 !px-8">
            ดูสินค้าทั้งหมด
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
