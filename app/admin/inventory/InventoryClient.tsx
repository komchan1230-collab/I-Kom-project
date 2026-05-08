"use client";

import React, { useState } from "react";
import Image from "next/image";
import { addEquipmentStock, removeEquipmentStock, updateProduct, type InventoryProduct } from "@/app/actions/inventory";

// ==========================================
// Sub-Components for Inline Editing (Dark Theme)
// ==========================================

function EditableCell({ 
  value, 
  onSave, 
  type = "text",
  className = "" 
}: { 
  value: string; 
  onSave: (val: string) => Promise<any>; 
  type?: "text" | "number";
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (current === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    await onSave(current);
    setLoading(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-[120px]">
        <input
          autoFocus
          type={type}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          onBlur={handleSave}
          disabled={loading}
          className={`bg-[var(--bg-card-hover)] border border-[var(--accent-blue)] rounded-lg px-2 py-1 text-sm outline-none w-full text-white ${className}`}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-white/5 hover:text-[var(--accent-cyan)] px-2 py-1 rounded-lg transition-colors truncate ${className}`}
      title="คลิกเพื่อแก้ไข"
    >
      {type === "number" ? Number(value).toLocaleString() : value}
    </div>
  );
}

function SpecsEditor({ specs, onSave }: { specs: any; onSave: (specs: any) => Promise<any> }) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(JSON.stringify(specs, null, 2));

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(current);
      await onSave(parsed);
      setEditing(false);
    } catch (e) {
      alert("JSON ไม่ถูกต้อง");
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-2 w-full min-w-[200px]">
        <textarea
          autoFocus
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="bg-[var(--bg-card-hover)] border border-[var(--accent-blue)] rounded-xl p-3 text-[10px] font-mono outline-none h-40 text-white shadow-inner"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-1.5 bg-[var(--accent-blue)] text-white text-[10px] rounded-lg font-bold hover:opacity-90 transition-all">บันทึก</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-white/10 text-[var(--text-secondary)] text-[10px] rounded-lg font-bold hover:bg-white/20 transition-all">ยกเลิก</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-white/5 p-3 rounded-xl group transition-all border border-transparent hover:border-white/5"
    >
      <div className="grid grid-cols-1 gap-1">
        {Object.entries(specs || {}).map(([k, v]: any) => (
          <div key={k} className="text-[10px] text-[var(--text-secondary)] flex gap-2 items-center">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-tighter shrink-0">{k}:</span>
            <span className="truncate text-white">{String(v)}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-[var(--accent-blue)] mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity text-center">คลิกเพื่อแก้ไขสเปค</div>
    </div>
  );
}

// ==========================================
// Main Component
// ==========================================

export default function InventoryClient({ initialProducts }: { initialProducts: InventoryProduct[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [serialNumbers, setSerialNumbers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const handleUpdateName = async (id: string, name: string) => {
    const res = await updateProduct(id, { name });
    if (!res.success) alert(res.error);
  };

  const handleUpdateRentPrice = async (id: string, price: string) => {
    const res = await updateProduct(id, { monthlyPrice: Number(price) });
    if (!res.success) alert(res.error);
  };

  const handleUpdateBuyPrice = async (id: string, price: string) => {
    const res = await updateProduct(id, { buyPrice: Number(price) });
    if (!res.success) alert(res.error);
  };

  const handleUpdateSpecs = async (id: string, specs: any) => {
    const res = await updateProduct(id, { specs });
    if (!res.success) alert(res.error);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    const sns = serialNumbers.split("\n").map(s => s.trim()).filter(s => s !== "");
    
    const result = await addEquipmentStock(selectedProduct.id, sns);
    if (result.success) {
      alert(`เพิ่มสต็อกสำเร็จ: ${result.count} รายการ`);
      window.location.reload();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleRemoveStock = async (equipmentId: string) => {
    if (!confirm("คุณต้องการลบอุปกรณ์นี้ใช่หรือไม่? (ลบได้เฉพาะสถานะ AVAILABLE)")) return;

    const result = await removeEquipmentStock(equipmentId);
    if (result.success) {
      alert("ลบสต็อกสำเร็จ");
      window.location.reload();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[var(--text-muted)] text-[10px] uppercase tracking-[0.2em] bg-white/[0.02]">
                <th className="px-6 py-5 text-left font-black">สินค้า</th>
                <th className="px-6 py-5 text-left font-black">ราคา (เช่า/ซื้อ)</th>
                <th className="px-6 py-5 text-left font-black hidden md:table-cell">รายละเอียดสเปค</th>
                <th className="px-6 py-5 text-center font-black">สถานะคลัง</th>
                <th className="px-6 py-5 text-right font-black">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initialProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center min-w-[220px]">
                        <div className="h-12 w-12 flex-shrink-0 relative rounded-2xl border border-white/5 overflow-hidden mr-4 glass-light p-1">
                          <Image src={product.imageUrl || "/laptop.png"} alt={product.name} fill className="object-contain p-1" />
                        </div>
                        <EditableCell 
                          value={product.name} 
                          onSave={(v) => handleUpdateName(product.id, v)}
                          className="font-black text-white text-lg tracking-tight"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-tighter w-8">เช่า</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[var(--accent-blue)] text-xs font-bold">฿</span>
                            <EditableCell 
                              value={String(product.monthlyPrice)} 
                              onSave={(v) => handleUpdateRentPrice(product.id, v)}
                              type="number"
                              className="text-[var(--accent-blue)] font-black text-base"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-tighter w-8">ซื้อ</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[var(--text-secondary)] text-xs font-bold">฿</span>
                            <EditableCell 
                              value={String(product.buyPrice)} 
                              onSave={(v) => handleUpdateBuyPrice(product.id, v)}
                              type="number"
                              className="text-[var(--text-primary)] font-black text-base"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 hidden md:table-cell">
                      <SpecsEditor 
                        specs={product.specs} 
                        onSave={(s) => handleUpdateSpecs(product.id, s)} 
                      />
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="text-2xl font-black text-[var(--accent-cyan)]">{product.counts.AVAILABLE}</span>
                          <span className="text-[var(--text-muted)] font-bold">/</span>
                          <span className="text-sm text-[var(--text-secondary)] font-bold">{product.equipment.length}</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {Object.entries(product.counts).map(([status, count]) => (
                            count > 0 && (
                              <span key={status} className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${
                                status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                status === 'RENTED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                                status === 'SOLD' ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-red-500/20 text-red-400 border-red-500/20'
                              }`}>
                                {status === 'AVAILABLE' ? 'ว่าง' : status === 'RENTED' ? 'เช่าอยู่' : status === 'SOLD' ? 'ขายแล้ว' : 'ซ่อม'}:{count}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-white transition-all text-xs font-black border border-[var(--accent-blue)]/20 shadow-lg shadow-blue-500/5 uppercase tracking-widest"
                      >
                        + สต็อก
                      </button>
                      <button 
                        onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                        className="text-[var(--text-muted)] hover:text-white p-2 transition-colors rounded-xl hover:bg-white/5"
                      >
                        <svg className={`h-6 w-6 transform transition-transform ${expandedProductId === product.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr className="bg-white/[0.015]">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-white/10"></span>
                            รายการอุปกรณ์รายชิ้น ({product.equipment.length} เครื่อง)
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {product.equipment.map((item: any) => (
                            <div key={item.id} className="glass-light p-4 rounded-2xl border border-white/5 text-xs card-hover group relative">
                              <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-0.5 rounded-lg font-black text-[8px] uppercase tracking-widest border ${
                                  item.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                                  item.status === 'RENTED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-white/5 text-gray-500 border-white/5'
                                }`}>
                                  {item.status === 'AVAILABLE' ? 'พร้อมเช่า' : item.status === 'RENTED' ? 'เช่าอยู่' : item.status}
                                </span>
                                {item.status === 'AVAILABLE' && (
                                  <button 
                                    onClick={() => handleRemoveStock(item.id)}
                                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-500/20 rounded-lg"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="font-mono text-white font-black truncate text-sm mb-1" title={item.serialNumber}>
                                {item.serialNumber}
                              </div>
                              {item.conditionNote && (
                                <div className="text-[9px] text-[var(--text-muted)] italic truncate border-t border-white/5 pt-2 mt-2 font-medium">{item.conditionNote}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[var(--bg-primary)] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">เพิ่มอุปกรณ์ใหม่</h3>
                <p className="text-[var(--text-muted)] text-xs mt-1 font-medium">สินค้า: {selectedProduct?.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 text-gray-400 hover:text-white transition-all hover:bg-white/10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStock} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase mb-3 tracking-[0.2em]">
                  Serial Numbers (1 รายการต่อบรรทัด)
                </label>
                <textarea
                  required
                  rows={8}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-[var(--accent-blue)] font-mono text-sm outline-none text-white transition-all placeholder:text-gray-700 shadow-inner"
                  placeholder="SN-GAME-001&#10;SN-GAME-002"
                  value={serialNumbers}
                  onChange={(e) => setSerialNumbers(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-white/5 text-[var(--text-secondary)] rounded-2xl hover:bg-white/10 font-bold transition-all border border-white/5 uppercase text-xs tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-[var(--gradient-primary)] text-white rounded-2xl hover:opacity-90 font-black transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 uppercase text-xs tracking-widest"
                >
                  {isSubmitting ? "กำลังรัน..." : "บันทึกสต็อก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
