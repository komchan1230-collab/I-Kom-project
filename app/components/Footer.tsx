import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white font-bold text-lg">
                I
              </div>
              <span className="text-xl font-bold text-gradient">I-Kom</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              ศูนย์รวมคอมพิวเตอร์คุณภาพสูง ซื้อ-เช่าได้ พร้อม AI ช่วยแนะนำสเปค
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:glow-blue transition-all" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:glow-blue transition-all" aria-label="Line">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:glow-blue transition-all" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              เมนูหลัก
            </h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">หน้าหลัก</Link></li>
              <li><Link href="/shop" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">ซื้อ-เช่าคอม</Link></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">โปรโมชั่น</a></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">บทความ</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              บริการ
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">ซ่อมคอมพิวเตอร์</a></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">อัพเกรดสเปค</a></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">ติดตั้งซอฟต์แวร์</a></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">เคลมประกัน</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              ติดต่อเรา
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                02-XXX-XXXX
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                contact@i-kom.com
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[var(--accent-blue)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                กรุงเทพมหานคร ประเทศไทย
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © 2026 I-Kom. สงวนลิขสิทธิ์ทุกประการ
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/terms" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">เงื่อนไขการใช้งาน</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
