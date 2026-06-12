"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Server Action that calls Google Gemini API (gemini-1.5-flash) to generate a response.
 * Uses systemInstructions to establish the persona of the I-Kom AI Assistant.
 */
export async function generateAIResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[AIEngine Error]: GEMINI_API_KEY is not defined in environment variables.");
    return "สวัสดีครับ! ยินดีต้อนรับสู่ร้าน I-Kom ครับ 😅 ขณะนี้ช่องทางการตอบคำถาม AI กำลังปิดปรับปรุงชั่วคราว คุณลูกค้าสามารถสอบถามข้อมูลสเปกคอม เช่า หรือผ่อนสินค้ากับพนักงานหน้าร้านโดยตรงได้เลยที่ LINE: @ikom-computer ครับ!";
  }

  if (!userMessage || !userMessage.trim()) {
    return "สวัสดีครับ! ผมคือ I-Kom AI Assistant ยินดีให้บริการครับ มีอะไรสอบถามเกี่ยวกับสเปกคอมพิวเตอร์ การจัดสเปกเล่นเกม หรือบริการเช่า/ซื้อขาดคอมพิวเตอร์ไหมครับ? 😊";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction:
        "คุณคือ 'I-Kom AI Assistant' ผู้ช่วยอัจฉริยะของร้าน I-Kom คุณเชี่ยวชาญด้านฮาร์ดแวร์คอมพิวเตอร์ การจัดสเปกคอมเล่นเกม และการให้ข้อมูลเกี่ยวกับการเช่าคอมพิวเตอร์ ให้ตอบคำถามลูกค้าอย่างสุภาพ เป็นกันเอง กระชับ และอ่านง่าย (ใช้ Emoji ได้นิดหน่อย)",
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const textResponse = response.text();

    return textResponse || "ขออภัยด้วยครับ ผมไม่พบข้อมูลสเปกที่เหมาะสมสำหรับการตอบคำถามนี้ มีอะไรเพิ่มเติมให้ผมช่วยตรวจสอบอีกไหมครับ?";
  } catch (error) {
    console.error("[AIEngine API Error]:", error);
    return "ขออภัยด้วยนะครับคุณลูกค้า 😅 ระบบวิเคราะห์ข้อมูลของผมขัดข้องชั่วคราว คุณลูกค้าสามารถลองใหม่อีกครั้ง หรือสอบถามข้อมูลเพิ่มเติมจากทางเพจ/LINE: @ikom-computer ได้เลยครับ!";
  }
}
