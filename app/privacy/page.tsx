"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-blue)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass rounded-2xl p-8 md:p-12 neon-border">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
            <p className="text-[var(--text-secondary)]">ปรับปรุงล่าสุดเมื่อ: 17 พฤษภาคม 2026</p>
          </div>

          <div className="space-y-8 text-[var(--text-primary)] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-cyan)] mb-4">1. บทนำ</h2>
              <p>
                เว็บไซต์ I-Kom ("เรา", "พวกเรา", หรือ "ของเรา") ให้ความสำคัญกับความเป็นส่วนตัวของท่าน นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการที่เรารวบรวม ใช้ เปิดเผย และปกป้องข้อมูลส่วนบุคคลของท่านเมื่อท่านเยี่ยมชมเว็บไซต์ หรือใช้บริการเช่า/ซื้ออุปกรณ์คอมพิวเตอร์ของเรา
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-cyan)] mb-4">2. ข้อมูลที่เรารวบรวม</h2>
              <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
                <li><strong className="text-[var(--text-primary)]">ข้อมูลยืนยันตัวตน:</strong> ชื่อ-นามสกุล, ที่อยู่อีเมล, รหัสผ่าน, และเอกสารยืนยันตัวตน (เช่น รูปถ่ายบัตรนักศึกษา/บัตรประชาชน) สำหรับการเช่าสินค้า</li>
                <li><strong className="text-[var(--text-primary)]">ข้อมูลการทำธุรกรรม:</strong> ประวัติการเช่า การสั่งซื้อสินค้า และข้อมูลการชำระเงิน (สลิปโอนเงิน)</li>
                <li><strong className="text-[var(--text-primary)]">ข้อมูลทางเทคนิค:</strong> ที่อยู่ IP, ประเภทเบราว์เซอร์, เวลาที่เข้าชม และประวัติการเข้าชม</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-cyan)] mb-4">3. การใช้ข้อมูลของท่าน</h2>
              <p className="mb-2">เราใช้ข้อมูลที่รวบรวมมาเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
                <li>เพื่อดำเนินการและจัดการบัญชีผู้ใช้ของท่าน</li>
                <li>เพื่อพิจารณาอนุมัติการเช่าสินค้าและป้องกันการฉ้อโกง</li>
                <li>เพื่อให้บริการลูกค้าและตอบคำถามต่างๆ (รวมถึงผ่านระบบ AI Chatbot)</li>
                <li>เพื่อวิเคราะห์และปรับปรุงบริการของเว็บไซต์</li>
                <li>เพื่อแนะนำสินค้าที่เหมาะสมกับผู้ใช้งาน (เช่น ตามคณะที่ศึกษา)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-cyan)] mb-4">4. การเปิดเผยข้อมูล</h2>
              <p>
                เราจะไม่ขาย ถ่ายโอน หรือเปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด ยกเว้นในกรณีที่จำเป็นตามกฎหมาย หรือเพื่อดำเนินการตามคำขอของท่านผ่านผู้ให้บริการภายนอก (เช่น ระบบตรวจสอบการชำระเงิน)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-cyan)] mb-4">5. ความปลอดภัยของข้อมูล</h2>
              <p>
                เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสม เพื่อปกป้องข้อมูลส่วนบุคคลของท่านจากการเข้าถึง การใช้งาน หรือการเปิดเผยที่ไม่ได้รับอนุญาต อย่างไรก็ตาม ไม่มีการส่งผ่านข้อมูลทางอินเทอร์เน็ตใดที่ปลอดภัย 100%
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--accent-cyan)] mb-4">6. สิทธิของท่าน</h2>
              <p>
                ท่านมีสิทธิในการเข้าถึง แก้ไข หรือขอลบข้อมูลส่วนบุคคลของท่านที่อยู่ในความดูแลของเราได้ตลอดเวลา โดยสามารถติดต่อเราได้ผ่านช่องทางที่ระบุไว้ในส่วน "ติดต่อเรา"
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
