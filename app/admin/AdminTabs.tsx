"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/app/components/ProductData";
import InventoryClient from "./inventory/InventoryClient";
import type { InventoryProduct } from "@/app/actions/inventory";

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
    <div className="glass rounded-2xl p-12 text-center neon-border">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[var(--accent-blue)]/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">ไม่พบรายการ</h3>
      <p className="text-[var(--text-secondary)]">{text}</p>
    </div>
  );

  return (
    <>
      {/* Tabs */}
      <div className="flex flex-wrap items-center glass rounded-xl p-1 mb-6 w-fit gap-1">
        <button
          onClick={() => setTab("rentals")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            tab === "rentals"
              ? "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          📋 เช่า (รออนุมัติ)
          {pendingRentals.length > 0 && (
            <span className="bg-white/20 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold">
              {pendingRentals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("active")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            tab === "active"
              ? "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-green)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          🟢 กำลังเช่า
          {activeRentals.length > 0 && (
            <span className="bg-white/20 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold">
              {activeRentals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("purchases")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            tab === "purchases"
              ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          💰 ซื้อ (รออนุมัติ)
          {pendingPurchases.length > 0 && (
            <span className="bg-white/20 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold">
              {pendingPurchases.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("inventory")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            tab === "inventory"
              ? "bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          📦 สต็อก
        </button>
      </div>

      {/* Rentals Tab */}
      {tab === "rentals" && (
        pendingRentals.length === 0 ? (
          <EmptyState text="ไม่มีรายการเช่าที่รอการอนุมัติ" />
        ) : (
          <div className="space-y-3">
            {pendingRentals.map((r) => (
              <div key={r.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">เช่า</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold">⏳ {r.status}</span>
                    </div>
                    <h3 className="font-bold text-white">{r.productName}</h3>
                    <div className="text-xs text-[var(--text-muted)] font-mono">SN: {r.serialNumber}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                      <span>👤 {r.userName} ({r.userEmail})</span>
                      <span>📅 {new Date(r.startDate).toLocaleDateString("th-TH")} — {new Date(r.endDate).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
                    <div className="text-right">
                      <div className="text-xs text-[var(--text-muted)]">มัดจำ</div>
                      <div className="text-xl font-black text-gradient-cyan">฿{formatPrice(r.depositAmount)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.paymentSlipUrl && (
                        <button onClick={() => setSlipModal(r.paymentSlipUrl)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors text-xs font-bold">
                          🧾 สลิป
                        </button>
                      )}
                      <form action={asFormAction(approveRental.bind(null, r.id))}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-colors text-xs font-bold">
                          ✅ อนุมัติ
                        </button>
                      </form>
                      <form action={asFormAction(rejectRental.bind(null, r.id))}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors text-xs font-bold">
                          ❌ ยกเลิก
                        </button>
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
          <div className="space-y-3">
            {activeRentals.map((r) => {
              const isOverdue = new Date(r.endDate) < new Date();
              return (
                <div key={r.id} className="glass rounded-2xl overflow-hidden card-hover border-l-4 border-l-green-500">
                  <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isOverdue ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30"}`}>
                          {isOverdue ? "⚠️ เลยกำหนด" : "🟢 กำลังเช่า"}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">SN: {r.serialNumber}</span>
                      </div>
                      <h3 className="font-bold text-white">{r.productName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                        <span>👤 {r.userName}</span>
                        <span>📅 คืนวันที่: {new Date(r.endDate).toLocaleDateString("th-TH")}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => setReturnModal(r)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-[var(--accent-cyan)] hover:text-black transition-all text-sm font-bold border border-white/10"
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
          <EmptyState text="ไม่มีรายการสั่งซื้อที่รอการอนุมัติ" />
        ) : (
          <div className="space-y-3">
            {pendingPurchases.map((p) => (
              <div key={p.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold">ซื้อ</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold">💳 {p.status}</span>
                    </div>
                    <h3 className="font-bold text-white">{p.productName}</h3>
                    <div className="text-xs text-[var(--text-muted)] font-mono">SN: {p.serialNumber}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                      <span>👤 {p.userName} ({p.userEmail})</span>
                      <span>🕐 {new Date(p.createdAt).toLocaleString("th-TH")}</span>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
                    <div className="text-right">
                      <div className="text-xs text-[var(--text-muted)]">ราคาซื้อ</div>
                      <div className="text-xl font-black text-gradient">฿{formatPrice(p.totalPrice)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.paymentSlipUrl && (
                        <button onClick={() => setSlipModal(p.paymentSlipUrl)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors text-xs font-bold">
                          🧾 สลิป
                        </button>
                      )}
                      <form action={asFormAction(approvePurchase.bind(null, p.id))}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-colors text-xs font-bold">
                          ✅ อนุมัติ
                        </button>
                      </form>
                      <form action={asFormAction(rejectPurchase.bind(null, p.id))}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors text-xs font-bold">
                          ❌ ยกเลิก
                        </button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSlipModal(null)} />
          <div className="relative bg-[#0a0a0f] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full mx-4 animate-in">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-bold text-white">🧾 สลิปการชำระเงิน</h3>
              <button onClick={() => setSlipModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-4">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                <Image src={slipModal} alt="Payment Slip" fill className="object-contain bg-white" />
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
    } else {
      alert("เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0f] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl max-w-md w-full mx-4 animate-in">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">รับคืนอุปกรณ์</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            รับคืนเครื่อง <span className="text-white font-mono">{rental.serialNumber}</span> จากคุณ {rental.userName}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">สถานะอุปกรณ์หลังรับคืน</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setStatus("AVAILABLE")}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${status === "AVAILABLE" ? "bg-green-500/20 border-green-500 text-green-400" : "bg-white/5 border-white/10 text-[var(--text-secondary)]"}`}
                >
                  🟢 พร้อมใช้งาน
                </button>
                <button 
                  onClick={() => setStatus("MAINTENANCE")}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${status === "MAINTENANCE" ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "bg-white/5 border-white/10 text-[var(--text-secondary)]"}`}
                >
                  ⚙️ ส่งซ่อม/เช็คสภาพ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">หมายเหตุสภาพเครื่อง</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--accent-cyan)] h-24"
                placeholder="เช่น เครื่องมีรอยขีดข่วนเล็กน้อย, ลง Windows ใหม่เรียบร้อย"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">ยกเลิก</button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white font-bold hover:opacity-90 transition-all"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการรับคืน"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
