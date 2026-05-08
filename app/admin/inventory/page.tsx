import { getSession } from "@/app/actions/auth";
import { getInventoryData } from "@/app/actions/inventory";
import { redirect } from "next/navigation";
import Link from "next/link";
import InventoryClient from "./InventoryClient";

export const metadata = {
  title: "Inventory Management | I-Kom Admin",
};

export default async function InventoryPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const products = await getInventoryData();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent-cyan)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Inventory <span className="text-gradient">Management</span>
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              จัดการสต็อกสินค้า แก้ไขข้อมูล และดูสถิติความนิยม
            </p>
          </div>
        </div>

        <InventoryClient products={products} />
      </div>
    </div>
  );
}
