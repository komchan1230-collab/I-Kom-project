"use client";

import Image from "next/image";
import Link from "next/link";
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
  onRentClick?: (product: MappedProduct) => void;
  priority?: boolean;
}

export default function ProductCard({ product, mode, onRentClick, priority = false }: ProductCardProps) {
  return (
    <div className="group relative rounded-3xl overflow-hidden glass card-hover neon-border flex flex-col h-full sm:aspect-auto aspect-[4/5] bg-black">
      {/* Full Bleed Image */}
      <div className="absolute inset-0 w-full h-full bg-neutral-900/50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover sm:object-contain transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent sm:via-transparent sm:from-[var(--bg-secondary)] sm:to-[var(--bg-card)]" />
      </div>

      {/* Badges */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        {product.badge ? (
          <span className={`badge badge-${product.badge} shadow-lg`}>
            {product.badge === "hot" ? "🔥 ขายดี" : product.badge === "new" ? "✨ ใหม่" : "💚 ลดราคา"}
          </span>
        ) : <div />}
        
        <div className={`px-2 py-1 rounded-full text-[0.65rem] font-bold shadow-lg backdrop-blur-md border ${
          product.isAvailable 
            ? "bg-green-500/20 text-green-400 border-green-500/30"
            : "bg-red-500/20 text-red-400 border-red-500/30"
        }`}>
          {product.isAvailable ? `ว่าง ${product.stockCount} เครื่อง` : "สินค้าหมด"}
        </div>
      </div>

      {/* Content overlay anchored to bottom */}
      <div className="relative z-10 mt-auto p-5 flex flex-col pt-20">
        <span className="text-[0.65rem] text-[var(--accent-cyan)] font-bold tracking-wider uppercase mb-1 drop-shadow-md">
          {product.categoryLabel}
        </span>
        
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl font-bold text-white mb-2 leading-tight drop-shadow-lg hover:text-[var(--accent-cyan)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Specs - Hidden on very small screens, visible otherwise */}
        <div className="hidden sm:block space-y-1 mb-3 opacity-80">
          {product.specs.slice(0, 2).map((spec, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_5px_var(--accent-cyan)]" />
              {spec}
            </div>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between mt-2 pt-3 border-t border-white/10">
          <div>
            <span className="text-[0.65rem] text-gray-400 block mb-0.5">
              {mode === "buy" ? "ราคาซื้อ" : "ค่าเช่า/เดือน"}
            </span>
            <div className={`text-xl sm:text-2xl font-black ${mode === "rent" ? "text-gradient-cyan" : "text-gradient"}`}>
              ฿{formatPrice(mode === "buy" ? product.buyPrice : product.rentPrice)}
            </div>
          </div>
          
          <button 
            onClick={() => onRentClick && onRentClick(product)}
            disabled={mode === "rent" && !product.isAvailable}
            className={`
              relative overflow-hidden px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(0,255,255,0.3)]
              transition-all duration-300 active:scale-95
              ${(!product.isAvailable && mode === "rent") 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none border border-gray-700" 
                : "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]"}
            `}
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-white/20 translate-y-[-50%] rounded-full blur-md" />
            <span className="relative z-10 drop-shadow-md">
              {mode === "buy" ? "ซื้อเลย" : "เช่าเลย"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
