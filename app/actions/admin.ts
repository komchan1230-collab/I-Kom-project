"use server";

import prisma from "@/lib/prisma";
import { EquipmentStatus, RentalStatus, PurchaseOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Fetches all rentals that are currently in PENDING status.
 */
export async function getPendingRentals() {
  try {
    const rentals = await prisma.rental.findMany({
      where: {
        status: RentalStatus.PENDING,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        equipment: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return rentals;
  } catch (error) {
    console.error("[Admin] Failed to fetch pending rentals:", error);
    return [];
  }
}

/**
 * Approves a pending rental. 
 * Changes Rental status to ACTIVE and Equipment status to RENTED.
 */
export async function approveRental(rentalId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({ where: { id: rentalId } });

      if (!rental) {
        throw new Error("Rental record not found.");
      }
      if (rental.status !== RentalStatus.PENDING) {
        throw new Error("Rental is not in PENDING state.");
      }

      // Update Rental to ACTIVE
      await tx.rental.update({
        where: { id: rentalId },
        data: { status: RentalStatus.ACTIVE },
      });

      // Update Equipment to RENTED
      await tx.equipment.update({
        where: { id: rental.equipmentId },
        data: { status: EquipmentStatus.RENTED },
      });
    });

    // Revalidate the admin page to refresh the table
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Failed to approve rental:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Rejects/Cancels a pending rental.
 * Changes Rental status to CANCELLED and Equipment status back to AVAILABLE.
 */
export async function rejectRental(rentalId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({ where: { id: rentalId } });

      if (!rental) {
        throw new Error("Rental record not found.");
      }
      if (rental.status !== RentalStatus.PENDING) {
        throw new Error("Rental is not in PENDING state.");
      }

      // Update Rental to CANCELLED
      await tx.rental.update({
        where: { id: rentalId },
        data: { status: RentalStatus.CANCELLED },
      });

      // Release Equipment back to AVAILABLE
      await tx.equipment.update({
        where: { id: rental.equipmentId },
        data: { status: EquipmentStatus.AVAILABLE },
      });
    });

    // Revalidate the admin page to refresh the table
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Failed to reject rental:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// Purchase Order Management
// ==========================================

/**
 * Fetches all purchase orders that are currently in PENDING_PAYMENT status.
 */
export async function getPendingPurchases() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: {
        status: PurchaseOrderStatus.PENDING_PAYMENT,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        equipment: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("[Admin] Failed to fetch pending purchases:", error);
    return [];
  }
}

/**
 * Approves a purchase order.
 * Changes PurchaseOrder status to COMPLETED and Equipment status to SOLD.
 */
export async function approvePurchase(orderId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({ where: { id: orderId } });

      if (!order) {
        throw new Error("Purchase order not found.");
      }
      if (order.status !== PurchaseOrderStatus.PENDING_PAYMENT) {
        throw new Error("Order is not in PENDING_PAYMENT state.");
      }

      // Update PurchaseOrder to COMPLETED
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: PurchaseOrderStatus.COMPLETED },
      });

      // Update Equipment to SOLD
      await tx.equipment.update({
        where: { id: order.equipmentId },
        data: { status: EquipmentStatus.SOLD },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Failed to approve purchase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Rejects a purchase order.
 * Changes PurchaseOrder status to CANCELLED and Equipment status back to AVAILABLE.
 */
export async function rejectPurchase(orderId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({ where: { id: orderId } });

      if (!order) {
        throw new Error("Purchase order not found.");
      }
      if (order.status !== PurchaseOrderStatus.PENDING_PAYMENT) {
        throw new Error("Order is not in PENDING_PAYMENT state.");
      }

      // Update PurchaseOrder to CANCELLED
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: PurchaseOrderStatus.CANCELLED },
      });

      // Release Equipment back to AVAILABLE
      await tx.equipment.update({
        where: { id: order.equipmentId },
        data: { status: EquipmentStatus.AVAILABLE },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Failed to reject purchase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the count of COMPLETED purchase orders.
 */
export async function getCompletedPurchasesCount() {
  try {
    const count = await prisma.purchaseOrder.count({
      where: {
        status: PurchaseOrderStatus.COMPLETED,
      },
    });
    return count;
  } catch (error) {
    console.error("[Admin] Failed to fetch completed purchases count:", error);
    return 0;
  }
}

// ==========================================
// Rental Return Management
// ==========================================

/**
 * Fetches rentals that are currently ACTIVE or OVERDUE.
 */
export async function getActiveRentals() {
  try {
    const rentals = await prisma.rental.findMany({
      where: {
        status: {
          in: [RentalStatus.ACTIVE, RentalStatus.OVERDUE],
        },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        equipment: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: {
        endDate: "asc", // Show those expiring soonest first
      },
    });

    return rentals;
  } catch (error) {
    console.error("[Admin] Failed to fetch active rentals:", error);
    return [];
  }
}

/**
 * Processes the return of rented equipment.
 * Sets rental to RETURNED and equipment to either AVAILABLE or MAINTENANCE.
 */
export async function processRentalReturn(
  rentalId: string,
  equipmentStatus: EquipmentStatus = EquipmentStatus.AVAILABLE,
  conditionNote?: string
) {
  try {
    await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({
        where: { id: rentalId },
      });

      if (!rental) throw new Error("Rental record not found.");

      // 1. Update Rental Status
      await tx.rental.update({
        where: { id: rentalId },
        data: { status: RentalStatus.RETURNED },
      });

      // 2. Update Equipment Status and Note
      await tx.equipment.update({
        where: { id: rental.equipmentId },
        data: {
          status: equipmentStatus,
          conditionNote: conditionNote || undefined,
        },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Failed to process return:", error);
    return { success: false, error: error.message };
  }
}

