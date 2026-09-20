import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { MemberDashboard } from "@/components/member-dashboard";
import { getMemberOverview } from "@/db/repository";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/en/account");
  const overview = await getMemberOverview(user.id);
  return <MemberDashboard locale="en" profile={overview.profile as never} applications={overview.applications as never} />;
}
