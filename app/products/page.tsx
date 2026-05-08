import prisma from "@/lib/prisma";
import ShopClient from "./components/ShopClient";
import { EquipmentStatus } from "@prisma/client";
import { MappedProduct } from "./components/ProductCard";

export default async function ProductsPage() {
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
    },
    orderBy: { createdAt: "desc" }
  });

  // Fetch recommended products
  const { getRecommendedProducts } = await import("@/app/actions/recommendation");
  const rawRecommended = await getRecommendedProducts();

  // Helper to map DB product to UI product
  const mapProduct = (p: any): MappedProduct => {
    let categoryLabel = "ทั่วไป";
    const nameLower = p.name.toLowerCase();
    
    if (nameLower.includes("gaming") || nameLower.includes("blaze") || nameLower.includes("titan") || nameLower.includes("fury")) {
      categoryLabel = "เกมมิ่ง";
    } else if (nameLower.includes("workstation") || nameLower.includes("creator") || nameLower.includes("studio")) {
      categoryLabel = "เวิร์คสเตชั่น";
    } else if (nameLower.includes("laptop") || nameLower.includes("swift") || nameLower.includes("air") || nameLower.includes("pro")) {
      categoryLabel = "แล็ปท็อป";
    } else if (nameLower.includes("office") || nameLower.includes("lite")) {
      categoryLabel = "สำนักงาน";
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
      tags: ["แนะนำ", "เช่ารายเดือน"],
      isAvailable: p._count.equipment > 0,
      stockCount: p._count.equipment,
      badge: p._count.equipment > 0 ? "hot" : undefined
    };
  };

  const mappedProducts: MappedProduct[] = dbProducts.map(mapProduct);
  const mappedRecommendations: MappedProduct[] = rawRecommended.map(mapProduct);

  return <ShopClient products={mappedProducts} recommended={mappedRecommendations} />;
}
