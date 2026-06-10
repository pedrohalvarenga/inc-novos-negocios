import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { gerarHtmlRelatorioMatricula } from "@/lib/matricula/pdfMatricula";
import type { DadosMatricula } from "@/lib/matricula/analisarMatricula";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const matricula = await prisma.matricula.findUnique({
    where: { id },
    include: { terreno: { select: { nome: true, cidade: true, uf: true } } },
  });

  if (!matricula) return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });
  if (!matricula.dadosExtraidos) {
    return NextResponse.json({ error: "Matrícula ainda não foi analisada" }, { status: 400 });
  }

  const html = gerarHtmlRelatorioMatricula({
    terreno: matricula.terreno,
    matricula: {
      numero: matricula.numero,
      cartorio: matricula.cartorio,
      comarca: matricula.comarca,
      createdAt: matricula.createdAt,
    },
    dados: matricula.dadosExtraidos as unknown as DadosMatricula,
    dataEmissao: new Date(),
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Matricula-Id": id,
    },
  });
}
