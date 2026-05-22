import { products, formatPrice, Product } from "./ProductData";

export interface ChatContext {
  lastIntent?: string;
  lastBudget?: number;
  lastCategory?: string;
  turnCount: number;
}

export const quickQuestions = [
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

const normalize = (text: string) => text.toLowerCase().trim();

function extractBudget(msg: string): number | null {
  const numericFull = msg.match(/(\d{1,3}[,.]?\d{3})/);
  if (numericFull) return parseInt(numericFull[1].replace(/[,.]/g, ""));
  const kMatch = msg.match(/(\d+)\s*k/i);
  if (kMatch) return parseInt(kMatch[1]) * 1000;
  const muenMatch = msg.match(/(\d+)\s*หมื่น/);
  if (muenMatch) return parseInt(muenMatch[1]) * 10000;
  const lakhMatch = msg.match(/(\d+)\s*แสน/);
  if (lakhMatch) return parseInt(lakhMatch[1]) * 100000;
  return null;
}

export function generateAIResponse(
  userMessage: string,
  context: ChatContext = { turnCount: 0 }
): { text: string; products?: Product[]; newContext?: Partial<ChatContext> } {
  if (!userMessage.trim()) {
    return { text: "สวัสดีครับ มีอะไรให้ผมช่วยไหมครับ?" };
  }

  const msg = normalize(userMessage);
  const budget = extractBudget(msg) || context.lastBudget || null;

  // ─── Intents ───────────────────────────────────────────────
  const isGreeting = /(สวัสดี|หวัดดี|hi|hello|hey|ดีครับ|ดีค่ะ|มีใครอยู่ไหม)/i.test(msg);
  const isGaming = /(เกม|gaming|game|สตรีม|stream|esport|pubg|valorant|fps|mmorpg)/i.test(msg);
  const isWork = /(ทำงาน|office|สำนักงาน|เอกสาร|zoom|ประชุม|excel|word)/i.test(msg);
  const isStudy = /(เรียน|นักศึกษา|นักเรียน|มหาวิทยาลัย|มอ|มช|จุฬา|วิศวะ|ไอที)/i.test(msg);
  const isLaptop = /(โน๊ตบุ๊ค|laptop|แล็ปท็อป|พกพา|macbook|notebook|พกพาง่าย)/i.test(msg);
  const isCreative = /(ตัดต่อ|กราฟิก|3d|render|workstation|วิดีโอ|video|photoshop|premiere|ออกแบบ|illustrator|davinci|blender)/i.test(msg);
  const isDev = /(เขียนโปรแกรม|coding|developer|code|เขียนเว็บ|docker|vm|virtual|programmer|react|python|javascript)/i.test(msg);
  const isRental = /(เช่า|rent|รายเดือน|ยืม|สัญญา|มัดจำ)/i.test(msg);
  const isPayment = /(ผ่อน|0%|บัตรเครดิต|จ่ายเงิน|กี่งวด|กสิกร|scb|ทรู|qr|promptpay|เงินสด)/i.test(msg);
  const isDelivery = /(ส่ง|จัดส่ง|delivery|ส่งฟรี|กี่วัน|ได้รับ|ขนส่ง)/i.test(msg);
  const isWarranty = /(ประกัน|ซ่อม|พัง|เสีย|เคลม|warranty|service|บริการหลัง)/i.test(msg);
  const isCompare = /(เปรียบเทียบ|compare|ต่างกัน|ดีกว่า|vs|หรือ.*ดี|แบบไหนดี)/i.test(msg);
  const isShopInfo = /(ร้าน|ที่อยู่|เปิด|ปิด|เวลา|location|แผนที่|ติดต่อ|โทร|line|facebook)/i.test(msg);
  const isSpec = /(สเปค|spec|cpu|gpu|ram|การ์ดจอ|processor|i5|i7|i9|ryzen|rtx|gtx|m3|m2)/i.test(msg);
  const isPriceQuery = /(ราคา|เท่าไหร่|กี่บาท|ถูก|แพง|งบ|งบประมาณ|price)/i.test(msg);
  const isThankYou = /(ขอบคุณ|ขอบใจ|thanks|thank|โอเค|โอเค|ok|เข้าใจ|รับทราบ)/i.test(msg);
  const isShortRental = /(1 เดือน|สั้น|ชั่วคราว|แค่เดือนเดียว|ระยะสั้น)/i.test(msg);

  // ─── RTX compare ───
  const compareRTX = /(rtx.*4060.*4070|rtx.*4070.*4060|4060.*4070|4070.*4060)/i.test(msg);

  // ─── Thank you ───
  if (isThankYou) {
    return {
      text: "ด้วยความยินดีครับ 😊 ถ้ามีอะไรให้ช่วยเพิ่มเติม ถามได้เลยนะครับ!",
    };
  }

  // ─── Greeting ───
  if (isGreeting && msg.length < 15) {
    return {
      text: "สวัสดีครับ! 👋 ยินดีต้อนรับสู่ **I-Kom** ผมเป็น AI ผู้ช่วยประจำร้านครับ\n\nผมช่วยคุณได้เรื่อง:\n• แนะนำสินค้าตามการใช้งานและงบประมาณ\n• เปรียบเทียบสเปคและรุ่น\n• บริการเช่า/ผ่อน/ประกัน\n• ข้อมูลร้านและการจัดส่ง\n\nมีอะไรให้ช่วยไหมครับ?",
    };
  }

  // ─── Shop Info ───
  if (isShopInfo) {
    return {
      text: "📍 **I-Kom Computer Store**\n\n🏪 **ที่อยู่:** 123 ถ.นิมมานเหมินทร์ ซอย 7 เชียงใหม่ 50200\n⏰ **เวลาเปิด:** จันทร์–เสาร์ 09:00–19:00 น. (อาทิตย์ปิด)\n📞 **โทร:** 053-XXX-XXX\n💬 **LINE:** @ikom-computer\n📘 **Facebook:** /ikomcomputer\n\n✈️ นอกจากหน้าร้านยังมีบริการออนไลน์ครับ สั่งได้ตลอด 24 ชม.!",
    };
  }

  // ─── Warranty ───
  if (isWarranty) {
    return {
      text: "🛡️ **บริการหลังการขาย I-Kom**\n\n**สินค้าซื้อขาด:**\n• ประกันศูนย์ 3 ปี\n• On-site Service ซ่อมถึงที่ (กรุงเทพฯ/เชียงใหม่)\n• เครื่องสำรองให้ใช้ฟรีหากซ่อมนานกว่า 3 วัน\n\n**เครื่องเช่า:**\n• ซ่อม/เปลี่ยนอะไหล่ฟรีตลอดสัญญา\n• ดูแลซอฟต์แวร์ฟรี (ลง OS ใหม่ กำจัดไวรัส)\n• เปลี่ยนเครื่องทันทีถ้าเสียหายรุนแรง\n\n📞 แจ้งซ่อมได้ตลอด ผ่าน LINE: @ikom-computer",
    };
  }

  // ─── Payment / Installment ───
  if (isPayment) {
    return {
      text: "💳 **ช่องทางชำระเงิน I-Kom**\n\n**ซื้อขาด:**\n• เงินสด / โอนธนาคาร / QR Code\n• บัตรเครดิตทุกธนาคาร\n• **ผ่อน 0% นาน 10 เดือน** (KBank, SCB, BBL, KTC, Krungsri)\n\n**เช่ารายเดือน:**\n• ตัดบัตรเครดิตอัตโนมัติทุกเดือน\n• โอนรายเดือนก็ได้ครับ\n\n💡 ตัวอย่าง: เครื่อง ฿60,000 ผ่อน 10 เดือน = เดือนละ ฿6,000 เท่านั้น!",
    };
  }

  // ─── Delivery ───
  if (isDelivery) {
    return {
      text: "🚚 **บริการจัดส่ง I-Kom**\n\n• **กรุงเทพฯ/ปริมณฑล:** ส่งด่วน 24-48 ชม. พร้อมช่างติดตั้ง **ฟรี**\n• **เชียงใหม่:** ส่งฟรีภายในวัน (สั่งก่อน 12:00)\n• **ต่างจังหวัด:** Kerry / Flash Express ภายใน 2-4 วันทำการ ประกัน 100%\n• **ฟรีค่าส่งทุกออเดอร์** ไม่มีขั้นต่ำ\n\n📦 มีบรรจุภัณฑ์พิเศษกันกระแทกสำหรับอุปกรณ์อิเล็กทรอนิกส์โดยเฉพาะครับ",
    };
  }

  // ─── Short-term rental ───
  if (isShortRental && isRental) {
    return {
      text: "📋 **เช่าระยะสั้น (1 เดือน) ได้ไหม?**\n\nได้ครับ! แต่มีเงื่อนไขนิดหน่อย:\n\n• **เช่า 1 เดือน:** ราคาสูงกว่า rate ปกติ ~20%\n• **เช่า 3 เดือน:** ราคา Standard (แนะนำ)\n• **เช่า 6+ เดือน:** ลด 10% จาก rate ปกติ\n• **เช่า 12 เดือน:** ลด 15% + ฟรีบริการล้างเครื่องปีละครั้ง\n\n💡 มัดจำ 1 เดือน (คืนเมื่อส่งคืนเครื่องในสภาพดี)\n\nอยากดูรุ่นที่เปิดรับเช่าตอนนี้ไหมครับ?",
    };
  }

  // ─── Rental (general) ───
  if (isRental && !isGaming && !isWork && !isLaptop && !isStudy) {
    return {
      text: "📋 **บริการเช่าคอมพิวเตอร์ I-Kom**\n\n• ราคาเริ่มต้น **฿690/เดือน**\n• สัญญาขั้นต่ำ 1 เดือน (ยิ่งนานยิ่งถูก)\n• ครอบคลุม: ซ่อมฟรี, ดูแลซอฟต์แวร์ฟรี\n• อัปเกรดสเปคได้เมื่อต่อสัญญา\n• เหมาะสำหรับ: นักศึกษา, ฟรีแลนซ์, บริษัท Startup\n\n**ทำไมต้องเช่าแทนซื้อ?**\n→ ประหยัดเงินก้อนใหญ่ตอนต้น\n→ ได้สเปคสูงกว่างบซื้อขาด\n→ ไม่กังวลเรื่องเครื่องเสื่อม\n\nบอกการใช้งานมาได้เลย แล้วผมจะแนะนำรุ่นที่เหมาะที่สุดครับ 😊",
    };
  }

  // ─── GPU Comparison ───
  if (compareRTX) {
    return {
      text: "⚡ **เปรียบเทียบ RTX 4060 vs RTX 4070**\n\n| ประเด็น | RTX 4060 Ti | RTX 4070 |\n|---------|------------|----------|\n| ราคา | ~฿12,000 | ~฿18,000 |\n| VRAM | 8GB | 12GB |\n| 1080p | ยอดเยี่ยม | เกินพอ |\n| 1440p | ดีมาก | ยอดเยี่ยม |\n| 4K | พอได้ | ดี |\n| ประหยัดไฟ | ดี | ดีมาก |\n\n**สรุป:**\n• เลือก **RTX 4060 Ti** ถ้าเล่น 1080p-1440p งบจำกัด\n• เลือก **RTX 4070** ถ้าเน้น 1440p หรืออยากอยู่ได้นานกว่า\n\nอยากดูเครื่องที่มี RTX ซีรีส์นี้ไหมครับ?",
    };
  }

  // ─── Spec Questions ───
  if (isSpec && !isGaming && !isCreative && !isDev) {
    return {
      text: "🔧 **สเปคที่ควรรู้ก่อนซื้อคอม**\n\n**CPU (โปรเซสเซอร์):**\n• i5 / Ryzen 5 → ทำงาน, เรียน\n• i7 / Ryzen 7 → เกม, ตัดต่อ, Dev\n• i9 / Ryzen 9 → งานหนัก, Render\n\n**RAM:**\n• 8GB → ทำงานทั่วไป\n• 16GB → เกม, Dev, ตัดต่อ\n• 32GB+ → Workstation, AI/ML\n\n**GPU (การ์ดจอ):**\n• Integrated → ทำงาน, เรียน\n• RTX 4060 → เกม 1080p-1440p\n• RTX 4070+ → เกม 4K, ตัดต่อ\n• RTX 4090 → Workstation, AI\n\nอยากให้แนะนำสเปคสำหรับการใช้งานอะไรครับ?",
    };
  }

  // ─── Recommendation Engine ───
  let filtered = [...products];
  let responseText = "";
  let newIntent = context.lastIntent;

  if (isStudy && !isGaming) {
    if (isLaptop || !msg.includes("ตั้งโต๊ะ")) {
      filtered = filtered.filter((p) => p.category === "laptop");
      responseText =
        "สำหรับนักศึกษา แนะนำแล็ปท็อปครับ พกพาสะดวก เข้าห้องสมุด ห้องเรียนได้ทันที 🎓";
    } else {
      filtered = filtered.filter((p) => p.category === "office");
      responseText =
        "คอมตั้งโต๊ะสายเรียนเน้นประหยัด แต่สเปคใช้งานได้ดีครับ 🖥️";
    }
    newIntent = "study";
  } else if (isGaming) {
    filtered = filtered.filter((p) => p.category === "gaming");
    responseText =
      "สายเกมเมอร์ต้องรุ่นพวกนี้เลยครับ การ์ดจอ RTX ล่าสุด เล่นลื่นทุกเกม 🎮";
    newIntent = "gaming";
  } else if (isLaptop) {
    filtered = filtered.filter((p) => p.category === "laptop");
    responseText =
      "แล็ปท็อปของเรา บางเบาแต่สเปคไม่ธรรมดาครับ 💻";
    newIntent = "laptop";
  } else if (isWork) {
    filtered = filtered.filter((p) => p.category === "office");
    responseText =
      "แนะนำรุ่นสำนักงานครับ เสถียร เปิดหลายโปรแกรมพร้อมกันได้ไม่ค้าง 🏢";
    newIntent = "office";
  } else if (isCreative) {
    filtered = filtered.filter((p) => p.category === "workstation");
    responseText =
      "งานกราฟิก ตัดต่อ 3D หรือ AI แนะนำ Workstation ระดับโปรครับ ⚙️";
    newIntent = "workstation";
  } else if (isDev) {
    filtered = products.filter((p) =>
      p.specs.some(
        (s) =>
          s.includes("16GB") ||
          s.includes("32GB") ||
          s.includes("i7") ||
          s.includes("M3")
      )
    );
    responseText =
      "สาย Dev แนะนำรุ่นที่ RAM 16GB+ รัน Docker, IDE ได้ลื่นไหลครับ 👨‍💻";
    newIntent = "dev";
  } else if (context.lastIntent && context.lastCategory) {
    // Continue from context
    filtered = filtered.filter((p) => p.category === context.lastCategory);
    responseText = "ตามที่คุณสนใจอยู่ นี่คือตัวเลือกเพิ่มเติมครับ 👇";
  }

  // Apply budget filter
  if (budget) {
    const inBudget = filtered.filter((p) => p.buyPrice <= budget);
    if (inBudget.length > 0) {
      filtered = inBudget;
      responseText = `ในงบไม่เกิน ฿${formatPrice(budget)} ผมคัดรุ่นที่คุ้มค่าที่สุดมาให้แล้วครับ 👇`;
    } else {
      return {
        text: `งบ ฿${formatPrice(budget)} สำหรับสเปคนี้อาจจะหายากครับ 😅\n\nแต่มีทางเลือกอื่น:\n• **เช่ารายเดือน** — ได้สเปคสูงกว่ามาก เริ่มต้นหลักร้อย\n• **ผ่อน 0%** — กระจายจ่ายนาน 10 เดือน ไม่กระทบกระแสเงินสด\n\nสนใจดูตัวเลือกไหนครับ?`,
        newContext: { lastBudget: budget },
      };
    }
  }

  if (filtered.length > 0) {
    return {
      text:
        responseText ||
        "นี่คือรุ่นยอดนิยมที่น่าจะตอบโจทย์ครับ สอบถามรายละเอียดเพิ่มเติมได้เลย ✨",
      products: filtered.slice(0, 3),
      newContext: {
        lastIntent: newIntent,
        lastBudget: budget || undefined,
        lastCategory: filtered[0]?.category,
      },
    };
  }

  // Price overview fallback
  if (isPriceQuery && !budget) {
    return {
      text: "ราคาที่ร้านมีหลายระดับครับ:\n\n• 🏢 **สายทำงาน:** เริ่ม ฿12,900\n• 💻 **แล็ปท็อป:** เริ่ม ฿27,900\n• 🎮 **เกมมิ่ง:** เริ่ม ฿35,900\n• ⚙️ **เวิร์คสเตชั่น:** เริ่ม ฿189,900\n• 📋 **เช่ารายเดือน:** เริ่ม ฿690/เดือน\n\nมีงบในใจประมาณเท่าไหร่ครับ?",
    };
  }

  // Default fallback
  return {
    text: "ขออภัยครับ ผมอาจจะยังไม่เข้าใจ 😅\n\nลองบอกผมว่า:\n1. จะใช้คอมทำอะไร? (เกม / ทำงาน / เรียน / ตัดต่อ)\n2. งบประมาณเท่าไหร่?\n3. เน้นตั้งโต๊ะหรือพกพา?\n\nหรือกดปุ่มคำถามด้านบนเพื่อเริ่มได้เลยครับ 🤖",
  };
}
