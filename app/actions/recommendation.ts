"use server";

import prisma from "@/lib/prisma";
import { getSession } from "./auth";
import { EquipmentStatus } from "@/app/generated/prisma/client";

export async function getRecommendedProducts() {
  try {
    const session = await getSession();
    let faculty = "";

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { faculty: true }
      });
      faculty = user?.faculty || "";
    }

    // Determine query conditions based on faculty
    const facLower = faculty.toLowerCase();
    
    let keywordFilter = {};
    if (facLower.includes("วิศว") || facLower.includes("engineering") || facLower.includes("สถาปัตย") || facLower.includes("architecture")) {
      keywordFilter = {
        OR: [
          { name: { contains: "workstation" } },
          { name: { contains: "high-end" } },
          { description: { contains: "rendering" } }
        ]
      };
    } else if (facLower.includes("บริหาร") || facLower.includes("business") || facLower.includes("อักษร") || facLower.includes("arts") || facLower.includes("บัญชี")) {
      keywordFilter = {
        OR: [
          { name: { contains: "laptop" } },
          { name: { contains: "office" } },
          { description: { contains: "lightweight" } }
        ]
      };
    } else if (facLower.includes("คอม") || facLower.includes("it") || facLower.includes("เกม") || facLower.includes("science")) {
      keywordFilter = {
        OR: [
          { name: { contains: "gaming" } },
          { name: { contains: "setup" } },
          { description: { contains: "competitive" } }
        ]
      };
    }

    // Fetch the products matching the criteria
    let recommended = await prisma.product.findMany({
      where: keywordFilter,
      take: 3,
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

    // Fallback: If no products match the keyword or user has no faculty, return general top products
    if (recommended.length === 0) {
      recommended = await prisma.product.findMany({
        take: 3,
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
    }

    return recommended;
  } catch (error) {
    console.error("[Recommendation Engine] Error:", error);
    // Return empty array on failure
    return [];
  }
}
