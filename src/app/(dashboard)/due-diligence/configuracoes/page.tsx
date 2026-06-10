import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DueDiligenceConfiguracoes from "@/components/due-diligence/DueDiligenceConfiguracoes";

export default async function DueDiligenceConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id }, select: { role: true } });
  if (dbUser?.role !== "ADMIN") redirect("/due-diligence");

  return <DueDiligenceConfiguracoes />;
}
