"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/app/components/SearchBar";
import ChatBot from "@/app/components/ChatBot";
import { categories } from "@/app/components/ProductData";
import ProductCard, { MappedProduct } from "./ProductCard";

export default function ShopClient({ products }: { products: MappedProduct[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mode, setMode] = useState<"buy" | "rent">("rent"); // Default to rent
  const [chatOpen, setChatOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      // Very basic mock categorization since DB doesn't have it.
      // We will just filter by name match for demonstration.
      if (selectedCategory === "gaming") {
        filtered = filtered.filter(p => p.name.toLowerCase().includes("gaming") || p.name.toLowerCase().includes("fury") || p.name.toLowerCase().includes("titan"));
      } else if (selectedCategory === "workstation") {
        filtered = filtered.filter(p => p.name.toLowerCase().includes("workstation") || p.name.toLowerCase().includes("creator"));
      } else if (selectedCategory === "laptop") {
        filtered = filtered.filter(p => p.name.toLowerCase().includes("laptop") || p.name.toLowerCase().includes("swift"));
      } else if (selectedCategory === "office") {
        filtered = filtered.filter(p => p.name.toLowerCase().includes("office") || p.name.toLowerCase().includes("lite"));
      }
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specs.some((s) => s.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.categoryLabel.includes(q)
      );
    }

    return filtered;
  }, [query, selectedCategory, products]);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              <span className="text-gradient">ซื้อ-เช่า</span> คอมพิวเตอร์
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              เลือกคอมพิวเตอร์ที่ใช่สำหรับคุณ หรือให้ AI ช่วยแนะนำ
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg shadow-[var(--accent-blue)]/20"
                    : "glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-blue)]/30"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Buy/Rent Toggle */}
          <div className="flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setMode("buy")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "buy"
                  ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              💰 ซื้อ
            </button>
            <button
              onClick={() => setMode("rent")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "rent"
                  ? "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              📋 เช่า
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[var(--text-muted)]">
            แสดง <span className="text-[var(--text-primary)] font-semibold">{filteredProducts.length}</span> สินค้า
            {selectedCategory !== "all" && (
              <span> ในหมวด <span className="text-[var(--accent-blue)]">{categories.find(c => c.id === selectedCategory)?.label}</span></span>
            )}
          </p>
          {query && (
            <button
              onClick={() => { setQuery(""); setSelectedCategory("all"); }}
              className="text-xs text-[var(--accent-blue)] hover:underline"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} mode={mode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              ไม่พบสินค้า
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              ลองค้นหาด้วยคำอื่น หรือถาม AI ให้ช่วยแนะนำ
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              ถาม AI ช่วยแนะนำ
            </button>
          </div>
        )}
      </div>

      {/* ChatBot */}
      <ChatBot isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}
