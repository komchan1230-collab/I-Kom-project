"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { OrderItem } from "@/app/actions/orders";
import { formatPrice } from "@/app/components/ProductData";

type Filter = "all" | "rental" | "purchase";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: "รอดำเนินการ", color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30", icon: "⏳" },
  ACTIVE: { label: "กำลังเช่า", color: "text-green-400 bg-green-500/15 border-green-500/30", icon: "✅" },
  RETURNED: { label: "คืนแล้ว", color: "text-blue-400 bg-blue-500/15 border-blue-500/30", icon: "📦" },
  OVERDUE: { label: "เลยกำหนด", color: "text-red-400 bg-red-500/15 border-red-500/30", icon: "⚠️" },
  CANCELLED: { label: "ยกเลิก", color: "text-gray-400 bg-gray-500/15 border-gray-500/30", icon: "❌" },
  PENDING_PAYMENT: { label: "รอชำระเงิน", color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30", icon: "💳" },
  COMPLETED: { label: "สำเร็จ", color: "text-green-400 bg-green-500/15 border-green-500/30", icon: "✅" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, color: "text-gray-400 bg-gray-500/15 border-gray-500/30", icon: "❓" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

interface Props {
  session: { userId: string; name: string; email: string };
  orders: OrderItem[];
}

export default function ProfileClient({ session, orders }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [slipModal, setSlipModal] = useState<string | null>(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.type === filter);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {session.name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{session.name}</h1>
              <p className="text-sm text-[var(--text-muted)]">{session.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "ทั้งหมด", value: orders.length, gradient: "from-[var(--accent-blue)] to-[var(--accent-cyan)]" },
            { label: "เช่า", value: orders.filter((o) => o.type === "rental").length, gradient: "from-[var(--accent-cyan)] to-[var(--accent-green)]" },
            { label: "ซื้อ", value: orders.filter((o) => o.type === "purchase").length, gradient: "from-[var(--accent-purple)] to-[var(--accent-pink)]" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <div className={`text-2xl font-black bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center glass rounded-xl p-1 mb-6 self-start w-fit">
          {([
            { key: "all", label: "📋 ทั้งหมด" },
            { key: "rental", label: "🔄 เช่า" },
            { key: "purchase", label: "💰 ซื้อ" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-lg"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="relative w-full sm:w-32 h-32 sm:h-auto bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] flex items-center justify-center flex-shrink-0">
                    <Image src={order.productImage} alt={order.productName} width={80} height={80} className="object-contain" />
                    <div className="absolute top-2 left-2">
                      <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold ${order.type === "rental" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"}`}>
                        {order.type === "rental" ? "เช่า" : "ซื้อ"}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">{order.productName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <StatusBadge status={order.status} />
                        {order.startDate && (
                          <span className="text-[0.65rem] text-[var(--text-muted)]">
                            {new Date(order.startDate).toLocaleDateString("th-TH")} — {new Date(order.endDate!).toLocaleDateString("th-TH")}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.65rem] text-[var(--text-muted)] mt-1">
                        สั่งเมื่อ {new Date(order.createdAt).toLocaleString("th-TH")}
                      </p>
                    </div>

                    {/* Price & Slip */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <div className={`text-lg font-black ${order.type === "rental" ? "text-gradient-cyan" : "text-gradient"}`}>
                        ฿{formatPrice(order.price)}
                      </div>
                      {order.paymentSlipUrl && (
                        <button
                          onClick={() => setSlipModal(order.paymentSlipUrl)}
                          className="text-[0.7rem] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[var(--accent-blue)] hover:bg-white/10 transition-colors font-semibold"
                        >
                          🧾 ดูสลิป
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">ยังไม่มีรายการ</h3>
            <p className="text-[var(--text-secondary)] mb-6">เริ่มต้นเช่าหรือซื้อคอมพิวเตอร์ได้เลย</p>
            <Link href="/products" className="btn-primary">🛒 ไปหน้าสินค้า</Link>
          </div>
        )}
      </div>

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
    </div>
  );
}
