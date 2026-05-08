"use client";

import React, { useState } from "react";
import Image from "next/image";
import { addEquipmentStock, removeEquipmentStock, updateProduct, type InventoryProduct } from "@/app/actions/inventory";

// ==========================================
// Sub-Components for Inline Editing
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
          className={`bg-white border border-indigo-500 rounded px-2 py-1 text-sm outline-none w-full ${className}`}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => setEditing(true)}
      className={`cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 rounded transition-colors truncate ${className}`}
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
      <div className="flex flex-col gap-1 w-full min-w-[200px]">
        <textarea
          autoFocus
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="bg-white border border-indigo-500 rounded p-2 text-[10px] font-mono outline-none h-32"
        />
        <div className="flex gap-1">
          <button onClick={handleSave} className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded">บันทึก</button>
          <button onClick={() => setEditing(false)} className="bg-gray-200 text-gray-700 text-[10px] px-2 py-1 rounded">ยกเลิก</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:bg-indigo-50 p-2 rounded group"
    >
      <div className="grid grid-cols-1 gap-0.5">
        {Object.entries(specs || {}).map(([k, v]: any) => (
          <div key={k} className="text-[10px] text-gray-500 flex gap-1">
            <span className="font-bold shrink-0">{k}:</span>
            <span className="truncate">{String(v)}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-indigo-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อแก้ไขสเปค</div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา (เช่า/ซื้อ)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">สเปค (JSON)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะสต็อก</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {initialProducts.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center min-w-[200px]">
                        <div className="h-10 w-10 flex-shrink-0 relative rounded border border-gray-100 overflow-hidden mr-3">
                          <Image src={product.imageUrl || "/laptop.png"} alt={product.name} fill className="object-cover" />
                        </div>
                        <EditableCell 
                          value={product.name} 
                          onSave={(v) => handleUpdateName(product.id, v)}
                          className="font-bold text-gray-900"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase w-8">เช่า:</span>
                          <EditableCell 
                            value={String(product.monthlyPrice)} 
                            onSave={(v) => handleUpdateRentPrice(product.id, v)}
                            type="number"
                            className="text-indigo-600 font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase w-8">ซื้อ:</span>
                          <EditableCell 
                            value={String(product.buyPrice)} 
                            onSave={(v) => handleUpdateBuyPrice(product.id, v)}
                            type="number"
                            className="text-gray-700 font-bold"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <SpecsEditor 
                        specs={product.specs} 
                        onSave={(s) => handleUpdateSpecs(product.id, s)} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-lg font-black text-indigo-600">{product.counts.AVAILABLE}</span>
                          <span className="text-gray-300">/</span>
                          <span className="text-sm text-gray-400">{product.equipment.length}</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1">
                          {Object.entries(product.counts).map(([status, count]) => (
                            count > 0 && (
                              <span key={status} className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${
                                status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                status === 'RENTED' ? 'bg-indigo-100 text-indigo-700' :
                                status === 'SOLD' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'
                              }`}>
                                {status.charAt(0)}:{count}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                      >
                        + สต็อก
                      </button>
                      <button 
                        onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <svg className={`h-5 w-5 transform transition-transform ${expandedProductId === product.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">รายการอุปกรณ์ทั้งหมด ({product.equipment.length})</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {product.equipment.map((item: any) => (
                            <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 text-xs shadow-sm hover:border-indigo-300 transition-colors group">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${
                                  item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                                  item.status === 'RENTED' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {item.status}
                                </span>
                                {item.status === 'AVAILABLE' && (
                                  <button 
                                    onClick={() => handleRemoveStock(item.id)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="font-mono text-gray-600 font-bold truncate" title={item.serialNumber}>
                                {item.serialNumber}
                              </div>
                              {item.conditionNote && (
                                <div className="mt-1 text-[9px] text-gray-400 italic truncate">{item.conditionNote}</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">เพิ่มสต็อก: {selectedProduct?.name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
                  Serial Numbers (1 รายการต่อบรรทัด)
                </label>
                <textarea
                  required
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm outline-none bg-gray-50"
                  placeholder="SN-GAME-001&#10;SN-GAME-002"
                  value={serialNumbers}
                  onChange={(e) => setSerialNumbers(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการเพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
