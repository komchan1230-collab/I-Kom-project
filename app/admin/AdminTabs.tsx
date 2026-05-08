"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/app/components/ProductData";
import InventoryClient from "./inventory/InventoryClient";
import type { InventoryProduct } from "@/app/actions/inventory";
import React from "react";

type RentalRow = {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  serialNumber: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  paymentSlipUrl: string | null;
  status: string;
};

type ActiveRentalRow = {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  serialNumber: string;
  startDate: string;
  endDate: string;
  status: string;
};

type PurchaseRow = {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  serialNumber: string;
  totalPrice: number;
  paymentSlipUrl: string | null;
  status: string;
  createdAt: string;
};

interface Props {
  pendingRentals: RentalRow[];
  pendingPurchases: PurchaseRow[];
  activeRentals: ActiveRentalRow[];
  inventoryProducts: InventoryProduct[];
  approveRental: (id: string) => Promise<{ success: boolean }>;
  rejectRental: (id: string) => Promise<{ success: boolean }>;
  approvePurchase: (id: string) => Promise<{ success: boolean }>;
  rejectPurchase: (id: string) => Promise<{ success: boolean }>;
  processRentalReturn: (rentalId: string, equipmentStatus: any, note?: string) => Promise<{ success: boolean }>;
}

/** Wraps a server action so its return value is discarded — required by form `action` prop type */
function asFormAction(fn: () => Promise<unknown>): () => Promise<void> {
  return async () => { await fn(); };
}

export default function AdminTabs({
  pendingRentals, pendingPurchases, activeRentals, inventoryProducts,
  approveRental, rejectRental,
  approvePurchase, rejectPurchase,
  processRentalReturn
}: Props) {
  const [tab, setTab] = useState<"rentals" | "purchases" | "active" | "inventory">("rentals");
  const [slipModal, setSlipModal] = useState<string | null>(null);
  const [returnModal, setReturnModal] = useState<ActiveRentalRow | null>(null);

  const EmptyState = ({ text }: { text: string }) => (
    <div className="glass rounded-3xl p-16 text-center border-white/5 animate-fade-in shadow-2xl">
      <div className="mx-auto h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-white mb-2 tracking-tight">ไม่พบรายการ</h3>
      <p className="text-[var(--text-secondary)] font-medium max-w-xs mx-auto leading-relaxed">{text}</p>
    </div>
  );

  return (
    <>
      {/* Tabs Control */}
      <div className="flex flex-wrap items-center glass rounded-2xl p-1.5 mb-8 w-fit gap-1 border-white/5 shadow-2xl">
        <button
          onClick={() => setTab("rentals")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest ${
            tab === "rentals"
              ? "bg-[var(--gradient-primary)] text-white shadow-lg shadow-blue-500/20"
              : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          }`}
        >
          📋 รายการเช่า
          {pendingRentals.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-lg font-black">
              {pendingRentals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("active")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest ${
            tab === "active"
              ? "bg-[var(--gradient-secondary)] text-white shadow-lg shadow-cyan-500/20"
              : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          }`}
        >
          🟢 กำลังเช่า
          {activeRentals.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-lg font-black">
              {activeRentals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("purchases")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest ${
            tab === "purchases"
              ? "bg-[var(--gradient-accent)] text-white shadow-lg shadow-purple-500/20"
              : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          }`}
        >
          💰 รายการซื้อ
          {pendingPurchases.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-lg font-black">
              {pendingPurchases.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("inventory")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest ${
            tab === "inventory"
              ? "bg-white/10 text-white border border-white/10"
              : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          }`}
        >
          📦 จัดการสต็อก
        </button>
      </div>

      {/* Rentals Tab */}
      {tab === "rentals" && (
        pendingRentals.length === 0 ? (
          <EmptyState text="ไม่มีรายการเช่าที่รอการอนุมัติในระบบขณะนี้" />
        ) : (
          <div className="grid gap-4">
            {pendingRentals.map((r) => (
              <div key={r.id} className="glass rounded-3xl overflow-hidden card-hover border-white/5 animate-fade-in-up shadow-xl">
                <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black uppercase tracking-widest">คำขอเช่าอุปกรณ์</span>
                      <span className="text-[10px] px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-black uppercase tracking-widest italic">⏳ {r.status}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-1">{r.productName}</h3>
                      <div className="text-xs text-[var(--text-muted)] font-mono font-bold tracking-widest">SERIAL: {r.serialNumber}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">ข้อมูลลูกค้า</p>
                        <p className="text-sm font-bold text-white">👤 {r.userName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{r.userEmail}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">ระยะเวลาการเช่า</p>
                        <p className="text-sm font-bold text-[var(--accent-blue)]">📅 {new Date(r.startDate).toLocaleDateString("th-TH")}</p>
                        <p className="text-xs text-[var(--text-secondary)]">ถึงวันที่ {new Date(r.endDate).toLocaleDateString("th-TH")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">เงินมัดจำ</div>
                      <div className="text-3xl font-black text-white leading-none">
                        <span className="text-sm font-bold mr-1 text-[var(--text-secondary)]">฿</span>
                        {formatPrice(r.depositAmount)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.paymentSlipUrl && (
                        <button onClick={() => setSlipModal(r.paymentSlipUrl)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all group" title="ดูสลิป">
                          <svg className="h-6 w-6 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                      )}
                      <form action={asFormAction(approveRental.bind(null, r.id))}>
                        <button type="submit" className="h-12 px-6 rounded-2xl bg-[var(--accent-green)] text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-green-500/10">อนุมัติ</button>
                      </form>
                      <form action={asFormAction(rejectRental.bind(null, r.id))}>
                        <button type="submit" className="h-12 px-6 rounded-2xl bg-white/5 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all">ปฏิเสธ</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Active Rentals Tab */}
      {tab === "active" && (
        activeRentals.length === 0 ? (
          <EmptyState text="ไม่มีอุปกรณ์ที่กำลังถูกเช่าอยู่ในขณะนี้" />
        ) : (
          <div className="grid gap-4">
            {activeRentals.map((r) => {
              const isOverdue = new Date(r.endDate) < new Date();
              return (
                <div key={r.id} className={`glass rounded-3xl overflow-hidden card-hover border-white/5 animate-fade-in-up shadow-xl relative ${isOverdue ? 'ring-2 ring-red-500/20' : ''}`}>
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isOverdue ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-[var(--accent-green)] shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} />
                  <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6">
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${isOverdue ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}>
                          {isOverdue ? "⚠️ เลยกำหนดคืน" : "🟢 กำลังเช่า"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold tracking-widest uppercase">Serial: {r.serialNumber}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{r.productName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">ผู้เช่าปัจจุบัน</p>
                          <p className="text-sm font-bold text-white">👤 {r.userName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">กำหนดคืน</p>
                          <p className={`text-sm font-bold ${isOverdue ? 'text-red-400' : 'text-[var(--accent-cyan)]'}`}>📅 {new Date(r.endDate).toLocaleDateString("th-TH")}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                      <button 
                        onClick={() => setReturnModal(r)}
                        className="w-full md:w-auto h-14 px-8 rounded-2xl bg-white/5 text-white hover:bg-[var(--gradient-secondary)] hover:text-black hover:border-transparent transition-all text-xs font-black uppercase tracking-[0.2em] border border-white/10"
                      >
                        📥 รับคืนเครื่อง
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Purchases Tab */}
      {tab === "purchases" && (
        pendingPurchases.length === 0 ? (
          <EmptyState text="ไม่มีรายการสั่งซื้อที่รอการอนุมัติในระบบขณะนี้" />
        ) : (
          <div className="grid gap-4">
            {pendingPurchases.map((p) => (
              <div key={p.id} className="glass rounded-3xl overflow-hidden card-hover border-white/5 animate-fade-in-up shadow-xl">
                <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black uppercase tracking-widest">รายการสั่งซื้อสินค้า</span>
                      <span className="text-[10px] px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-black uppercase tracking-widest italic">💳 {p.status}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-1">{p.productName}</h3>
                      <div className="text-xs text-[var(--text-muted)] font-mono font-bold tracking-widest">SERIAL: {p.serialNumber}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">ข้อมูลลูกค้า</p>
                        <p className="text-sm font-bold text-white">👤 {p.userName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{p.userEmail}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">วันที่ทำรายการ</p>
                        <p className="text-sm font-bold text-white">🕐 {new Date(p.createdAt).toLocaleString("th-TH")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">ยอดรวมสุทธิ</div>
                      <div className="text-3xl font-black text-white leading-none">
                        <span className="text-sm font-bold mr-1 text-[var(--text-secondary)]">฿</span>
                        {formatPrice(p.totalPrice)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.paymentSlipUrl && (
                        <button onClick={() => setSlipModal(p.paymentSlipUrl)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all group" title="ดูสลิป">
                          <svg className="h-6 w-6 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                      )}
                      <form action={asFormAction(approvePurchase.bind(null, p.id))}>
                        <button type="submit" className="h-12 px-6 rounded-2xl bg-[var(--accent-purple)] text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-purple-500/10">สมบูรณ์</button>
                      </form>
                      <form action={asFormAction(rejectPurchase.bind(null, p.id))}>
                        <button type="submit" className="h-12 px-6 rounded-2xl bg-white/5 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all">ยกเลิก</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Inventory Tab */}
      {tab === "inventory" && (
        <InventoryClient initialProducts={inventoryProducts} />
      )}

      {/* Return Confirmation Modal */}
      {returnModal && (
        <ReturnModal 
          rental={returnModal} 
          onClose={() => setReturnModal(null)} 
          onConfirm={processRentalReturn}
        />
      )}

      {/* Slip Modal */}
      {slipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSlipModal(null)} />
          <div className="relative bg-[var(--bg-card)] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl max-w-sm w-full animate-in">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="font-black text-white text-lg uppercase tracking-widest">หลักฐานการชำระเงิน</h3>
              <button onClick={() => setSlipModal(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-white">
                <Image src={slipModal} alt="Payment Slip" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReturnModal({ 
  rental, 
  onClose, 
  onConfirm 
}: { 
  rental: ActiveRentalRow, 
  onClose: () => void,
  onConfirm: (id: string, status: any, note?: string) => Promise<{success: boolean}>
}) {
  const [status, setStatus] = useState<string>("AVAILABLE");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await onConfirm(rental.id, status as any, note);
    if (res.success) {
      onClose();
      window.location.reload();
    } else {
      alert("เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[var(--bg-primary)] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl max-w-md w-full animate-in">
        <div className="p-8">
          <h3 className="text-3xl font-black text-white mb-2 tracking-tight">ดำเนินการคืนเครื่อง</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
            รับคืนเครื่อง <span className="text-[var(--accent-cyan)] font-mono font-black">{rental.serialNumber}</span> จากคุณ {rental.userName}
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase mb-3 tracking-widest">สถานะอุปกรณ์หลังรับคืน</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setStatus("AVAILABLE")}
                  className={`px-4 py-4 rounded-2xl text-xs font-black border transition-all uppercase tracking-widest ${status === "AVAILABLE" ? "bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/10" : "bg-white/5 border-white/5 text-[var(--text-muted)] hover:bg-white/10"}`}
                >
                  🟢 พร้อมเช่า
                </button>
                <button 
                  onClick={() => setStatus("MAINTENANCE")}
                  className={`px-4 py-4 rounded-2xl text-xs font-black border transition-all uppercase tracking-widest ${status === "MAINTENANCE" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-500/10" : "bg-white/5 border-white/5 text-[var(--text-muted)] hover:bg-white/10"}`}
                >
                  ⚙️ ส่งซ่อม
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase mb-3 tracking-widest">หมายเหตุสภาพเครื่อง</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-[var(--accent-blue)] h-32 transition-all placeholder:text-gray-700 font-medium"
                placeholder="ระบุสภาพเครื่อง เช่น มีรอยขีดข่วน หรือ ปัญหาทางเทคนิค..."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-[var(--text-secondary)] font-bold hover:bg-white/10 transition-all border border-white/5 uppercase text-xs tracking-widest">ยกเลิก</button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl bg-[var(--gradient-primary)] text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-500/20"
            >
              {loading ? "กำลังรัน..." : "ยืนยันการรับคืน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
