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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
      case "RETURNED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
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
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
              <p className="text-gray-500">{session.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                {session.role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">ประวัติการสั่งซื้อและเช่า</h2>
            <Link 
              href="/products" 
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
            >
              เลือกดูสินค้าเพิ่มเติม &rarr;
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">ยังไม่มีรายการสั่งซื้อหรือเช่าในขณะนี้</p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ไปหน้าสินค้า
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative h-20 w-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                          <Image
                            src={order.productImage}
                            alt={order.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              order.type === 'rental' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {order.type === 'rental' ? 'เช่า' : 'ซื้อ'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mt-1">{order.productName}</h3>
                          <p className="text-sm text-gray-500">วันที่ทำรายการ: {formatDate(order.createdAt)}</p>
                          {order.type === 'rental' && order.startDate && order.endDate && (
                            <p className="text-xs text-indigo-600 font-medium mt-1">
                              ระยะเวลา: {formatDate(order.startDate)} - {formatDate(order.endDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            {order.type === 'rental' ? 'ค่ามัดจำ' : 'ราคาสุทธิ'}
                          </p>
                          <p className="text-xl font-black text-gray-900">{formatCurrency(order.price)}</p>
                        </div>
                        
                        {order.paymentSlipUrl ? (
                          <div className="group relative">
                            <div className="h-12 w-12 rounded border border-gray-200 overflow-hidden bg-gray-50 cursor-zoom-in">
                              <Image 
                                src={order.paymentSlipUrl} 
                                alt="Payment Slip" 
                                width={48} 
                                height={48} 
                                className="object-cover transition-transform group-hover:scale-110"
                              />
                            </div>
                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                              <div className="bg-white p-2 rounded-lg shadow-xl border border-gray-200 w-48">
                                <p className="text-[10px] text-gray-400 mb-1 font-bold">หลักฐานการชำระเงิน</p>
                                <div className="relative aspect-[3/4] w-full rounded overflow-hidden">
                                  <Image 
                                    src={order.paymentSlipUrl} 
                                    alt="Payment Slip Full" 
                                    fill 
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-red-500 font-bold mb-1">รอการอัปโหลดสลิป</span>
                            <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md font-bold hover:bg-indigo-100 transition-colors border border-indigo-200">
                              อัปโหลดสลิป
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
