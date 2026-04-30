"use client";

import { useState } from "react";
import Image from "next/image";
import { createRentalBooking } from "@/app/actions/rental";
import CountdownTimer from "./CountdownTimer";
import { formatPrice } from "@/app/components/ProductData";

export interface MappedProduct {
  id: string;
  name: string;
  categoryLabel: string;
  specs: string[];
  description: string;
  buyPrice: number;
  rentPrice: number;
  image: string;
  tags: string[];
  badge?: "hot" | "new" | "sale";
  isAvailable: boolean;
  stockCount: number;
}

interface ProductCardProps {
  product: MappedProduct;
  mode: "buy" | "rent";
}

export default function ProductCard({ product, mode }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [rentalId, setRentalId] = useState<string | null>(null);

  const handleRent = async () => {
    if (!product.isAvailable) {
      setError("สินค้าหมด (Out of Stock)");
      return;
    }

    setIsLoading(true);
    setError(null);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const res = await createRentalBooking({
      userId: "demo-student-id-123", // Ignored due to action logic
      productId: product.id,
      startDate,
      endDate,
      depositAmount: product.rentPrice,
    });

    if (res.success && res.rental) {
      setSuccess(true);
      setRentalId(res.rental.id);
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      setExpiresAt(expirationTime);
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่");
    }
    
    setIsLoading(false);
  };

  const handleExpire = () => {
    setError("หมดเวลาการจอง กรุณากดเช่าใหม่อีกครั้ง");
    setSuccess(false);
  };

  return (
    <div className="group glass rounded-2xl overflow-hidden card-hover neon-border flex flex-col h-full">
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
        <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${
          product.isAvailable 
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {product.isAvailable ? `ว่าง ${product.stockCount} เครื่อง` : "สินค้าหมด"}
        </div>
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
      <div className="p-5 flex flex-col flex-1 relative z-10">
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
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
              {error}
            </div>
          )}

          {success && expiresAt && rentalId ? (
            <CountdownTimer 
              expiresAt={expiresAt} 
              onExpire={handleExpire} 
              rentalId={rentalId}
            />
          ) : (
            <>
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
                <button 
                  onClick={mode === "rent" ? handleRent : undefined}
                  disabled={isLoading || (mode === "rent" && !product.isAvailable)}
                  className={`flex-1 btn-primary text-sm !py-2.5 justify-center transition-all ${
                    isLoading || (mode === "rent" && !product.isAvailable) ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "กำลังล็อกเครื่อง..." : (mode === "buy" ? "🛒 เพิ่มลงตะกร้า" : "📋 เช่าเลย")}
                </button>
                <button className="btn-secondary text-sm !py-2.5 !px-3" title="ดูรายละเอียด">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
