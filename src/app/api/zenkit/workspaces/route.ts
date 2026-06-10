import { NextResponse } from "next/server";
import { listarWorkspaces } from "@/lib/zenkit/client";

export async function GET() {
  try {
    const data = await listarWorkspaces();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
