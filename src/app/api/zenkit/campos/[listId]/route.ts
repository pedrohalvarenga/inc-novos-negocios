import { NextRequest, NextResponse } from "next/server";
import { buscarCampos } from "@/lib/zenkit/client";

export async function GET(_: NextRequest, { params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  try {
    const campos = await buscarCampos(listId);
    return NextResponse.json(campos);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
