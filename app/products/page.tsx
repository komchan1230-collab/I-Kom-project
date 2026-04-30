import prisma from "@/lib/prisma";
import ShopClient from "./components/ShopClient";
import { EquipmentStatus } from "@/app/generated/prisma/client";
import { MappedProduct } from "./components/ProductCard";

// A small helper to seed dummy data if the database is empty
async function seedDemoDataIfEmpty() {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      console.log("Database empty. Seeding demo products and equipments...");
      const p1 = await prisma.product.create({
        data: {
          name: "I-Kom High-End Workstation",
          description: "Perfect for 3D rendering, video editing, and heavy workloads.",
          specs: { CPU: "Intel Core i9 14900K", RAM: "64GB DDR5", GPU: "RTX 4090 24GB" },
          monthlyPrice: 4500,
          imageUrl: "/workstation.png",
        }
      });

      const p2 = await prisma.product.create({
        data: {
          name: "I-Kom Gaming Setup",
          description: "High frame rates for competitive gaming and streaming.",
          specs: { CPU: "AMD Ryzen 7 7800X3D", RAM: "32GB DDR5", GPU: "RTX 4070 Ti" },
          monthlyPrice: 2800,
          imageUrl: "/gaming-desktop.png",
        }
      });

      const p3 = await prisma.product.create({
        data: {
          name: "I-Kom Student Laptop",
          description: "Lightweight, long battery life, perfect for taking to classes.",
          specs: { CPU: "Apple M3", RAM: "16GB", Storage: "512GB SSD" },
          monthlyPrice: 1200,
          imageUrl: "/laptop.png",
        }
      });

      // Add 1 equipment for workstation
      await prisma.equipment.create({
        data: { productId: p1.id, serialNumber: "WS-001", status: EquipmentStatus.AVAILABLE }
      });

      // Add 2 equipments for gaming setup
      await prisma.equipment.createMany({
        data: [
          { productId: p2.id, serialNumber: "GM-001", status: EquipmentStatus.AVAILABLE },
          { productId: p2.id, serialNumber: "GM-002", status: EquipmentStatus.AVAILABLE }
        ]
      });

      // Add 1 equipment for laptop
      await prisma.equipment.create({
        data: { productId: p3.id, serialNumber: "LT-001", status: EquipmentStatus.AVAILABLE }
      });
    }
  } catch (error) {
    console.error("Failed to seed demo data:", error);
  }
}

export default async function ProductsPage() {
  await seedDemoDataIfEmpty();

  // Fetch all products with their available equipment count
  const dbProducts = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          equipment: {
            where: { status: EquipmentStatus.AVAILABLE }
          }
        }
      }
    }
  });

  // Map database products to the old UI structure
  const mappedProducts: MappedProduct[] = dbProducts.map(p => {
    // Basic category inference
    let categoryLabel = "คอมพิวเตอร์";
    if (p.name.toLowerCase().includes("gaming")) categoryLabel = "เกมมิ่ง";
    else if (p.name.toLowerCase().includes("workstation")) categoryLabel = "เวิร์คสเตชั่น";
    else if (p.name.toLowerCase().includes("laptop")) categoryLabel = "แล็ปท็อป";

    // Format specs
    const specsArray = typeof p.specs === "object" && p.specs !== null 
      ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`) 
      : [];

    return {
      id: p.id,
      name: p.name,
      categoryLabel,
      specs: specsArray.length > 0 ? specsArray : ["มาตรฐาน"],
      description: p.description,
      rentPrice: Number(p.monthlyPrice),
      buyPrice: Number(p.monthlyPrice) * 12 * 1.5, // Dummy buy price calculated from rent
      image: p.imageUrl || "/workstation.png",
      tags: ["แนะนำ", "เช่ารายเดือน"],
      isAvailable: p._count.equipment > 0,
      stockCount: p._count.equipment,
      badge: p._count.equipment > 0 ? "hot" : undefined
    };
  });

  return <ShopClient products={mappedProducts} />;
}
