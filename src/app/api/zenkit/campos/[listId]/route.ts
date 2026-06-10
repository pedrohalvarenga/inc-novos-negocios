import { NextRequest, NextResponse } from "next/server";
import { buscarCampos } from "@/lib/zenkit/client";

export async function GET(_: NextRequest, { params }: { params: { listId: string } }) {
  try {
    const campos = await buscarCampos(params.listId);
    return NextResponse.json(campos);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
