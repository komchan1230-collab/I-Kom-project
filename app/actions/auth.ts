"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-development-only";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await createSession(user.id, user.name || "", user.email, user.role);

    return { success: true };
  } catch (error: any) {
    console.error("[Register Error]:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return { success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    await createSession(user.id, user.name || "", user.email, user.role);

    return { success: true };
  } catch (error: any) {
    console.error("[Login Error]:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
  }
}

export async function logout() {
  (await cookies()).delete("session");
  return { success: true };
}

// Session Helpers
async function createSession(userId: string, name: string, email: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ userId, name, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; name: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}
