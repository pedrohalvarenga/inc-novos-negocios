import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DueDiligenceContent from "@/components/due-diligence/DueDiligenceContent";

export default async function DueDiligencePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <DueDiligenceContent />;
}
