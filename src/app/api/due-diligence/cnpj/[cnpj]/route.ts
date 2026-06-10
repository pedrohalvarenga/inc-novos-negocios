import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { receitaFederalProvider } from "@/lib/due-diligence/providers/receitaFederal";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { cnpj } = await params;

  try {
    const resultado = await receitaFederalProvider.consultar(cnpj, "CNPJ");
    return NextResponse.json(resultado);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
