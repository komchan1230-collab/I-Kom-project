import prisma from "@/lib/prisma";
import Hero from "./components/Hero";
import Features from "./components/Features";
import PopularProducts from "./components/PopularProducts";
import { EquipmentStatus } from "@prisma/client";
import { MappedProduct } from "./products/components/ProductCard";

export default async function Home() {
  // Fetch up to 4 products with their available equipment count
  const dbProducts = await prisma.product.findMany({
    take: 4,
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

  // Map database products
  const mappedProducts: MappedProduct[] = dbProducts.map(p => {
    let categoryLabel = "ทั่วไป";
    const nameLower = p.name.toLowerCase();
    
    if (nameLower.includes("titan") || nameLower.includes("high")) {
      categoryLabel = "ระดับไฮเอนด์";
    } else if (nameLower.includes("fury") || nameLower.includes("mid")) {
      categoryLabel = "ระดับกลาง";
    } else if (nameLower.includes("blaze") || nameLower.includes("entry")) {
      categoryLabel = "เริ่มต้น";
    } else if (nameLower.includes("stream") || nameLower.includes("master")) {
      categoryLabel = "สตรีมเมอร์";
    }

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
      buyPrice: Number(p.buyPrice),
      image: p.imageUrl || "/workstation.png",
      tags: ["ยอดนิยม"],
      isAvailable: p._count.equipment > 0,
      stockCount: p._count.equipment,
      badge: p._count.equipment > 0 ? "hot" : undefined
    };
  });

  return (
    <>
      <Hero />
      <Features />
      <PopularProducts products={mappedProducts} />
    </>
  );
}
