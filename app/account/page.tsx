import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { MemberDashboard } from "@/components/member-dashboard";
import { getMemberOverview } from "@/db/repository";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");
  const overview = await getMemberOverview(user.id);
  return <MemberDashboard locale="tr" profile={overview.profile as never} applications={overview.applications as never} />;
}
