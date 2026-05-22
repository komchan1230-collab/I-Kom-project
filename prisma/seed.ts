import { PrismaClient, EquipmentStatus, VerificationStatus, Role } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "mysql://root:096096@localhost:3306/ikom_rental";
const adapterUrl = connectionString.includes("?")
  ? `${connectionString}&allowPublicKeyRetrieval=true`
  : `${connectionString}?allowPublicKeyRetrieval=true`;

const adapter = new PrismaMariaDb(adapterUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Clean existing data (order matters for FK constraints) ──
  console.log("🧹 Cleaning existing data...");
  await prisma.purchaseOrder.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleaned!\n");

  // ── 1. Create mock student user ──
  const user = await prisma.user.create({
    data: {
      name: "สมชาย ทดสอบ",
      email: "somchai@test.com",
      password: await bcrypt.hash("password", 10),
      verificationStatus: VerificationStatus.APPROVED,
      role: Role.USER,
    },
  });
  console.log(`✅ User: ${user.name} (${user.email})`);

  // ── 1.5 Create Admin user ──
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@ikom.com",
      password: await bcrypt.hash("admin", 10),
      verificationStatus: VerificationStatus.APPROVED,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin: ${admin.name} (${admin.email})`);

  // ── 2. Create 3 products ──
  const titan = await prisma.product.create({
    data: {
      name: "I-Kom TITAN X",
      description:
        "เครื่องเกมมิ่งระดับท็อปสำหรับเกมเมอร์ที่ต้องการความแรงสูงสุด เล่นเกม AAA ได้ลื่นที่ 4K Ultra",
      specs: {
        CPU: "Intel Core i9-14900K",
        RAM: "64GB DDR5",
        GPU: "RTX 4090 24GB",
        Storage: "2TB NVMe SSD",
      },
      monthlyPrice: 6990,
      buyPrice: 129900,
      imageUrl: "/gaming-desktop.png",
    },
  });

  const fury = await prisma.product.create({
    data: {
      name: "I-Kom FURY PRO",
      description:
        "เครื่องเกมมิ่งระดับกลาง-สูง คุ้มค่าที่สุดสำหรับเกมเมอร์จริงจัง เล่นได้ทุกเกมที่ 1440p Ultra",
      specs: {
        CPU: "Intel Core i7-14700K",
        RAM: "32GB DDR5",
        GPU: "RTX 4070 Ti 12GB",
        Storage: "1TB NVMe SSD",
      },
      monthlyPrice: 3990,
      buyPrice: 69900,
      imageUrl: "/gaming-desktop.png",
    },
  });

  const blaze = await prisma.product.create({
    data: {
      name: "I-Kom BLAZE",
      description:
        "เครื่องเกมมิ่งระดับเริ่มต้นที่นิยมเยอะที่สุด เล่นเกมลื่นๆ ได้ เหมาะสำหรับ 1080p High-Ultra",
      specs: {
        CPU: "AMD Ryzen 5 7600",
        RAM: "16GB DDR5",
        GPU: "RTX 4060 8GB",
        Storage: "512GB NVMe SSD",
      },
      monthlyPrice: 1990,
      buyPrice: 35900,
      imageUrl: "/gaming-desktop.png",
    },
  });

  console.log(`✅ Products: ${titan.name}, ${fury.name}, ${blaze.name}`);

  // ── 3. Create 5 equipment units ──
  const equipments = await Promise.all([
    prisma.equipment.create({
      data: { productId: titan.id, serialNumber: "TITAN-001", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: titan.id, serialNumber: "TITAN-002", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: fury.id, serialNumber: "FURY-001", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: fury.id, serialNumber: "FURY-002", status: EquipmentStatus.AVAILABLE },
    }),
    prisma.equipment.create({
      data: { productId: blaze.id, serialNumber: "BLAZE-001", status: EquipmentStatus.AVAILABLE },
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
