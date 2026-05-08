import { products, formatPrice, Product } from "./ProductData";

/**
 * Enhanced AI Engine for I-Kom Computer Store
 * Focuses on stability, better intent recognition, and localized Thai responses.
 */

export const quickQuestions = [
  "แนะนำคอมเล่นเกม งบ 30,000",
  "โน๊ตบุ๊คทำงาน น้ำหนักเบา",
  "อยากเช่าคอมรายเดือน",
  "คอมสำหรับตัดต่อวิดีโอ 4K",
  "สอบถามเรื่องการรับประกัน",
  "ที่ร้านมีผ่อน 0% ไหม?",
];

// Helper to normalize Thai text for better matching
const normalizeThai = (text: string) => {
  return text.toLowerCase()
    .replace(/[เแโใไ]/g, (m) => ({ 'เ': 'เ', 'แ': 'แ', 'โ': 'โ', 'ใ': 'ใ', 'ไ': 'ไ' }[m] || m))
    .trim();
};

export function generateAIResponse(userMessage: string): { text: string; products?: Product[] } {
  if (!userMessage || userMessage.trim().length === 0) {
    return { text: "สวัสดีครับ มีอะไรให้ผมช่วยไหมครับ? พิมพ์สอบถามสเปคหรือราคากับผมได้เลยครับ" };
  }

  const msg = normalizeThai(userMessage);

  // 1. Better Budget Detection (Supports "30k", "30,000", "3 หมื่น")
  let budget: number | null = null;
  
  // Pattern: 30,000 or 30000
  const numericMatch = msg.match(/(\d{1,3}[,.]?\d{3})/);
  if (numericMatch) {
    budget = parseInt(numericMatch[1].replace(/[,.]/g, ""));
  } 
  // Pattern: 30k or 30K
  else if (msg.match(/(\d+)\s*k/i)) {
    const kMatch = msg.match(/(\d+)\s*k/i);
    if (kMatch) budget = parseInt(kMatch[1]) * 1000;
  }
  // Pattern: 3 หมื่น
  else if (msg.includes("หมื่น")) {
    const mMatch = msg.match(/(\d+)\s*หมื่น/);
    if (mMatch) budget = parseInt(mMatch[1]) * 10000;
  }

  // 2. Intent Categorization
  const isGreeting = /(สวัสดี|หวัดดี|ทัก|hi|hello|hey|ดีครับ|ดีค่ะ)/i.test(msg);
  const isGaming = /(เกม|gaming|game|สตรีม|stream|เล่นเกม|esport|pubg|valorant)/i.test(msg);
  const isWork = /(ทำงาน|office|สำนักงาน|เอกสาร|เรียน|zoom|ประชุม|online)/i.test(msg);
  const isLaptop = /(โน๊ตบุ๊ค|laptop|แล็ปท็อป|พกพา|macbook|notebook)/i.test(msg);
  const isCreative = /(ตัดต่อ|กราฟิก|3d|render|workstation|วิดีโอ|video|photoshop|premiere|ai|ออกแบบ)/i.test(msg);
  const isDev = /(เขียนโปรแกรม|coding|developer|code|เขียนเว็บ|docker|programmer)/i.test(msg);
  const isRental = /(เช่า|rent|รายเดือน|ยืม|สัญญา|มัดจำ)/i.test(msg);
  const isPayment = /(ผ่อน|0%|บัตรเครดิต|จ่ายเงิน|กี่งวด|กสิกร|scb|เงินสด)/i.test(msg);
  const isDelivery = /(ส่ง|จัดส่ง|delivery|ส่งฟรี|กี่วัน|ได้รับ)/i.test(msg);
  const isWarranty = /(ประกัน|ซ่อม|พัง|เสีย|เคลม|warranty|service|ดูแล)/i.test(msg);
  const isPriceQuery = /(ราคา|เท่าไหร่|กี่บาท|ถูก|แพง|งบ|งบประมาณ|price)/i.test(msg);

  // 3. Logic Flow

  // 3.1 Greeting
  if (isGreeting && msg.length < 10) {
    return {
      text: "สวัสดีครับ! ยินดีต้อนรับสู่ **I-Kom** 🙏 ผมเป็น AI ผู้ช่วยที่จะช่วยคุณเลือกคอมพิวเตอร์ที่ตอบโจทย์ที่สุดครับ\n\nบอกงบประมาณหรือการใช้งานที่ต้องการได้เลย เช่น:\n• 'แนะนำคอมเล่นเกมงบ 3 หมื่น'\n• 'อยากเช่าโน๊ตบุ๊คทำงาน'\n• 'คอมตัดต่อวิดีโอแรงๆ'",
    };
  }

  // 3.2 Payment & Installments
  if (isPayment) {
    return {
      text: "ที่ **I-Kom** เรามีทางเลือกการชำระเงินที่หลากหลายครับ 💳\n\n• **ผ่อน 0% นานสูงสุด 10 เดือน** ผ่านบัตรเครดิตที่ร่วมรายการ (KBank, SCB, BBL, KTC, Krungsri)\n• สำหรับการเช่า สามารถตัดบัตรเครดิตรายเดือนได้อัตโนมัติ\n• รองรับการโอนเงินและชำระด้วยเงินสด\n\nสนใจสเปคไหนเพื่อคำนวณยอดผ่อนไหมครับ?",
    };
  }

  // 3.3 Warranty
  if (isWarranty) {
    return {
      text: "เรื่องบริการหลังการขายคือจุดเด่นของเราครับ 🛡️\n\n• **สินค้าใหม่:** ประกันเต็ม 3 ปี พร้อม On-site Service (ซ่อมถึงที่)\n• **เครื่องเช่า:** บริการซ่อมบำรุงและดูแลซอฟต์แวร์ฟรีตลอดอายุสัญญา\n• **เครื่องสำรอง:** หากต้องซ่อมเกิน 3 วัน เรามีเครื่องสำรองให้ใช้ฟรีทันทีครับ",
    };
  }

  // 3.4 Delivery
  if (isDelivery) {
    return {
      text: "เราจัดส่งให้ **ฟรีทั่วประเทศไทย** ครับ! 🚚\n\n• **กรุงเทพฯ/ปริมณฑล:** ส่งด่วนภายใน 24-48 ชม. พร้อมช่างติดตั้งและเซ็ตระบบให้พร้อมใช้\n• **ต่างจังหวัด:** ส่งผ่านขนส่งเอกชนที่มีประกันสินค้า 100% ถึงมือภายใน 2-4 วันทำการครับ",
    };
  }

  // 3.5 Rental
  if (isRental && !isGaming && !isWork && !isLaptop) {
    return {
      text: "บริการเช่าคอมพิวเตอร์จาก I-Kom คุ้มค่าและยืดหยุ่นมากครับ 📋\n\n• ราคาเริ่มต้นเพียง ฿690/เดือน\n• สัญญาขั้นต่ำ 3 เดือน (ยิ่งเช่านานยิ่งถูกลง)\n• อัปเกรดสเปคได้ตลอดเมื่อต่อสัญญา\n• เหมาะสำหรับบริษัทหรือฟรีแลนซ์ที่ต้องการลดค่าใช้จ่ายก้อนใหญ่\n\nอยากดูรุ่นแนะนำสำหรับเช่าไหมครับ?",
    };
  }

  // 4. Recommendation Logic (Data-driven)
  let filtered = [...products];
  let responseText = "";

  if (isGaming) {
    filtered = filtered.filter(p => p.category === "gaming");
    responseText = "สายเกมเมอร์ต้องรุ่นพวกนี้เลยครับ สเปคแรง การ์ดจอ RTX ซีรีส์ล่าสุด เล่นลื่นทุกเกมแน่นอน 🎮";
  } else if (isLaptop) {
    filtered = filtered.filter(p => p.category === "laptop");
    responseText = "สำหรับเน้นพกพา แล็ปท็อปของเราคัดมาแต่รุ่นที่บางเบาแต่ประสิทธิภาพสูงครับ 💻";
  } else if (isWork) {
    filtered = filtered.filter(p => p.category === "office");
    responseText = "แนะนำรุ่นสำหรับทำงานออฟฟิศครับ เสถียร เปิดหลายโปรแกรมพร้อมกันได้ไม่ค้าง 🏢";
  } else if (isCreative) {
    filtered = filtered.filter(p => p.category === "workstation");
    responseText = "งานสายกราฟิก ตัดต่อ 3D หรือ AI แนะนำเป็น Workstation ระดับโปรครับ ประมวลผลไวประหยัดเวลา ⚙️";
  } else if (isDev) {
    filtered = products.filter(p => p.specs.some(s => s.includes("16GB") || s.includes("32GB") || s.includes("i7") || s.includes("M3")));
    responseText = "สำหรับสาย Developer ผมแนะนำรุ่นที่มี RAM 16GB ขึ้นไปเพื่อการรัน Docker หรือ IDE ได้ลื่นไหลครับ 👨‍💻";
  }

  // Apply Budget Filter
  if (budget) {
    const inBudget = filtered.filter(p => p.buyPrice <= budget);
    if (inBudget.length > 0) {
      filtered = inBudget;
      responseText = `ในงบไม่เกิน ฿${formatPrice(budget)} ผมคัดรุ่นที่คุ้มค่าที่สุดมาให้แล้วครับ 👇`;
    } else {
      return {
        text: `งบ ฿${formatPrice(budget)} สำหรับสเปคนี้อาจจะหายากนิดนึงครับ 😅 แต่ทาง I-Kom มีบริการ **เช่ารายเดือน** เริ่มต้นหลักร้อย ซึ่งจะได้สเปคที่แรงกว่างบซื้อขาดมาก สนใจดูเครื่องเช่าไหมครับ?`,
      };
    }
  }

  // 5. Final Response Construction
  if (filtered.length > 0) {
    return {
      text: responseText || "นี่คือรุ่นยอดนิยมที่น่าจะตอบโจทย์คุณครับ สอบถามรายละเอียดสเปคเพิ่มเติมได้เลยครับ ✨",
      products: filtered.slice(0, 3),
    };
  }

  // 6. Fallback (General Price Query)
  if (isPriceQuery && !budget) {
    return {
      text: "ราคาคอมพิวเตอร์ที่ร้านเรามีหลายระดับครับ:\n\n• 🏢 **สายทำงาน:** เริ่มต้น ฿12,900\n• 💻 **แล็ปท็อป:** เริ่มต้น ฿27,900\n• 🎮 **เกมมิ่ง:** เริ่มต้น ฿35,900\n• ⚙️ **เวิร์คสเตชั่น:** เริ่มต้น ฿189,900\n\n(หรือเช่าเริ่มต้นแค่ ฿690/เดือน) คุณมีงบประมาณในใจประมาณเท่าไหร่ครับ?",
    };
  }

  // 7. Default Fallback
  return {
    text: "ขออภัยครับ ผมอาจจะยังไม่เข้าใจความต้องการของคุณ 😅\n\nลองระบุสิ่งที่ต้องการ เช่น:\n1. ใช้งานแบบไหน? (เล่นเกม, ทำงาน, ตัดต่อ)\n2. มีงบประมาณเท่าไหร่? (เช่น 30,000 หรือ 50k)\n3. เน้นตั้งโต๊ะหรือพกพา?\n\nผมจะรีบหาเครื่องที่สเปคดีที่สุดให้ครับ! 🤖",
  };
}
