import { getSession } from "@/app/actions/auth";
import { getMyOrders } from "@/app/actions/orders";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const result = await getMyOrders();
  const orders = result.success ? result.orders : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PENDING_PAYMENT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "CANCELLED":
      case "RETURNED":
        return "bg-white/10 text-gray-400 border-white/10";
      case "OVERDUE":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent-blue)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-6 mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="h-24 w-24 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20 ring-4 ring-white/5">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-white">{session.name}</h1>
                <span className="inline-flex items-center self-center sm:self-auto px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-[var(--text-secondary)] border border-white/10 uppercase tracking-widest">
                  {session.role === "ADMIN" ? "Admin Mode" : "User Member"}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] font-medium mb-4">{session.email}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter mb-0.5">รายการทั้งหมด</p>
                  <p className="text-xl font-black text-white leading-none">{orders.length}</p>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter mb-0.5">สถานะบัญชี</p>
                  <p className="text-xl font-black text-[var(--accent-green)] leading-none">ปกติ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--accent-blue)] rounded-full"></span>
              ประวัติรายการของฉัน
            </h2>
            <Link 
              href="/products" 
              className="text-[var(--accent-cyan)] hover:opacity-80 font-bold text-xs transition-all flex items-center gap-1"
            >
              สั่งซื้อเพิ่ม ➔
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center animate-fade-in">
              <div className="mx-auto h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <svg className="h-10 w-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีรายการ</h3>
              <p className="text-[var(--text-secondary)] mb-8">คุณยังไม่ได้ทำการเช่าหรือซื้อสินค้าใดๆ ในขณะนี้</p>
              <Link
                href="/products"
                className="btn-primary"
              >
                เลือกดูสินค้าเลย
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order, idx) => (
                <div 
                  key={order.id} 
                  className="glass rounded-2xl overflow-hidden card-hover animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="flex items-start space-x-5">
                        <div className="relative h-20 w-20 flex-shrink-0 bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-2">
                          <Image
                            src={order.productImage}
                            alt={order.productName}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                              order.type === 'rental' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {order.type === 'rental' ? 'RENT' : 'BUY'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white leading-tight">{order.productName}</h3>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs text-[var(--text-muted)]">ทำรายการเมื่อ: {formatDate(order.createdAt)}</p>
                            {order.type === 'rental' && order.startDate && order.endDate && (
                              <p className="text-[10px] text-[var(--accent-blue)] font-bold">
                                📅 {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest mb-0.5">
                            {order.type === 'rental' ? 'Deposit Fee' : 'Total Price'}
                          </p>
                          <p className="text-2xl font-black text-white">
                            <span className="text-sm font-bold mr-1 text-[var(--text-secondary)]">฿</span>
                            {formatCurrency(order.price).replace('฿', '')}
                          </p>
                        </div>
                        
                        {order.paymentSlipUrl ? (
                          <div className="group relative">
                            <div className="h-14 w-14 rounded-xl border border-white/10 overflow-hidden bg-white/5 cursor-zoom-in ring-2 ring-transparent group-hover:ring-[var(--accent-blue)] transition-all">
                              <Image 
                                src={order.paymentSlipUrl} 
                                alt="Slip" 
                                width={56} 
                                height={56} 
                                className="object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent flex items-center justify-center">
                                <svg className="h-4 w-4 text-white opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                            {/* Hover Preview Tooltip */}
                            <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block z-50 animate-fade-in">
                              <div className="glass p-2 rounded-2xl shadow-2xl border-white/20 w-52 overflow-hidden glow-blue">
                                <p className="text-[10px] text-[var(--text-muted)] mb-2 font-black uppercase text-center">หลักฐานการชำระเงิน</p>
                                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white">
                                  <Image 
                                    src={order.paymentSlipUrl} 
                                    alt="Slip Full" 
                                    fill 
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-red-400 font-black mb-2 animate-pulse uppercase tracking-tighter">รอการยืนยันสลิป</span>
                            <button className="px-4 py-2 bg-white/5 text-white text-[10px] font-black rounded-xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest">
                              Upload Slip
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
