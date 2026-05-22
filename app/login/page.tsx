"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, loginWithGoogle } from "@/app/actions/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);

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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-blue)]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-purple)]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass rounded-2xl p-8 relative z-10 neon-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">เข้าสู่ระบบ</h1>
          <p className="text-[var(--text-secondary)] text-sm">เข้าสู่ระบบเพื่อเช่าคอมพิวเตอร์และอุปกรณ์</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary justify-center !py-3 mt-4 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#111116] text-[var(--text-secondary)]">หรือ</span>
          </div>
        </div>

        <div className="mt-2 mb-2 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                setIsLoading(true);
                const res = await loginWithGoogle(credentialResponse.credential);
                if (res.success) {
                  router.push("/products");
                  router.refresh();
                } else {
                  setError(res.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
                  setIsLoading(false);
                }
              }
            }}
            onError={() => {
              setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google");
            }}
            theme="filled_black"
            text="signin_with"
            shape="pill"
          />
        </div>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-[var(--accent-cyan)] hover:underline font-medium">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}
