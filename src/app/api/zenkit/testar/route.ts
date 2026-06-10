import { NextResponse } from "next/server";
import { listarWorkspaces } from "@/lib/zenkit/client";

export async function GET() {
  try {
    const ws = await listarWorkspaces();
    return NextResponse.json({ ok: true, workspaces: ws });
  } catch (e: any) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}
