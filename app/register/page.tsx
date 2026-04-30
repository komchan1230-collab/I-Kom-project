"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setIsLoading(false);
      return;
    }

    const res = await registerUser(formData);

    if (res.success) {
      router.push("/products");
      router.refresh();
    } else {
      setError(res.error || "เกิดข้อผิดพลาด");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-cyan)]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-blue)]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg glass rounded-2xl p-8 relative z-10 neon-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-cyan mb-2">สมัครสมาชิกใหม่</h1>
          <p className="text-[var(--text-secondary)] text-sm">สร้างบัญชีเพื่อเริ่มต้นเช่าอุปกรณ์กับ I-Kom</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">ชื่อ - นามสกุล</label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
              placeholder="สมชาย ใจดี"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">อีเมล</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
              placeholder="student@uni.ac.th"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary justify-center !py-3 mt-6 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-[var(--accent-cyan)] hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
