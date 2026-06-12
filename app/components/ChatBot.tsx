"use client";

import { useState, useEffect, useRef } from "react";
import { generateAIResponse } from "./AIEngine";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  products?: any[];
};

const quickQuestions = [
  "แนะนำคอมเล่นเกม งบ 30,000",
  "โน๊ตบุ๊คทำงาน น้ำหนักเบา",
  "อยากเช่าคอมรายเดือน",
  "คอมสำหรับตัดต่อวิดีโอ 4K",
  "สอบถามเรื่องการรับประกัน",
  "ที่ร้านมีผ่อน 0% ไหม?",
  "เปรียบเทียบ RTX 4060 กับ 4070",
  "คอมนักศึกษางบ 20,000",
  "เช่าระยะสั้น 1 เดือนได้ไหม?",
  "ร้านอยู่ที่ไหน เปิดกี่โมง",
];

const TOPIC_GROUPS = [
  { label: "🎮 เกม", q: "แนะนำคอมเล่นเกม งบ 30,000" },
  { label: "💻 แล็ปท็อป", q: "โน๊ตบุ๊คทำงาน น้ำหนักเบา" },
  { label: "🎓 นักศึกษา", q: "คอมนักศึกษางบ 20,000" },
  { label: "🎬 ตัดต่อ", q: "คอมสำหรับตัดต่อวิดีโอ 4K" },
  { label: "👨‍💻 Dev", q: "คอมเขียนโปรแกรม docker" },
  { label: "📋 เช่า", q: "อยากเช่าคอมรายเดือน" },
  { label: "💳 ผ่อน", q: "ที่ร้านมีผ่อน 0% ไหม?" },
  { label: "🛡️ ประกัน", q: "สอบถามเรื่องการรับประกัน" },
  { label: "🚚 จัดส่ง", q: "จัดส่งฟรีไหม กี่วันถึง" },
  { label: "📍 ร้าน", q: "ร้านอยู่ที่ไหน เปิดกี่โมง" },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "สวัสดีครับ! 👋 ผมเป็น AI ผู้ช่วยจาก **I-Kom** พร้อมให้คำแนะนำด้านคอมพิวเตอร์ครบจบที่เดียวครับ\n\nเลือกหัวข้อด้านล่าง หรือพิมพ์ถามได้เลย 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotif, setHasNotif] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    // Show user message immediately and clear input
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the Server Action
      const responseText = await generateAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: responseText,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("[ChatBot Error]:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "ขออภัยด้วยครับคุณลูกค้า 😅 ขณะนี้ระบบตอบคำถามขัดข้องชั่วคราว คุณลูกค้าสามารถลองใหม่อีกครั้ง หรือสอบถามข้อมูลเพิ่มเติมผ่านทาง LINE: @ikom-computer ได้เลยครับ!",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNotif(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="glass rounded-[2rem] w-[360px] sm:w-[420px] h-[600px] mb-4 flex flex-col shadow-2xl border-white/10 overflow-hidden pointer-events-auto"
          style={{ animation: "slideUp 0.25s ease" }}
        >
          {/* Header */}
          <div className="bg-[var(--gradient-primary)] p-4 flex items-center justify-between shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-widest">I-Kom AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-tighter">ออนไลน์พร้อมให้บริการ</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Topic Pills */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-black/20 border-b border-white/5 flex-shrink-0">
            {TOPIC_GROUPS.map((t) => (
              <button
                key={t.label}
                onClick={() => handleSendMessage(t.q)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-[var(--accent-blue)] text-white text-[10px] font-black rounded-lg border border-white/10 transition-all uppercase tracking-tighter flex-shrink-0 disabled:opacity-50"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]/50 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="h-7 w-7 bg-[var(--gradient-primary)] rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] ${
                    msg.role === "user"
                      ? "bg-[var(--accent-blue)] text-white rounded-2xl rounded-tr-none"
                      : "glass text-white rounded-2xl rounded-tl-none border-white/5"
                  } p-3 shadow-xl`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-black text-[var(--accent-cyan)] uppercase tracking-widest mb-2">
                        สินค้าแนะนำ ({msg.products.length} รุ่น):
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {msg.products.map((p: any) => (
                          <a
                            key={p.id}
                            href={`/products`}
                            className="min-w-[130px] glass-light rounded-xl p-2 border-white/5 group block hover:border-[var(--accent-blue)] border transition-all"
                          >
                            <div className="relative h-16 w-full mb-2 bg-white/5 rounded-lg overflow-hidden p-1">
                              <Image
                                src={p.image || "/laptop.png"}
                                alt={p.name}
                                fill
                                className="object-contain transition-transform group-hover:scale-110"
                              />
                            </div>
                            <p className="text-[9px] font-black text-white truncate mb-0.5">{p.name}</p>
                            <p className="text-[10px] font-black text-[var(--accent-blue)]">฿{p.buyPrice?.toLocaleString()}</p>
                            <p className="text-[9px] text-white/50">เช่า ฿{p.rentPrice?.toLocaleString()}/เดือน</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="h-7 w-7 bg-[var(--gradient-primary)] rounded-xl flex items-center justify-center flex-shrink-0 mr-2">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="glass rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center border-white/5">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-black/10 border-t border-white/5 flex-shrink-0">
            {quickQuestions.slice(0, 5).map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 text-[9px] font-bold rounded-lg border border-white/5 transition-all flex-shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-[var(--bg-primary)] flex-shrink-0">
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[var(--accent-blue)] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
                placeholder={isLoading ? "กำลังประมวลผลคำตอบ..." : "ถามอะไรก็ได้เกี่ยวกับคอมพิวเตอร์..."}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-white font-medium placeholder:text-white/30 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="h-9 w-9 bg-[var(--accent-blue)] text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-blue-500/20 flex-shrink-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-gray-400 text-[9px] mt-1.5 font-medium">AI ให้ข้อมูลเบื้องต้น • ยืนยันกับพนักงานก่อนตัดสินใจ</p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="pointer-events-auto h-16 w-16 bg-[var(--gradient-primary)] text-white rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 transition-all group relative border-4 border-white/10"
      >
        {isOpen ? (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {hasNotif && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse"></span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}
