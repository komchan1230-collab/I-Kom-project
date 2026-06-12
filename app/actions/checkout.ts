"use server";

import prisma from "@/lib/prisma";
import {
  EquipmentStatus,
  RentalStatus,
  PurchaseOrderStatus,
} from "@prisma/client";
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
  isAutoVerified?: boolean;
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
  // 1. DoS Protection: Limit payload size strictly (5MB limit in base64 char length is approx 7.18 million characters)
  const MAX_BASE64_LENGTH = 5 * 1024 * 1024 * 1.37;
  if (base64Data.length > MAX_BASE64_LENGTH) {
    throw new Error("FILE_TOO_LARGE: ขนาดไฟล์ต้องไม่เกิน 5MB");
  }

  // Strip the data URI prefix if present
  const base64Content = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  const buffer = Buffer.from(base64Content, "base64");

  // 2. Security / XSS Protection: Strictly validate MIME type to safe image formats
  let extension = "png";
  const mimeMatch = base64Data.match(/data:image\/(\w+);base64/);
  if (mimeMatch) {
    const mimeType = mimeMatch[1].toLowerCase();
    if (mimeType === "jpeg" || mimeType === "jpg") {
      extension = "jpg";
    } else if (mimeType === "png") {
      extension = "png";
    } else if (mimeType === "webp") {
      extension = "webp";
    } else {
      throw new Error("INVALID_FILE_TYPE: รูปแบบไฟล์ไม่ถูกต้อง อัปโหลดได้เฉพาะรูปภาพ JPEG, PNG, WEBP");
    }
  } else {
    throw new Error("INVALID_FILE_TYPE: รูปแบบไฟล์ไม่ถูกต้อง");
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
 * Mock function to simulate verification of a payment slip with a 3rd-party API (e.g. SlipOK).
 * Simulates a 1-second delay and returns success.
 */
async function verifySlipWithAPI(
  slipBase64: string,
  expectedAmount: number
): Promise<{ success: boolean; verifiedAmount: number }> {
  // Simulate network latency (1-second delay)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  console.log(`[Auto-Slip Verification]: Verified slip with expected amount: ฿${expectedAmount}`);
  
  return {
    success: true,
    verifiedAmount: expectedAmount,
  };
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

    // 5. Mock Auto-Slip Verification
    let isAutoVerified = false;
    let successMessage = "สร้างรายการเช่าสำเร็จ กรุณารอการยืนยันจากผู้ดูแลระบบ";

    try {
      const verification = await verifySlipWithAPI(paymentSlipBase64, depositAmount);
      if (verification.success) {
        // Auto-approve: update Rental status to ACTIVE and Equipment status to RENTED
        await prisma.$transaction(async (tx) => {
          await tx.rental.update({
            where: { id: rental.id },
            data: { status: RentalStatus.ACTIVE },
          });

          await tx.equipment.update({
            where: { id: rental.equipmentId },
            data: { status: EquipmentStatus.RENTED },
          });
        });

        isAutoVerified = true;
        successMessage = "ชำระเงินและตรวจสอบสลิปอัตโนมัติสำเร็จแล้ว! รายการเช่ามีสถานะเป็น 'ใช้งานอยู่' (Active) เรียบร้อยแล้ว";
      }
    } catch (verifError) {
      console.error("[Auto-Slip Verification Failure]:", verifError);
    }

    return {
      success: true,
      rentalId: rental.id,
      isAutoVerified,
      message: successMessage,
    };
  } catch (error: any) {
    console.error("[Rental Checkout Error]:", error);

    // Sanitize error messages returned to the client to avoid leaking database schema/Prisma errors
    const isClientSafe = error.message && (
      error.message.startsWith("OUT_OF_STOCK:") ||
      error.message.startsWith("CONCURRENCY_CONFLICT:") ||
      error.message.startsWith("UNAUTHORIZED:") ||
      error.message.startsWith("FILE_TOO_LARGE:") ||
      error.message.startsWith("INVALID_FILE_TYPE:")
    );

    return {
      success: false,
      error: isClientSafe ? error.message.split(": ")[1] : "เกิดข้อผิดพลาดในการทำรายการเช่า กรุณาลองใหม่อีกครั้ง",
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

    // 1. Get the product to determine the price BEFORE entering transaction (optimizes DB lock times)
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND: ไม่พบสินค้าที่ระบุ");
    }

    // Save the payment slip file before entering the transaction
    const paymentSlipUrl = await savePaymentSlip(
      paymentSlipBase64,
      "purchase"
    );

    // -- Atomic database transaction --
    const purchaseOrder = await prisma.$transaction(async (tx) => {
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
      //    totalPrice uses the product's dedicated buyPrice field
      const newOrder = await tx.purchaseOrder.create({
        data: {
          userId: user.id,
          equipmentId: availableEquipment.id,
          totalPrice: product.buyPrice,
          paymentSlipUrl,
          status: PurchaseOrderStatus.PENDING_PAYMENT,
        },
      });

      return newOrder;
    });

    // 6. Mock Auto-Slip Verification
    let isAutoVerified = false;
    let successMessage = "สร้างรายการสั่งซื้อสำเร็จ กรุณารอการยืนยันจากผู้ดูแลระบบ";

    try {
      const verification = await verifySlipWithAPI(paymentSlipBase64, Number(product.buyPrice));
      if (verification.success) {
        // Auto-approve: update PurchaseOrder status to COMPLETED and Equipment status to SOLD
        await prisma.$transaction(async (tx) => {
          await tx.purchaseOrder.update({
            where: { id: purchaseOrder.id },
            data: { status: PurchaseOrderStatus.COMPLETED },
          });

          await tx.equipment.update({
            where: { id: purchaseOrder.equipmentId },
            data: { status: EquipmentStatus.SOLD },
          });
        });

        isAutoVerified = true;
        successMessage = "ชำระเงินและตรวจสอบสลิปอัตโนมัติสำเร็จแล้ว! รายการสั่งซื้อมีสถานะเป็น 'เสร็จสิ้น' (Completed) เรียบร้อยแล้ว";
      }
    } catch (verifError) {
      console.error("[Auto-Slip Verification Failure]:", verifError);
    }

    return {
      success: true,
      purchaseOrderId: purchaseOrder.id,
      isAutoVerified,
      message: successMessage,
    };
  } catch (error: any) {
    console.error("[Purchase Checkout Error]:", error);

    // Sanitize error messages returned to the client to avoid leaking database schema/Prisma errors
    const isClientSafe = error.message && (
      error.message.startsWith("PRODUCT_NOT_FOUND:") ||
      error.message.startsWith("OUT_OF_STOCK:") ||
      error.message.startsWith("CONCURRENCY_CONFLICT:") ||
      error.message.startsWith("UNAUTHORIZED:") ||
      error.message.startsWith("FILE_TOO_LARGE:") ||
      error.message.startsWith("INVALID_FILE_TYPE:")
    );

    return {
      success: false,
      error: isClientSafe ? error.message.split(": ")[1] : "เกิดข้อผิดพลาดในการทำรายการซื้อ กรุณาลองใหม่อีกครั้ง",
    };
  }
}
