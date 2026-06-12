export interface Product {
  id: string;
  name: string;
  category: "gaming" | "laptop" | "office" | "workstation" | "entry" | "mid" | "high" | "streamer";
  categoryLabel: string;
  specs: string[];
  description: string;
  buyPrice: number;
  rentPrice: number;
  image: string;
  tags: string[];
  badge?: "hot" | "new" | "sale";
}

export const categories = [
  { id: "all", label: "ทั้งหมด", icon: "🖥️" },
  { id: "entry", label: "เริ่มต้น", icon: "🥉" },
  { id: "mid", label: "ระดับกลาง", icon: "🥈" },
  { id: "high", label: "ระดับไฮเอนด์", icon: "🥇" },
  { id: "streamer", label: "สตรีมเมอร์", icon: "🎙️" },
];

export const products: Product[] = [
  {
    id: "gm-001",
    name: "I-Kom TITAN X",
    category: "high",
    categoryLabel: "ระดับไฮเอนด์",
    specs: [
      "Intel Core i9-14900K",
      "RTX 4090 24GB",
      "64GB DDR5 RAM",
      "2TB NVMe SSD",
    ],
    description: "เครื่องเกมมิ่งระดับท็อปสำหรับเกมเมอร์ที่ต้องการความแรงสูงสุด เล่นเกม AAA ได้ลื่นที่ 4K Ultra",
    buyPrice: 129900,
    rentPrice: 6990,
    image: "/gaming-desktop.png",
    tags: ["4K Gaming", "VR Ready"],
    badge: "hot",
  },
  {
    id: "gm-002",
    name: "I-Kom FURY PRO",
    category: "mid",
    categoryLabel: "ระดับกลาง",
    specs: [
      "Intel Core i7-14700K",
      "RTX 4070 Ti 12GB",
      "32GB DDR5 RAM",
      "1TB NVMe SSD",
    ],
    description: "เครื่องเกมมิ่งระดับกลาง-สูง คุ้มค่าที่สุดสำหรับเกมเมอร์จริงจัง เล่นได้ทุกเกมที่ 1440p Ultra",
    buyPrice: 69900,
    rentPrice: 3990,
    image: "/gaming-desktop.png",
    tags: ["1440p Gaming", "Competitive"],
    badge: "new",
  },
  {
    id: "gm-003",
    name: "I-Kom BLAZE",
    category: "entry",
    categoryLabel: "เริ่มต้น",
    specs: [
      "AMD Ryzen 5 7600",
      "RTX 4060 8GB",
      "16GB DDR5 RAM",
      "512GB NVMe SSD",
    ],
    description: "เครื่องเกมมิ่งระดับเริ่มต้นที่นิยมเยอะที่สุด เล่นเกมลื่นๆ ได้ เหมาะสำหรับ 1080p High",
    buyPrice: 35900,
    rentPrice: 1990,
    image: "/gaming-desktop.png",
    tags: ["1080p Gaming", "ประหยัด"],
    badge: "sale",
  },
  {
    id: "gm-004",
    name: "I-Kom STREAM MASTER",
    category: "streamer",
    categoryLabel: "สตรีมเมอร์",
    specs: [
      "AMD Ryzen 9 7900X",
      "RTX 4080 16GB",
      "64GB DDR5 RAM",
      "2TB NVMe SSD",
    ],
    description: "สเปคเพื่อสตรีมเมอร์โดยเฉพาะ ซีพียูหลายคอร์ ไลฟ์สดเล่นเกมไปพร้อมกันไม่มีสะดุด",
    buyPrice: 99900,
    rentPrice: 4990,
    image: "/gaming-desktop.png",
    tags: ["Streaming", "Content Creator"],
  },
  {
    id: "gm-005",
    name: "I-Kom ENTRY PRO",
    category: "entry",
    categoryLabel: "เริ่มต้น",
    specs: [
      "Intel Core i5-13400F",
      "RTX 3060 12GB",
      "16GB DDR4 RAM",
      "512GB NVMe SSD",
    ],
    description: "เครื่องเกมมิ่งราคาประหยัดสุดคุ้ม สำหรับนักเรียนนักศึกษา เล่นเกมทั่วไปได้ครบ",
    buyPrice: 25900,
    rentPrice: 1490,
    image: "/gaming-desktop.png",
    tags: ["สุดคุ้ม", "เริ่มต้น"],
  },
];

export function formatPrice(price: number): string {
  return price.toLocaleString("th-TH");
}
