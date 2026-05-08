"use server";

import prisma from "@/lib/prisma";
import { EquipmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

export type InventoryProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  monthlyPrice: number;
  buyPrice: number;
  specs: any;
  counts: {
    AVAILABLE: number;
    RESERVED: number;
    RENTED: number;
    SOLD: number;
    MAINTENANCE: number;
  };
  equipment: any[];
};

/**
 * Fetches all products with their equipment counts grouped by status.
 */
export async function getInventory(): Promise<InventoryProduct[]> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        equipment: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products.map(product => {
      const counts = {
        AVAILABLE: 0,
        RESERVED: 0,
        RENTED: 0,
        SOLD: 0,
        MAINTENANCE: 0,
      };

      product.equipment.forEach(e => {
        counts[e.status as keyof typeof counts]++;
      });

      return {
        ...product,
        monthlyPrice: Number(product.monthlyPrice),
        buyPrice: Number(product.buyPrice),
        counts,
      };
    });
  } catch (error) {
    console.error("[Inventory] Failed to fetch inventory:", error);
    return [];
  }
}

/**
 * Updates a product's basic info.
 */
export async function updateProduct(
  productId: string,
  data: {
    name?: string;
    monthlyPrice?: number;
    buyPrice?: number;
    specs?: any;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "UNAUTHORIZED" };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data,
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[Inventory] Failed to update product:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลสินค้า" };
  }
}

/**
 * Adds new equipment stock for a specific product.
 */
export async function addEquipmentStock(productId: string, serialNumbers: string[]) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "UNAUTHORIZED" };
  }

  if (serialNumbers.length === 0) {
    return { success: false, error: "กรุณาระบุ Serial Number อย่างน้อย 1 รายการ" };
  }

  try {
    // Check for duplicate serial numbers in the input
    const uniqueSerials = Array.from(new Set(serialNumbers.map(s => s.trim()).filter(s => s !== "")));
    
    // Check if any of these serial numbers already exist in DB
    const existing = await prisma.equipment.findMany({
      where: {
        serialNumber: { in: uniqueSerials }
      },
      select: { serialNumber: true }
    });

    if (existing.length > 0) {
      const serials = existing.map(e => e.serialNumber).join(", ");
      return { success: false, error: `Serial Number ต่อไปนี้มีอยู่ในระบบแล้ว: ${serials}` };
    }

    await prisma.equipment.createMany({
      data: uniqueSerials.map(sn => ({
        productId,
        serialNumber: sn,
        status: EquipmentStatus.AVAILABLE,
      }))
    });

    revalidatePath("/admin/inventory");
    return { success: true, count: uniqueSerials.length };
  } catch (error: any) {
    console.error("[Inventory] Failed to add stock:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเพิ่มสต็อก" };
  }
}

/**
 * Removes (deletes) equipment records if they are currently AVAILABLE.
 */
export async function removeEquipmentStock(equipmentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "UNAUTHORIZED" };
  }

  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return { success: false, error: "ไม่พบข้อมูลอุปกรณ์" };
    }

    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      return { success: false, error: "สามารถลบได้เฉพาะอุปกรณ์ที่มีสถานะ AVAILABLE เท่านั้น" };
    }

    await prisma.equipment.delete({
      where: { id: equipmentId }
    });

    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("[Inventory] Failed to remove stock:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบสต็อก" };
  }
}
