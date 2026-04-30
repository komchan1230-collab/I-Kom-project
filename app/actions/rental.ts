"use server";

import prisma from "@/lib/prisma";
import { EquipmentStatus, RentalStatus } from "@/app/generated/prisma/client";

export type BookingRequest = {
  userId: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  depositAmount: number;
};

/**
 * Creates a rental booking by locking an available equipment unit and creating a pending rental record.
 */
export async function createRentalBooking(data: BookingRequest) {
  try {
    const { userId, productId, startDate, endDate, depositAmount } = data;

    // We use a Prisma interactive transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Find an available equipment unit for the requested product
      const availableEquipment = await tx.equipment.findFirst({
        where: {
          productId: productId,
          status: EquipmentStatus.AVAILABLE,
        },
      });

      if (!availableEquipment) {
        throw new Error("OUT_OF_STOCK: No available equipment found for this product at the moment.");
      }

      // 2. Attempt to lock the equipment by updating its status to RESERVED.
      // We include `status: EquipmentStatus.AVAILABLE` in the where clause as an optimistic concurrency lock.
      // If another user books this exact unit milliseconds before, the update count will be 0.
      const lockResult = await tx.equipment.updateMany({
        where: {
          id: availableEquipment.id,
          status: EquipmentStatus.AVAILABLE,
        },
        data: {
          status: EquipmentStatus.RESERVED,
        },
      });

      if (lockResult.count === 0) {
        throw new Error("CONCURRENCY_CONFLICT: The unit was just booked by someone else. Please try again.");
      }

      // 2.5 Get the logged in user's session
      const { getSession } = await import("./auth");
      const session = await getSession();
      
      if (!session) {
        throw new Error("UNAUTHORIZED: กรุณาเข้าสู่ระบบก่อนทำการจอง");
      }

      // Check if user actually exists in DB to be safe
      const user = await tx.user.findUnique({ where: { id: session.userId } });
      if (!user) {
        throw new Error("UNAUTHORIZED: ไม่พบข้อมูลผู้ใช้ในระบบ");
      }

      // 3. Create the pending rental record
      const rental = await tx.rental.create({
        data: {
          userId: user.id, // Use valid DB user ID
          equipmentId: availableEquipment.id,
          startDate,
          endDate,
          depositAmount,
          status: RentalStatus.PENDING,
        },
      });

      return rental;
    });

    return { 
      success: true, 
      rental: result,
      message: "Booking successful. Please complete the payment within 15 minutes to confirm."
    };

  } catch (error: any) {
    console.error("[Rental Booking Action Error]:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred during booking." 
    };
  }
}

/**
 * Confirms the rental payment and changes statuses to ACTIVE / RENTED.
 */
export async function confirmRentalPayment(rentalId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({ where: { id: rentalId } });
      
      if (!rental) {
        throw new Error("Rental record not found.");
      }
      if (rental.status !== RentalStatus.PENDING) {
        throw new Error("This rental is not in PENDING state.");
      }

      // 1. Update Rental to ACTIVE
      const updatedRental = await tx.rental.update({
        where: { id: rentalId },
        data: { status: RentalStatus.ACTIVE },
      });

      // 2. Update Equipment to RENTED
      await tx.equipment.update({
        where: { id: rental.equipmentId },
        data: { status: EquipmentStatus.RENTED },
      });

      return updatedRental;
    });

    return { success: true, rental: result };
  } catch (error: any) {
    console.error("[Payment Confirmation Error]:", error);
    return { success: false, error: error.message || "Failed to confirm payment" };
  }
}

