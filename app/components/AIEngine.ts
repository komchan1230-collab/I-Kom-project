import { products, formatPrice, Product } from "./ProductData";

export const quickQuestions = [
  "คอมเล่นเกม งบ 30,000",
  "แล็ปท็อปทำงาน เบาๆ",
  "เช่าคอมราคาเท่าไหร่",
  "คอมตัดต่อวิดีโอ",
  "มีผ่อน 0% ไหม?",
  "คอมเขียนโปรแกรม",
];

export function generateAIResponse(userMessage: string): { text: string; products?: Product[] } {
  const msg = userMessage.toLowerCase();

  // 1. Budget Detection
  const budgetMatch = msg.match(/(\d{1,3}[,.]?\d{3})/);
  const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/[,.]/g, "")) : null;

  // 2. Greeting
  if (msg.includes("สวัสดี") || msg.includes("หวัดดี") || msg.includes("hello") || msg.includes("hi") || msg === "ดี" || msg === "ทัก") {
    return {
      text: "สวัสดีครับ! 👋 ยินดีต้อนรับสู่ I-Kom ผมเป็น AI ผู้ช่วยของร้านครับ ช่วยอะไรได้บ้างครับ?\n\n• ให้ผมแนะนำสเปคคอมให้ (บอกงบและการใช้งานมาได้เลย)\n• สอบถามราคาเช่า\n• สอบถามเรื่องการจัดส่งและการรับประกัน",
    };
  }

  // 3. Payment & Installment (ผ่อนชำระ)
  if (msg.includes("ผ่อน") || msg.includes("บัตรเครดิต") || msg.includes("งวด") || msg.includes("installment")) {
    return {
      text: "การชำระเงินที่ I-Kom สะดวกมากครับ! 💳\n\n• สามารถผ่อน 0% ได้นานสูงสุด 10 เดือน ผ่านบัตรเครดิตที่ร่วมรายการ (KBank, SCB, BBL, KTC, Krungsri)\n• หากเป็นการเช่า สามารถหักผ่านบัตรเครดิตรายเดือนได้เลยครับ\n\nสนใจดูสินค้าหมวดไหนเป็นพิเศษไหมครับ?",
    };
  }

  // 4. Warranty & Support (ประกัน/ซ่อม)
  if (msg.includes("ประกัน") || msg.includes("รับประกัน") || msg.includes("ซ่อม") || msg.includes("พัง") || msg.includes("เสีย") || msg.includes("เคลม")) {
    return {
      text: "อุ่นใจได้เลยครับ! 🛡️ ทุกเครื่องที่ซื้อจาก I-Kom:\n\n• รับประกันเต็ม 3 ปี (On-site service ในกรุงเทพฯ และปริมณฑล)\n• มีเครื่องสำรองให้ใช้ระหว่างซ่อม\n• ส่วนเครื่องเช่า เรามีบริการซ่อมบำรุงฟรีตลอดอายุสัญญาครับ!",
    };
  }

  // 5. Delivery (การจัดส่ง)
  if (msg.includes("ส่ง") || msg.includes("จัดส่ง") || msg.includes("กี่วัน") || msg.includes("delivery") || msg.includes("ค่าส่ง")) {
    return {
      text: "เราจัดส่งให้ **ฟรีทั่วประเทศ** ครับ! 🚚\n\n• กรุงเทพฯ และปริมณฑล: ได้รับของภายใน 1-2 วันทำการ (พร้อมช่างติดตั้งให้ฟรี)\n• ต่างจังหวัด: 2-4 วันทำการ พร้อมแพ็คเกจกันกระแทกอย่างดี มีประกันการขนส่งครับ",
    };
  }

  // 6. Use Cases & Categories
  // 6.1 Gaming
  if (msg.includes("เกม") || msg.includes("gaming") || msg.includes("game") || msg.includes("สตรีม") || msg.includes("stream")) {
    const gamingProducts = products.filter((p) => p.category === "gaming");
    if (budget) {
      const inBudget = gamingProducts.filter((p) => p.buyPrice <= budget);
      if (inBudget.length > 0) {
        return {
          text: `สำหรับงบ ฿${formatPrice(budget)} ผมคัดคอมเล่นเกมตัวคุ้มมาให้ครับ! สเปคนี้เล่นลื่นแน่นอน 🎮`,
          products: inBudget.slice(0, 3),
        };
      } else {
        return {
          text: `งบ ฿${formatPrice(budget)} สำหรับคอมเกมมิ่งอาจจะค่อนข้างจำกัดครับ แต่เรามีบริการ "เช่าคอม" ที่อาจจะตอบโจทย์กว่า สนใจดูเครื่องเช่าสเปคแรงๆ ไหมครับ? 💡`,
          products: gamingProducts.slice(0, 2),
        };
      }
    }
    return {
      text: "สายเกมเมอร์มาทางนี้เลยครับ! 🎮 เรามีตั้งแต่สเปคเริ่มต้นเล่นเกม Esports ลื่นๆ ไปจนถึงระดับ 4K Ultra และสำหรับการสตรีมมิ่ง ดูรุ่นฮิตของเราก่อนได้ครับ หรือบอกงบมาได้เลย",
      products: gamingProducts.slice(0, 3),
    };
  }

  // 6.2 Laptop
  if (msg.includes("แล็ปท็อป") || msg.includes("laptop") || msg.includes("โน๊ตบุ๊ค") || msg.includes("notebook") || msg.includes("พกพา") || msg.includes("เบา")) {
    const laptopProducts = products.filter((p) => p.category === "laptop");
    if (budget) {
      const inBudget = laptopProducts.filter((p) => p.buyPrice <= budget);
      if (inBudget.length > 0) {
         return {
          text: `เจอแล้วครับ แล็ปท็อปในงบ ฿${formatPrice(budget)} สเปคดี พกพาสะดวก 💻`,
          products: inBudget.slice(0, 3),
        };
      }
    }
    return {
      text: "กำลังมองหาแล็ปท็อปอยู่ใช่ไหมครับ? 💻 เรามีทั้งรุ่นบางเบาแบตอึดๆ สำหรับสายทำงาน และรุ่นสเปคแรงสำหรับสายเกมเมอร์/ครีเอเตอร์ครับ นี่คือรุ่นแนะนำ:",
      products: laptopProducts.slice(0, 3),
    };
  }

  // 6.3 Programmer / Developer
  if (msg.includes("เขียนโปรแกรม") || msg.includes("code") || msg.includes("dev") || msg.includes("โปรแกรมเมอร์") || msg.includes("เขียนเว็บ")) {
    // Recommend macbook or decent office/laptop
    const devProducts = products.filter(p => p.name.includes("PRO 15") || p.name.includes("SWIFT") || p.name.includes("OFFICE MAX"));
    return {
      text: "สำหรับสาย Dev / เขียนโปรแกรม แนะนำให้เน้น RAM (16GB ขึ้นไป) และ CPU หลายคอร์ครับ เพื่อการรัน Docker หรือเปิดหลายโปรเจกต์พร้อมกัน นี่คือตัวท็อปสำหรับนักพัฒนาครับ 👨‍💻",
      products: devProducts.slice(0, 3),
    };
  }

  // 6.4 Office / Student
  if (msg.includes("ทำงาน") || msg.includes("สำนักงาน") || msg.includes("office") || msg.includes("เรียน") || msg.includes("เอกสาร") || msg.includes("พิมพ์งาน")) {
    const officeProducts = products.filter((p) => p.category === "office");
    if (budget) {
      const inBudget = officeProducts.filter((p) => p.buyPrice <= budget);
      if (inBudget.length > 0) {
        return {
          text: `คอมทำงานในงบ ฿${formatPrice(budget)} มีครับ! ใช้งาน Office, เข้าเว็บ, เรียนออนไลน์ ได้สบายๆ เลย 🏢`,
          products: inBudget.slice(0, 3),
        };
      }
    }
    return {
      text: "คอมสำหรับใช้งานทั่วไป พิมพ์งาน เรียนออนไลน์ ไม่จำเป็นต้องสเปคสูงมากครับ เรามีรุ่นราคาประหยัดแต่ใช้งานลื่นไหลมาแนะนำ 🏢",
      products: officeProducts.slice(0, 3),
    };
  }

  // 6.5 Creative / Workstation
  if (msg.includes("ตัดต่อ") || msg.includes("วิดีโอ") || msg.includes("3d") || msg.includes("render") || msg.includes("workstation") || msg.includes("กราฟิก") || msg.includes("ai") || msg.includes("ออกแบบ")) {
    const wsProducts = products.filter((p) => p.category === "workstation");
    return {
      text: "สายครีเอเตอร์ต้องสเปคจัดเต็มครับ! งาน Render 3D, ตัดต่อ 4K, หรืองาน AI ต้องการ CPU/GPU ที่ประมวลผลหนักๆ แนะนำ Workstation ซีรีส์นี้เลยครับ ⚙️",
      products: wsProducts.slice(0, 3),
    };
  }

  // 7. Rental specifics
  if (msg.includes("เช่า") || msg.includes("rent") || msg.includes("รายเดือน") || msg.includes("สัญญา")) {
    return {
      text: `การเช่าคอมกับ I-Kom คุ้มค่ามากครับ! 📋\n\n• ราคาเริ่มต้นเพียง ฿${formatPrice(690)}/เดือน\n• สัญญาขั้นต่ำเพียง 3 เดือน\n• หากเครื่องมีปัญหา เปลี่ยนเครื่องใหม่ทันทีไม่ต้องรอซ่อม\n• อัพเกรดสเปคได้เมื่อต่อสัญญา\n\nอยากดูรุ่นไหนเพื่อเช่าไหมครับ?`,
    };
  }

  // 8. General Price Questions
  if (msg.includes("ราคา") || msg.includes("ถูก") || msg.includes("แพง") || msg.includes("เท่าไหร่") || msg.includes("price")) {
    return {
      text: `ช่วงราคาคอมพิวเตอร์ของเราแบ่งตามประเภทครับ:\n\n• 🏢 คอมทำงาน: เริ่มต้น ฿${formatPrice(12900)}\n• 💻 แล็ปท็อป: เริ่มต้น ฿${formatPrice(27900)}\n• 🎮 คอมเกมมิ่ง: เริ่มต้น ฿${formatPrice(35900)}\n• ⚙️ เวิร์คสเตชั่น: เริ่มต้น ฿${formatPrice(189900)}\n\n(หรือเลือกเช่าเริ่มต้นแค่ ฿${formatPrice(690)}/เดือน ก็ได้ครับ) บอกงบมาได้เลยครับ จะหาเครื่องที่ตรงงบให้! 💰`,
    };
  }

  // 9. Comparison
  if (msg.includes("เปรียบเทียบ") || msg.includes("compare") || msg.includes("ต่างกัน") || msg.includes("ดีกว่า")) {
    return {
      text: "ยินดีครับ! 🔍 แจ้งชื่อรุ่นที่อยากให้เปรียบเทียบมาได้เลย (เช่น I-Kom FURY กับ BLAZE ต่างกันยังไง?) หรือถ้าไม่แน่ใจ บอกความต้องการมา ผมจะเทียบรุ่นที่เหมาะสมให้ครับ",
    };
  }

  // 10. Components / Brands
  if (msg.includes("intel") || msg.includes("amd") || msg.includes("ryzen") || msg.includes("core i")) {
    return {
      text: "ร้านเรามีทั้ง CPU จาก Intel (Core i5, i7, i9) และ AMD (Ryzen 5, 7, 9) เลยครับ \n- ถ้าเน้นเล่นเกมหนักๆ AMD Ryzen X3D ตอนนี้มาแรงมาก\n- ถ้าเน้นทำงานด้วย เล่นเกมด้วย Intel Core ก็เป็นตัวเลือกที่เสถียรครับ",
    };
  }
  
  if (msg.includes("nvidia") || msg.includes("rtx") || msg.includes("การ์ดจอ")) {
    return {
      text: "เราประกอบเครื่องโดยใช้การ์ดจอ NVIDIA RTX ซีรีส์ 40 ทั้งหมดครับ ตั้งแต่ RTX 4060 ไปจนถึง RTX 4090 รองรับ DLSS 3 เล่นเกมภาพสวย ลื่นไหลแน่นอนครับ",
    };
  }

  // 11. Catch-all Budget (if only budget is mentioned)
  if (budget) {
    const inBudget = products.filter((p) => p.buyPrice <= budget);
    if (inBudget.length > 0) {
      return {
        text: `โอเคครับ งบ ฿${formatPrice(budget)} มีหลายตัวเลือกที่น่าสนใจเลย ลองดูตามรายการนี้ได้เลยครับ 👇 หรือจะบอกเพิ่มว่าเอาไปใช้งานอะไร จะได้แนะนำได้แม่นยำขึ้นครับ 🎯`,
        products: inBudget.slice(0, 3),
      };
    } else {
       return {
        text: `งบ ฿${formatPrice(budget)} อาจจะหาเครื่องได้ยากนิดนึงครับ 😅 ลองพิจารณาทางเลือกเป็น **การเช่ารายเดือน** ดูไหมครับ? จะได้สเปคที่แรงขึ้นในราคาที่จ่ายสบายกว่าเยอะเลยครับ!`,
      };
    }
  }

  // 12. Default response
  return {
    text: "ขอโทษทีครับ ผมอาจจะไม่เข้าใจ 😅 \nช่วยบอกผมหน่อยครับว่าคุณกำลังมองหาอะไรอยู่:\n\n1️⃣ เอาไปใช้งานแบบไหน? (เล่นเกม, ทำงาน, เขียนโปรแกรม, ตัดต่อ)\n2️⃣ มีงบประมาณในใจเท่าไหร่?\n3️⃣ อยากจะซื้อขาด หรือ เช่ารายเดือน?\n\nเดี๋ยวผมหาเครื่องที่ตอบโจทย์ให้ครับ! 🤖",
  };
}
