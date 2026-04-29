"use client";

import { useState, useRef, useEffect } from "react";
import { products, formatPrice, Product } from "./ProductData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

import { generateAIResponse, quickQuestions } from "./AIEngine";

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatBot({ isOpen, onToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "สวัสดีครับ! 👋 ผมเป็น AI ผู้ช่วยของ I-Kom\n\nถามเรื่องคอมพิวเตอร์ได้เลยครับ เช่น:\n• แนะนำคอมเล่นเกม\n• คอมทำงาน งบ 20,000\n• ราคาเช่าคอม\n• เปรียบเทียบสเปค",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateAIResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text,
        products: response.products,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform animate-pulse-glow"
          aria-label="เปิด AI Chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-pink)] border-2 border-[var(--bg-primary)] animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] rounded-2xl glass border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">I-Kom AI</h3>
                <span className="flex items-center gap-1 text-xs text-[var(--accent-green)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse" />
                  ออนไลน์
                </span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-secondary)]"
              aria-label="ปิด Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white rounded-br-md"
                      : "glass text-[var(--text-primary)] rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product.id}
                          className="rounded-lg bg-white/10 p-3 border border-white/10"
                        >
                          <div className="font-semibold text-xs mb-1">{product.name}</div>
                          <div className="text-[0.65rem] opacity-80 mb-1.5">
                            {product.specs.slice(0, 2).join(" • ")}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">
                              ฿{formatPrice(product.buyPrice)}
                            </span>
                            <span className="text-[0.6rem] opacity-60">
                              เช่า ฿{formatPrice(product.rentPrice)}/ด.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-[0.65rem] px-2.5 py-1.5 rounded-full glass-light text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:border-[var(--accent-blue)]/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-[var(--border-color)] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]/50 transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-[var(--accent-blue)]/20 transition-all disabled:hover:shadow-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
