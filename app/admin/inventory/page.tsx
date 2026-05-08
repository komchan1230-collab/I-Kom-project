import { getInventory } from "@/app/actions/inventory";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import InventoryClient from "./InventoryClient";

export default async function InventoryPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const inventory = await getInventory();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการสต็อกและอุปกรณ์</h1>
            <p className="text-gray-500 mt-1">ตรวจสอบจำนวนสินค้าและจัดการอุปกรณ์รายชิ้น</p>
          </div>
          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
            <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-indigo-700 font-medium text-sm">กำลังออนไลน์ในโหมดผู้ดูแลระบบ</span>
          </div>
        </div>

        <InventoryClient initialProducts={inventory} />
      </div>
    </div>
  );
}
