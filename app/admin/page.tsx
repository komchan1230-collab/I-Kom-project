import {
  getPendingRentals, approveRental, rejectRental,
  getPendingPurchases, approvePurchase, rejectPurchase,
  getActiveRentals, processRentalReturn,
  getCompletedPurchasesCount
} from "@/app/actions/admin";
import { getInventory } from "@/app/actions/inventory";
import { formatPrice } from "@/app/components/ProductData";
import Link from "next/link";
import AdminTabs from "./AdminTabs";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard | I-Kom",
};

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    pendingRentals, 
    pendingPurchases, 
    inventoryProducts, 
    activeRentals,
    completedPurchasesCount
  ] = await Promise.all([
    getPendingRentals(),
    getPendingPurchases(),
    getInventory(),
    getActiveRentals(),
    getCompletedPurchasesCount(),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--accent-cyan)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent-blue)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Admin <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          จัดการรายการเช่า สั่งซื้อ และสต็อกสินค้า
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-gradient-cyan">{pendingRentals.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">เช่า (รออนุมัติ)</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-gradient-green">{activeRentals.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">กำลังเช่าอยู่</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-gradient-purple">{pendingPurchases.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">ซื้อ (รออนุมัติ)</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{completedPurchasesCount}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">ขายได้แล้ว (เครื่อง)</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-[var(--accent-cyan)]">{inventoryProducts.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">รายการสินค้า</div>
          </div>
        </div>

        <AdminTabs
          pendingRentals={pendingRentals.map(r => ({
            id: r.id,
            userName: r.user.name || "ไม่ระบุชื่อ",
            userEmail: r.user.email,
            productName: r.equipment.product.name,
            serialNumber: r.equipment.serialNumber,
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
            depositAmount: Number(r.depositAmount),
            paymentSlipUrl: r.paymentSlipUrl,
            status: r.status,
          }))}
          pendingPurchases={pendingPurchases.map(p => ({
            id: p.id,
            userName: p.user.name || "ไม่ระบุชื่อ",
            userEmail: p.user.email,
            productName: p.equipment.product.name,
            serialNumber: p.equipment.serialNumber,
            totalPrice: Number(p.totalPrice),
            paymentSlipUrl: p.paymentSlipUrl,
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          }))}
          activeRentals={activeRentals.map(r => ({
            id: r.id,
            userName: r.user.name || "ไม่ระบุชื่อ",
            userEmail: r.user.email,
            productName: r.equipment.product.name,
            serialNumber: r.equipment.serialNumber,
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
            status: r.status,
          }))}
          inventoryProducts={inventoryProducts}
          approveRental={approveRental}
          rejectRental={rejectRental}
          approvePurchase={approvePurchase}
          rejectPurchase={rejectPurchase}
          processRentalReturn={processRentalReturn}
        />
      </div>
    </div>
  );
}
