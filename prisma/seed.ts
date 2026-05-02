import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { EquipmentStatus, VerificationStatus } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL || "mysql://root:096096@localhost:3306/ikom_rental";
const adapterUrl = connectionString.includes("?")
  ? `${connectionString}&allowPublicKeyRetrieval=true`
  : `${connectionString}?allowPublicKeyRetrieval=true`;

const adapter = new PrismaMariaDb(adapterUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Create mock student user ──
  const user = await prisma.user.create({
    data: {
      name: "สมชาย ทดสอบ",
      email: "somchai@test.com",
      password: "$2b$10$dummyhashforseeding1234567890abcdef", // not a real hash
      university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
      faculty: "คณะวิศวกรรมศาสตร์",
      verificationStatus: VerificationStatus.APPROVED,
    },
  });
  console.log(`✅ User: ${user.name} (${user.email})`);

  // ── 2. Create 3 products ──
  const macbook = await prisma.product.create({
    data: {
      name: "MacBook Pro M3",
      description:
        "แล็ปท็อประดับพรีเมียมจาก Apple ชิป M3 ประสิทธิภาพสูง จอ Retina 14 นิ้ว แบตอึด 18 ชม. เหมาะสำหรับครีเอเตอร์ นักพัฒนา และนักศึกษาที่ต้องการเครื่องมือระดับมืออาชีพ",
      specs: {
        CPU: "Apple M3 (8-core)",
        RAM: "16GB Unified",
        Storage: "512GB SSD",
        Display: "14\" Liquid Retina XDR",
      },
      monthlyPrice: 3500,
      imageUrl: "/laptop.png",
    },
  });

  const dellXps = await prisma.product.create({
    data: {
      name: "Dell XPS 15",
      description:
        "แล็ปท็อป Windows สุดพรีเมียม จอ OLED 15.6 นิ้ว สีสันสดใส ตัวเครื่องบางเบา สเปคแรง เหมาะทั้งทำงานและเล่นเกมเบาๆ",
      specs: {
        CPU: "Intel Core i7-13700H",
        RAM: "32GB DDR5",
        GPU: "RTX 4060 8GB",
        Storage: "1TB NVMe SSD",
      },
      monthlyPrice: 2800,
      imageUrl: "/laptop.png",
    },
  });

  const thinkpad = await prisma.product.create({
    data: {
      name: "Lenovo ThinkPad X1 Carbon",
      description:
        "แล็ปท็อปธุรกิจระดับตำนาน คีย์บอร์ดดีที่สุดในโลก ทนทานมาตรฐานทหาร น้ำหนักเบา 1.12 กก. แบตยาว 15 ชม. เหมาะสำหรับสายทำงานจริงจัง",
      specs: {
        CPU: "Intel Core i7-1365U",
        RAM: "16GB LPDDR5",
        Storage: "512GB SSD",
        Display: "14\" 2.8K OLED",
      },
      monthlyPrice: 2200,
      imageUrl: "/laptop.png",
    },
  });

  console.log(`✅ Products: ${macbook.name}, ${dellXps.name}, ${thinkpad.name}`);

  // ── 3. Create 5 equipment units ──
  const equipments = await Promise.all([
    prisma.equipment.create({
      data: { productId: macbook.id, serialNumber: "MBP-M3-001", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: macbook.id, serialNumber: "MBP-M3-002", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: dellXps.id, serialNumber: "XPS15-001", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: dellXps.id, serialNumber: "XPS15-002", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: thinkpad.id, serialNumber: "TP-X1C-001", status: EquipmentStatus.AVAILABLE },
    }),
  ]);

  console.log(`✅ Equipment: ${equipments.length} units created\n`);

  // ── Summary ──
  console.log("╔══════════════════════════════════════╗");
  console.log("║       🌱 SEED COMPLETE               ║");
  console.log("╠══════════════════════════════════════╣");
  console.log(`║  Users:      1                        ║`);
  console.log(`║  Products:   3                        ║`);
  console.log(`║  Equipment:  5 (all AVAILABLE)        ║`);
  console.log("╚══════════════════════════════════════╝");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
