"use server";

import prisma from "@/lib/prisma";
import { getSession } from "./auth";

export type OrderItem = {
  id: string;
  type: "rental" | "purchase";
  productName: string;
  productImage: string;
  status: string;
  price: number;
  paymentSlipUrl: string | null;
  createdAt: string;
  startDate?: string;
  endDate?: string;
};

/**
 * Fetches all orders (rentals + purchases) for the logged-in user.
 */
export async function getMyOrders(): Promise<{ success: boolean; orders: OrderItem[]; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, orders: [], error: "กรุณาเข้าสู่ระบบ" };
  }

  const [rentals, purchases] = await Promise.all([
    prisma.rental.findMany({
      where: { userId: session.userId },
      include: { equipment: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { userId: session.userId },
      include: { equipment: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rentalOrders: OrderItem[] = rentals.map((r) => ({
    id: r.id,
    type: "rental",
    productName: r.equipment.product.name,
    productImage: r.equipment.product.imageUrl || "/laptop.png",
    status: r.status,
    price: Number(r.depositAmount),
    paymentSlipUrl: r.paymentSlipUrl,
    createdAt: r.createdAt.toISOString(),
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
  }));

  const purchaseOrders: OrderItem[] = purchases.map((p) => ({
    id: p.id,
    type: "purchase",
    productName: p.equipment.product.name,
    productImage: p.equipment.product.imageUrl || "/laptop.png",
    status: p.status,
    price: Number(p.totalPrice),
    paymentSlipUrl: p.paymentSlipUrl,
    createdAt: p.createdAt.toISOString(),
  }));

  // Merge and sort by date descending
  const all = [...rentalOrders, ...purchaseOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { success: true, orders: all };
}
