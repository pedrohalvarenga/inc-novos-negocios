import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import MatriculasContent from "@/components/matricula/MatriculasContent";

export default async function MatriculasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <MatriculasContent />;
}
