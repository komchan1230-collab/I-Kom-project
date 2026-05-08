"use server";

import prisma from "@/lib/prisma";
import { EquipmentStatus } from "@prisma/client";

/**
 * Returns recommended products for the user.
 * Currently simplified to return 3 available products as faculty-based 
 * recommendations have been removed.
 */
export async function getRecommendedProducts() {
  try {
    // Fetch products that have available units
    const recommended = await prisma.product.findMany({
      take: 3,
      include: {
        _count: {
          select: {
            equipment: {
              where: { status: EquipmentStatus.AVAILABLE }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return recommended;
  } catch (error) {
    console.error("[Recommendation Engine] Error:", error);
    return [];
  }
}
