import prisma from "@/lib/prisma";
import ShopClient from "./components/ShopClient";
import { EquipmentStatus } from "@prisma/client";
import { MappedProduct } from "./components/ProductCard";

export default async function ProductsPage() {
  // Fetch both products and recommended list in parallel to eliminate request waterfall
  const [dbProducts, rawRecommended] = await Promise.all([
    prisma.product.findMany({
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
    }),
    (async () => {
      const { getRecommendedProducts } = await import("@/app/actions/recommendation");
      return getRecommendedProducts();
    })()
  ]);

  // Helper to map DB product to UI product
  const mapProduct = (p: any): MappedProduct => {
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
