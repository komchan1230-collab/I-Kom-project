"use client";

import { useState, useEffect } from "react";
import { confirmRentalPayment } from "@/app/actions/rental";

export default function CountdownTimer({ 
  expiresAt, 
  onExpire,
  rentalId
}: { 
  expiresAt: Date; 
  onExpire: () => void;
  rentalId: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentSuccess) return; // Stop timer if paid

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = new Date(expiresAt).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("00:00");
        onExpire();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [expiresAt, onExpire, paymentSuccess]);

  const handleUploadPayment = async () => {
    setIsUploading(true);
    setError(null);
    
    // Simulate a brief upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await confirmRentalPayment(rentalId);
    
    if (res.success) {
      setPaymentSuccess(true);
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน");
    }
    
    setIsUploading(false);
  };

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm mt-4">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-green-400 font-bold text-lg mb-1">ชำระเงินสำเร็จ!</p>
        <p className="text-green-300/80 text-sm text-center">คอมพิวเตอร์ของคุณพร้อมสำหรับการรับเครื่องแล้ว</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm mt-4">
      <p className="text-red-400 font-semibold mb-2 text-sm uppercase tracking-wider">
        รอการชำระเงิน
      </p>
      <div className="text-4xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
        {timeLeft}
      </div>
      <p className="text-gray-400 text-sm mt-3 text-center mb-2">
        กรุณาอัปโหลดสลิปชำระเงินก่อนหมดเวลา <br/>
        มิฉะนั้นการจองของคุณจะถูกยกเลิก
      </p>
      
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      
      <button 
        onClick={handleUploadPayment}
        disabled={isUploading}
        className={`mt-2 px-6 py-2 rounded-full font-medium transition-all ${
          isUploading 
            ? "bg-gray-600 text-gray-300 cursor-wait" 
            : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
        }`}
      >
        {isUploading ? "กำลังตรวจสอบ..." : "อัปโหลดสลิปชำระเงิน"}
      </button>
    </div>
  );
}
