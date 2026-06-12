"use client";

import { useState, useRef, useEffect } from "react";
import { MappedProduct } from "./ProductCard";
import { processRentalCheckout, processPurchaseCheckout } from "@/app/actions/checkout";
import { formatPrice } from "@/app/components/ProductData";
import { generatePromptPayQR } from "@/lib/promptpay";
import Image from "next/image";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MappedProduct | null;
  mode: "buy" | "rent";
}

export default function CheckoutModal({ isOpen, onClose, product, mode }: CheckoutModalProps) {
  const [step, setStep] = useState<"review" | "processing" | "success" | "error">("review");
  const [errorMessage, setErrorMessage] = useState("");
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipBase64, setSlipBase64] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isAutoVerified, setIsAutoVerified] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const price = product ? (mode === "rent" ? product.rentPrice : product.buyPrice) : 0;

  useEffect(() => {
    if (isOpen && product && price > 0) {
      const fetchQR = async () => {
        setIsGeneratingQR(true);
        try {
          const qr = await generatePromptPayQR(price);
          setQrCodeUrl(qr);
        } catch (err) {
          console.error("Failed to generate PromptPay QR:", err);
        } finally {
          setIsGeneratingQR(false);
        }
      };
      fetchQR();
    } else {
      setQrCodeUrl(null);
      setIsAutoVerified(false);
    }
  }, [isOpen, product, price]);

  if (!isOpen || !product) return null;

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

  const handleConfirm = async () => {
    if (!slipBase64) {
      setErrorMessage("กรุณาอัปโหลดสลิปการชำระเงิน");
      setStep("error");
      return;
    }

    setStep("processing");

    try {
      if (mode === "rent") {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const res = await processRentalCheckout({
          productId: product.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          depositAmount: product.rentPrice,
          paymentSlipBase64: slipBase64,
        });

        if (res.success) {
          setIsAutoVerified(!!res.isAutoVerified);
          setStep("success");
        } else {
          setErrorMessage(res.error || "เกิดข้อผิดพลาดในการทำรายการ");
          setStep("error");
        }
      } else {
        const res = await processPurchaseCheckout({
          productId: product.id,
          paymentSlipBase64: slipBase64,
        });

        if (res.success) {
          setIsAutoVerified(!!res.isAutoVerified);
          setStep("success");
        } else {
          setErrorMessage(res.error || "เกิดข้อผิดพลาดในการทำรายการ");
          setStep("error");
        }
      }
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setStep("error");
    }
  };

  const handleClose = () => {
    setTimeout(() => {
      setStep("review");
      setSlipPreview(null);
      setSlipBase64(null);
      setErrorMessage("");
      setQrCodeUrl(null);
      setIsAutoVerified(false);
    }, 300);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:w-[28rem] bg-[#0a0a0f] border border-[var(--border-color)] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white">
            {step === "review"
              ? mode === "rent" ? "ยืนยันการเช่า" : "ยืนยันการซื้อ"
              : step === "processing"
              ? "กำลังประมวลผล..."
              : step === "success"
              ? "สำเร็จ!"
              : "เกิดข้อผิดพลาด"}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "review" && (
            <div className="space-y-5">
              {/* Product Info */}
              <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-xl p-2 flex items-center justify-center flex-shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-contain p-1" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="text-xs text-[var(--accent-cyan)] mb-1">{product.categoryLabel}</div>
                  <div className="text-sm font-bold text-white line-clamp-2 leading-tight">{product.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {mode === "rent" ? "📋 เช่ารายเดือน" : "💰 ซื้อขาด"}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 text-sm">
                {mode === "rent" && (
                  <div className="flex justify-between text-gray-400">
                    <span>ระยะเวลาเช่า</span>
                    <span className="text-white">1 เดือน</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>สถานะสินค้า</span>
                  <span className="text-green-400">พร้อมใช้งาน ({product.stockCount} เครื่อง)</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-gray-400">{mode === "rent" ? "ยอดมัดจำที่ต้องชำระ" : "ราคาซื้อ"}</span>
                  <span className={`text-2xl font-black ${mode === "rent" ? "text-gradient-cyan" : "text-gradient"}`}>
                    ฿{formatPrice(price)}
                  </span>
                </div>
              </div>

              {/* PromptPay QR Code Section */}
              <div className="p-4 rounded-2xl bg-[#0f0f18]/60 border border-white/5 flex flex-col items-center text-center space-y-2.5">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  ชำระผ่าน PromptPay (สแกนเพื่อจ่าย)
                </div>

                {isGeneratingQR ? (
                  <div className="w-36 h-36 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : qrCodeUrl ? (
                  <div className="relative p-2 bg-white rounded-xl shadow-lg border border-white/10 group overflow-hidden">
                    <Image
                      src={qrCodeUrl}
                      alt="PromptPay QR Code"
                      width={144}
                      height={144}
                      className="rounded-lg object-contain"
                    />
                    <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 text-xs text-red-400">
                    ไม่สามารถสร้าง QR Code ได้
                  </div>
                )}

                <div className="text-[10px] text-gray-400 font-medium">
                  บัญชีผู้รับ: <span className="text-white">I-Kom Computer Co., Ltd.</span>
                  <br />
                  ยอดโอน: <span className="text-[var(--accent-cyan)] font-extrabold text-xs">฿{formatPrice(price)}</span>
                </div>
              </div>

              {/* Payment Slip Upload */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">📎 อัปโหลดสลิปการชำระเงิน</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative border-2 border-dashed border-white/10 hover:border-[var(--accent-cyan)]/40 rounded-2xl p-5 text-center cursor-pointer transition-colors group"
                >
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {slipPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full max-w-[160px] mx-auto aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                        <Image src={slipPreview} alt="สลิป" fill className="object-cover" />
                      </div>
                      <p className="text-xs text-[var(--accent-green)]">✅ อัปโหลดสำเร็จ — กดเพื่อเปลี่ยน</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📷</div>
                      <p className="text-sm text-[var(--text-secondary)]">กดเพื่อเลือกรูปสลิป</p>
                      <p className="text-[0.65rem] text-[var(--text-muted)]">รองรับ JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleConfirm}
                disabled={!slipBase64}
                className={`w-full relative overflow-hidden py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
                  !slipBase64
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : mode === "rent"
                    ? "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]"
                    : "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[-50%] rounded-full blur-md" />
                <span className="relative z-10 drop-shadow-md">
                  {mode === "rent" ? "ยืนยันการเช่า" : "ยืนยันการซื้อ"}
                </span>
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-16 h-16 border-4 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin" />
              <p className="text-gray-400">
                {mode === "rent" ? "กำลังล็อกเครื่องและสร้างรายการเช่า..." : "กำลังสร้างรายการสั่งซื้อ..."}
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-6 space-y-5 text-center">
              <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {isAutoVerified
                    ? mode === "rent" ? "รายการเช่าเปิดใช้งานแล้ว!" : "สั่งซื้อสินค้าเสร็จสมบูรณ์!"
                    : mode === "rent" ? "สร้างรายการเช่าสำเร็จ!" : "สร้างรายการสั่งซื้อสำเร็จ!"}
                </h3>
                <p className="text-sm text-gray-400 px-4">
                  {isAutoVerified
                    ? "ระบบตรวจสอบความถูกต้องของสลิปชำระเงินเรียบร้อยแล้ว ออเดอร์ของท่านได้รับการอนุมัติอัตโนมัติ"
                    : "กรุณารอการยืนยันจากผู้ดูแลระบบ เราจะแจ้งผลให้ทราบเร็วที่สุด"}
                </p>
              </div>
              <div className={`w-full p-4 rounded-2xl border ${
                isAutoVerified
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/20 text-[var(--accent-blue)]"
              }`}>
                <p className="text-sm font-bold">
                  {isAutoVerified
                    ? mode === "rent"
                      ? "📋 สถานะ: เปิดใช้งานอยู่ (Active) • ติดต่อรับสินค้าได้ทันที"
                      : "📋 สถานะ: ชำระเงินสำเร็จ (Completed)"
                    : "📋 สถานะ: รอผู้ดูแลระบบตรวจสอบสลิป"}
                </p>
              </div>
              <button onClick={handleClose} className="px-8 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-semibold">ปิด</button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center py-8 space-y-4 text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-400">{errorMessage}</h3>
              <button
                onClick={() => setStep("review")}
                className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
