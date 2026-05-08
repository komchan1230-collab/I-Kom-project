import { getInventory } from "@/app/actions/inventory";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import InventoryClient from "./InventoryClient";
import Link from "next/link";

export default async function InventoryPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const inventory = await getInventory();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent-blue)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <Link 
              href="/admin" 
              className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] text-xs font-bold transition-colors mb-2 inline-block uppercase tracking-widest"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Inventory <span className="text-gradient">Manager</span>
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">จัดการสต็อกสินค้าและสเปคอุปกรณ์แบบ Real-time</p>
          </div>
          <div className="flex items-center space-x-3 glass px-5 py-3 rounded-2xl border-white/5 shadow-xl">
            <span className="h-2 w-2 bg-[var(--accent-green)] rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            <span className="text-white font-black text-xs uppercase tracking-widest">Admin Authorization Verified</span>
          </div>
        </div>

        <InventoryClient initialProducts={inventory} />
      </div>
    </div>
  );
}
