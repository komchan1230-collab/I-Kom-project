import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/app/actions/orders";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "รายการของฉัน | I-Kom",
  description: "ดูรายการเช่าและสั่งซื้อทั้งหมดของคุณ",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { orders } = await getMyOrders();

  return <ProfileClient session={session} orders={orders} />;
}
