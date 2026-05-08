import prisma from "@/lib/prisma";
import { EquipmentStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return { title: "ไม่พบสินค้า | I-Kom" };
  }

  return {
    title: `${product.name} | I-Kom`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          equipment: {
            where: { status: EquipmentStatus.AVAILABLE },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Map to a serializable object for the client component
  const specsArray =
    typeof product.specs === "object" && product.specs !== null
      ? Object.entries(product.specs as Record<string, string>).map(
          ([k, v]) => ({ key: k, value: String(v) })
        )
      : [];

  let categoryLabel = "คอมพิวเตอร์";
  if (product.name.toLowerCase().includes("gaming")) categoryLabel = "เกมมิ่ง";
  else if (product.name.toLowerCase().includes("workstation"))
    categoryLabel = "เวิร์คสเตชั่น";
  else if (product.name.toLowerCase().includes("laptop"))
    categoryLabel = "แล็ปท็อป";

  const mappedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    categoryLabel,
    specs: specsArray,
    rentPrice: Number(product.monthlyPrice),
    buyPrice: Number(product.buyPrice),
    image: product.imageUrl || "/workstation.png",
    isAvailable: product._count.equipment > 0,
    stockCount: product._count.equipment,
  };

  return <ProductDetailClient product={mappedProduct} />;
}
