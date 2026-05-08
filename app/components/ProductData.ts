export interface Product {
  id: string;
  name: string;
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
  { id: "gaming", label: "เกมมิ่ง", icon: "🎮" },
  { id: "laptop", label: "แล็ปท็อป", icon: "💻" },
  { id: "office", label: "สำนักงาน", icon: "🏢" },
  { id: "workstation", label: "เวิร์คสเตชั่น", icon: "⚙️" },
];

export function formatPrice(price: number): string {
  return price.toLocaleString("th-TH");
}
