"use client";

import Link from "next/link";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--accent-cyan)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[var(--accent-blue)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass rounded-2xl p-8 md:p-12 neon-border">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-cyan mb-4">เงื่อนไขการใช้งาน (Terms of Use)</h1>
            <p className="text-[var(--text-secondary)]">ปรับปรุงล่าสุดเมื่อ: 17 พฤษภาคม 2026</p>
          </div>

          <div className="space-y-8 text-[var(--text-primary)] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-blue)] mb-4">1. ข้อตกลงทั่วไป</h2>
              <p>
                การเข้าถึงและใช้งานเว็บไซต์ I-Kom ถือว่าท่านตกลงที่จะผูกพันตามเงื่อนไขและข้อกำหนดเหล่านี้ หากท่านไม่เห็นด้วยกับข้อกำหนดใดๆ โปรดงดเว้นการใช้งานเว็บไซต์และบริการของเรา
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-blue)] mb-4">2. บัญชีผู้ใช้งาน</h2>
              <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
                <li>ท่านต้องให้ข้อมูลที่เป็นความจริงและเป็นปัจจุบันในการสมัครสมาชิก</li>
                <li>ท่านมีความรับผิดชอบในการเก็บรักษารหัสผ่านของท่านให้ปลอดภัย</li>
                <li>ทางเราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้ หากพบว่ามีการกระทำที่ผิดเงื่อนไข หรือให้ข้อมูลเท็จ (เช่น บัตรนักศึกษาปลอม)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-blue)] mb-4">3. เงื่อนไขการเช่าสินค้า</h2>
              <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
                <li>ผู้เช่าต้องผ่านการยืนยันตัวตนก่อนจึงจะสามารถทำรายการเช่าได้</li>
                <li>ผู้เช่าต้องชำระค่าเช่าและเงินมัดจำ (ถ้ามี) ล่วงหน้าตามที่ระบบระบุ</li>
                <li>ผู้เช่าต้องรับผิดชอบต่อความเสียหายที่เกิดขึ้นกับอุปกรณ์ตลอดระยะเวลาการเช่า ไม่ว่ากรณีใดๆ (ยกเว้นความเสื่อมสภาพจากการใช้งานปกติ)</li>
                <li>หากส่งคืนสินค้าเกินกำหนด ผู้เช่าตกลงที่จะชำระค่าปรับล่าช้าตามอัตราที่บริษัทกำหนด</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-blue)] mb-4">4. การซื้อสินค้า</h2>
              <p>
                ในกรณีที่เป็นการซื้อขาด (Purchase) การสั่งซื้อจะสมบูรณ์เมื่อมีการยืนยันการชำระเงินเรียบร้อยแล้ว สินค้าที่ซื้อไปแล้วจะอยู่ภายใต้เงื่อนไขการรับประกันตามที่ระบุไว้ในรายละเอียดสินค้านั้นๆ 
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-blue)] mb-4">5. นโยบายการคืนเงิน</h2>
              <p>
                ทางเราจะทำการคืนเงินมัดจำค่าเช่าภายใน 3-5 วันทำการ หลังจากที่ได้รับอุปกรณ์คืนและตรวจสอบแล้วว่าอุปกรณ์อยู่ในสภาพสมบูรณ์ ไม่มีการชำรุดเสียหาย สำหรับการยกเลิกออเดอร์ก่อนการจัดส่ง จะต้องทำล่วงหน้าอย่างน้อย 24 ชั่วโมง
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-blue)] mb-4">6. ข้อจำกัดความรับผิดชอบ</h2>
              <p>
                I-Kom จะไม่รับผิดชอบต่อความเสียหายทางอ้อม ความสูญเสียของข้อมูล หรือการสูญเสียรายได้ ที่เกิดจากการใช้งาน หรือไม่สามารถใช้งานอุปกรณ์ที่เช่าหรือซื้อจากทางเราได้
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border-color)] text-center">
            <Link href="/" className="btn-primary inline-flex">
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
