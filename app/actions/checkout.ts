"use server";

import prisma from "@/lib/prisma";
import {
  EquipmentStatus,
  RentalStatus,
  PurchaseOrderStatus,
} from "@/app/generated/prisma/client";
import { getSession } from "./auth";
import path from "path";
import fs from "fs/promises";

// ==========================================
// Types
// ==========================================

export type CheckoutResult = {
  success: boolean;
  message?: string;
  error?: string;
  rentalId?: string;
  purchaseOrderId?: string;
};

type RentalCheckoutInput = {
  productId: string;
  startDate: string; // ISO date string from the client
  endDate: string;   // ISO date string from the client
  depositAmount: number;
  paymentSlipBase64: string; // base64 encoded image from the client
};

type PurchaseCheckoutInput = {
  productId: string;
  paymentSlipBase64: string; // base64 encoded image from the client
};

// ==========================================
// Helpers
// ==========================================

/**
 * Saves a base64-encoded payment slip image to disk and returns the public URL path.
 * Creates the upload directory if it doesn't exist.
 */
async function savePaymentSlip(
  base64Data: string,
  prefix: string
): Promise<string> {
  // Strip the data URI prefix if present (e.g. "data:image/png;base64,")
  const base64Content = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  const buffer = Buffer.from(base64Content, "base64");

  // Determine file extension from data URI header, default to png
  let extension = "png";
  const mimeMatch = base64Data.match(/data:image\/(\w+);base64/);
  if (mimeMatch) {
    extension = mimeMatch[1] === "jpeg" ? "jpg" : mimeMatch[1];
  }

  const filename = `${prefix}_${Date.now()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");

  // Ensure the directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  // Return the public URL path (relative to /public)
  return `/uploads/slips/${filename}`;
}

/**
 * Validates that the current user session is valid and the user exists in the database.
 * Returns the user ID or throws.
 */
async function validateSession(): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
  }
  return session.userId;
}

// ==========================================
// Server Actions
// ==========================================

/**
 * processRentalCheckout
 * ---------------------
 * Handles the complete rental checkout flow within a single database transaction:
 *
 * 1. Validates user session
 * 2. Saves the payment slip to the filesystem
 * 3. Opens a Prisma interactive transaction:
 *    a. Finds the first AVAILABLE equipment unit for the given productId
 *    b. Applies an optimistic lock by updating only if status is still AVAILABLE
 *    c. Creates a Rental record with status PENDING and the payment slip URL
 * 4. Returns the rental ID on success
 *
 * Concurrency: Uses `updateMany` with a WHERE clause on status=AVAILABLE as an
 * optimistic concurrency control. If another request grabs the same unit between
 * the findFirst and updateMany, the update count will be 0 and we throw.
 */
export async function processRentalCheckout(
  input: RentalCheckoutInput
): Promise<CheckoutResult> {
  try {
    // -- Pre-transaction validation --
    const userId = await validateSession();

    const { productId, startDate, endDate, depositAmount, paymentSlipBase64 } =
      input;

    if (!productId || !startDate || !endDate || !depositAmount) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }

    if (!paymentSlipBase64) {
      return { success: false, error: "กรุณาอัปโหลดสลิปการชำระเงิน" };
    }

    // Save the payment slip file before entering the transaction
    // (filesystem operations should not be inside DB transactions)
    const paymentSlipUrl = await savePaymentSlip(
      paymentSlipBase64,
      "rental"
    );

    // -- Atomic database transaction --
    const rental = await prisma.$transaction(async (tx) => {
      // 1. Find an available equipment unit for the product
      const availableEquipment = await tx.equipment.findFirst({
        where: {
          productId,
          status: EquipmentStatus.AVAILABLE,
        },
      });

      if (!availableEquipment) {
        throw new Error(
          "OUT_OF_STOCK: ไม่มีอุปกรณ์ที่พร้อมให้เช่าสำหรับสินค้านี้"
        );
      }

      // 2. Optimistic lock — update only if still AVAILABLE
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
        throw new Error(
          "CONCURRENCY_CONFLICT: อุปกรณ์ถูกจองโดยผู้อื่นแล้ว กรุณาลองใหม่อีกครั้ง"
        );
      }

      // 3. Verify the user exists in DB
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("UNAUTHORIZED: ไม่พบข้อมูลผู้ใช้ในระบบ");
      }

      // 4. Create the rental record with payment slip
      const newRental = await tx.rental.create({
        data: {
          userId: user.id,
          equipmentId: availableEquipment.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          depositAmount,
          paymentSlipUrl,
          status: RentalStatus.PENDING,
        },
      });

      return newRental;
    });

    return {
      success: true,
      rentalId: rental.id,
      message:
        "สร้างรายการเช่าสำเร็จ กรุณารอการยืนยันจากผู้ดูแลระบบ",
    };
  } catch (error: any) {
    console.error("[Rental Checkout Error]:", error);
    return {
      success: false,
      error:
        error.message || "เกิดข้อผิดพลาดในการทำรายการเช่า",
    };
  }
}

/**
 * processPurchaseCheckout
 * -----------------------
 * Handles the complete purchase checkout flow within a single database transaction:
 *
 * 1. Validates user session
 * 2. Saves the payment slip to the filesystem
 * 3. Opens a Prisma interactive transaction:
 *    a. Fetches the product to determine the selling price (uses monthlyPrice as base)
 *    b. Finds the first AVAILABLE equipment unit for the given productId
 *    c. Applies an optimistic lock by updating only if status is still AVAILABLE
 *    d. Creates a PurchaseOrder with status PENDING_PAYMENT and the payment slip URL
 * 4. Returns the purchase order ID on success
 *
 * Note: Equipment status is set to RESERVED (not SOLD) — the admin must verify
 * the payment slip and manually mark as SOLD via an admin action.
 */
export async function processPurchaseCheckout(
  input: PurchaseCheckoutInput
): Promise<CheckoutResult> {
  try {
    // -- Pre-transaction validation --
    const userId = await validateSession();

    const { productId, paymentSlipBase64 } = input;

    if (!productId) {
      return { success: false, error: "กรุณาระบุสินค้า" };
    }

    if (!paymentSlipBase64) {
      return { success: false, error: "กรุณาอัปโหลดสลิปการชำระเงิน" };
    }

    // Save the payment slip file before entering the transaction
    const paymentSlipUrl = await savePaymentSlip(
      paymentSlipBase64,
      "purchase"
    );

    // -- Atomic database transaction --
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      // 1. Get the product to determine the price
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND: ไม่พบสินค้าที่ระบุ");
      }

      // 2. Find an available equipment unit for the product
      const availableEquipment = await tx.equipment.findFirst({
        where: {
          productId,
          status: EquipmentStatus.AVAILABLE,
        },
      });

      if (!availableEquipment) {
        throw new Error(
          "OUT_OF_STOCK: ไม่มีอุปกรณ์ที่พร้อมขายสำหรับสินค้านี้"
        );
      }

      // 3. Optimistic lock — update only if still AVAILABLE
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
        throw new Error(
          "CONCURRENCY_CONFLICT: อุปกรณ์ถูกจองโดยผู้อื่นแล้ว กรุณาลองใหม่อีกครั้ง"
        );
      }

      // 4. Verify the user exists in DB
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("UNAUTHORIZED: ไม่พบข้อมูลผู้ใช้ในระบบ");
      }

      // 5. Create the purchase order
      //    totalPrice is derived from the product's monthlyPrice
      //    (In a production system you'd likely have a separate sellingPrice field)
      const newOrder = await tx.purchaseOrder.create({
        data: {
          userId: user.id,
          equipmentId: availableEquipment.id,
          totalPrice: product.monthlyPrice,
          paymentSlipUrl,
          status: PurchaseOrderStatus.PENDING_PAYMENT,
        },
      });

      return newOrder;
    });

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id,
      message:
        "สร้างรายการสั่งซื้อสำเร็จ กรุณารอการยืนยันจากผู้ดูแลระบบ",
    };
  } catch (error: any) {
    console.error("[Purchase Checkout Error]:", error);
    return {
      success: false,
      error:
        error.message || "เกิดข้อผิดพลาดในการทำรายการซื้อ",
    };
  }
}
