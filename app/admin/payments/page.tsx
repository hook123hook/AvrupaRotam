import { redirect } from "next/navigation";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getPaymentAdmin } from "@/lib/payment-admin";
import { PaymentReviewDashboard } from "@/components/payment-review-dashboard";

export const dynamic = "force-dynamic";

export default async function PaymentsAdminPage() {
  const user = await getChatGPTUser();

  if (!user) {
    redirect("/login?return_to=%2Fadmin%2Fpayments");
  }

  const admin = await getPaymentAdmin();

  if (!admin) {
    return (
      <main style={{ padding: 32, background: "#fff", color: "#0b1f33" }}>
        <h1>Erişim yetkiniz yok</h1>
        <p>Bu ekran yalnızca ödeme inceleme yöneticileri içindir.</p>
        <a href="/account">Hesabıma dön</a>
      </main>
    );
  }

  return <PaymentReviewDashboard />;
}