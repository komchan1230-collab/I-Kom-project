"use server";

import prisma from "@/lib/prisma";
import { EquipmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/actions/auth";

// ==========================================
// Types
// ==========================================

export type EquipmentStatusCount = {
  AVAILABLE: number;
  RESERVED: number;
  RENTED: number;
  SOLD: number;
  MAINTENANCE: number;
};

export type EquipmentRow = {
  id: string;
  serialNumber: string;
  status: string;
  conditionNote: string | null;
  createdAt: string;
};

export type InventoryProduct = {
  id: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  monthlyPrice: number;
  buyPrice: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  totalEquipment: number;
  availableEquipment: number;
  statusBreakdown: EquipmentStatusCount;
  rentalCount: number;
  purchaseCount: number;
  popularityScore: number;
  equipment: EquipmentRow[];
};

// ==========================================
// Helpers
// ==========================================

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

// ==========================================
// GET — Inventory Data
// ==========================================

export async function getInventoryData(): Promise<InventoryProduct[]> {
  await requireAdmin();

  try {
    const products = await prisma.product.findMany({
      include: {
        equipment: {
          include: {
            rentals: { select: { id: true } },
            purchaseOrder: { select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => {
      // Status breakdown
      const statusBreakdown: EquipmentStatusCount = {
        AVAILABLE: 0,
        RESERVED: 0,
        RENTED: 0,
        SOLD: 0,
        MAINTENANCE: 0,
      };

      let rentalCount = 0;
      let purchaseCount = 0;

      for (const eq of product.equipment) {
        statusBreakdown[eq.status as keyof EquipmentStatusCount]++;
        rentalCount += eq.rentals.length;
        purchaseCount += eq.purchaseOrder ? 1 : 0;
      }

      const popularityScore = rentalCount + purchaseCount;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        specs: product.specs as Record<string, string>,
        monthlyPrice: Number(product.monthlyPrice),
        buyPrice: Number(product.buyPrice),
        imageUrl: product.imageUrl,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        totalEquipment: product.equipment.length,
        availableEquipment: statusBreakdown.AVAILABLE,
        statusBreakdown,
        rentalCount,
        purchaseCount,
        popularityScore,
        equipment: product.equipment.map((eq) => ({
          id: eq.id,
          serialNumber: eq.serialNumber,
          status: eq.status,
          conditionNote: eq.conditionNote,
          createdAt: eq.createdAt.toISOString(),
        })),
      };
    });
  } catch (error) {
    console.error("[Inventory] Failed to fetch inventory data:", error);
    return [];
  }
}

// ==========================================
// UPDATE — Product (Inline Edit)
// ==========================================

export async function updateProduct(
  productId: string,
  data: {
    name?: string;
    monthlyPrice?: number;
    buyPrice?: number;
    specs?: Record<string, string>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.monthlyPrice !== undefined) updateData.monthlyPrice = data.monthlyPrice;
    if (data.buyPrice !== undefined) updateData.buyPrice = data.buyPrice;
    if (data.specs !== undefined) updateData.specs = data.specs;

    await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("[Inventory] Failed to update product:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// ADD STOCK — Create Equipment rows
// ==========================================

export async function addEquipmentStock(
  productId: string,
  serialNumbers: string[]
): Promise<{ success: boolean; error?: string; addedCount?: number }> {
  try {
    await requireAdmin();

    if (!serialNumbers.length) {
      return { success: false, error: "No serial numbers provided." };
    }

    // Remove duplicates and empty strings
    const cleaned = [...new Set(serialNumbers.map((s) => s.trim()).filter(Boolean))];
    if (!cleaned.length) {
      return { success: false, error: "No valid serial numbers provided." };
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    // Check for existing serial numbers
    const existing = await prisma.equipment.findMany({
      where: { serialNumber: { in: cleaned } },
      select: { serialNumber: true },
    });

    if (existing.length > 0) {
      const dupes = existing.map((e) => e.serialNumber).join(", ");
      return {
        success: false,
        error: `Serial numbers already exist: ${dupes}`,
      };
    }

    // Create equipment rows in a transaction
    await prisma.$transaction(
      cleaned.map((sn) =>
        prisma.equipment.create({
          data: {
            productId,
            serialNumber: sn,
            status: EquipmentStatus.AVAILABLE,
          },
        })
      )
    );

    revalidatePath("/admin/inventory");
    return { success: true, addedCount: cleaned.length };
  } catch (error: any) {
    console.error("[Inventory] Failed to add stock:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// REMOVE STOCK — Delete AVAILABLE Equipment
// ==========================================

export async function removeEquipmentStock(
  equipmentIds: string[]
): Promise<{ success: boolean; error?: string; removedCount?: number }> {
  try {
    await requireAdmin();

    if (!equipmentIds.length) {
      return { success: false, error: "No equipment selected." };
    }

    // Verify all selected equipment is AVAILABLE
    const equipments = await prisma.equipment.findMany({
      where: { id: { in: equipmentIds } },
      select: { id: true, status: true, serialNumber: true },
    });

    const nonAvailable = equipments.filter((e) => e.status !== EquipmentStatus.AVAILABLE);
    if (nonAvailable.length > 0) {
      const sns = nonAvailable.map((e) => `${e.serialNumber} (${e.status})`).join(", ");
      return {
        success: false,
        error: `Cannot remove non-AVAILABLE equipment: ${sns}`,
      };
    }

    // Delete in transaction
    const result = await prisma.equipment.deleteMany({
      where: {
        id: { in: equipmentIds },
        status: EquipmentStatus.AVAILABLE,
      },
    });

    revalidatePath("/admin/inventory");
    return { success: true, removedCount: result.count };
  } catch (error: any) {
    console.error("[Inventory] Failed to remove stock:", error);
    return { success: false, error: error.message };
  }
}
