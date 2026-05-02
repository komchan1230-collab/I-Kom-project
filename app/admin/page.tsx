import { getPendingRentals, approveRental, rejectRental } from "@/app/actions/admin";
import { formatPrice } from "@/app/components/ProductData";

export default async function AdminDashboard() {
  const pendingRentals = await getPendingRentals();

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
          จัดการรายการเช่าที่รอการอนุมัติ (Pending Rentals)
        </p>

        {pendingRentals.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center neon-border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[var(--accent-blue)]/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">ไม่มีรายการที่รออนุมัติ</h3>
            <p className="text-[var(--text-secondary)]">รายการเช่าทั้งหมดได้รับการจัดการเรียบร้อยแล้ว</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden neon-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-[var(--border-color)]">
                    <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">ผู้เช่า</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">สินค้า</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">วันที่เช่า (เริ่มต้น - สิ้นสุด)</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-right">มัดจำ</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-center">สถานะ</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {pendingRentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-[var(--text-primary)]">{rental.user.name || "ไม่ระบุชื่อ"}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{rental.user.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[var(--text-primary)]">{rental.equipment.product.name}</div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono">SN: {rental.equipment.serialNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[var(--text-primary)]">
                          {new Date(rental.startDate).toLocaleDateString("th-TH")}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          ถึง {new Date(rental.endDate).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-[var(--accent-cyan)]">
                        ฿{formatPrice(Number(rental.depositAmount))}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {rental.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <form action={approveRental.bind(null, rental.id)}>
                            <button 
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-colors text-sm font-medium"
                              title="อนุมัติการเช่า (Approve)"
                            >
                              อนุมัติ
                            </button>
                          </form>
                          <form action={rejectRental.bind(null, rental.id)}>
                            <button 
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors text-sm font-medium"
                              title="ยกเลิกการเช่า (Reject/Cancel)"
                            >
                              ยกเลิก
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
