"use client";

import { useState } from "react";
import Image from "next/image";
import { addEquipmentStock, removeEquipmentStock } from "@/app/actions/inventory";

type ProductWithInventory = {
  id: string;
  name: string;
  imageUrl: string | null;
  counts: {
    AVAILABLE: number;
    RESERVED: number;
    RENTED: number;
    SOLD: number;
    MAINTENANCE: number;
  };
  equipment: any[];
};

export default function InventoryClient({ initialProducts }: { initialProducts: ProductWithInventory[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | null>(null);
  const [serialNumbers, setSerialNumbers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    const sns = serialNumbers.split("\n").map(s => s.trim()).filter(s => s !== "");
    
    const result = await addEquipmentStock(selectedProduct.id, sns);
    if (result.success) {
      alert(`เพิ่มสต็อกสำเร็จ: ${result.count} รายการ`);
      window.location.reload(); // Quick way to refresh server component data
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">พร้อมเช่า</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จองแล้ว</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">เช่าอยู่</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ขายแล้ว</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ซ่อมบำรุง</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 relative rounded border border-gray-100 overflow-hidden mr-3">
                          <Image src={product.imageUrl || "/laptop.png"} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">{product.counts.AVAILABLE}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">{product.counts.RESERVED}</td>
                    <td className="px-6 py-4 text-center text-indigo-600 font-medium">{product.counts.RENTED}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{product.counts.SOLD}</td>
                    <td className="px-6 py-4 text-center text-red-500">{product.counts.MAINTENANCE}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        เพิ่มสต็อก
                      </button>
                      <button 
                        onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        {expandedProductId === product.id ? "ย่อ" : "รายละเอียด"}
                      </button>
                    </td>
                  </tr>
                  {expandedProductId === product.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {product.equipment.map((item: any) => (
                            <div key={item.id} className="bg-white p-3 rounded border border-gray-200 text-xs shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                  item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                                  item.status === 'RENTED' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {item.status}
                                </span>
                                {item.status === 'AVAILABLE' && (
                                  <button 
                                    onClick={() => handleRemoveStock(item.id)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="font-mono text-gray-600 truncate" title={item.serialNumber}>
                                {item.serialNumber}
                              </div>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">เพิ่มสต็อก: {selectedProduct?.name}</h3>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Numbers (1 รายการต่อบรรทัด)
                </label>
                <textarea
                  required
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder="SN0001&#10;SN0002&#10;SN0003"
                  value={serialNumbers}
                  onChange={(e) => setSerialNumbers(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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

// Add React to the file scope since we're using React.Fragment
import React from "react";
