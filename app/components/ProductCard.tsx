"use client";

import Image from "next/image";
import { Product, formatPrice } from "./ProductData";

interface ProductCardProps {
  product: Product;
  mode: "buy" | "rent";
}

export default function ProductCard({ product, mode }: ProductCardProps) {
  return (
    <div className="group glass rounded-2xl overflow-hidden card-hover neon-border flex flex-col">
      {/* Image */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] flex items-center justify-center overflow-hidden">
        {product.badge && (
          <span className={`absolute top-3 left-3 z-10 badge badge-${product.badge}`}>
            {product.badge === "hot"
              ? "🔥 ขายดี"
              : product.badge === "new"
              ? "✨ ใหม่"
              : "💚 ลดราคา"}
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          width={220}
          height={220}
          className="object-contain transition-transform duration-500 group-hover:scale-110"
        />
        {/* Glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-blue)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <span className="text-xs text-[var(--accent-cyan)] font-medium mb-1">
          {product.categoryLabel}
        </span>

        {/* Name */}
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-gradient transition-colors">
          {product.name}
        </h3>

        {/* Specs */}
        <div className="space-y-1 mb-3">
          {product.specs.slice(0, 3).map((spec, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-1 h-1 rounded-full bg-[var(--accent-blue)]" />
              {spec}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)] border border-[var(--border-color)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="mb-3">
            {mode === "buy" ? (
              <div>
                <span className="text-xs text-[var(--text-muted)]">ราคาซื้อ</span>
                <div className="text-2xl font-bold text-gradient">
                  ฿{formatPrice(product.buyPrice)}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs text-[var(--text-muted)]">ค่าเช่า/เดือน</span>
                <div className="text-2xl font-bold text-gradient-cyan">
                  ฿{formatPrice(product.rentPrice)}
                  <span className="text-sm font-normal text-[var(--text-muted)]">/เดือน</span>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 btn-primary text-sm !py-2.5 justify-center">
              {mode === "buy" ? "🛒 เพิ่มลงตะกร้า" : "📋 เช่าเลย"}
            </button>
            <button className="btn-secondary text-sm !py-2.5 !px-3" title="ดูรายละเอียด">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
