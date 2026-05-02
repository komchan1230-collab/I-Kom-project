"use server";

import prisma from "@/lib/prisma";
import { EquipmentStatus, RentalStatus } from "@/app/generated/prisma/client";
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
