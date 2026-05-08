"use client";

import { useState, useEffect, useRef } from "react";
import { generateAIResponse, quickQuestions } from "./AIEngine";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  products?: any[];
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "สวัสดีครับ! ผมเป็น AI ผู้ช่วยจาก I-Kom ยินดีให้บริการครับ มีอะไรให้ช่วยแนะนำไหมครับ? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.text,
        products: response.products,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="glass rounded-[2rem] w-[350px] sm:w-[400px] h-[550px] mb-4 flex flex-col shadow-2xl border-white/10 overflow-hidden pointer-events-auto animate-in">
          {/* Header */}
          <div className="bg-[var(--gradient-primary)] p-5 flex items-center justify-between shadow-lg">
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
            <button onClick={() => setIsOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth bg-[var(--bg-primary)]/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-[var(--accent-blue)] text-white rounded-2xl rounded-tr-none" : "glass text-white rounded-2xl rounded-tl-none border-white/5"} p-4 shadow-xl`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                  
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-black text-[var(--accent-cyan)] uppercase tracking-widest">สินค้าแนะนำ:</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {msg.products.map((p: any) => (
                          <div key={p.id} className="min-w-[140px] glass-light rounded-xl p-2 border-white/5 group">
                            <div className="relative h-20 w-full mb-2 bg-white/5 rounded-lg overflow-hidden p-1">
                              <Image src={p.image || "/laptop.png"} alt={p.name} fill className="object-contain transition-transform group-hover:scale-110" />
                            </div>
                            <p className="text-[10px] font-black text-white truncate mb-1">{p.name}</p>
                            <p className="text-[11px] font-black text-[var(--accent-blue)]">฿{p.buyPrice?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl rounded-tl-none p-4 flex gap-1 items-center border-white/5">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-black/20 border-y border-white/5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-[var(--accent-blue)] text-white text-[10px] font-black rounded-lg border border-white/10 transition-all uppercase tracking-tighter"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-[var(--bg-primary)]">
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[var(--accent-blue)] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="พิมพ์ข้อความที่นี่..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-white font-medium"
              />
              <button
                onClick={() => handleSend(input)}
                className="h-10 w-10 bg-[var(--accent-blue)] text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto h-16 w-16 bg-[var(--gradient-primary)] text-white rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 transition-all group relative border-4 border-white/10"
      >
        {isOpen ? (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
          </div>
        )}
      </button>
    </div>
  );
}
