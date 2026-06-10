import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ContratoEditor from "@/components/contratos/ContratoEditor";

export const metadata = { title: "Editor de Contrato — INC Novos Negócios" };

export default async function ContratoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.usuario.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) redirect("/login");

  return (
    <ContratoEditor
      contratoId={id}
      usuarioNome={dbUser.nome}
      usuarioRole={dbUser.role}
    />
  );
}
