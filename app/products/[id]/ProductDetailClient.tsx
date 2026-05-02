"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/app/components/ProductData";
import { processRentalCheckout, processPurchaseCheckout } from "@/app/actions/checkout";

export interface DetailProduct {
  id: string;
  name: string;
  description: string;
  categoryLabel: string;
  specs: { key: string; value: string }[];
  rentPrice: number;
  buyPrice: number;
  image: string;
  isAvailable: boolean;
  stockCount: number;
}

type ModalStep = "form" | "processing" | "success" | "error";

export default function ProductDetailClient({ product }: { product: DetailProduct }) {
  const [mode, setMode] = useState<"rent" | "buy">("rent");
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipBase64, setSlipBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const price = mode === "rent" ? product.rentPrice : product.buyPrice;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setSlipBase64(result);
      setSlipPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!slipBase64) {
      setErrorMsg("กรุณาอัปโหลดสลิปการชำระเงิน");
      setStep("error");
      return;
    }
    setStep("processing");

    try {
      if (mode === "rent") {
        const start = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        const res = await processRentalCheckout({
          productId: product.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          depositAmount: product.rentPrice,
          paymentSlipBase64: slipBase64,
        });
        if (res.success) { setStep("success"); } 
        else { setErrorMsg(res.error || "เกิดข้อผิดพลาด"); setStep("error"); }
      } else {
        const res = await processPurchaseCheckout({
          productId: product.id,
          paymentSlipBase64: slipBase64,
        });
        if (res.success) { setStep("success"); }
        else { setErrorMsg(res.error || "เกิดข้อผิดพลาด"); setStep("error"); }
      }
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setStep("error");
    }
  };

  const resetModal = () => {
    setStep("form");
    setSlipPreview(null);
    setSlipBase64(null);
    setErrorMsg("");
  };

  const openModal = () => { resetModal(); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setTimeout(resetModal, 300); };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Link href="/products" className="hover:text-[var(--accent-blue)] transition-colors">ซื้อ-เช่าคอม</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Image Section */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative glass rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-8">
              <Image src={product.image} alt={product.name} width={400} height={400} className="object-contain transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            {/* Category & Stock */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--accent-cyan)]">{product.categoryLabel}</span>
              <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border ${product.isAvailable ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                {product.isAvailable ? `ว่าง ${product.stockCount} เครื่อง` : "สินค้าหมด"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{product.name}</h1>
            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">{product.description}</p>

            {/* Specs */}
            <div className="glass rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_6px_var(--accent-cyan)]" />
                สเปค
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-xs text-[var(--text-muted)]">{s.key}</span>
                    <span className="text-sm font-semibold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center glass rounded-xl p-1 mb-5 self-start">
              <button onClick={() => setMode("rent")} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "rent" ? "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:text-white"}`}>
                📋 เช่ารายเดือน
              </button>
              <button onClick={() => setMode("buy")} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "buy" ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:text-white"}`}>
                💰 ซื้อเลย
              </button>
            </div>

            {/* Price & CTA */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="text-xs text-[var(--text-muted)] block mb-1">{mode === "rent" ? "ค่าเช่า / เดือน" : "ราคาซื้อขาด"}</span>
                  <div className={`text-3xl font-black ${mode === "rent" ? "text-gradient-cyan" : "text-gradient"}`}>
                    ฿{formatPrice(price)}
                    {mode === "rent" && <span className="text-sm font-normal text-[var(--text-muted)]">/เดือน</span>}
                  </div>
                </div>
              </div>
              <button onClick={openModal} disabled={!product.isAvailable} className={`w-full relative overflow-hidden py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${!product.isAvailable ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"}`}>
                <div className="absolute inset-0 bg-white/20 translate-y-[-50%] rounded-full blur-md" />
                <span className="relative z-10 drop-shadow-md">{mode === "rent" ? "📋 ดำเนินการเช่า" : "🛒 ดำเนินการซื้อ"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================== CHECKOUT MODAL =================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full sm:w-[30rem] bg-[#0a0a0f] border border-[var(--border-color)] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">
                {step === "form" ? (mode === "rent" ? "ยืนยันการเช่า" : "ยืนยันการซื้อ") : step === "processing" ? "กำลังประมวลผล..." : step === "success" ? "สำเร็จ!" : "เกิดข้อผิดพลาด"}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-6">
              {/* FORM STEP */}
              {step === "form" && (
                <div className="space-y-5">
                  {/* Product mini card */}
                  <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-black flex-shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.65rem] text-[var(--accent-cyan)] mb-0.5">{product.categoryLabel}</div>
                      <div className="text-sm font-bold text-white truncate">{product.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{mode === "rent" ? "เช่ารายเดือน" : "ซื้อขาด"}</div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 text-sm">
                    {mode === "rent" && (
                      <div className="flex justify-between text-gray-400">
                        <span>ระยะเวลาเช่า</span>
                        <span className="text-white">1 เดือน</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>ประเภท</span>
                      <span className="text-white">{mode === "rent" ? "เช่ารายเดือน" : "ซื้อขาด"}</span>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-gray-400">{mode === "rent" ? "ยอดมัดจำ" : "ราคาซื้อ"}</span>
                      <span className={`text-2xl font-black ${mode === "rent" ? "text-gradient-cyan" : "text-gradient"}`}>฿{formatPrice(price)}</span>
                    </div>
                  </div>

                  {/* Payment Slip Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">📎 อัปโหลดสลิปการชำระเงิน</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="relative border-2 border-dashed border-white/10 hover:border-[var(--accent-cyan)]/40 rounded-2xl p-6 text-center cursor-pointer transition-colors group"
                    >
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      {slipPreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full max-w-[200px] mx-auto aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                            <Image src={slipPreview} alt="สลิป" fill className="object-cover" />
                          </div>
                          <p className="text-xs text-[var(--accent-green)]">✅ อัปโหลดสำเร็จ — กดเพื่อเปลี่ยน</p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📷</div>
                          <p className="text-sm text-[var(--text-secondary)]">กดเพื่อเลือกรูปสลิป</p>
                          <p className="text-[0.65rem] text-[var(--text-muted)]">รองรับ JPG, PNG, WEBP</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button onClick={handleSubmit} disabled={!slipBase64} className={`w-full relative overflow-hidden py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${!slipBase64 ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"}`}>
                    <div className="absolute inset-0 bg-white/20 translate-y-[-50%] rounded-full blur-md" />
                    <span className="relative z-10">{mode === "rent" ? "ยืนยันการเช่า" : "ยืนยันการซื้อ"}</span>
                  </button>
                </div>
              )}

              {/* PROCESSING */}
              {step === "processing" && (
                <div className="flex flex-col items-center py-12 space-y-6">
                  <div className="w-16 h-16 border-4 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin" />
                  <p className="text-gray-400">กำลังประมวลผลรายการ...</p>
                </div>
              )}

              {/* SUCCESS */}
              {step === "success" && (
                <div className="flex flex-col items-center py-8 space-y-6 text-center">
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{mode === "rent" ? "สร้างรายการเช่าสำเร็จ!" : "สร้างรายการสั่งซื้อสำเร็จ!"}</h3>
                    <p className="text-sm text-gray-400 px-4">กรุณารอการยืนยันจากผู้ดูแลระบบ เราจะแจ้งผลให้ทราบเร็วที่สุด</p>
                  </div>
                  <div className="w-full p-4 rounded-2xl bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20">
                    <p className="text-sm text-[var(--accent-blue)]">📋 สถานะ: รอผู้ดูแลระบบตรวจสอบสลิป</p>
                  </div>
                  <button onClick={closeModal} className="px-8 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-semibold">ปิด</button>
                </div>
              )}

              {/* ERROR */}
              {step === "error" && (
                <div className="flex flex-col items-center py-8 space-y-4 text-center">
                  <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-red-400">{errorMsg}</h3>
                  <button onClick={() => setStep("form")} className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">ลองใหม่อีกครั้ง</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
